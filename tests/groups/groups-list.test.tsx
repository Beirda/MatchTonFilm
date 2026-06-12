import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';

import type { Group } from '@/types/group';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/lib/groups', () => ({ fetchUserGroups: jest.fn() }));

import { fetchUserGroups } from '@/lib/groups';
import GroupsList from '@/components/groups';

const MOCK_GROUPS: Group[] = [
  {
    id: 'coloc',
    name: 'Soirée Coloc',
    emoji: '🍿',
    members: 4,
    activity: 'Il y a 2 h',
    matches: 7,
    status: 'En cours',
    accent: '#ff3b47',
    people: [{ n: 'L', c: '#ff3b47' }],
    posters: [],
  },
  {
    id: 'couple',
    name: 'Ciné Couple',
    emoji: '❤️',
    members: 2,
    activity: 'Hier',
    matches: 0,
    status: 'À lancer',
    accent: '#d11e63',
    people: [{ n: 'A', c: '#d11e63' }],
    posters: [],
  },
];

describe('GroupsList', () => {
  const noop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche l\'état vide quand aucun groupe', async () => {
    (fetchUserGroups as jest.Mock).mockResolvedValue([]);
    const { getByText } = render(<GroupsList onCreatePress={noop} onJoinPress={noop} />);
    await waitFor(() => {
      expect(getByText('Aucun groupe… pour l\'instant')).toBeTruthy();
    });
  });

  it('affiche la liste des groupes', async () => {
    (fetchUserGroups as jest.Mock).mockResolvedValue(MOCK_GROUPS);
    const { getByText } = render(<GroupsList onCreatePress={noop} onJoinPress={noop} />);
    await waitFor(() => {
      expect(getByText('🍿 Soirée Coloc')).toBeTruthy();
      expect(getByText('❤️ Ciné Couple')).toBeTruthy();
    });
  });

  it('affiche le nombre de groupes dans l\'eyebrow', async () => {
    (fetchUserGroups as jest.Mock).mockResolvedValue(MOCK_GROUPS);
    const { getByText } = render(<GroupsList onCreatePress={noop} onJoinPress={noop} />);
    await waitFor(() => {
      expect(getByText('Mes groupes · 2')).toBeTruthy();
    });
  });

  it('affiche le bouton Rejoindre', async () => {
    (fetchUserGroups as jest.Mock).mockResolvedValue(MOCK_GROUPS);
    const { getByText } = render(<GroupsList onCreatePress={noop} onJoinPress={noop} />);
    await waitFor(() => {
      expect(getByText('Rejoindre')).toBeTruthy();
    });
  });

  it('appelle onJoinPress au tap sur Rejoindre', async () => {
    const onJoinPress = jest.fn();
    (fetchUserGroups as jest.Mock).mockResolvedValue(MOCK_GROUPS);
    const { getByText } = render(<GroupsList onCreatePress={noop} onJoinPress={onJoinPress} />);
    await waitFor(() => { expect(getByText('Rejoindre')).toBeTruthy(); });
    fireEvent.press(getByText('Rejoindre'));
    expect(onJoinPress).toHaveBeenCalledTimes(1);
  });

  it('navigue vers le groupe au tap sur une carte', async () => {
    const { router } = require('expo-router');
    (fetchUserGroups as jest.Mock).mockResolvedValue(MOCK_GROUPS);
    const { getByText } = render(<GroupsList onCreatePress={noop} onJoinPress={noop} />);
    await waitFor(() => { expect(getByText('🍿 Soirée Coloc')).toBeTruthy(); });
    fireEvent.press(getByText('🍿 Soirée Coloc'));
    expect(router.push).toHaveBeenCalledWith('/groups/coloc');
  });
});
