// API used by pages/components. Requests go through the NSwag-generated client in
// src/apiClient/generated.ts (regenerate with `npm run api:update` after backend changes), so
// URLs, request bodies and response types always match the backend's OpenAPI spec.
//
// This layer adds what the generated client doesn't know about: caching (src/apiCache.js),
// cache invalidation after writes, and the legacy error convention pages rely on.
import { cachedAt, cachedJson, invalidate, KEYS, LONG_TERM_TTL } from './apiCache';
import { DisplayClient, ScheduleClient, ScoresClient, TeamsClient } from './apiClient/generated';

/** @typedef {import('./apiClient/generated').TeamDataBulkResponse} TeamDataBulkResponse */
/** @typedef {import('./apiClient/generated').TeamSingularResponse} TeamSingularResponse */
/** @typedef {import('./apiClient/generated').RankResponse} RankResponse */
/** @typedef {import('./apiClient/generated').EventBase} EventBase */
/** @typedef {import('./apiClient/generated').DeleteTeamResponse} DeleteTeamResponse */
/** @typedef {import('./apiClient/generated').DetailResponse} DetailResponse */
/** @typedef {import('./apiClient/generated').CreateScoreResponse} CreateScoreResponse */
/** @typedef {import('./apiClient/generated').DisplayTeamScoresResponse} DisplayTeamScoresResponse */
/** @typedef {import('./apiClient/generated').CheckPasswordResponse} CheckPasswordResponse */
/** @typedef {import('./apiClient/generated').ScheduleResponse} ScheduleResponse */
/** @typedef {import('./apiClient/generated').RoomAssignmentResponse} RoomAssignmentResponse */
/** @typedef {{ detail: any }} ErrorBody FastAPI error body, e.g. { detail: "Unauthorized" } */

const BASE_URL = process.env.GATSBY_BACKEND_URL || 'https://tuneup-backend-7cb9db42de78.herokuapp.com';

// Resolve `fetch` at call time: the generated clients default to `window`, which doesn't exist
// while Gatsby renders pages at build time.
const http = { fetch: (url, init) => fetch(url, init) };

const teams = new TeamsClient(BASE_URL, http);
const scores = new ScoresClient(BASE_URL, http);
const display = new DisplayClient(BASE_URL, http);
const schedule = new ScheduleClient(BASE_URL, http);

// The generated clients throw on non-2xx responses: a parsed body for declared errors (422),
// an ApiException (with the raw `response` text) otherwise. Pages were written against the old
// fetch().then(r => r.json()) API, which resolved with the error body instead, e.g.
// { detail: "Unauthorized" }. Keep that contract; network failures still reject.
function errorBody(error) {
    if (error && error.isApiException) {
        try {
            return JSON.parse(error.response);
        } catch (e) {
            return { detail: error.response || error.message };
        }
    }
    if (error instanceof Error) throw error; // network failure
    return error; // parsed error body thrown by the generated client
}

const read = (promise) => promise.catch(errorBody);
// Writes drop the cached data they affect, whether or not they succeeded.
const write = (promise, ...prefixes) => promise.finally(() => invalidate(...prefixes)).catch(errorBody);

const SCHEDULE_KEY = KEYS.roster + 'schedule';
const ROOMS_KEY = KEYS.roster + 'rooms';

export class Team_API_Client {
    /** @returns {Promise<TeamDataBulkResponse>} */
    getAllTeams() {
        return read(cachedJson(KEYS.scores + 'teams', () => teams.getAllTeams()));
    }

    /** @returns {Promise<TeamSingularResponse | ErrorBody>} */
    createTeam(name, id, password) {
        return write(teams.createTeam({ team_id: id, name, password }));
    }

    /** @returns {Promise<TeamSingularResponse | ErrorBody>} */
    getSpecificTeam(team_id) {
        return read(teams.getTeam(team_id));
    }

    /** @returns {Promise<DeleteTeamResponse | ErrorBody>} */
    deleteTeam(team_id, password) {
        return write(teams.deleteTeam({ team_id, password }));
    }

    /** @returns {Promise<DetailResponse | ErrorBody>} */
    editTeam(team_id, name, password) {
        return write(teams.renameTeam({ team_id, name, password }));
    }

    /** @returns {Promise<RankResponse[]>} */
    getRanks() {
        return read(cachedJson(KEYS.scores + 'ranks', () => teams.getRanks()));
    }

    /** A team's schedule (events). @returns {Promise<EventBase[] | ErrorBody>} */
    getSchedule(team_id, { force = false } = {}) {
        return read(cachedJson(KEYS.roster + `team-events:${team_id}`, () => teams.getEvents({ team_id }),
            { ttl: LONG_TERM_TTL, force }));
    }
}

export class Score_API_Client {
    /** @returns {Promise<CreateScoreResponse | ErrorBody>} */
    addScore(team_id, score, password) {
        return write(scores.createScore({ team_id, score, password }), KEYS.scores);
    }

    /** Removes one score with this value from the team. @returns {Promise<DetailResponse | ErrorBody>} */
    removeScore(team_id, score, password) {
        return write(scores.deleteScore({ team_id, score, password }), KEYS.scores);
    }

    /** @returns {Promise<DetailResponse | ErrorBody>} */
    removeScoreById(scoreId, password) {
        return write(scores.deleteScore({ id: scoreId, password }), KEYS.scores);
    }
}

export class Display_API_Client {
    // Scores change constantly, so these always hit the network (cache = dedupe + offline fallback).
    /** All teams, best average first. @returns {Promise<DisplayTeamScoresResponse[]>} */
    getDisplay() {
        return read(cachedJson(KEYS.scores + 'display', () => display.displayScores()));
    }

    /** @returns {Promise<DisplayTeamScoresResponse | ErrorBody>} */
    getDisplayById(teamId) {
        return read(cachedJson(KEYS.scores + `display:${teamId}`, () => display.displayTeamScores(teamId)));
    }

    /** @returns {Promise<CheckPasswordResponse>} */
    checkDisplayPassword(password) {
        return read(display.checkPassword({ password }));
    }
}

export class Schedule_API_Client {
    // Schedule and rooms only change when the schedule CSV is reloaded; pass { force: true } to refetch.
    /** @returns {Promise<ScheduleResponse[]>} */
    getSchedule({ force = false } = {}) {
        return read(cachedJson(SCHEDULE_KEY, () => schedule.getSchedule(), { ttl: LONG_TERM_TTL, force }));
    }

    /** @returns {Promise<RoomAssignmentResponse[]>} */
    getRooms({ force = false } = {}) {
        return read(cachedJson(ROOMS_KEY, () => schedule.roomAssignment(), { ttl: LONG_TERM_TTL, force }));
    }

    // When the data last returned by getSchedule()/getRooms() was actually fetched from the server.
    scheduleFetchedAt() {
        return cachedAt(SCHEDULE_KEY);
    }

    roomsFetchedAt() {
        return cachedAt(ROOMS_KEY);
    }
}
