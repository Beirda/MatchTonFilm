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
 * % = likes / nombre de membres du groupe, pour que « 1/2 votes » reflète
 * bien qu'un seul membre sur deux a voté. Si un film a reçu plus de votes
 * que le groupe ne compte de membres (membre parti), on garde le nombre
 * de votes comme dénominateur pour ne jamais dépasser 100 %.
 * Le classement est trié par score décroissant, puis par nombre de likes.
 */
export async function getGroupMatches(groupId: string): Promise<MovieMatch[]> {
  const [votesRes, membersRes] = await Promise.all([
    supabase.from('votes').select('movie_id, vote').eq('group_id', groupId),
    supabase.from('group_members').select('user_id').eq('group_id', groupId),
  ]);
  if (votesRes.error || !votesRes.data) return [];

  const memberCount = membersRes.error ? 0 : (membersRes.data ?? []).length;

  const counts = new Map<number, { likes: number; total: number }>();
  for (const { movie_id, vote } of votesRes.data as { movie_id: number; vote: string }[]) {
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
      const total = Math.max(memberCount, c.total);
      return {
        movie,
        likes: c.likes,
        total,
        pct: Math.round((c.likes / total) * 100),
      };
    })
    .sort((a, b) => b.pct - a.pct || b.likes - a.likes);
}
