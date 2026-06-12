const mockGetUser = jest.fn();
const mockMemberships = jest.fn();
const mockGroups = jest.fn();
const mockVotes = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => ({
      select: () => {
        if (table === 'group_members') return { eq: () => mockMemberships() };
        if (table === 'votes') return { in: () => mockVotes() };
        return { in: () => ({ order: () => mockGroups() }) };
      },
    }),
  },
}));

const mockGetMovie = jest.fn();
jest.mock('@/lib/tmdb', () => ({
  tmdb: {
    getMovie: (id: number) => mockGetMovie(id),
  },
}));

import { fetchUserGroups } from '@/lib/groups';

function groupRow(id: string, name: string) {
  return {
    id,
    name,
    emoji: '🍿',
    accent: '#ff3b47',
    created_at: new Date().toISOString(),
    group_members: [
      { profiles: { display_name: 'lea', avatar_color: '#ff3b47' } },
      { profiles: { display_name: 'marc', avatar_color: '#7d2b8c' } },
    ],
  };
}

describe('fetchUserGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVotes.mockResolvedValue({ data: [], error: null });
  });

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
    mockGroups.mockResolvedValue({ data: [groupRow('g1', 'Soirée Coloc')], error: null });

    const groups = await fetchUserGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].members).toBe(2);
    expect(groups[0].people).toEqual([
      { n: 'L', c: '#ff3b47' },
      { n: 'M', c: '#7d2b8c' },
    ]);
    expect(groups[0].name).toBe('Soirée Coloc');
    expect(groups[0].posters).toEqual([]);
    expect(groups[0].status).toBe('À lancer');
  });

  it('remonte les affiches des films les plus aimés et le nombre de matchs', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockMemberships.mockResolvedValue({ data: [{ group_id: 'g1' }], error: null });
    mockGroups.mockResolvedValue({ data: [groupRow('g1', 'Soirée Coloc')], error: null });
    mockVotes.mockResolvedValue({
      data: [
        { group_id: 'g1', movie_id: 1, vote: 'like', created_at: '2026-06-10T10:00:00Z' },
        { group_id: 'g1', movie_id: 1, vote: 'like', created_at: '2026-06-10T10:01:00Z' },
        { group_id: 'g1', movie_id: 2, vote: 'like', created_at: '2026-06-10T10:02:00Z' },
        { group_id: 'g1', movie_id: 3, vote: 'dislike', created_at: '2026-06-10T10:03:00Z' },
      ],
      error: null,
    });
    mockGetMovie.mockImplementation((id: number) =>
      Promise.resolve({ id, poster_path: `/poster-${id}.jpg` }),
    );

    const groups = await fetchUserGroups();

    expect(groups[0].posters).toEqual([
      'https://image.tmdb.org/t/p/w185/poster-1.jpg',
      'https://image.tmdb.org/t/p/w185/poster-2.jpg',
    ]);
    expect(groups[0].matches).toBe(1);
    expect(groups[0].status).toBe('En cours');
  });

  it('ignore les affiches des films TMDB indisponibles', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockMemberships.mockResolvedValue({ data: [{ group_id: 'g1' }], error: null });
    mockGroups.mockResolvedValue({ data: [groupRow('g1', 'Soirée Coloc')], error: null });
    mockVotes.mockResolvedValue({
      data: [
        { group_id: 'g1', movie_id: 1, vote: 'like', created_at: '2026-06-10T10:00:00Z' },
      ],
      error: null,
    });
    mockGetMovie.mockRejectedValue(new Error('TMDB Error Not Found'));

    const groups = await fetchUserGroups();

    expect(groups[0].posters).toEqual([]);
  });
});
