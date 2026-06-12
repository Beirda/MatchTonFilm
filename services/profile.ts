import { supabase } from '@/lib/supabase';

export type Profile = {
  displayName: string;
  avatarColor: string;
};

export type ProfileStats = {
  votes: number;
  likes: number;
  groups: number;
};

/** Récupère le pseudo et la couleur d'avatar de l'utilisateur. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_color')
    .eq('id', userId)
    .single();
  if (error || !data) return null;

  const row = data as { display_name: string | null; avatar_color: string };
  return {
    displayName: row.display_name ?? '',
    avatarColor: row.avatar_color,
  };
}

/** Met à jour le pseudo de l'utilisateur. */
export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName.trim() })
    .eq('id', userId);
  if (error) throw error;
}

/** Met à jour la couleur d'avatar de l'utilisateur. */
export async function updateAvatarColor(userId: string, avatarColor: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_color: avatarColor })
    .eq('id', userId);
  if (error) throw error;
}

/** Statistiques réelles du profil : films votés, films aimés, groupes. */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [votesRes, likesRes, groupsRes] = await Promise.all([
    supabase.from('votes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('vote', 'like'),
    supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    votes: votesRes.count ?? 0,
    likes: likesRes.count ?? 0,
    groups: groupsRes.count ?? 0,
  };
}
