export const GENRES = [
  'Action', 'Aventure', 'Comédie', 'Drame', 'Science-fiction', 'Thriller',
  'Horreur', 'Romance', 'Animation', 'Crime', 'Musique', 'Documentaire',
  'Fantastique', 'Biopic', 'Policier', 'Guerre',
] as const;

/** Correspondance entre les genres de groupe (GH-4) et les ids de genre TMDB. */
export const GENRE_TMDB_IDS: Record<string, number> = {
  'Action': 28,
  'Aventure': 12,
  'Comédie': 35,
  'Drame': 18,
  'Science-fiction': 878,
  'Thriller': 53,
  'Horreur': 27,
  'Romance': 10749,
  'Animation': 16,
  'Crime': 80,
  'Musique': 10402,
  'Documentaire': 99,
  'Fantastique': 14,
  'Biopic': 18,
  'Policier': 80,
  'Guerre': 10752,
};
