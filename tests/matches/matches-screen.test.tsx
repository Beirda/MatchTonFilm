import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ id: 'g1' }),
}));

const mockSingle = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ single: () => mockSingle() }) }) }),
  },
}));

const mockGetGroupMatches = jest.fn();
jest.mock('@/lib/matches', () => ({
  getGroupMatches: (groupId: string) => mockGetGroupMatches(groupId),
}));

import MatchesScreen from '@/app/groups/[id]/matches';
import type { Movie } from '@/wrappers/TMDBTypes';
import type { MovieMatch } from '@/lib/matches';

function buildMovie(id: number, title: string): Partial<Movie> {
  return { id, title, poster_path: null };
}

function buildMatch(id: number, title: string, likes: number, total: number, pct: number): MovieMatch {
  return { movie: buildMovie(id, title) as Movie, likes, total, pct };
}

describe('MatchesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: { name: 'Ciné Club', emoji: '🎬' } });
  });

  it('affiche le film gagnant et le classement', async () => {
    mockGetGroupMatches.mockResolvedValue([
      buildMatch(1, 'Oppenheimer', 2, 2, 100),
      buildMatch(2, 'Dune', 2, 3, 67),
    ]);

    const { getByText } = render(<MatchesScreen />);

    await waitFor(() => expect(getByText('Oppenheimer')).toBeTruthy());
    expect(getByText('100%')).toBeTruthy();
    expect(getByText('2/2')).toBeTruthy();
    expect(getByText('Dune')).toBeTruthy();
    expect(getByText('67%')).toBeTruthy();
    expect(getByText('🎬 Ciné Club')).toBeTruthy();
  });

  it("affiche un message quand aucun vote n'a encore été enregistré", async () => {
    mockGetGroupMatches.mockResolvedValue([]);

    const { getByText } = render(<MatchesScreen />);

    await waitFor(() => expect(getByText('Pas encore de match')).toBeTruthy());
  });
});
