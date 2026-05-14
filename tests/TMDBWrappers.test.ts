import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";

import { TMDBClient } from "../wrappers/TMDBClient";

type FetchCall = {
  input: string | URL | Request;
  init?: RequestInit;
};

type MockResponse = {
  ok: boolean;
  statusText: string;
  json: () => Promise<unknown>;
};

const API_KEY = "test-api-key";
const BASE_URL = "https://api.themoviedb.org/3/";

const originalFetch = global.fetch;

let fetchCalls: FetchCall[] = [];

function createJsonResponse(data: unknown, statusText = "OK"): MockResponse {
  return {
    ok: true,
    statusText,
    json: async () => data,
  };
}

function createErrorResponse(statusText = "Unauthorized"): MockResponse {
  return {
    ok: false,
    statusText,
    json: async () => ({}),
  };
}

function installFetchMock(...responses: MockResponse[]) {
  let index = 0;

  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    fetchCalls.push({ input, init });

    const response = responses[index];

    if (!response) {
      throw new Error(`Unexpected fetch call #${index + 1}`);
    }

    index += 1;

    return response as unknown as Response;
  }) as typeof fetch;
}

function latestCall(): FetchCall {
  assert.ok(fetchCalls.length > 0, "Expected at least one fetch call");
  return fetchCalls[fetchCalls.length - 1];
}

function sampleMovie(id: number) {
  return {
    id,
    title: `Movie ${id}`,
  };
}

beforeEach(() => {
  fetchCalls = [];
});

afterEach(() => {
  global.fetch = originalFetch;
});

test("searchMovie encodes the query and sends TMDB headers", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = {
    page: 1,
    results: [sampleMovie(1)],
    total_pages: 1,
    total_results: 1,
  };

  installFetchMock(createJsonResponse(payload));

  const result = await client.searchMovie("Le fabuleux destin d'Amelie & co");

  assert.deepEqual(result, payload);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/search/movie?query=Le%20fabuleux%20destin%20d'Amelie%20%26%20co&language=fr-FR`
  );
  assert.deepEqual(latestCall().init, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      accept: "application/json",
    },
  });
});

test("request throws with the TMDB status text when the response is not ok", async () => {
  const client = new TMDBClient(API_KEY);

  installFetchMock(createErrorResponse("Forbidden"));

  await assert.rejects(client.getMovie(99), {
    message: "TMDB Error Forbidden",
  });
});

test("getMovie requests the localized movie endpoint", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = sampleMovie(42);

  installFetchMock(createJsonResponse(payload));

  const result = await client.getMovie(42);

  assert.deepEqual(result, payload);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/movie/42?language=fr-FR`
  );
});

test("getPopularPage uses page 1 by default", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = {
    page: 1,
    results: [sampleMovie(1)],
    total_pages: 3,
    total_results: 60,
  };

  installFetchMock(createJsonResponse(payload));

  const result = await client.getPopularPage();

  assert.deepEqual(result, payload);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/movie/popular?page=1&language=fr-FR`
  );
});

test("getPopularPage forwards a custom page number", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = {
    page: 4,
    results: [sampleMovie(4)],
    total_pages: 8,
    total_results: 160,
  };

  installFetchMock(createJsonResponse(payload));

  const result = await client.getPopularPage(4);

  assert.deepEqual(result, payload);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/movie/popular?page=4&language=fr-FR`
  );
});

test("getPopularMovies aggregates several pages and trims the extra results", async () => {
  const client = new TMDBClient(API_KEY);

  installFetchMock(
    createJsonResponse({
      page: 1,
      results: [sampleMovie(1), sampleMovie(2)],
      total_pages: 3,
      total_results: 6,
    }),
    createJsonResponse({
      page: 2,
      results: [sampleMovie(3), sampleMovie(4)],
      total_pages: 3,
      total_results: 6,
    })
  );

  const result = await client.getPopularMovies(3);

  assert.deepEqual(result, [sampleMovie(1), sampleMovie(2), sampleMovie(3)]);
  assert.equal(fetchCalls.length, 2);
  assert.equal(
    String(fetchCalls[0].input),
    `${BASE_URL}/movie/popular?page=1&language=fr-FR`
  );
  assert.equal(
    String(fetchCalls[1].input),
    `${BASE_URL}/movie/popular?page=2&language=fr-FR`
  );
});

test("getPopularMovies stops when the API has no more pages", async () => {
  const client = new TMDBClient(API_KEY);

  installFetchMock(
    createJsonResponse({
      page: 1,
      results: [sampleMovie(1), sampleMovie(2)],
      total_pages: 1,
      total_results: 2,
    })
  );

  const result = await client.getPopularMovies(5);

  assert.deepEqual(result, [sampleMovie(1), sampleMovie(2)]);
  assert.equal(fetchCalls.length, 1);
});

test("getGenres returns only the nested genres array", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = {
    genres: [
      { id: 12, name: "Adventure" },
      { id: 35, name: "Comedy" },
    ],
  };

  installFetchMock(createJsonResponse(payload));

  const result = await client.getGenres();

  assert.deepEqual(result, payload.genres);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/genre/movie/list?language=fr-FR`
  );
});

test("discoverMoviesByGenres joins ids and uses page 1 by default", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = {
    page: 1,
    results: [sampleMovie(7)],
    total_pages: 2,
    total_results: 2,
  };

  installFetchMock(createJsonResponse(payload));

  const result = await client.discoverMoviesByGenres([28, 12]);

  assert.deepEqual(result, payload);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/discover/movie?with_genres=28,12&page=1&sort_by=popularity.desc&language=fr-FR`
  );
});

test("discoverMoviesByGenres forwards a custom page number", async () => {
  const client = new TMDBClient(API_KEY);
  const payload = {
    page: 3,
    results: [sampleMovie(8)],
    total_pages: 5,
    total_results: 10,
  };

  installFetchMock(createJsonResponse(payload));

  const result = await client.discoverMoviesByGenres([16, 18], 3);

  assert.deepEqual(result, payload);
  assert.equal(
    String(latestCall().input),
    `${BASE_URL}/discover/movie?with_genres=16,18&page=3&sort_by=popularity.desc&language=fr-FR`
  );
});

test("getMoviesByGenres aggregates pages until the requested count is reached", async () => {
  const client = new TMDBClient(API_KEY);

  installFetchMock(
    createJsonResponse({
      page: 1,
      results: [sampleMovie(10), sampleMovie(11)],
      total_pages: 4,
      total_results: 8,
    }),
    createJsonResponse({
      page: 2,
      results: [sampleMovie(12), sampleMovie(13)],
      total_pages: 4,
      total_results: 8,
    })
  );

  const result = await client.getMoviesByGenres([878], 3);

  assert.deepEqual(result, [sampleMovie(10), sampleMovie(11), sampleMovie(12)]);
  assert.equal(fetchCalls.length, 2);
});

test("getMoviesByGenres stops when the genre discovery reaches the last page", async () => {
  const client = new TMDBClient(API_KEY);

  installFetchMock(
    createJsonResponse({
      page: 1,
      results: [sampleMovie(21)],
      total_pages: 1,
      total_results: 1,
    })
  );

  const result = await client.getMoviesByGenres([53], 10);

  assert.deepEqual(result, [sampleMovie(21)]);
  assert.equal(fetchCalls.length, 1);
});
