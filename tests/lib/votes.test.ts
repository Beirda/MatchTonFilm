const mockGetUser = jest.fn();
const mockUpsert = jest.fn();
const mockSingle = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: () => ({
      upsert: (...args: unknown[]) => mockUpsert(...args),
      select: () => ({ eq: () => ({ eq: () => ({ single: () => mockSingle() }) }) }),
    }),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import { isGroupAdmin, resetGroupVotes, saveVote } from '@/lib/votes';

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

describe('isGroupAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retourne true si le rôle du membre est admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'admin' } });

    await expect(isGroupAdmin('g1')).resolves.toBe(true);
  });

  it('retourne false si le rôle du membre est member', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockSingle.mockResolvedValue({ data: { role: 'member' } });

    await expect(isGroupAdmin('g1')).resolves.toBe(false);
  });

  it('retourne false si aucun utilisateur connecté', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(isGroupAdmin('g1')).resolves.toBe(false);
    expect(mockSingle).not.toHaveBeenCalled();
  });
});

describe('resetGroupVotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appelle la RPC reset_group_votes avec le group_id', async () => {
    mockRpc.mockResolvedValue({ error: null });

    await resetGroupVotes('g1');

    expect(mockRpc).toHaveBeenCalledWith('reset_group_votes', { p_group_id: 'g1' });
  });

  it("propage l'erreur renvoyée par la RPC", async () => {
    mockRpc.mockResolvedValue({ error: new Error('not authorized') });

    await expect(resetGroupVotes('g1')).rejects.toThrow('not authorized');
  });
});
