const mockSelectEq = jest.fn();
const mockDelete = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => mockSelectEq() }),
      delete: () => ({ eq: () => mockDelete() }),
      insert: (rows: unknown) => mockInsert(rows),
    }),
  },
}));

import { getUserGenres, saveUserGenres } from '@/services/preferences';

describe('getUserGenres', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('mappe les lignes user_genres en GenrePreference', async () => {
    mockSelectEq.mockResolvedValue({
      data: [
        { tmdb_genre_id: 28, genre_name: 'Action' },
        { tmdb_genre_id: 878, genre_name: 'Science-Fiction' },
      ],
      error: null,
    });

    await expect(getUserGenres('u1')).resolves.toEqual([
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science-Fiction' },
    ]);
  });

  it('renvoie [] en cas d\'erreur', async () => {
    mockSelectEq.mockResolvedValue({ data: null, error: new Error('boom') });

    await expect(getUserGenres('u1')).resolves.toEqual([]);
  });
});

describe('saveUserGenres', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('remplace les genres au bon format', async () => {
    await saveUserGenres('u1', [{ id: 28, name: 'Action' }]);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith([
      { user_id: 'u1', tmdb_genre_id: 28, genre_name: 'Action' },
    ]);
  });

  it('n\'insère rien quand la sélection est vide', async () => {
    await saveUserGenres('u1', []);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
