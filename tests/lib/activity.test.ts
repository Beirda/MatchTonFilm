const mockGetUser = jest.fn();
const mockMemberships = jest.fn();
const mockJoins = jest.fn();
const mockGroupsList = jest.fn();
const mockLikes = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => ({
      select: () => {
        if (table === 'group_members') {
          return { eq: () => mockMemberships(), in: () => mockJoins() };
        }
        if (table === 'votes') {
          return {
            in: () => ({
              eq: () => ({
                order: () => ({ limit: () => mockLikes() }),
              }),
            }),
          };
        }
        return { in: () => mockGroupsList() };
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

import { fetchUserActivity } from '@/lib/activity';

describe('fetchUserActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockMemberships.mockResolvedValue({ data: [{ group_id: 'g1' }], error: null });
    mockGroupsList.mockResolvedValue({ data: [{ id: 'g1', name: 'Ciné Club' }], error: null });
    mockJoins.mockResolvedValue({ data: [], error: null });
    mockLikes.mockResolvedValue({ data: [], error: null });
  });

  it('renvoie [] sans utilisateur connecté', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(fetchUserActivity()).resolves.toEqual([]);
  });

  it('renvoie [] sans groupe', async () => {
    mockMemberships.mockResolvedValue({ data: [], error: null });

    await expect(fetchUserActivity()).resolves.toEqual([]);
  });

  it('fusionne arrivées et votes triés du plus récent au plus ancien', async () => {
    mockJoins.mockResolvedValue({
      data: [
        {
          group_id: 'g1',
          user_id: 'u2',
          joined_at: '2026-06-10T10:00:00Z',
          profiles: { display_name: 'Marc' },
        },
      ],
      error: null,
    });
    mockLikes.mockResolvedValue({
      data: [
        {
          group_id: 'g1',
          movie_id: 550,
          created_at: '2026-06-11T09:00:00Z',
          profiles: { display_name: 'Léa' },
        },
      ],
      error: null,
    });
    mockGetMovie.mockResolvedValue({ id: 550, title: 'Fight Club' });

    const events = await fetchUserActivity();

    expect(events).toHaveLength(2);
    expect(events[0].text).toBe('Léa a aimé Fight Club');
    expect(events[0].icon).toBe('favorite');
    expect(events[0].sub).toContain('Ciné Club');
    expect(events[1].text).toBe('Marc a rejoint Ciné Club');
    expect(events[1].icon).toBe('group');
  });

  it('ignore les votes dont le film TMDB est indisponible', async () => {
    mockLikes.mockResolvedValue({
      data: [
        {
          group_id: 'g1',
          movie_id: 550,
          created_at: '2026-06-11T09:00:00Z',
          profiles: { display_name: 'Léa' },
        },
      ],
      error: null,
    });
    mockGetMovie.mockRejectedValue(new Error('TMDB Error Not Found'));

    await expect(fetchUserActivity()).resolves.toEqual([]);
  });
});
