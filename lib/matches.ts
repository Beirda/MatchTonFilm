import { supabase } from '@/lib/supabase';
import { tmdb } from '@/lib/tmdb';
import type { Movie } from '@/wrappers/TMDBTypes';

export type MovieMatch = {
  movie: Movie;
  likes: number;
  total: number;
  pct: number;
};

/**
 * Calcule le score de match de chaque film voté dans un groupe :
 * % = likes / total des votes (likes + dislikes) sur ce film.
 * Le classement est trié par score décroissant, puis par nombre de likes.
 */
export async function getGroupMatches(groupId: string): Promise<MovieMatch[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('movie_id, vote')
    .eq('group_id', groupId);
  if (error || !data) return [];

  const counts = new Map<number, { likes: number; total: number }>();
  for (const { movie_id, vote } of data as { movie_id: number; vote: string }[]) {
    const c = counts.get(movie_id) ?? { likes: 0, total: 0 };
    c.total += 1;
    if (vote === 'like') c.likes += 1;
    counts.set(movie_id, c);
  }

  const movies = await Promise.all(
    [...counts.keys()].map((id) => tmdb.getMovieDetails(id).catch(() => null)),
  );

  return movies
    .filter((movie): movie is Movie => movie !== null)
    .map((movie) => {
      const c = counts.get(movie.id) as { likes: number; total: number };
      return {
        movie,
        likes: c.likes,
        total: c.total,
        pct: Math.round((c.likes / c.total) * 100),
      };
    })
    .sort((a, b) => b.pct - a.pct || b.likes - a.likes);
}
