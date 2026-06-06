import type { UserPreferences } from '@/types/preferences';
import { supabase } from '@/lib/supabase';

/**
 * Remplace les préférences de l'utilisateur : on vide ses lignes existantes
 * puis on réinsère la sélection courante (genres + films TMDB).
 */
export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  await supabase.from('user_genres').delete().eq('user_id', prefs.userId);
  await supabase.from('user_films').delete().eq('user_id', prefs.userId);

  if (prefs.genres.length > 0) {
    const { error } = await supabase.from('user_genres').insert(
      prefs.genres.map(g => ({
        user_id: prefs.userId,
        tmdb_genre_id: g.id,
        genre_name: g.name,
      }))
    );
    if (error) throw error;
  }

  if (prefs.films.length > 0) {
    const { error } = await supabase.from('user_films').insert(
      prefs.films.map(f => ({
        user_id: prefs.userId,
        tmdb_id: f.tmdbId,
        title: f.title,
        poster_path: f.posterPath,
      }))
    );
    if (error) throw error;
  }
}

/** Vrai si l'utilisateur a déjà enregistré au moins un genre (onboarding terminé). */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('user_genres')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) return false;
  return (count ?? 0) > 0;
}
