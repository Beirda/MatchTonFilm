export type AgeRating = 'Tous' | '12+' | '16+' | '18+';
export type Language = 'VF' | 'VOSTFR' | 'VF + VOSTFR';

export type GroupForm = {
  name: string;
  genres: string[];
  ageRating: AgeRating;
  language: Language;
};
