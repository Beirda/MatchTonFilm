export type GenrePreference = {
  id: number;
  name: string;
};

export type FilmPreference = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

export type UserPreferences = {
  userId: string;
  genres: GenrePreference[];
  films: FilmPreference[];
};
