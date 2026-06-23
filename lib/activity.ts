import { supabase } from '@/lib/supabase';
import { tmdb } from '@/lib/tmdb';

const EVENT_LIMIT = 12;
const VOTES_LIMIT = 15;

export type ActivityEvent = {
  id: string;
  text: string;
  sub: string;
  icon: 'favorite' | 'group' | 'thumb-down';
  date: string;
};

type JoinRow = {
  group_id: string;
  user_id: string;
  joined_at: string;
  profiles: { display_name: string | null } | null;
};

type VoteRow = {
  group_id: string;
  movie_id: number;
  vote: 'like' | 'dislike';
  created_at: string;
  profiles: { display_name: string | null } | null;
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

function firstName(displayName: string | null): string {
  if (!displayName) return 'Un membre';
  return displayName.split('@')[0];
}

/**
 * Fil d'activité réel de l'utilisateur : arrivées de membres et films swipés
 * (aimés comme passés) dans ses groupes, triés du plus récent au plus ancien.
 */
export async function fetchUserActivity(): Promise<ActivityEvent[]> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);
  const ids = ((memberships ?? []) as { group_id: string }[]).map(m => m.group_id);
  if (ids.length === 0) return [];

  const [groupsRes, joinsRes, votesRes] = await Promise.all([
    supabase.from('groups').select('id, name').in('id', ids),
    supabase
      .from('group_members')
      .select('group_id, user_id, joined_at, profiles(display_name)')
      .in('group_id', ids),
    supabase
      .from('votes')
      .select('group_id, movie_id, vote, created_at, profiles(display_name)')
      .in('group_id', ids)
      .order('created_at', { ascending: false })
      .limit(VOTES_LIMIT),
  ]);

  const groupNames = new Map(
    ((groupsRes.data ?? []) as { id: string; name: string }[]).map(g => [g.id, g.name]),
  );

  const votes = (votesRes.data ?? []) as unknown as VoteRow[];
  const movieTitles = new Map<number, string>();
  await Promise.all(
    [...new Set(votes.map(v => v.movie_id))].map(async movieId => {
      try {
        const movie = await tmdb.getMovie(movieId);
        movieTitles.set(movieId, movie.title);
      } catch {
        // titre indisponible : l'événement est ignoré plus bas
      }
    }),
  );

  const events: ActivityEvent[] = [];

  for (const join of (joinsRes.data ?? []) as unknown as JoinRow[]) {
    const groupName = groupNames.get(join.group_id);
    if (!groupName) continue;
    events.push({
      id: `join-${join.group_id}-${join.user_id}`,
      text: `${firstName(join.profiles?.display_name ?? null)} a rejoint ${groupName}`,
      sub: relativeTime(join.joined_at),
      icon: 'group',
      date: join.joined_at,
    });
  }

  for (const vote of votes) {
    const groupName = groupNames.get(vote.group_id);
    const title = movieTitles.get(vote.movie_id);
    if (!groupName || !title) continue;
    const liked = vote.vote === 'like';
    events.push({
      id: `vote-${vote.group_id}-${vote.movie_id}-${vote.created_at}`,
      text: `${firstName(vote.profiles?.display_name ?? null)} a ${liked ? 'aimé' : 'passé'} ${title}`,
      sub: `${groupName} · ${relativeTime(vote.created_at)}`,
      icon: liked ? 'favorite' : 'thumb-down',
      date: vote.created_at,
    });
  }

  return events
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, EVENT_LIMIT);
}
