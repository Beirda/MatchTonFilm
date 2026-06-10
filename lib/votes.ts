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
