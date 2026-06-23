import React from 'react';
import { Image } from 'expo-image';
import { render, waitFor } from '@testing-library/react-native';

import PosterMarquee from '@/components/auth/poster-marquee';
import { tmdb } from '@/lib/tmdb';

jest.mock('@/lib/tmdb', () => ({
  tmdb: { getPopularMovies: jest.fn() },
}));

const mockedTmdb = tmdb as jest.Mocked<typeof tmdb>;

function makeMovie(id: number, poster_path: string | null) {
  return {
    id,
    title: `Populaire ${id}`,
    poster_path,
    original_title: `Populaire ${id}`,
    overview: '',
    tagline: '',
    release_date: '',
    runtime: 0,
    adult: false,
    video: false,
    original_language: 'fr',
    status: '',
    popularity: 0,
    vote_average: 0,
    vote_count: 0,
    budget: 0,
    revenue: 0,
    homepage: null,
    imdb_id: null,
    backdrop_path: null,
    genres: [],
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
    credits: { cast: [], crew: [] },
  };
}

describe('PosterMarquee', () => {
  afterEach(() => jest.clearAllMocks());

  it('rend les titres de repli avant que TMDB réponde', () => {
    mockedTmdb.getPopularMovies.mockReturnValue(new Promise(() => {}));
    const { getAllByText } = render(<PosterMarquee />);
    // Le marquee est décoratif (masqué aux lecteurs d'écran) → on inclut les nœuds cachés.
    // Chaque colonne duplique sa liste → un même titre apparaît plusieurs fois.
    const opts = { includeHiddenElements: true };
    expect(getAllByText('Parasite', opts).length).toBeGreaterThanOrEqual(2);
    expect(getAllByText('Joker', opts).length).toBeGreaterThanOrEqual(2);
  });

  it('affiche les vraies affiches TMDB une fois chargées', async () => {
    const movies = Array.from({ length: 12 }, (_, i) => makeMovie(i + 1, `/p${i + 1}.jpg`));
    mockedTmdb.getPopularMovies.mockResolvedValue(movies as never);

    const screen = render(<PosterMarquee />);

    await waitFor(() => {
      const images = screen.UNSAFE_getAllByType(Image);
      expect(images.length).toBeGreaterThan(0);
      expect(images[0].props.source.uri).toContain('image.tmdb.org');
      expect(images[0].props.source.uri).toContain('/p1.jpg');
    });
  });

  it('ignore les films sans affiche et garde le repli si trop peu de couvertures', async () => {
    mockedTmdb.getPopularMovies.mockResolvedValue([
      makeMovie(1, '/p1.jpg'),
      makeMovie(2, null),
    ] as never);

    const screen = render(<PosterMarquee />);

    await waitFor(() => expect(mockedTmdb.getPopularMovies).toHaveBeenCalled());

    const opts = { includeHiddenElements: true };
    expect(screen.getAllByText('Parasite', opts).length).toBeGreaterThanOrEqual(2);
    expect(screen.UNSAFE_queryAllByType(Image)).toHaveLength(0);
  });

  it('garde le repli si TMDB échoue', async () => {
    mockedTmdb.getPopularMovies.mockRejectedValue(new Error('TMDB down'));

    const screen = render(<PosterMarquee />);

    await waitFor(() => expect(mockedTmdb.getPopularMovies).toHaveBeenCalled());

    const opts = { includeHiddenElements: true };
    expect(screen.getAllByText('Joker', opts).length).toBeGreaterThanOrEqual(2);
    expect(screen.UNSAFE_queryAllByType(Image)).toHaveLength(0);
  });
});
