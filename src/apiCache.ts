// Client-side cache for backend reads made through the generated API client (src/apiClient).
//
// - Long-term data (schedule, rooms, team events) is served from memory/localStorage for
//   `ttl` ms without touching the network; pass `force` to bypass (e.g. Refresh buttons).
// - Identical requests that are in flight at the same time share one network call.
// - If the backend can't be reached (network error or 5xx), the last good response is returned
//   instead, so pages keep working on flaky venue wifi.
// - Only successful responses are cached; other errors (e.g. 404) are rethrown to the caller.
//
// The backend also sends ETags, so even uncached requests are cheap 304 revalidations.

export const MINUTE = 60 * 1000;
export const LONG_TERM_TTL = 10 * MINUTE; // roster data: only changes when the schedule CSV is reloaded

const STORAGE_PREFIX = `tuneup-cache:v1:${process.env.GATSBY_BACKEND_URL || ''}:`;

interface Entry {
    data: unknown;
    savedAt: number;
}

export interface CacheOptions {
    /** How long a cached copy is served without a request, in ms. 0 = always hit the network. */
    ttl?: number;
    /** Skip the cached copy (it's still used as the outage fallback). */
    force?: boolean;
}

const memory = new Map<string, Entry>();
const inFlight = new Map<string, Promise<unknown>>();

function storage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch (e) {
        return null; // blocked (private mode, disabled storage)
    }
}

function read(key: string): Entry | null {
    const cached = memory.get(key);
    if (cached) return cached;
    const store = storage();
    if (!store) return null;
    try {
        const entry: Entry | null = JSON.parse(store.getItem(STORAGE_PREFIX + key) ?? 'null');
        if (entry) memory.set(key, entry);
        return entry;
    } catch (e) {
        return null;
    }
}

function write(key: string, data: unknown) {
    const entry = { data, savedAt: Date.now() };
    memory.set(key, entry);
    const store = storage();
    if (!store) return;
    try {
        store.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
        // quota exceeded etc. - memory cache still works
    }
}

/**
 * @param key unique cache key for this request
 * @param load performs the request; resolves with the response data
 */
export function cachedJson<T>(key: string, load: () => Promise<T>, { ttl = 0, force = false }: CacheOptions = {}): Promise<T> {
    // Entries under a key are only ever written by the same `load`, so they hold a T.
    const cached = read(key) as { data: T; savedAt: number } | null;
    if (!force && cached && ttl > 0 && Date.now() - cached.savedAt < ttl) {
        return Promise.resolve(cached.data);
    }
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<T>;

    // A request is "current" until it finishes or invalidate() drops it; only current requests
    // may update the cache, so a response that raced a write can't overwrite fresher data.
    const isCurrent = () => inFlight.get(key) === request;
    const request: Promise<T> = load()
        .then((data) => {
            if (isCurrent()) write(key, data);
            return data;
        })
        .catch((error: unknown) => {
            if (cached && isOutage(error)) {
                console.warn(`Network request for ${key} failed, using cached copy from ${new Date(cached.savedAt).toLocaleTimeString()}`, error);
                return cached.data;
            }
            throw error;
        })
        .finally(() => {
            if (isCurrent()) inFlight.delete(key);
        });

    inFlight.set(key, request);
    return request;
}

// Network failures (TypeError from fetch) and 5xx mean "backend unreachable". Errors carrying a
// 4xx status, or a parsed error body the generated client threw, are real answers.
function isOutage(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const status = (error as Error & { status?: unknown }).status;
    return typeof status !== 'number' || status >= 500;
}

/** Date the cached copy of `key` was fetched from the server, or null if nothing is cached. */
export function cachedAt(key: string): Date | null {
    const entry = read(key);
    return entry ? new Date(entry.savedAt) : null;
}

/** Drop cached entries whose key starts with any of the given prefixes (all entries if none given). */
export function invalidate(...prefixes: string[]) {
    const matches = (key: string) => prefixes.length === 0 || prefixes.some((prefix) => key.startsWith(prefix));
    for (const key of Array.from(memory.keys())) {
        if (matches(key)) memory.delete(key);
    }
    // Requests started before a write may return pre-write data; don't let new callers join them.
    for (const key of Array.from(inFlight.keys())) {
        if (matches(key)) inFlight.delete(key);
    }
    const store = storage();
    if (!store) return;
    try {
        for (const fullKey of Object.keys(store)) {
            if (fullKey.startsWith(STORAGE_PREFIX) && matches(fullKey.slice(STORAGE_PREFIX.length))) {
                store.removeItem(fullKey);
            }
        }
    } catch (e) {
        // ignore storage errors
    }
}

// Cache key prefixes, grouped by what invalidates them.
export const KEYS = {
    scores: 'scores:', // anything containing scores
    roster: 'roster:', // teams, schedule, rooms, events
} as const;
