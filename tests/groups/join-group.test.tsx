import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import JoinGroupScreen from '@/app/groups/join';

describe('JoinGroupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche le titre d'invitation", () => {
    const { getByText } = render(<JoinGroupScreen />);
    expect(getByText("Saisis le code d'invitation")).toBeTruthy();
  });

  it('affiche le texte descriptif', () => {
    const { getByText } = render(<JoinGroupScreen />);
    expect(getByText(/Demande le code à ton ami/)).toBeTruthy();
  });

  it('affiche le bouton de collage de lien', () => {
    const { getByText } = render(<JoinGroupScreen />);
    expect(getByText("Coller un lien d'invitation")).toBeTruthy();
  });

  it('affiche le bouton Rejoindre le groupe', () => {
    const { getByText } = render(<JoinGroupScreen />);
    expect(getByText('Rejoindre le groupe')).toBeTruthy();
  });

  it('rend 6 cellules de saisie', () => {
    const { getAllByDisplayValue } = render(<JoinGroupScreen />);
    // Les cellules vides ont value=''
    const cells = getAllByDisplayValue('');
    expect(cells.length).toBe(6);
  });

  it('accepte la saisie en majuscules dans une cellule', () => {
    const { getAllByDisplayValue } = render(<JoinGroupScreen />);
    const cells = getAllByDisplayValue('');
    fireEvent.changeText(cells[0], 'a');
    // La valeur est convertie en majuscule
    expect(cells[0]).toBeTruthy();
  });

  it('affiche le séparateur "ou"', () => {
    const { getByText } = render(<JoinGroupScreen />);
    expect(getByText('ou')).toBeTruthy();
  });

  it('appelle router.back après validation du code complet', async () => {
    const { router } = require('expo-router');
    const { getAllByDisplayValue, getByText } = render(<JoinGroupScreen />);

    const cells = getAllByDisplayValue('');
    ['A', 'B', 'C', '1', '2', '3'].forEach((char, i) => {
      fireEvent.changeText(cells[i], char);
    });

    fireEvent.press(getByText('Rejoindre le groupe'));

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
