const mockSingle = jest.fn();
const mockMembers = jest.fn();
const mockUserGenres = jest.fn();
const mockGetMoviesByGenres = jest.fn();
const mockGetPopularMovies = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'groups') {
        return { select: () => ({ eq: () => ({ single: () => mockSingle() }) }) };
      }
      if (table === 'group_members') {
        return { select: () => ({ eq: () => mockMembers() }) };
      }
      return { select: () => ({ in: () => mockUserGenres() }) };
    },
  },
}));

jest.mock('@/lib/tmdb', () => ({
  tmdb: {
    getMoviesByGenres: (...args: unknown[]) => mockGetMoviesByGenres(...args),
    getPopularMovies: (...args: unknown[]) => mockGetPopularMovies(...args),
  },
}));

import { getGroupRecommendations, intersectGenreIds } from '@/lib/recommendations';

function movie(id: number, adult = false) {
  return { id, title: `Film ${id}`, adult };
}

describe('intersectGenreIds', () => {
  it("renvoie les genres du groupe si les membres n'en ont aucun", () => {
    expect(intersectGenreIds([28, 12], [])).toEqual([28, 12]);
  });

  it("renvoie les genres des membres si le groupe n'en filtre aucun", () => {
    expect(intersectGenreIds([], [35, 18])).toEqual([35, 18]);
  });

  it('renvoie l\'intersection quand elle existe', () => {
    expect(intersectGenreIds([28, 12, 35], [35, 18, 28])).toEqual([28, 35]);
  });

  it('retombe sur les genres du groupe si l\'intersection est vide', () => {
    expect(intersectGenreIds([28, 12], [35, 18])).toEqual([28, 12]);
  });
});

describe('getGroupRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMembers.mockResolvedValue({ data: [{ user_id: 'u1' }, { user_id: 'u2' }], error: null });
    mockUserGenres.mockResolvedValue({ data: [], error: null });
    mockGetMoviesByGenres.mockResolvedValue([]);
    mockGetPopularMovies.mockResolvedValue([]);
  });

  it("renvoie [] si le groupe n'existe pas", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });

    expect(await getGroupRecommendations('g1')).toEqual([]);
    expect(mockGetMoviesByGenres).not.toHaveBeenCalled();
  });

  it("interroge TMDB sur l'intersection genres groupe / préférences membres", async () => {
    mockSingle.mockResolvedValue({ data: { genres: ['Action', 'Comédie'], age_rating: '12+' }, error: null });
    mockUserGenres.mockResolvedValue({ data: [{ tmdb_genre_id: 28 }, { tmdb_genre_id: 53 }], error: null });
    mockGetMoviesByGenres.mockResolvedValue([movie(1)]);

    const result = await getGroupRecommendations('g1', 5);

    expect(mockGetMoviesByGenres).toHaveBeenCalledWith([28], 5, { includeAdult: false });
    expect(result).toEqual([movie(1)]);
  });

  it("retombe sur les films populaires si aucun genre n'est défini", async () => {
    mockSingle.mockResolvedValue({ data: { genres: [], age_rating: 'Tous' }, error: null });
    mockMembers.mockResolvedValue({ data: [], error: null });
    mockGetPopularMovies.mockResolvedValue([movie(2)]);

    const result = await getGroupRecommendations('g1', 5);

    expect(mockGetMoviesByGenres).not.toHaveBeenCalled();
    expect(mockGetPopularMovies).toHaveBeenCalledWith(5);
    expect(result).toEqual([movie(2)]);
  });

  it('autorise le contenu adulte uniquement pour les groupes 18+', async () => {
    mockSingle.mockResolvedValue({ data: { genres: ['Horreur'], age_rating: '18+' }, error: null });
    mockGetMoviesByGenres.mockResolvedValue([movie(3, true)]);

    const result = await getGroupRecommendations('g1');

    expect(mockGetMoviesByGenres).toHaveBeenCalledWith([27], 20, { includeAdult: true });
    expect(result).toEqual([movie(3, true)]);
  });

  it('filtre le contenu adulte hors limite 18+', async () => {
    mockSingle.mockResolvedValue({ data: { genres: ['Horreur'], age_rating: '16+' }, error: null });
    mockGetMoviesByGenres.mockResolvedValue([movie(4, true), movie(5, false)]);

    const result = await getGroupRecommendations('g1');

    expect(result).toEqual([movie(5, false)]);
  });
});
