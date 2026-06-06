const mockGetUser = jest.fn();
const mockMemberships = jest.fn();
const mockGroups = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => ({
      select: () =>
        table === 'group_members'
          ? { eq: () => mockMemberships() }
          : { in: () => ({ order: () => mockGroups() }) },
    }),
  },
}));

import { fetchUserGroups } from '@/lib/groups';

describe('fetchUserGroups', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renvoie [] si pas de session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    expect(await fetchUserGroups()).toEqual([]);
  });

  it('renvoie [] si l\'utilisateur n\'a aucun groupe', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockMemberships.mockResolvedValue({ data: [], error: null });
    expect(await fetchUserGroups()).toEqual([]);
  });

  it('mappe membres et avatars depuis les profils', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockMemberships.mockResolvedValue({ data: [{ group_id: 'g1' }], error: null });
    mockGroups.mockResolvedValue({
      data: [
        {
          id: 'g1',
          name: 'Soirée Coloc',
          emoji: '🍿',
          accent: '#ff3b47',
          created_at: new Date().toISOString(),
          group_members: [
            { profiles: { display_name: 'lea', avatar_color: '#ff3b47' } },
            { profiles: { display_name: 'marc', avatar_color: '#7d2b8c' } },
          ],
        },
      ],
      error: null,
    });

    const groups = await fetchUserGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].members).toBe(2);
    expect(groups[0].people).toEqual([
      { n: 'L', c: '#ff3b47' },
      { n: 'M', c: '#7d2b8c' },
    ]);
    expect(groups[0].name).toBe('Soirée Coloc');
  });
});
