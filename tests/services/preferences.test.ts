const mockInsert = jest.fn();
const mockState = { count: 0 };

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: (rows: unknown) => mockInsert(table, rows),
      select: () => ({
        eq: () => Promise.resolve({ count: mockState.count, error: null }),
      }),
    }),
  },
}));

import { saveUserPreferences, hasCompletedOnboarding } from '@/services/preferences';

describe('preferences service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockState.count = 0;
  });

  it('insère les genres et films au bon format', async () => {
    await saveUserPreferences({
      userId: 'u1',
      genres: [{ id: 28, name: 'Action' }],
      films: [{ tmdbId: 550, title: 'Fight Club', posterPath: '/x.jpg' }],
    });

    expect(mockInsert).toHaveBeenCalledWith('user_genres', [
      { user_id: 'u1', tmdb_genre_id: 28, genre_name: 'Action' },
    ]);
    expect(mockInsert).toHaveBeenCalledWith('user_films', [
      { user_id: 'u1', tmdb_id: 550, title: 'Fight Club', poster_path: '/x.jpg' },
    ]);
  });

  it('n\'insère rien quand les listes sont vides', async () => {
    await saveUserPreferences({ userId: 'u1', genres: [], films: [] });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('hasCompletedOnboarding renvoie true quand au moins un genre existe', async () => {
    mockState.count = 3;
    expect(await hasCompletedOnboarding('u1')).toBe(true);
  });

  it('hasCompletedOnboarding renvoie false sans genre', async () => {
    mockState.count = 0;
    expect(await hasCompletedOnboarding('u1')).toBe(false);
  });
});
