export type Sexe = 'M' | 'F';

export interface Submission {
  id: string;
  classe: string;
  nomEleve: string;
  prenoms: string;
  sexe: Sexe;
  age: number;
  redoublant: boolean;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  nomPere?: string | null;
  professionPere?: string | null;
  telephonePere?: string | null;
  nomMere?: string | null;
  professionMere?: string | null;
  telephoneMere?: string | null;
  adresseQuartier: string;
  nomTuteur: string;
  contactTuteur: string;
  personneUrgence: string;
  contactUrgence: string;
  observations?: string | null;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionInput {
  classe: string;
  nomEleve: string;
  prenoms: string;
  sexe: Sexe;
  age: number;
  redoublant: boolean;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  nomPere: string;
  professionPere: string;
  telephonePere: string;
  nomMere: string;
  professionMere: string;
  telephoneMere: string;
  adresseQuartier: string;
  nomTuteur: string;
  contactTuteur: string;
  personneUrgence: string;
  contactUrgence: string;
  observations: string;
  photoUrl: string;
}