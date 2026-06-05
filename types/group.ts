/** Membre d'un groupe : initiale d'affichage + couleur d'avatar. */
export type GroupPerson = {
  n: string;
  c: string;
};

/** Groupe de visionnage auquel l'utilisateur appartient. */
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
