import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), dismissAll: jest.fn() },
  useLocalSearchParams: () => ({ id: 'g1' }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

const mockSingle = jest.fn();
const mockUpdate = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => mockSingle() }) }),
      update: (values: unknown) => ({ eq: () => mockUpdate(values) }),
    }),
  },
}));

const mockIsGroupAdmin = jest.fn();
jest.mock('@/lib/votes', () => ({
  isGroupAdmin: (groupId: string) => mockIsGroupAdmin(groupId),
}));

const mockDeleteGroup = jest.fn();
jest.mock('@/lib/groups', () => ({
  deleteGroup: (groupId: string) => mockDeleteGroup(groupId),
}));

import GroupSettingsScreen from '@/app/groups/[id]/settings';

const GROUP = {
  name: 'Soirée Coloc',
  genres: ['Comédie'],
  age_rating: '16+',
  language: 'VF + VOSTFR',
  invitation_code: 'ABC234',
};

describe('GroupSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: GROUP, error: null });
    mockIsGroupAdmin.mockResolvedValue(true);
    mockUpdate.mockResolvedValue({ error: null });
    mockDeleteGroup.mockResolvedValue(undefined);
  });

  it('préremplit le formulaire avec les paramètres du groupe', async () => {
    const { getByDisplayValue, getByText } = render(<GroupSettingsScreen />);

    await waitFor(() => expect(getByDisplayValue('Soirée Coloc')).toBeTruthy());
    expect(getByText('ABC234')).toBeTruthy();
  });

  it('refuse l\'accès à un membre non admin', async () => {
    mockIsGroupAdmin.mockResolvedValue(false);

    const { getByText } = render(<GroupSettingsScreen />);

    await waitFor(() => expect(getByText("Réservé à l'admin")).toBeTruthy());
  });

  it('enregistre les paramètres modifiés puis revient en arrière', async () => {
    const { router } = require('expo-router');
    const { getByDisplayValue, getByText } = render(<GroupSettingsScreen />);
    await waitFor(() => expect(getByDisplayValue('Soirée Coloc')).toBeTruthy());

    fireEvent.changeText(getByDisplayValue('Soirée Coloc'), 'Ciné Club');
    fireEvent.press(getByText('Enregistrer'));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Ciné Club',
        genres: ['Comédie'],
        age_rating: '16+',
        language: 'VF + VOSTFR',
      }),
    );
    expect(router.back).toHaveBeenCalled();
  });

  it('régénère le code après confirmation et invalide l\'ancien', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      const confirm = buttons?.find(b => b.style === 'destructive');
      confirm?.onPress?.();
    });

    const { getByText, queryByText, getByLabelText } = render(<GroupSettingsScreen />);
    await waitFor(() => expect(getByText('ABC234')).toBeTruthy());

    fireEvent.press(getByLabelText("Régénérer le code d'invitation"));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({ invitation_code: expect.stringMatching(/^[A-Z2-9]{6}$/) }),
    );
    await waitFor(() => expect(queryByText('ABC234')).toBeNull());

    alertSpy.mockRestore();
  });

  it('supprime le groupe après confirmation puis revient à la liste', async () => {
    const { router } = require('expo-router');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      const confirm = buttons?.find(b => b.style === 'destructive');
      confirm?.onPress?.();
    });

    const { getByText } = render(<GroupSettingsScreen />);
    await waitFor(() => expect(getByText('ABC234')).toBeTruthy());

    fireEvent.press(getByText('Supprimer le groupe'));

    await waitFor(() => expect(mockDeleteGroup).toHaveBeenCalledWith('g1'));
    expect(router.dismissAll).toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
