import { TMDBClient } from '@/wrappers/TMDBClient';

export const tmdb = new TMDBClient(process.env.EXPO_PUBLIC_TMDB_TOKEN ?? '');
