const mockEq = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({ select: () => ({ eq: () => mockEq(table) }) }),
  },
}));

const mockGetMovieDetails = jest.fn();
jest.mock('@/lib/tmdb', () => ({
  tmdb: {
    getMovieDetails: (id: number) => mockGetMovieDetails(id),
  },
}));

import { getGroupMatches } from '@/lib/matches';
import type { Movie } from '@/wrappers/TMDBTypes';

function buildMovie(id: number, title: string): Partial<Movie> {
  return { id, title, poster_path: null };
}

function mockTables({
  votes,
  members,
}: {
  votes: { data: unknown; error: Error | null };
  members: { data: unknown; error: Error | null };
}) {
  mockEq.mockImplementation((table: string) =>
    Promise.resolve(table === 'votes' ? votes : members),
  );
}

describe('getGroupMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('utilise le nombre de membres du groupe comme dénominateur', async () => {
    mockTables({
      votes: {
        data: [
          { movie_id: 1, vote: 'like' },
          { movie_id: 2, vote: 'like' },
          { movie_id: 2, vote: 'like' },
        ],
        error: null,
      },
      members: { data: [{ user_id: 'u1' }, { user_id: 'u2' }], error: null },
    });
    mockGetMovieDetails.mockImplementation((id: number) =>
      Promise.resolve(buildMovie(id, id === 1 ? 'Dune' : 'Oppenheimer')),
    );

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([
      { movie: buildMovie(2, 'Oppenheimer'), likes: 2, total: 2, pct: 100 },
      { movie: buildMovie(1, 'Dune'), likes: 1, total: 2, pct: 50 },
    ]);
  });

  it('ne dépasse jamais 100 % quand un film a plus de votes que de membres', async () => {
    mockTables({
      votes: {
        data: [
          { movie_id: 1, vote: 'like' },
          { movie_id: 1, vote: 'like' },
          { movie_id: 1, vote: 'dislike' },
        ],
        error: null,
      },
      members: { data: [{ user_id: 'u1' }, { user_id: 'u2' }], error: null },
    });
    mockGetMovieDetails.mockImplementation((id: number) =>
      Promise.resolve(buildMovie(id, 'Dune')),
    );

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([
      { movie: buildMovie(1, 'Dune'), likes: 2, total: 3, pct: 67 },
    ]);
  });

  it('retombe sur le nombre de votes si la liste des membres est indisponible', async () => {
    mockTables({
      votes: {
        data: [
          { movie_id: 1, vote: 'like' },
          { movie_id: 1, vote: 'dislike' },
        ],
        error: null,
      },
      members: { data: null, error: new Error('boom') },
    });
    mockGetMovieDetails.mockImplementation((id: number) =>
      Promise.resolve(buildMovie(id, 'Dune')),
    );

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([
      { movie: buildMovie(1, 'Dune'), likes: 1, total: 2, pct: 50 },
    ]);
  });

  it("retourne un tableau vide quand il n'y a aucun vote", async () => {
    mockTables({
      votes: { data: [], error: null },
      members: { data: [{ user_id: 'u1' }], error: null },
    });

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([]);
    expect(mockGetMovieDetails).not.toHaveBeenCalled();
  });

  it("retourne un tableau vide en cas d'erreur sur les votes", async () => {
    mockTables({
      votes: { data: null, error: new Error('boom') },
      members: { data: [{ user_id: 'u1' }], error: null },
    });

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([]);
  });

  it('ignore un film dont les détails TMDB sont indisponibles', async () => {
    mockTables({
      votes: {
        data: [
          { movie_id: 1, vote: 'like' },
          { movie_id: 2, vote: 'like' },
        ],
        error: null,
      },
      members: { data: [{ user_id: 'u1' }], error: null },
    });
    mockGetMovieDetails.mockImplementation((id: number) =>
      id === 1 ? Promise.reject(new Error('TMDB Error Not Found')) : Promise.resolve(buildMovie(2, 'Oppenheimer')),
    );

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([
      { movie: buildMovie(2, 'Oppenheimer'), likes: 1, total: 1, pct: 100 },
    ]);
  });
});
