"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importStar(require("node:test"));
const TMDBWrappers_1 = require("../wrappers/TMDBWrappers");
const API_KEY = "test-api-key";
const BASE_URL = "https://api.themoviedb.org/3/";
const originalFetch = global.fetch;
let fetchCalls = [];
function createJsonResponse(data, statusText = "OK") {
    return {
        ok: true,
        statusText,
        json: async () => data,
    };
}
function createErrorResponse(statusText = "Unauthorized") {
    return {
        ok: false,
        statusText,
        json: async () => ({}),
    };
}
function installFetchMock(...responses) {
    let index = 0;
    global.fetch = (async (input, init) => {
        fetchCalls.push({ input, init });
        const response = responses[index];
        if (!response) {
            throw new Error(`Unexpected fetch call #${index + 1}`);
        }
        index += 1;
        return response;
    });
}
function latestCall() {
    strict_1.default.ok(fetchCalls.length > 0, "Expected at least one fetch call");
    return fetchCalls[fetchCalls.length - 1];
}
function sampleMovie(id) {
    return {
        id,
        title: `Movie ${id}`,
    };
}
(0, node_test_1.beforeEach)(() => {
    fetchCalls = [];
});
(0, node_test_1.afterEach)(() => {
    global.fetch = originalFetch;
});
(0, node_test_1.default)("searchMovie encodes the query and sends TMDB headers", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = {
        page: 1,
        results: [sampleMovie(1)],
        total_pages: 1,
        total_results: 1,
    };
    installFetchMock(createJsonResponse(payload));
    const result = await client.searchMovie("Le fabuleux destin d'Amelie & co");
    strict_1.default.deepEqual(result, payload);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/search/movie?query=Le%20fabuleux%20destin%20d'Amelie%20%26%20co&language=fr-FR`);
    strict_1.default.deepEqual(latestCall().init, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            accept: "application/json",
        },
    });
});
(0, node_test_1.default)("request throws with the TMDB status text when the response is not ok", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    installFetchMock(createErrorResponse("Forbidden"));
    await strict_1.default.rejects(client.getMovie(99), {
        message: "TMDB Error Forbidden",
    });
});
(0, node_test_1.default)("getMovie requests the localized movie endpoint", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = sampleMovie(42);
    installFetchMock(createJsonResponse(payload));
    const result = await client.getMovie(42);
    strict_1.default.deepEqual(result, payload);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/movie/42?language=fr-FR`);
});
(0, node_test_1.default)("getPopularPage uses page 1 by default", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = {
        page: 1,
        results: [sampleMovie(1)],
        total_pages: 3,
        total_results: 60,
    };
    installFetchMock(createJsonResponse(payload));
    const result = await client.getPopularPage();
    strict_1.default.deepEqual(result, payload);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/movie/popular?page=1&language=fr-FR`);
});
(0, node_test_1.default)("getPopularPage forwards a custom page number", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = {
        page: 4,
        results: [sampleMovie(4)],
        total_pages: 8,
        total_results: 160,
    };
    installFetchMock(createJsonResponse(payload));
    const result = await client.getPopularPage(4);
    strict_1.default.deepEqual(result, payload);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/movie/popular?page=4&language=fr-FR`);
});
(0, node_test_1.default)("getPopularMovies aggregates several pages and trims the extra results", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    installFetchMock(createJsonResponse({
        page: 1,
        results: [sampleMovie(1), sampleMovie(2)],
        total_pages: 3,
        total_results: 6,
    }), createJsonResponse({
        page: 2,
        results: [sampleMovie(3), sampleMovie(4)],
        total_pages: 3,
        total_results: 6,
    }));
    const result = await client.getPopularMovies(3);
    strict_1.default.deepEqual(result, [sampleMovie(1), sampleMovie(2), sampleMovie(3)]);
    strict_1.default.equal(fetchCalls.length, 2);
    strict_1.default.equal(String(fetchCalls[0].input), `${BASE_URL}/movie/popular?page=1&language=fr-FR`);
    strict_1.default.equal(String(fetchCalls[1].input), `${BASE_URL}/movie/popular?page=2&language=fr-FR`);
});
(0, node_test_1.default)("getPopularMovies stops when the API has no more pages", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    installFetchMock(createJsonResponse({
        page: 1,
        results: [sampleMovie(1), sampleMovie(2)],
        total_pages: 1,
        total_results: 2,
    }));
    const result = await client.getPopularMovies(5);
    strict_1.default.deepEqual(result, [sampleMovie(1), sampleMovie(2)]);
    strict_1.default.equal(fetchCalls.length, 1);
});
(0, node_test_1.default)("getGenres returns only the nested genres array", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = {
        genres: [
            { id: 12, name: "Adventure" },
            { id: 35, name: "Comedy" },
        ],
    };
    installFetchMock(createJsonResponse(payload));
    const result = await client.getGenres();
    strict_1.default.deepEqual(result, payload.genres);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/genre/movie/list?language=fr-FR`);
});
(0, node_test_1.default)("discoverMoviesByGenres joins ids and uses page 1 by default", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = {
        page: 1,
        results: [sampleMovie(7)],
        total_pages: 2,
        total_results: 2,
    };
    installFetchMock(createJsonResponse(payload));
    const result = await client.discoverMoviesByGenres([28, 12]);
    strict_1.default.deepEqual(result, payload);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/discover/movie?with_genres=28,12&page=1&sort_by=popularity.desc&language=fr-FR`);
});
(0, node_test_1.default)("discoverMoviesByGenres forwards a custom page number", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    const payload = {
        page: 3,
        results: [sampleMovie(8)],
        total_pages: 5,
        total_results: 10,
    };
    installFetchMock(createJsonResponse(payload));
    const result = await client.discoverMoviesByGenres([16, 18], 3);
    strict_1.default.deepEqual(result, payload);
    strict_1.default.equal(String(latestCall().input), `${BASE_URL}/discover/movie?with_genres=16,18&page=3&sort_by=popularity.desc&language=fr-FR`);
});
(0, node_test_1.default)("getMoviesByGenres aggregates pages until the requested count is reached", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    installFetchMock(createJsonResponse({
        page: 1,
        results: [sampleMovie(10), sampleMovie(11)],
        total_pages: 4,
        total_results: 8,
    }), createJsonResponse({
        page: 2,
        results: [sampleMovie(12), sampleMovie(13)],
        total_pages: 4,
        total_results: 8,
    }));
    const result = await client.getMoviesByGenres([878], 3);
    strict_1.default.deepEqual(result, [sampleMovie(10), sampleMovie(11), sampleMovie(12)]);
    strict_1.default.equal(fetchCalls.length, 2);
});
(0, node_test_1.default)("getMoviesByGenres stops when the genre discovery reaches the last page", async () => {
    const client = new TMDBWrappers_1.TMDBClient(API_KEY);
    installFetchMock(createJsonResponse({
        page: 1,
        results: [sampleMovie(21)],
        total_pages: 1,
        total_results: 1,
    }));
    const result = await client.getMoviesByGenres([53], 10);
    strict_1.default.deepEqual(result, [sampleMovie(21)]);
    strict_1.default.equal(fetchCalls.length, 1);
});
