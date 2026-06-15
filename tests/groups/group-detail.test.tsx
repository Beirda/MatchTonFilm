import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { push: jest.fn() },
  useFocusEffect: (cb: () => void) => cb(),
  useLocalSearchParams: () => ({ id: 'g1' }),
}));
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock('expo-linking', () => ({
  createURL: () => 'matchtonfilm://groups/join?code=ABC234',
}));

const mockSingle = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ single: () => mockSingle() }) }) }),
  },
}));

const mockIsGroupAdmin = jest.fn();
jest.mock('@/lib/votes', () => ({
  isGroupAdmin: (groupId: string) => mockIsGroupAdmin(groupId),
}));

const mockRemoveGroupMember = jest.fn();
jest.mock('@/lib/groups', () => ({
  removeGroupMember: (groupId: string, userId: string) => mockRemoveGroupMember(groupId, userId),
}));

import GroupDetailScreen from '@/app/groups/[id]';

const GROUP = {
  name: 'Soirée Coloc',
  emoji: '🍿',
  invitation_code: 'ABC234',
  genres: ['Comédie'],
  age_rating: '16+',
  language: 'VF + VOSTFR',
  group_members: [
    { user_id: 'u1', role: 'admin', profiles: { display_name: 'Léa', avatar_color: '#ff3b47' } },
    { user_id: 'u2', role: 'member', profiles: { display_name: 'Marc', avatar_color: '#7d2b8c' } },
  ],
};

describe('GroupDetailScreen — gestion des membres', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: GROUP, error: null });
    mockIsGroupAdmin.mockResolvedValue(true);
    mockRemoveGroupMember.mockResolvedValue(undefined);
  });

  it("affiche le retrait pour les membres mais pas pour l'admin (vue admin)", async () => {
    const { getByText, getByLabelText, queryByLabelText } = render(<GroupDetailScreen />);

    await waitFor(() => expect(getByText('Soirée Coloc')).toBeTruthy());
    expect(getByLabelText('Retirer Marc du groupe')).toBeTruthy();
    expect(queryByLabelText('Retirer Léa du groupe')).toBeNull();
    expect(getByText('Admin')).toBeTruthy();
  });

  it('retire un membre après confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      const confirm = buttons?.find(b => b.style === 'destructive');
      confirm?.onPress?.();
    });

    const { getByText, getByLabelText, queryByText } = render(<GroupDetailScreen />);
    await waitFor(() => expect(getByText('Marc')).toBeTruthy());

    fireEvent.press(getByLabelText('Retirer Marc du groupe'));

    await waitFor(() => expect(mockRemoveGroupMember).toHaveBeenCalledWith('g1', 'u2'));
    await waitFor(() => expect(queryByText('Marc')).toBeNull());

    alertSpy.mockRestore();
  });

  it('ne montre aucun retrait pour un membre non-admin', async () => {
    mockIsGroupAdmin.mockResolvedValue(false);

    const { getByText, queryByLabelText } = render(<GroupDetailScreen />);

    await waitFor(() => expect(getByText('Soirée Coloc')).toBeTruthy());
    expect(queryByLabelText('Retirer Marc du groupe')).toBeNull();
  });
});
