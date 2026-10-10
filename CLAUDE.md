# TuneUp Frontend (FLL Scoreboard)

Gatsby 5 + React 18 + react-bootstrap, deployed on Netlify (`netlify.toml`: Node 18, env vars,
redirects). `README.md` is stale CRA boilerplate; `ENVIRONMENT.md` documents env files.

## Commands
- `npm run develop` — dev server, loads `.env.dev`
- `npm run build` — production build, loads `.env` (`gatsby-config.js` picks the file by NODE_ENV)
- Local `gatsby build` fails when `sharp`'s native binary is missing: npm's `allowScripts` policy
  blocks sharp's install script (approve it via `npm install-scripts`); unrelated to app code.
- No tests exist despite the `test` script.

## Env vars (`GATSBY_*` are inlined at build time)
`GATSBY_BACKEND_URL`, `GATSBY_TIMER` (match timer, "2:30"), `GATSBY_SHOW_FORM`, `GATSBY_DIVISOR`.

## Layout
- `src/pages/` — one file per route: `home` (menu), `scoreboard` (projector view + timer),
  `admin` (score entry), `team/` (`/team?id=` detail), `multi-team` (compare), `schedule`, `rooms`
  (judging rooms), `health`. `/` redirects to `/home`.
- `src/components/` — page pieces (ScoreTable, Timer, InputForm, EventSchedule, RoomAssignments…).
- `src/api.js` — what pages import (`Team_API_Client`, `Score_API_Client`, `Display_API_Client`,
  `Schedule_API_Client`). A thin layer over the generated client that adds caching, invalidation
  and the legacy error convention: HTTP errors **resolve** with FastAPI's error body
  (`{ detail: ... }`) instead of throwing; only network failures reject.
- `src/apiClient/generated.ts` — NSwag-generated typed client (`TeamsClient`, `ScoresClient`,
  `DisplayClient`, `ScheduleClient` + request/response interfaces). **Never edit by hand.**
- User prefs (password, hidden teams/events, selections) live in `localStorage`; always guard
  with `typeof window !== 'undefined'` because pages are also rendered at build time (SSR).

## Generated API client (NSwag)
The backend's OpenAPI spec is the contract. To pick up backend changes:
1. Backend: `python scripts/export_openapi.py` (writes `TuneUp-App-Backend/openapi.json`)
2. Frontend: `npm run api:update` = `api:spec` (copies it to `api-spec/openapi.json`; pass a URL
   like `node scripts/update-api-spec.js http://127.0.0.1:8001` to read a running backend) +
   `api:generate` (`nswag run nswag.json`).
3. Commit `api-spec/openapi.json` and `src/apiClient/generated.ts`; adapt `src/api.js` if needed.

- NSwag needs the .NET 8 runtime **and** ASP.NET Core 8 runtime. On this machine they're installed
  user-locally: `export DOTNET_ROOT=$HOME/.dotnet PATH=$HOME/.dotnet:$PATH` before `api:generate`.
  Netlify never runs NSwag (the generated file is committed).
- `scripts/update-api-spec.js` down-converts FastAPI's OpenAPI 3.1 to 3.0 (`anyOf [T, null]` ->
  `nullable`, drops property titles, `additionalProperties: false`). Without it NSwag emits junk
  types (incl. one named `Date`) and drops fields.
- Generated clients default to `window` for fetch, which breaks Gatsby's build-time render; `api.js`
  always passes its own `http` object.

## Caching (`src/apiCache.js`)
- `cachedJson(key, load, { ttl, force })`: `load` returns the data (a generated-client call).
  Dedupes concurrent identical requests, serves from memory/localStorage within `ttl`, falls back
  to the last good copy on outages (network error / 5xx; a 4xx is rethrown), never caches errors.
- Keys are prefixed `KEYS.roster` (schedule, rooms, team events; `LONG_TERM_TTL` = 10 min) or
  `KEYS.scores` (ttl 0: always fetched). Writes in `api.js` call `invalidate(...)`.
- Refresh buttons pass `{ force: true }`. New read methods should go through `cachedJson`; new write
  methods must `invalidate` the prefixes they affect.
- The backend also sends ETags, so the browser revalidates uncached requests with cheap 304s.
