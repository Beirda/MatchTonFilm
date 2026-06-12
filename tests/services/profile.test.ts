const counts = { votes: 0, likes: 0, group_members: 0 };
const mockSingle = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => mockSingle(),
          // 2e .eq() : filtre vote=like du comptage des j'aime
          eq: () => Promise.resolve({ count: counts.likes, error: null }),
          then: (resolve: (v: unknown) => void) =>
            resolve({
              count: table === 'votes' ? counts.votes : counts.group_members,
              error: null,
            }),
        }),
      }),
      update: (values: unknown) => ({ eq: () => mockUpdate(table, values) }),
    }),
  },
}));

import { getProfile, getProfileStats, updateAvatarColor, updateDisplayName } from '@/services/profile';

describe('profile service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockResolvedValue({ error: null });
    counts.votes = 0;
    counts.likes = 0;
    counts.group_members = 0;
  });

  it('getProfile mappe display_name et avatar_color', async () => {
    mockSingle.mockResolvedValue({
      data: { display_name: 'Léa', avatar_color: '#7d2b8c' },
      error: null,
    });

    await expect(getProfile('u1')).resolves.toEqual({
      displayName: 'Léa',
      avatarColor: '#7d2b8c',
    });
  });

  it('getProfile renvoie null en cas d\'erreur', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('boom') });

    await expect(getProfile('u1')).resolves.toBeNull();
  });

  it('updateDisplayName enregistre le pseudo nettoyé', async () => {
    await updateDisplayName('u1', '  Léa  ');

    expect(mockUpdate).toHaveBeenCalledWith('profiles', { display_name: 'Léa' });
  });

  it('updateAvatarColor enregistre la couleur', async () => {
    await updateAvatarColor('u1', '#0a7ea4');

    expect(mockUpdate).toHaveBeenCalledWith('profiles', { avatar_color: '#0a7ea4' });
  });

  it('getProfileStats agrège votes, j\'aime et groupes', async () => {
    counts.votes = 12;
    counts.likes = 7;
    counts.group_members = 3;

    await expect(getProfileStats('u1')).resolves.toEqual({
      votes: 12,
      likes: 7,
      groups: 3,
    });
  });
});
