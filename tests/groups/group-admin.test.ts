const mockDelete = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      delete: () => ({ eq: () => ({ select: () => mockDelete() }) }),
    }),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

// lib/groups importe lib/tmdb (instancie un client avec le token d'env) : on le
// neutralise pour isoler la couche groupes du wrapper TMDB.
jest.mock('@/lib/tmdb', () => ({ tmdb: {} }));

import { deleteGroup, removeGroupMember } from '@/lib/groups';

describe('deleteGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('supprime le groupe par son id', async () => {
    mockDelete.mockResolvedValue({ data: [{ id: 'g1' }], error: null });

    await deleteGroup('g1');

    expect(mockDelete).toHaveBeenCalled();
  });

  it("propage l'erreur renvoyée par Supabase", async () => {
    mockDelete.mockResolvedValue({ data: null, error: new Error('not authorized') });

    await expect(deleteGroup('g1')).rejects.toThrow('not authorized');
  });

  it('échoue si aucune ligne n\'a été supprimée (RLS refusée)', async () => {
    mockDelete.mockResolvedValue({ data: [], error: null });

    await expect(deleteGroup('g1')).rejects.toThrow(/Suppression refusée/);
  });
});

describe('removeGroupMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appelle la RPC remove_group_member avec le groupe et le membre', async () => {
    mockRpc.mockResolvedValue({ error: null });

    await removeGroupMember('g1', 'u2');

    expect(mockRpc).toHaveBeenCalledWith('remove_group_member', {
      p_group_id: 'g1',
      p_user_id: 'u2',
    });
  });

  it("propage l'erreur renvoyée par la RPC", async () => {
    mockRpc.mockResolvedValue({ error: new Error('not authorized') });

    await expect(removeGroupMember('g1', 'u2')).rejects.toThrow('not authorized');
  });
});
