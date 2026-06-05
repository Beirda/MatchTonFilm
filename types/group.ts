export type GroupPerson = {
  n: string;
  c: string;
};

export type Group = {
  id: string;
  name: string;
  emoji: string;
  members: number;
  activity: string;
  matches: number;
  status: string;
  accent: string;
  people: GroupPerson[];
};
