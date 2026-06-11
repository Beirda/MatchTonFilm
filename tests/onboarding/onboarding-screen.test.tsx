import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import OnboardingScreen from '@/app/onboarding';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ userId: null, email: '', loading: false }),
}));
jest.mock('@/services/preferences', () => ({
  saveUserPreferences: jest.fn().mockResolvedValue(undefined),
  hasCompletedOnboarding: jest.fn().mockResolvedValue(false),
}));
// FilmStep s'appuie sur tmdb — on stub tous les appels pour éviter des appels
// réseau réels (et des rejections non gérées) quand onboarding-screen navigue vers l'étape films.
jest.mock('@/lib/tmdb', () => ({
  tmdb: {
    getMoviesByGenres: jest.fn().mockResolvedValue([]),
    getPopularMovies: jest.fn().mockResolvedValue([]),
    searchMovie: jest.fn().mockResolvedValue({ results: [] }),
    getSimilar: jest.fn().mockResolvedValue({ results: [] }),
    getRecommendations: jest.fn().mockResolvedValue({ results: [] }),
  },
}));

describe('OnboardingScreen', () => {
  it('démarre sur l\'étape des genres', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Tes genres préférés')).toBeTruthy();
  });

  it('affiche "Encore X à choisir" avec moins de 3 genres', () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Action'));
    fireEvent.press(getByText('Thriller'));
    expect(getByText('Encore 1 à choisir')).toBeTruthy();
  });

  it('active le bouton Continuer à partir de 3 genres', () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Action'));
    fireEvent.press(getByText('Thriller'));
    fireEvent.press(getByText('Horreur'));
    expect(getByText('Continuer')).toBeTruthy();
  });

  it('avance à l\'étape films après avoir sélectionné 3 genres et appuyé Continuer', () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Action'));
    fireEvent.press(getByText('Thriller'));
    fireEvent.press(getByText('Horreur'));
    fireEvent.press(getByText('Continuer'));
    expect(getByText('Des films que tu adores')).toBeTruthy();
  });

  it('désélectionne un genre au second tap', () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Action'));
    fireEvent.press(getByText('Thriller'));
    fireEvent.press(getByText('Horreur'));
    // désélectionner Horreur
    fireEvent.press(getByText('Horreur'));
    expect(getByText('Encore 1 à choisir')).toBeTruthy();
  });
});
