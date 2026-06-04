import type { UserPreferences } from '@/types/preferences';
import { supabase } from '@/lib/supabase';

// TODO GH-2 : activer quand Supabase est disponible
// Schéma attendu : user_preferences(user_id uuid PK, genres jsonb, films jsonb, updated_at timestamptz)
export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  const { error } = await supabase.from('user_preferences').upsert({
    user_id: prefs.userId,
    genres: prefs.genres,
    films: prefs.films,
  });
  if (error) throw error;
}

export async function hasCompletedOnboarding(_userId: string): Promise<boolean> {
  // TODO GH-2 : vérifier si une ligne existe dans user_preferences pour cet utilisateur
  return false;
}
