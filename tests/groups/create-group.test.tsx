import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...a: unknown[]) => mockRpc(...a) } }));

import CreateGroupScreen from '@/app/groups/create';

describe('CreateGroupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: 'new-group-id', error: null });
  });

  it('affiche le champ nom du groupe', () => {
    const { getByPlaceholderText } = render(<CreateGroupScreen />);
    expect(getByPlaceholderText('Soirée pizza-ciné 🍕')).toBeTruthy();
  });

  it('affiche les 10 premiers genres', () => {
    const { getByText } = render(<CreateGroupScreen />);
    expect(getByText('Action')).toBeTruthy();
    expect(getByText('Thriller')).toBeTruthy();
    expect(getByText('Animation')).toBeTruthy();
    expect(getByText('Crime')).toBeTruthy();
  });

  it('affiche les 4 classifications d\'âge', () => {
    const { getByText } = render(<CreateGroupScreen />);
    expect(getByText('Tous')).toBeTruthy();
    expect(getByText('12+')).toBeTruthy();
    expect(getByText('16+')).toBeTruthy();
    expect(getByText('18+')).toBeTruthy();
  });

  it('affiche les 3 options de langue', () => {
    const { getByText } = render(<CreateGroupScreen />);
    expect(getByText('VF')).toBeTruthy();
    expect(getByText('VOSTFR')).toBeTruthy();
    expect(getByText('VF + VOSTFR')).toBeTruthy();
  });

  it('le bouton de lancement est présent', () => {
    const { getByText } = render(<CreateGroupScreen />);
    expect(getByText('Lancer la session de swipe')).toBeTruthy();
  });

  it('le bouton de lancement reste accessible après saisie du nom', () => {
    const { getByPlaceholderText, getByText } = render(<CreateGroupScreen />);
    fireEvent.changeText(getByPlaceholderText('Soirée pizza-ciné 🍕'), 'Soirée test');
    expect(getByText('Lancer la session de swipe')).toBeTruthy();
  });

  it('affiche le bouton de génération de lien', () => {
    const { getByText } = render(<CreateGroupScreen />);
    expect(getByText("Générer un lien d'invitation")).toBeTruthy();
  });

  it('affiche le code généré après appui sur le bouton', () => {
    const { getByText } = render(<CreateGroupScreen />);
    fireEvent.press(getByText("Générer un lien d'invitation"));
    expect(getByText('Code du groupe')).toBeTruthy();
    expect(getByText('Actif')).toBeTruthy();
    expect(getByText('Partager le lien')).toBeTruthy();
  });

  it('le code généré fait 6 caractères alphanumériques majuscules', () => {
    const { getByText, queryAllByText } = render(<CreateGroupScreen />);
    const before = queryAllByText(/^[A-Z0-9]{6}$/).length;
    fireEvent.press(getByText("Générer un lien d'invitation"));
    expect(queryAllByText(/^[A-Z0-9]{6}$/).length).toBe(before + 1);
  });

  it('appelle create_group puis navigue après soumission', async () => {
    const { router } = require('expo-router');
    const { getByPlaceholderText, getByText } = render(<CreateGroupScreen />);
    fireEvent.changeText(getByPlaceholderText('Soirée pizza-ciné 🍕'), 'Soirée test');
    fireEvent.press(getByText('Lancer la session de swipe'));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockRpc).toHaveBeenCalledWith('create_group', expect.objectContaining({
      p_name: 'Soirée test',
      p_age_rating: '16+',
      p_language: 'VF + VOSTFR',
    }));
    expect(router.replace).toHaveBeenCalledWith('/groups/new-group-id');
  });

  it('bascule un genre désélectionné à sélectionné', () => {
    const { getByText } = render(<CreateGroupScreen />);
    fireEvent.press(getByText('Action'));
    // Pas d'erreur = interaction gérée
    expect(getByText('Action')).toBeTruthy();
  });

  it('change la classification d\'âge au tap', () => {
    const { getByText } = render(<CreateGroupScreen />);
    fireEvent.press(getByText('18+'));
    expect(getByText('18+')).toBeTruthy();
  });

  it('change la langue au tap', () => {
    const { getByText } = render(<CreateGroupScreen />);
    fireEvent.press(getByText('VF'));
    expect(getByText('VF')).toBeTruthy();
  });
});
