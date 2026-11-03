export interface ExamSubmission {
  id: string
  examen: string
  serie: string
  matriculeCarteScolaire?: string | null
  numeroActeNaissance: string
  nomCandidat: string
  prenoms: string
  dateNaissance: string
  lieuNaissance: string
  sexe: 'M' | 'F'
  contactParent: string
  nomPere?: string | null
  nomMere?: string | null
  eps: 'APTE' | 'INAPTE'
  epreuveFacultative?: string | null
  faitA: string
  faitLe: string
  dateReceptionPrefet?: string | null
  createdAt: string
}

export type ExamInput = Omit<ExamSubmission, 'id' | 'createdAt'>