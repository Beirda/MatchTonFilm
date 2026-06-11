import { supabase } from '@/lib/supabase';

export type VoteValue = 'like' | 'dislike';

/**
 * Enregistre le vote (like/dislike) de l'utilisateur connecté sur un film,
 * pour un groupe donné. L'upsert sur (user_id, group_id, movie_id) évite les
 * doublons : un nouveau swipe sur le même film écrase le vote précédent.
 */
export async function saveVote(groupId: string, movieId: number, vote: VoteValue): Promise<void> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    await supabase
      .from('votes')
      .upsert(
        { user_id: user.id, group_id: groupId, movie_id: movieId, vote },
        { onConflict: 'user_id,group_id,movie_id' },
      );
  } catch {
    // Le swipe reste fluide même hors-ligne ou en cas d'erreur réseau ;
    // le vote sera simplement absent côté serveur.
  }
}

/**
 * Liste les ids de films sur lesquels l'utilisateur connecté a déjà voté
 * dans ce groupe — permet de reprendre une session de swipe là où elle
 * s'était arrêtée au lieu de revoir les mêmes films.
 */
export async function getUserVotedMovieIds(groupId: string): Promise<number[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];

  const { data } = await supabase
    .from('votes')
    .select('movie_id')
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  return ((data ?? []) as { movie_id: number }[]).map(v => v.movie_id);
}

/**
 * Indique si l'utilisateur connecté est admin du groupe donné.
 */
export async function isGroupAdmin(groupId: string): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return false;

  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  return (data as { role: string } | null)?.role === 'admin';
}

/**
 * Supprime les votes de tous les membres pour ce groupe (admin uniquement),
 * via la RPC `reset_group_votes` afin de relancer un nouveau cycle.
 */
export async function resetGroupVotes(groupId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_group_votes', { p_group_id: groupId });
  if (error) throw error;
}
