import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import FilmStep from '@/components/onboarding/film-step';

// Les données doivent être déclarées à l'intérieur de la factory pour éviter
// le hoisting de jest.mock qui les rendrait undefined à l'exécution.
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

  it('affiche les films après chargement', async () => {
    const { findByText } = render(
      <FilmStep genres={mockGenres} selected={[]} onToggle={mockOnToggle} />
    );
    expect(await findByText('Dune')).toBeTruthy();
    expect(await findByText('Parasite')).toBeTruthy();
  });

  it('appelle onToggle avec la bonne FilmPreference au tap', async () => {
    const { findByText } = render(
      <FilmStep genres={mockGenres} selected={[]} onToggle={mockOnToggle} />
    );
    fireEvent.press(await findByText('Dune'));
    await waitFor(() =>
      expect(mockOnToggle).toHaveBeenCalledWith({
        tmdbId: 1,
        title: 'Dune',
        posterPath: '/dune.jpg',
      })
    );
  });

  it('appelle getSimilar après sélection d\'un film', async () => {
    const { tmdb } = jest.requireMock('@/lib/tmdb');
    const { findByText } = render(
      <FilmStep genres={mockGenres} selected={[]} onToggle={mockOnToggle} />
    );
    fireEvent.press(await findByText('Dune'));
    await waitFor(() => expect(tmdb.getSimilar).toHaveBeenCalledWith(1));
  });

  it('ne rappelle pas getSimilar lors d\'une désélection', async () => {
    const { tmdb } = jest.requireMock('@/lib/tmdb');
    const selected = [{ tmdbId: 1, title: 'Dune', posterPath: '/dune.jpg' }];
    const { findByText } = render(
      <FilmStep genres={mockGenres} selected={selected} onToggle={mockOnToggle} />
    );
    fireEvent.press(await findByText('Dune'));
    await waitFor(() => expect(tmdb.getSimilar).not.toHaveBeenCalled());
  });
});
