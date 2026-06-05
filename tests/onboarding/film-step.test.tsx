import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import FilmStep from '@/components/onboarding/film-step';

// Les données doivent etre declarees a l interieur de la factory pour eviter
// le hoisting de jest.mock qui les rendrait undefined a l execution.
jest.mock('@/lib/tmdb', () => {
  const movies = [
    {
      id: 1, title: 'Dune', poster_path: '/dune.jpg',
      genres: [], overview: '', release_date: '', runtime: 0,
      adult: false, video: false, original_title: 'Dune',
      original_language: 'en', tagline: '', status: '',
      popularity: 0, vote_average: 8, vote_count: 0,
      budget: 0, revenue: 0, homepage: null, imdb_id: null,
      backdrop_path: null, production_companies: [],
      production_countries: [], spoken_languages: [],
      credits: { cast: [], crew: [] },
    },
    {
      id: 2, title: 'Parasite', poster_path: null,
      genres: [], overview: '', release_date: '', runtime: 0,
      adult: false, video: false, original_title: 'Parasite',
      original_language: 'ko', tagline: '', status: '',
      popularity: 0, vote_average: 9, vote_count: 0,
      budget: 0, revenue: 0, homepage: null, imdb_id: null,
      backdrop_path: null, production_companies: [],
      production_countries: [], spoken_languages: [],
      credits: { cast: [], crew: [] },
    },
  ];
  return {
    tmdb: {
      getMoviesByGenres: jest.fn().mockResolvedValue(movies),
      getPopularMovies: jest.fn().mockResolvedValue(movies),
      searchMovie: jest.fn().mockResolvedValue({ results: [movies[0]] }),
      getSimilar: jest.fn().mockResolvedValue({ results: [] }),
    },
  };
});

const mockGenres = [{ id: 878, name: 'Science-Fiction' }];

describe('FilmStep', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    jest.requireMock('@/lib/tmdb').tmdb.getSimilar.mockClear();
  });

  it('appelle getMoviesByGenres avec les ids des genres au montage', async () => {
    const { tmdb } = jest.requireMock('@/lib/tmdb');
    render(<FilmStep genres={mockGenres} selected={[]} onToggle={mockOnToggle} />);
    await waitFor(() => expect(tmdb.getMoviesByGenres).toHaveBeenCalledWith([878], 20));
  });

  it('utilise getPopularMovies en fallback si aucun genre', async () => {
    const { tmdb } = jest.requireMock('@/lib/tmdb');
    render(<FilmStep genres={[]} selected={[]} onToggle={mockOnToggle} />);
    await waitFor(() => expect(tmdb.getPopularMovies).toHaveBeenCalledWith(20));
  });

  it('appelle onToggle avec la bonne FilmPreference au tap', async () => {
    const { findByTestId } = render(
      <FilmStep genres={mockGenres} selected={[]} onToggle={mockOnToggle} />
    );
    fireEvent.press(await findByTestId('film-item-1'));
    await waitFor(() =>
      expect(mockOnToggle).toHaveBeenCalledWith({
        tmdbId: 1,
        title: 'Dune',
        posterPath: '/dune.jpg',
      })
    );
  });

  it('appelle getSimilar apres selection', async () => {
    const { tmdb } = jest.requireMock('@/lib/tmdb');
    const { findByTestId } = render(
      <FilmStep genres={mockGenres} selected={[]} onToggle={mockOnToggle} />
    );
    fireEvent.press(await findByTestId('film-item-1'));
    await waitFor(() => expect(tmdb.getSimilar).toHaveBeenCalledWith(1));
  });

  it('ne rappelle pas getSimilar a la deselection', async () => {
    const { tmdb } = jest.requireMock('@/lib/tmdb');
    const selected = [{ tmdbId: 1, title: 'Dune', posterPath: '/dune.jpg' }];
    const { findByTestId } = render(
      <FilmStep genres={mockGenres} selected={selected} onToggle={mockOnToggle} />
    );
    fireEvent.press(await findByTestId('film-item-1'));
    await waitFor(() => expect(tmdb.getSimilar).not.toHaveBeenCalled());
  });
});
