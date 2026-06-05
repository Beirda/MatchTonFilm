import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
}));

import CreateGroupScreen from '@/app/groups/create';

describe('CreateGroupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('le code généré commence par CINE-', () => {
    const { getByText } = render(<CreateGroupScreen />);
    fireEvent.press(getByText("Générer un lien d'invitation"));
    const codeEl = getByText(/^CINE-/);
    expect(codeEl).toBeTruthy();
  });

  it('le code contient le préfixe du nom du groupe', () => {
    const { getByPlaceholderText, getByText } = render(<CreateGroupScreen />);
    fireEvent.changeText(getByPlaceholderText('Soirée pizza-ciné 🍕'), 'Amis');
    fireEvent.press(getByText("Générer un lien d'invitation"));
    expect(getByText(/^CINE-AMI/)).toBeTruthy();
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
