import { useEffect, useState } from 'react'
import { Search, Plus, Trash2, Eye } from 'lucide-react'
import type { ExamSubmission } from '../types/exam'
import { ExamRepository, UnauthorizedError } from '../services/examRepository'
import { formatDate } from '../utils/date'

interface Props {
  onSelect: (exam: ExamSubmission) => void
  onNew: () => void
  onUnauthorized?: () => void
}

export function ExamList({ onSelect, onNew, onUnauthorized }: Props) {
  const [exams, setExams] = useState<ExamSubmission[]>([])
  const [search, setSearch] = useState('')
  const [examFilter, setExamFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ExamRepository.getAll()
      .then((d) => { if (mounted) setExams(d) })
      .catch((err) => {
        if (err instanceof UnauthorizedError) onUnauthorized?.()
        else console.warn('Erreur lors du chargement des fiches d’examen.')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [onUnauthorized])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await ExamRepository.delete(deleteId)
      setExams((p) => p.filter((e) => e.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      if (err instanceof UnauthorizedError) onUnauthorized?.()
      else alert('Erreur lors de la suppression')
    }
  }

  const examTypes = Array.from(new Set(exams.map((e) => e.examen)))
  const q = search.toLowerCase()
  const filtered = exams.filter(
    (e) =>
      (e.nomCandidat.toLowerCase().includes(q) ||
        e.prenoms.toLowerCase().includes(q) ||
        e.serie.toLowerCase().includes(q) ||
        e.numeroActeNaissance.toLowerCase().includes(q)) &&
      (examFilter ? e.examen === examFilter : true)
  )

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom, série, acte..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1E40AF]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm cursor-pointer"
          >
            <option value="">Tous les examens</option>
            {examTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold rounded-lg text-sm hover:opacity-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouvelle fiche d'examen
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-serif">Chargement des fiches d'examen...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-500">
          Aucune fiche d'examen trouvée.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0B1F4B] text-white font-serif text-xs uppercase tracking-wider">
                <th className="p-4">Candidat</th>
                <th className="p-4">Examen / Série</th>
                <th className="p-4">N° Acte</th>
                <th className="p-4">Né(e) le</th>
                <th className="p-4">EPS</th>
                <th className="p-4">Facultative</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-4 font-bold uppercase text-slate-900">
                    {e.nomCandidat}{' '}
                    <span className="font-normal capitalize text-slate-600">{e.prenoms.toLowerCase()}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#1E40AF] rounded-full text-xs font-bold border border-blue-200">
                      {e.examen} • {e.serie}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{e.numeroActeNaissance}</td>
                  <td className="p-4 text-slate-600">{formatDate(e.dateNaissance)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        e.eps === 'APTE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {e.eps === 'APTE' ? 'Apte' : 'Inapte'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{e.epreuveFacultative || '—'}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onSelect(e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F4B] text-white rounded-lg text-xs hover:bg-[#1E40AF] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Voir la fiche
                    </button>
                    <button
                      onClick={() => setDeleteId(e.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg inline-block cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="font-serif text-lg font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 mb-6">Supprimer définitivement cette fiche d'examen ?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}