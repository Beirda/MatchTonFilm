import type { Group, GroupPerson } from '@/types/group';
import { supabase } from '@/lib/supabase';

type MemberRow = {
  profiles: { display_name: string | null; avatar_color: string } | null;
};

type GroupRow = {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  created_at: string;
  group_members: MemberRow[] | null;
};

/** Formate une date ISO en libellé relatif court en français. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  return `Il y a ${days} j`;
}

/**
 * Récupère les groupes de l'utilisateur connecté avec le nombre de membres
 * et les avatars. `matches` / `status` restent neutres tant que le vote
 * (GH-8/GH-9) n'est pas branché.
 */
export async function fetchUserGroups(): Promise<Group[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];

  const { data: memberships, error: mErr } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);
  if (mErr || !memberships || memberships.length === 0) return [];

  const ids = (memberships as { group_id: string }[]).map(m => m.group_id);

  const { data, error } = await supabase
    .from('groups')
    .select('id, name, emoji, accent, created_at, group_members(profiles(display_name, avatar_color))')
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (error || !data) return [];

  return (data as unknown as GroupRow[]).map(g => {
    const members = g.group_members ?? [];
    const people: GroupPerson[] = members.slice(0, 4).map(m => ({
      n: (m.profiles?.display_name ?? '?').charAt(0).toUpperCase(),
      c: m.profiles?.avatar_color ?? '#ff3b47',
    }));
    return {
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      accent: g.accent,
      members: members.length,
      people,
      activity: relativeTime(g.created_at),
      matches: 0,
      status: 'À lancer',
    };
  });
}
