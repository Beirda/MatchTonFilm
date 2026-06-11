import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

// Le mock officiel exécute withTiming/withSpring et runOnJS de façon synchrone,
// ce qui permet de tester la complétion du swipe sans timers réels.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ id: 'g1' }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
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

const mockGetGroupRecommendations = jest.fn();
jest.mock('@/lib/recommendations', () => ({
  getGroupRecommendations: (groupId: string, count: number) => mockGetGroupRecommendations(groupId, count),
}));

const mockGetMovieDetails = jest.fn();
jest.mock('@/lib/tmdb', () => ({
  tmdb: {
    getMovieDetails: (id: number) => mockGetMovieDetails(id),
  },
}));

const mockSaveVote = jest.fn();
jest.mock('@/lib/votes', () => ({
  saveVote: (groupId: string, movieId: number, vote: string) => mockSaveVote(groupId, movieId, vote),
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

  it("récupère les films recommandés pour le groupe", async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Ciné Club', emoji: '🎬' },
    });
    mockGetGroupRecommendations.mockResolvedValue([{ id: 1 }]);
    mockGetMovieDetails.mockResolvedValue(buildMovie(1, 'Dune'));

    const { getByText } = render(<SwipeScreen />);

    await waitFor(() => expect(getByText('Dune')).toBeTruthy());
    expect(mockGetGroupRecommendations).toHaveBeenCalledWith('g1', 10);
    expect(getByText('🎬 Ciné Club')).toBeTruthy();
  });

  it("affiche un message quand il n'y a plus de film à proposer", async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Soirée Coloc', emoji: '🍿' },
    });
    mockGetGroupRecommendations.mockResolvedValue([]);

    const { getByText } = render(<SwipeScreen />);

    await waitFor(() => expect(getByText("Plus de films pour l'instant")).toBeTruthy());
  });

  it('ouvre la fiche complète du film depuis la carte', async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Ciné Club', emoji: '🎬' },
    });
    mockGetGroupRecommendations.mockResolvedValue([{ id: 1 }]);
    mockGetMovieDetails.mockResolvedValue(buildMovie(1, 'Dune'));

    const { getByText, getByLabelText } = render(<SwipeScreen />);
    await waitFor(() => expect(getByText('Dune')).toBeTruthy());

    fireEvent.press(getByLabelText('Voir la fiche complète de Dune'));

    await waitFor(() => expect(getByText('Synopsis')).toBeTruthy());
  });

  it('enregistre le vote du groupe lors d\'un swipe', async () => {
    mockSingle.mockResolvedValue({
      data: { name: 'Ciné Club', emoji: '🎬' },
    });
    mockGetGroupRecommendations.mockResolvedValue([{ id: 1 }]);
    mockGetMovieDetails.mockResolvedValue(buildMovie(1, 'Dune'));

    const { getByText, getByLabelText } = render(<SwipeScreen />);
    await waitFor(() => expect(getByText('Dune')).toBeTruthy());

    fireEvent.press(getByLabelText("J'aime ce film"));

    await waitFor(() => expect(mockSaveVote).toHaveBeenCalledWith('g1', 1, 'like'));
  });
});
