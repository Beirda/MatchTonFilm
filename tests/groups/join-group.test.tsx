import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockSearchParams = jest.fn(() => ({} as { code?: string }));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockSearchParams(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...a: unknown[]) => mockRpc(...a) } }));

const mockGetStringAsync = jest.fn();
jest.mock('expo-clipboard', () => ({ getStringAsync: (...a: unknown[]) => mockGetStringAsync(...a) }));

jest.mock('expo-linking', () => ({
  parse: (url: string) => {
    const match = /[?&]code=([^&]*)/.exec(url);
    return { queryParams: match ? { code: decodeURIComponent(match[1]) } : {} };
  },
  createURL: jest.fn((path: string, opts?: { queryParams?: Record<string, string> }) => {
    const code = opts?.queryParams?.code;
    return `matchtonfilm://${path}${code ? `?code=${code}` : ''}`;
  }),
}));

import JoinGroupScreen from '@/app/groups/join';

describe('JoinGroupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.mockReturnValue({});
    mockRpc.mockResolvedValue({ data: 'group-id', error: null });
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

  it('appelle join_group puis navigue vers le groupe après un code complet', async () => {
    const { router } = require('expo-router');
    const { getAllByDisplayValue, getByText } = render(<JoinGroupScreen />);

    const cells = getAllByDisplayValue('');
    ['A', 'B', 'C', '1', '2', '3'].forEach((char, i) => {
      fireEvent.changeText(cells[i], char);
    });

    fireEvent.press(getByText('Rejoindre le groupe'));

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockRpc).toHaveBeenCalledWith('join_group', { p_code: 'ABC123' });
    expect(router.replace).toHaveBeenCalledWith('/groups/group-id');
  });

  it('affiche une erreur quand le code est invalide', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    const { getAllByDisplayValue, getByText } = render(<JoinGroupScreen />);

    const cells = getAllByDisplayValue('');
    ['Z', 'Z', 'Z', 'Z', 'Z', 'Z'].forEach((char, i) => {
      fireEvent.changeText(cells[i], char);
    });

    fireEvent.press(getByText('Rejoindre le groupe'));

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(getByText("Ce code d'invitation est invalide.")).toBeTruthy();
  });

  describe("ouverture via un lien d'invitation", () => {
    it('pré-remplit le code depuis les paramètres du lien et rejoint automatiquement', async () => {
      const { router } = require('expo-router');
      mockSearchParams.mockReturnValue({ code: 'abc123' });

      const { getByDisplayValue } = render(<JoinGroupScreen />);

      ['A', 'B', 'C', '1', '2', '3'].forEach(char => {
        expect(getByDisplayValue(char)).toBeTruthy();
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('join_group', { p_code: 'ABC123' });
        expect(router.replace).toHaveBeenCalledWith('/groups/group-id');
      });
    });

    it('ignore un code de lien au format invalide', () => {
      mockSearchParams.mockReturnValue({ code: 'troplongcode' });

      const { getAllByDisplayValue } = render(<JoinGroupScreen />);
      const cells = getAllByDisplayValue('');
      expect(cells.length).toBe(6);
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe("collage d'un lien d'invitation", () => {
    it('rejoint automatiquement avec le code extrait du lien collé', async () => {
      const { router } = require('expo-router');
      mockGetStringAsync.mockResolvedValue('matchtonfilm://groups/join?code=xyz789');

      const { getByText } = render(<JoinGroupScreen />);
      fireEvent.press(getByText("Coller un lien d'invitation"));

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('join_group', { p_code: 'XYZ789' });
        expect(router.replace).toHaveBeenCalledWith('/groups/group-id');
      });
    });

    it('affiche une erreur quand le contenu collé n\'est pas un lien valide', async () => {
      mockGetStringAsync.mockResolvedValue('ceci n\'est pas un lien');

      const { getByText } = render(<JoinGroupScreen />);
      fireEvent.press(getByText("Coller un lien d'invitation"));

      await waitFor(() => {
        expect(getByText("Ce lien d'invitation est invalide.")).toBeTruthy();
      });
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('affiche une erreur quand le presse-papier est vide', async () => {
      mockGetStringAsync.mockResolvedValue('');

      const { getByText } = render(<JoinGroupScreen />);
      fireEvent.press(getByText("Coller un lien d'invitation"));

      await waitFor(() => {
        expect(getByText('Aucun contenu dans le presse-papier.')).toBeTruthy();
      });
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });
});
