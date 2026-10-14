export interface Student {
  id: string;
  matricule: string;
  anneeScolaire: string;
  photoDataUrl?: string;
  classe: string;
  nomEleve: string;
  prenoms: string;
  sexe: 'M' | 'F';
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
  nomTuteur?: string | null;
  contactTuteur?: string | null;
  personneUrgence: string;
  contactUrgence: string;
  observations?: string | null;
  createdAt?: string;
  updatedAt?: string;
}