import type { Group } from '@/types/group';

const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Ciné du jeudi',
    description: 'On regarde un film chaque jeudi soir',
    createdAt: new Date().toISOString(),
    memberCount: 4,
    coverUrl: null,
  },
  {
    id: '2',
    name: 'Soirée horror',
    description: null,
    createdAt: new Date().toISOString(),
    memberCount: 2,
    coverUrl: null,
  },
];

export async function fetchUserGroups(): Promise<Group[]> {
  // TODO GH-3: supabase.from('groups').select('*, members(count)').eq('user_id', userId)
  return Promise.resolve(MOCK_GROUPS);
}
