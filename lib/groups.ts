import type { Group } from '@/types/group';

const MOCK_GROUPS: Group[] = [
  {
    id: 'coloc',
    name: 'Soirée Coloc',
    emoji: '🍿',
    members: 4,
    activity: 'Il y a 2 h',
    matches: 7,
    status: 'En cours',
    accent: '#ff3b47',
    people: [
      { n: 'L', c: '#ff3b47' },
      { n: 'M', c: '#7d2b8c' },
      { n: 'T', c: '#2a3a8c' },
      { n: 'J', c: '#1f5a52' },
    ],
  },
  {
    id: 'couple',
    name: 'Ciné Couple',
    emoji: '❤️',
    members: 2,
    activity: 'Hier',
    matches: 12,
    status: 'Match trouvé',
    accent: '#d11e63',
    people: [
      { n: 'A', c: '#d11e63' },
      { n: 'S', c: '#b5651d' },
    ],
  },
  {
    id: 'boulot',
    name: 'Team Boulot',
    emoji: '💼',
    members: 6,
    activity: 'Il y a 3 j',
    matches: 0,
    status: 'À lancer',
    accent: '#2a3a8c',
    people: [
      { n: 'K', c: '#2a3a8c' },
      { n: 'R', c: '#a8421a' },
      { n: 'N', c: '#1f5a52' },
      { n: 'P', c: '#7d2b8c' },
    ],
  },
];

export async function fetchUserGroups(): Promise<Group[]> {
  // TODO GH-3: supabase.from('groups').select('*, members(count)').eq('user_id', userId)
  return Promise.resolve(MOCK_GROUPS);
}
