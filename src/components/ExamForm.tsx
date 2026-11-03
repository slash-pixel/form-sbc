import { useState, type FormEvent, type ReactNode, type ChangeEvent } from 'react'
import { ArrowLeft, Save } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://formapi-l768.onrender.com/api'
const today = () => new Date().toISOString().slice(0, 10)

interface Props {
  onDone?: () => void
  onBack?: () => void
}

const initial = {
  examen: 'BEPC',
  serie: '',
  matriculeCarteScolaire: '',
  numeroActeNaissance: '',
  nomCandidat: '',
  prenoms: '',
  dateNaissance: '',
  lieuNaissance: '',
  sexe: 'M' as 'M' | 'F',
  contactParent: '',
  nomPere: '',
  nomMere: '',
  eps: 'APTE' as 'APTE' | 'INAPTE',
  epreuveFacultative: '',
  faitA: 'Douala',
  faitLe: today(),
  dateReceptionPrefet: '',
}

type FormState = typeof initial

const inputClass =
  'mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-[#1E40AF] bg-white'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export default function ExamForm({ onDone, onBack }: Props) {
  const [f, setF] = useState<FormState>(initial)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const bind = (k: keyof FormState) => ({
    value: f[k] as string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value })),
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (f.contactParent.replace(/\D/g, '').length < 9) {
      setError('Le contact du parent doit contenir au moins 9 chiffres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          matriculeCarteScolaire: f.matriculeCarteScolaire || null,
          nomPere: f.nomPere || null,
          nomMere: f.nomMere || null,
          epreuveFacultative: f.epreuveFacultative || null,
          dateReceptionPrefet: f.dateReceptionPrefet || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Erreur lors de l'enregistrement")

      if (onDone) {
        onDone()
      } else {
        setSuccess("Fiche d'examen enregistrée avec succès !")
        setF({ ...initial, faitLe: today() })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8 border border-slate-200">
      {onBack && (
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0B1F4B] mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
      )}

      <h2 className="font-serif text-2xl font-bold text-center text-[#0B1F4B]">
        FORMULAIRE EXAMEN OBC — SESSION 2026
      </h2>
      <p className="text-center text-xs text-slate-500 mb-6">À remplir par chaque candidat</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Examen">
            <select className={inputClass} {...bind('examen')}>
              <option>BEPC</option>
              <option>Probatoire</option>
              <option>Baccalauréat</option>
            </select>
          </Field>
          <Field label="Série">
            <input className={inputClass} required placeholder="ex: Espagnol" {...bind('serie')} />
          </Field>
          <Field label="Matricule carte scolaire">
            <input className={inputClass} {...bind('matriculeCarteScolaire')} />
          </Field>
          <Field label="N° Acte de naissance">
            <input className={inputClass} required placeholder="ex: 1234/2012" {...bind('numeroActeNaissance')} />
          </Field>
          <Field label="Nom du candidat">
            <input className={inputClass} required {...bind('nomCandidat')} />
          </Field>
          <Field label="Prénoms">
            <input className={inputClass} required {...bind('prenoms')} />
          </Field>
          <Field label="Né(e) le">
            <input type="date" className={inputClass} required {...bind('dateNaissance')} />
          </Field>
          <Field label="À (lieu de naissance)">
            <input className={inputClass} required {...bind('lieuNaissance')} />
          </Field>
          <Field label="Sexe">
            <select className={inputClass} {...bind('sexe')}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Contact du parent">
            <input className={inputClass} required {...bind('contactParent')} />
          </Field>
          <Field label="Nom du père">
            <input className={inputClass} {...bind('nomPere')} />
          </Field>
          <Field label="Nom de la mère">
            <input className={inputClass} {...bind('nomMere')} />
          </Field>
          <Field label="EPS">
            <select className={inputClass} {...bind('eps')}>
              <option value="APTE">Apte</option>
              <option value="INAPTE">Inapte</option>
            </select>
          </Field>
          <Field label="Épreuve facultative sollicitée">
            <input className={inputClass} placeholder="ex: Dessin" {...bind('epreuveFacultative')} />
          </Field>
          <Field label="Fait à">
            <input className={inputClass} required {...bind('faitA')} />
          </Field>
          <Field label="Le">
            <input type="date" className={inputClass} required {...bind('faitLe')} />
          </Field>
          <Field label="Date de réception par le Préfet des Études">
            <input type="date" className={inputClass} {...bind('dateReceptionPrefet')} />
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold py-3 rounded-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Enregistrement...' : 'Enregistrer la fiche'}
        </button>
      </form>
    </div>
  )
}