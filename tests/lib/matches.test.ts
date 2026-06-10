const mockEq = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: (...args: unknown[]) => mockEq(...args) }) }),
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

describe('getGroupMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calcule le score (likes / total votes) par film et trie par score décroissant', async () => {
    mockEq.mockResolvedValue({
      data: [
        { movie_id: 1, vote: 'like' },
        { movie_id: 1, vote: 'like' },
        { movie_id: 1, vote: 'dislike' },
        { movie_id: 2, vote: 'like' },
        { movie_id: 2, vote: 'like' },
      ],
      error: null,
    });
    mockGetMovieDetails.mockImplementation((id: number) =>
      Promise.resolve(buildMovie(id, id === 1 ? 'Dune' : 'Oppenheimer')),
    );

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([
      { movie: buildMovie(2, 'Oppenheimer'), likes: 2, total: 2, pct: 100 },
      { movie: buildMovie(1, 'Dune'), likes: 2, total: 3, pct: 67 },
    ]);
  });

  it("retourne un tableau vide quand il n'y a aucun vote", async () => {
    mockEq.mockResolvedValue({ data: [], error: null });

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([]);
    expect(mockGetMovieDetails).not.toHaveBeenCalled();
  });

  it('retourne un tableau vide en cas d\'erreur', async () => {
    mockEq.mockResolvedValue({ data: null, error: new Error('boom') });

    const ranking = await getGroupMatches('g1');

    expect(ranking).toEqual([]);
  });

  it('ignore un film dont les détails TMDB sont indisponibles', async () => {
    mockEq.mockResolvedValue({
      data: [
        { movie_id: 1, vote: 'like' },
        { movie_id: 2, vote: 'like' },
      ],
      error: null,
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
