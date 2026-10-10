// API used by pages/components. Requests go through the NSwag-generated client in
// src/apiClient/generated.ts (regenerate with `npm run api:update` after backend changes), so
// URLs, request bodies and response types always match the backend's OpenAPI spec.
//
// This layer adds what the generated client doesn't know about: caching (src/apiCache.ts),
// cache invalidation after writes, and one error type: every failed request rejects with an
// ApiError (HTTP errors) or the original error (network failures).
import { cachedAt, cachedJson, invalidate, KEYS, LONG_TERM_TTL } from './apiCache';
import {
    ApiException,
    DisplayClient,
    ScheduleClient,
    ScoresClient,
    TeamsClient,
    type CheckPasswordResponse,
    type CreateScoreResponse,
    type DeleteTeamResponse,
    type DetailResponse,
    type DisplayTeamScoresResponse,
    type EventBase,
    type HTTPValidationError,
    type RankResponse,
    type RoomAssignmentResponse,
    type ScheduleResponse,
    type TeamDataBulkResponse,
    type TeamSingularResponse,
    type ValidationError,
} from './apiClient/generated';

// Re-exported so pages import API types from here rather than from the generated file.
export type {
    CheckPasswordResponse,
    CreateScoreResponse,
    DeleteTeamResponse,
    DetailResponse,
    DisplayTeamScoresResponse,
    EventBase,
    Entry as ScheduleEntry,
    RankResponse,
    RoomAssignmentResponse,
    ScheduleResponse,
    TeamDataBulkResponse,
    TeamSingularResponse,
} from './apiClient/generated';

const BASE_URL = process.env.GATSBY_BACKEND_URL || 'https://tuneup-backend-7cb9db42de78.herokuapp.com';

// Resolve `fetch` at call time: the generated clients default to `window`, which doesn't exist
// while Gatsby renders pages at build time.
const http = { fetch: (url: RequestInfo, init?: RequestInit) => fetch(url, init) };

const teams = new TeamsClient(BASE_URL, http);
const scores = new ScoresClient(BASE_URL, http);
const display = new DisplayClient(BASE_URL, http);
const schedule = new ScheduleClient(BASE_URL, http);

/** The backend answered with an error status. `detail` is FastAPI's error detail, e.g. "Unauthorized". */
export class ApiError extends Error {
    constructor(readonly status: number, readonly detail: unknown) {
        super(describe(detail));
        this.name = 'ApiError';
    }
}

function describe(detail: unknown): string {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) { // 422: a list of validation errors
        return (detail as ValidationError[]).map((error) => error.msg).join('; ');
    }
    return JSON.stringify(detail);
}

/** A message to show the user for anything a request (or other code) threw. */
export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

// The generated clients throw an ApiException (raw `response` text) for undeclared error statuses,
// and the parsed body itself for declared ones (422). Turn both into an ApiError.
function toApiError(error: unknown): never {
    if (typeof error === 'object' && error !== null && ApiException.isApiException(error)) {
        let detail: unknown = error.response || error.message;
        try {
            const body = JSON.parse(error.response);
            detail = body && typeof body === 'object' && 'detail' in body ? body.detail : body;
        } catch (e) {
            // not JSON - keep the raw text
        }
        throw new ApiError(error.status, detail);
    }
    if (error instanceof Error) throw error; // network failure
    throw new ApiError(422, (error as HTTPValidationError)?.detail);
}

const read = <T>(promise: Promise<T>): Promise<T> => promise.catch(toApiError);
// Writes drop the cached data they affect, whether or not they succeeded.
const write = <T>(promise: Promise<T>, ...prefixes: string[]): Promise<T> =>
    promise.finally(() => invalidate(...prefixes)).catch(toApiError);

const SCHEDULE_KEY = KEYS.roster + 'schedule';
const ROOMS_KEY = KEYS.roster + 'rooms';

interface ForceOption {
    /** Refetch even if a fresh cached copy exists (Refresh buttons). */
    force?: boolean;
}

export const teamApi = {
    getAllTeams(): Promise<TeamDataBulkResponse> {
        return read(cachedJson(KEYS.scores + 'teams', () => teams.getAllTeams()));
    },

    createTeam(teamId: number, name: string, password: string): Promise<TeamSingularResponse> {
        return write(teams.createTeam({ team_id: teamId, name, password }));
    },

    getTeam(teamId: number): Promise<TeamSingularResponse> {
        return read(teams.getTeam(teamId));
    },

    deleteTeam(teamId: number, password: string): Promise<DeleteTeamResponse> {
        return write(teams.deleteTeam({ team_id: teamId, password }));
    },

    renameTeam(teamId: number, name: string, password: string): Promise<DetailResponse> {
        return write(teams.renameTeam({ team_id: teamId, name, password }));
    },

    /** Only teams that have scores. */
    getRanks(): Promise<RankResponse[]> {
        return read(cachedJson(KEYS.scores + 'ranks', () => teams.getRanks()));
    },

    /** A team's schedule. */
    getEvents(teamId: number, { force = false }: ForceOption = {}): Promise<EventBase[]> {
        return read(cachedJson(KEYS.roster + `team-events:${teamId}`, () => teams.getEvents({ team_id: teamId }),
            { ttl: LONG_TERM_TTL, force }));
    },
};

export const scoreApi = {
    addScore(teamId: number, score: number, password: string): Promise<CreateScoreResponse> {
        return write(scores.createScore({ team_id: teamId, score, password }), KEYS.scores);
    },

    /** Removes one score with this value from the team. */
    removeScore(teamId: number, score: number, password: string): Promise<DetailResponse> {
        return write(scores.deleteScore({ team_id: teamId, score, password }), KEYS.scores);
    },

    removeScoreById(scoreId: number, password: string): Promise<DetailResponse> {
        return write(scores.deleteScore({ id: scoreId, password }), KEYS.scores);
    },
};

// Scores change constantly, so these always hit the network (cache = dedupe + offline fallback).
export const displayApi = {
    /** All teams, best average first. */
    getDisplay(): Promise<DisplayTeamScoresResponse[]> {
        return read(cachedJson(KEYS.scores + 'display', () => display.displayScores()));
    },

    getTeamScores(teamId: number): Promise<DisplayTeamScoresResponse> {
        return read(cachedJson(KEYS.scores + `display:${teamId}`, () => display.displayTeamScores(teamId)));
    },

    checkPassword(password: string): Promise<CheckPasswordResponse> {
        return read(display.checkPassword({ password }));
    },
};

// Schedule and rooms only change when the schedule CSV is reloaded; pass { force: true } to refetch.
export const scheduleApi = {
    getSchedule({ force = false }: ForceOption = {}): Promise<ScheduleResponse[]> {
        return read(cachedJson(SCHEDULE_KEY, () => schedule.getSchedule(), { ttl: LONG_TERM_TTL, force }));
    },

    getRooms({ force = false }: ForceOption = {}): Promise<RoomAssignmentResponse[]> {
        return read(cachedJson(ROOMS_KEY, () => schedule.roomAssignment(), { ttl: LONG_TERM_TTL, force }));
    },

    // When the data last returned by getSchedule()/getRooms() was actually fetched from the server.
    scheduleFetchedAt(): Date | null {
        return cachedAt(SCHEDULE_KEY);
    },

    roomsFetchedAt(): Date | null {
        return cachedAt(ROOMS_KEY);
    },
};
