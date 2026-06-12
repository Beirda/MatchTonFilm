import React from 'react';
import { render } from '@testing-library/react-native';

import GroupCard from '@/components/groups/group-card';
import type { Group } from '@/types/group';

const BASE_GROUP: Group = {
  id: 'test',
  name: 'Test Group',
  emoji: '🎬',
  members: 3,
  activity: 'Il y a 1 h',
  matches: 5,
  status: 'En cours',
  accent: '#ff3b47',
  people: [
    { n: 'A', c: '#ff3b47' },
    { n: 'B', c: '#2a3a8c' },
  ],
  posters: [],
};

describe('GroupCard', () => {
  it('affiche les affiches des films en tête des matchs', () => {
    const group = {
      ...BASE_GROUP,
      posters: ['https://image.tmdb.org/t/p/w185/a.jpg', 'https://image.tmdb.org/t/p/w185/b.jpg'],
    };
    const { getAllByLabelText } = render(<GroupCard group={group} />);
    expect(getAllByLabelText("Affiche d'un film en tête des matchs")).toHaveLength(2);
  });

  it('affiche le nom et l\'emoji du groupe', () => {
    const { getByText } = render(<GroupCard group={BASE_GROUP} />);
    expect(getByText('🎬 Test Group')).toBeTruthy();
  });

  it('affiche le nombre de matchs quand matches > 0', () => {
    const { getByText } = render(<GroupCard group={BASE_GROUP} />);
    expect(getByText('5 matchs')).toBeTruthy();
  });

  it('affiche "En attente" quand matches = 0', () => {
    const group = { ...BASE_GROUP, matches: 0 };
    const { getByText } = render(<GroupCard group={group} />);
    expect(getByText('En attente')).toBeTruthy();
  });

  it('affiche "1 match" au singulier', () => {
    const group = { ...BASE_GROUP, matches: 1 };
    const { getByText } = render(<GroupCard group={group} />);
    expect(getByText('1 match')).toBeTruthy();
  });

  it('affiche le nombre de membres au pluriel', () => {
    const { getByText } = render(<GroupCard group={BASE_GROUP} />);
    expect(getByText('3 membres · Il y a 1 h')).toBeTruthy();
  });

  it('affiche le singulier pour 1 membre', () => {
    const group = { ...BASE_GROUP, members: 1 };
    const { getByText } = render(<GroupCard group={group} />);
    expect(getByText('1 membre · Il y a 1 h')).toBeTruthy();
  });

  it('affiche le statut du groupe', () => {
    const { getByText } = render(<GroupCard group={BASE_GROUP} />);
    expect(getByText('En cours')).toBeTruthy();
  });
});
