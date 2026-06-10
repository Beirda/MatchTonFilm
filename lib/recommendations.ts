import { GENRE_TMDB_IDS } from '@/constants/genres';
import { supabase } from '@/lib/supabase';
import { tmdb } from '@/lib/tmdb';
import type { Movie } from '@/wrappers/TMDBTypes';

const DEFAULT_COUNT = 20;

/**
 * Calcule les ids de genre TMDB à interroger : intersection entre les
 * filtres du groupe (GH-4) et les préférences cumulées des membres (GH-2).
 * Si l'un des deux ensembles est vide, on retombe sur l'autre. Si
 * l'intersection est vide, on retombe sur les genres du groupe.
 */
export function intersectGenreIds(groupGenreIds: number[], memberGenreIds: number[]): number[] {
  if (groupGenreIds.length === 0) return memberGenreIds;
  if (memberGenreIds.length === 0) return groupGenreIds;

  const intersection = groupGenreIds.filter(id => memberGenreIds.includes(id));
  return intersection.length > 0 ? intersection : groupGenreIds;
}

/**
 * Récupère les films personnalisés pour un groupe : intersection entre les
 * genres filtrés du groupe (GH-4) et les genres préférés de ses membres
 * (GH-2), en respectant la limite d'âge du groupe (pas de contenu adulte
 * hors filtre 18+).
 */
export async function getGroupRecommendations(groupId: string, count: number = DEFAULT_COUNT): Promise<Movie[]> {
  if (count <= 0) return [];

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('genres, age_rating')
    .eq('id', groupId)
    .single();
  if (groupError || !group) return [];

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id);

  let memberGenreIds: number[] = [];
  if (memberIds.length > 0) {
    const { data: userGenres } = await supabase
      .from('user_genres')
      .select('tmdb_genre_id')
      .in('user_id', memberIds);
    memberGenreIds = [...new Set<number>((userGenres ?? []).map((g: { tmdb_genre_id: number }) => g.tmdb_genre_id))];
  }

  const groupGenreIds = [...new Set<number>(
    (group.genres ?? [])
      .map((name: string) => GENRE_TMDB_IDS[name])
      .filter((id: number | undefined): id is number => id !== undefined)
  )];

  const targetGenreIds = intersectGenreIds(groupGenreIds, memberGenreIds);

  const includeAdult = group.age_rating === '18+';

  let movies: Movie[];
  try {
    movies = targetGenreIds.length > 0
      ? await tmdb.getMoviesByGenres(targetGenreIds, count, { includeAdult })
      : await tmdb.getPopularMovies(count);
  } catch {
    return [];
  }

  const filtered = movies.filter(m => includeAdult || !m.adult);
  return Array.from(new Map(filtered.map(m => [m.id, m])).values());
}
