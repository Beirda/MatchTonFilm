import type { Group, GroupPerson } from '@/types/group';
import { supabase } from '@/lib/supabase';
import { tmdb } from '@/lib/tmdb';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';
const POSTER_COUNT = 3;

type GroupRow = {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  created_at: string;
  group_members: { profiles: { display_name: string | null; avatar_color: string } | null }[] | null;
};

type VoteRow = {
  group_id: string;
  movie_id: number;
  vote: string;
  created_at: string;
};

type GroupHighlights = {
  posters: string[];
  matches: number;
  voteCount: number;
  lastVoteAt: string | null;
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
 * Agrège les votes de chaque groupe : affiches des films les plus aimés
 * (têtes du classement des matchs), nombre de matchs (films aimés par au
 * moins 2 membres) et date du dernier vote.
 */
async function fetchGroupHighlights(ids: string[]): Promise<Map<string, GroupHighlights>> {
  const highlights = new Map<string, GroupHighlights>(
    ids.map(id => [id, { posters: [], matches: 0, voteCount: 0, lastVoteAt: null }]),
  );

  const { data, error } = await supabase
    .from('votes')
    .select('group_id, movie_id, vote, created_at')
    .in('group_id', ids);
  if (error || !data || data.length === 0) return highlights;

  const likesByGroup = new Map<string, Map<number, number>>();
  for (const { group_id, movie_id, vote, created_at } of data as VoteRow[]) {
    const h = highlights.get(group_id);
    if (!h) continue;
    h.voteCount += 1;
    if (!h.lastVoteAt || created_at > h.lastVoteAt) h.lastVoteAt = created_at;
    if (vote !== 'like') continue;
    const likes = likesByGroup.get(group_id) ?? new Map<number, number>();
    likes.set(movie_id, (likes.get(movie_id) ?? 0) + 1);
    likesByGroup.set(group_id, likes);
  }

  const topByGroup = new Map<string, number[]>();
  const movieIds = new Set<number>();
  for (const [groupId, likes] of likesByGroup) {
    const top = [...likes.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, POSTER_COUNT)
      .map(([movieId]) => movieId);
    topByGroup.set(groupId, top);
    top.forEach(id => movieIds.add(id));
    const h = highlights.get(groupId);
    if (h) h.matches = [...likes.values()].filter(count => count >= 2).length;
  }

  const posterById = new Map<number, string | null>();
  await Promise.all(
    [...movieIds].map(async id => {
      try {
        const movie = await tmdb.getMovie(id);
        posterById.set(id, movie.poster_path);
      } catch {
        posterById.set(id, null);
      }
    }),
  );

  for (const [groupId, top] of topByGroup) {
    const h = highlights.get(groupId);
    if (!h) continue;
    h.posters = top
      .map(id => posterById.get(id))
      .filter((path): path is string => Boolean(path))
      .map(path => `${POSTER_BASE}${path}`);
  }

  return highlights;
}

/**
 * Récupère les groupes de l'utilisateur connecté avec le nombre de membres,
 * les avatars, et les affiches des films en tête des matchs du groupe.
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

  const [groupsRes, highlights] = await Promise.all([
    supabase
      .from('groups')
      .select('id, name, emoji, accent, created_at, group_members(profiles(display_name, avatar_color))')
      .in('id', ids)
      .order('created_at', { ascending: false }),
    fetchGroupHighlights(ids),
  ]);
  if (groupsRes.error || !groupsRes.data) return [];

  return (groupsRes.data as unknown as GroupRow[]).map(g => {
    const members = g.group_members ?? [];
    const people: GroupPerson[] = members.slice(0, 4).map(m => ({
      n: (m.profiles?.display_name ?? '?').charAt(0).toUpperCase(),
      c: m.profiles?.avatar_color ?? '#ff3b47',
    }));
    const h = highlights.get(g.id) ?? { posters: [], matches: 0, voteCount: 0, lastVoteAt: null };
    return {
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      accent: g.accent,
      members: members.length,
      people,
      activity: relativeTime(h.lastVoteAt ?? g.created_at),
      matches: h.matches,
      status: h.voteCount > 0 ? 'En cours' : 'À lancer',
      posters: h.posters,
    };
  });
}

/**
 * Supprime définitivement un groupe (réservé à l'admin via la policy RLS
 * « groups: suppression par l'admin »). Les membres, votes et préférences liés
 * disparaissent en cascade (ON DELETE CASCADE sur group_id).
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const { data, error } = await supabase.from('groups').delete().eq('id', groupId).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Suppression refusée : tu n’es peut-être plus admin du groupe.');
}

/**
 * Retire un membre d'un groupe (réservé à l'admin) via la RPC SECURITY DEFINER
 * `remove_group_member` : la policy RLS de group_members ne permet à chacun que
 * de se retirer lui-même, d'où le passage par une fonction côté serveur.
 */
export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_group_member', {
    p_group_id: groupId,
    p_user_id: userId,
  });
  if (error) throw error;
}
