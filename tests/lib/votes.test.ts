const mockGetUser = jest.fn();
const mockUpsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: () => ({ upsert: (...args: unknown[]) => mockUpsert(...args) }),
  },
}));

import { saveVote } from '@/lib/votes';

describe('saveVote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upsert le vote avec une clé sur (user_id, group_id, movie_id)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockUpsert.mockResolvedValue({ error: null });

    await saveVote('g1', 42, 'like');

    expect(mockUpsert).toHaveBeenCalledWith(
      { user_id: 'u1', group_id: 'g1', movie_id: 42, vote: 'like' },
      { onConflict: 'user_id,group_id,movie_id' },
    );
  });

  it('ne fait rien si aucun utilisateur connecté', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await saveVote('g1', 42, 'dislike');

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('ignore silencieusement une erreur réseau', async () => {
    mockGetUser.mockRejectedValue(new Error('offline'));

    await expect(saveVote('g1', 42, 'like')).resolves.toBeUndefined();
  });
});
