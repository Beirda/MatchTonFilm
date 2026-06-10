import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ id: 'g1' }),
}));

// react-native-webview nécessite un module natif indisponible sous Jest ;
// le composant n'est de toute façon rendu que lorsqu'une bande-annonce est ouverte.
jest.mock('react-native-webview', () => ({ WebView: () => null }));

const mockSingle = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ single: () => mockSingle() }) }) }),
  },
}));

const mockGetGenres = jest.fn();
const mockGetMoviesByGenres = jest.fn();
const mockGetPopularMovies = jest.fn();
const mockGetMovieDetails = jest.fn();
jest.mock('@/lib/tmdb', () => ({
  tmdb: {
    getGenres: () => mockGetGenres(),
    getMoviesByGenres: (ids: number[], count: number) => mockGetMoviesByGenres(ids, count),
    getPopularMovies: (count: number) => mockGetPopularMovies(count),
    getMovieDetails: (id: number) => mockGetMovieDetails(id),
  },
}));

import SwipeScreen from '@/app/groups/[id]/swipe';
import type { Movie } from '@/wrappers/TMDBTypes';

function buildMovie(id: number, title: string): Movie {
  return {
    id,
    title,
    original_title: title,
    overview: 'Résumé du film.',
    tagline: '',
    release_date: '2024-01-01',
    runtime: 100,
    adult: false,
    video: false,
    original_language: 'en',
    status: 'Released',
    popularity: 0,
    vote_average: 7,
    vote_count: 0,
    budget: 0,
    revenue: 0,
    homepage: null,
    imdb_id: null,
    poster_path: null,
    backdrop_path: null,
    genres: [],
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
    credits: { cast: [], crew: [] },
    videos: { results: [] },
  };
}

describe('SwipeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("récupère les films à partir des genres du groupe (insensible à la casse)", async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Ciné Club', emoji: '🎬', genres: ['Science-fiction'] },
    });
    mockGetGenres.mockResolvedValue([
      { id: 878, name: 'Science-Fiction' },
      { id: 35, name: 'Comédie' },
    ]);
    mockGetMoviesByGenres.mockResolvedValue([{ id: 1 }]);
    mockGetMovieDetails.mockResolvedValue(buildMovie(1, 'Dune'));

    const { getByText } = render(<SwipeScreen />);

    await waitFor(() => expect(getByText('Dune')).toBeTruthy());
    expect(mockGetMoviesByGenres).toHaveBeenCalledWith([878], 10);
    expect(mockGetPopularMovies).not.toHaveBeenCalled();
    expect(getByText('🎬 Ciné Club')).toBeTruthy();
  });

  it("retombe sur les films populaires si le groupe n'a pas de genre reconnu", async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Soirée Coloc', emoji: '🍿', genres: [] },
    });
    mockGetGenres.mockResolvedValue([{ id: 878, name: 'Science-Fiction' }]);
    mockGetPopularMovies.mockResolvedValue([{ id: 2 }]);
    mockGetMovieDetails.mockResolvedValue(buildMovie(2, 'Film populaire'));

    const { getByText } = render(<SwipeScreen />);

    await waitFor(() => expect(getByText('Film populaire')).toBeTruthy());
    expect(mockGetPopularMovies).toHaveBeenCalledWith(10);
    expect(mockGetMoviesByGenres).not.toHaveBeenCalled();
  });

  it("affiche un message quand il n'y a plus de film à proposer", async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Soirée Coloc', emoji: '🍿', genres: [] },
    });
    mockGetGenres.mockResolvedValue([]);
    mockGetPopularMovies.mockResolvedValue([]);

    const { getByText } = render(<SwipeScreen />);

    await waitFor(() => expect(getByText("Plus de films pour l'instant")).toBeTruthy());
  });
});
