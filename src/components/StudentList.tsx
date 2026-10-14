import React, { useState, useEffect } from 'react';
import type { Student } from '../types/student';
import { StudentRepository } from '../services/studentRepository';
import { Search, Plus, FileText, Trash2, Users, UserCheck, AlertCircle, LayoutGrid, Table as TableIcon } from 'lucide-react';

interface Props {
  onSelectStudent: (student: Student) => void;
  onNewStudent: () => void;
  onLogout: () => void;
}

export const StudentList: React.FC<Props> = ({ onSelectStudent, onNewStudent, onLogout }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStudents() {
      setLoading(true);
      try {
        const data = await StudentRepository.getAll();
        if (isMounted) {
          setStudents(data);
        }
      } catch {
        console.warn('Erreur lors du chargement des données.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await StudentRepository.delete(deleteId);
      setStudents(students.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = 
      s.nomEleve.toLowerCase().includes(search.toLowerCase()) ||
      s.prenoms.toLowerCase().includes(search.toLowerCase()) ||
      s.classe.toLowerCase().includes(search.toLowerCase()) ||
      (s.telephonePere && s.telephonePere.includes(search));
    const matchClass = selectedClass ? s.classe === selectedClass : true;
    return matchSearch && matchClass;
  });

  const total = students.length;
  const garcons = students.filter(s => s.sexe === 'M').length;
  const filles = students.filter(s => s.sexe === 'F').length;
  const redoublants = students.filter(s => s.redoublant).length;

  return (
    <div className="min-h-screen bg-[#FBF8F1] text-slate-900">
      {/* En-tête principal */}
      <header className="bg-linear-to-r from-[#071533] via-[#0B1F4B] to-[#1E40AF] text-white py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] flex items-center justify-center bg-amber-50/10">
              <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#C9A227] fill-current">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M50 15 L50 85 M20 40 L80 40" stroke="currentColor" strokeWidth="6" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-[#E6C65A]">Collège Catholique St Charles Borromée</h1>
              <p className="text-xs text-slate-300">Année Scolaire 2026-2027 • Registre des Élèves</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNewStudent}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold rounded-lg shadow hover:opacity-95 transition-opacity text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouvel élève
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cartes Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Élèves" value={total} icon={<Users className="w-5 h-5 text-[#1E40AF]" />} />
          <StatCard title="Garçons / Filles" value={`${garcons} / ${filles}`} icon={<UserCheck className="w-5 h-5 text-[#C9A227]" />} />
          <StatCard title="Redoublants" value={redoublants} icon={<AlertCircle className="w-5 h-5 text-amber-600" />} />
          <StatCard title="Classes Actives" value="8 niveaux" icon={<FileText className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Barre d'outils & Filtres */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom, classe..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1E40AF]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none cursor-pointer"
            >
              <option value="">Toutes les classes</option>
              <option value="6ème A">6ème A</option>
              <option value="6ème B">6ème B</option>
              <option value="5ème A">5ème A</option>
              <option value="4ème B">4ème B</option>
              <option value="3ème C">3ème C</option>
              <option value="2nde C">2nde C</option>
              <option value="1ère D">1ère D</option>
              <option value="Tle C">Tle C</option>
            </select>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded cursor-pointer ${viewMode === 'table' ? 'bg-white shadow text-[#0B1F4B]' : 'text-slate-500'}`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded cursor-pointer ${viewMode === 'cards' ? 'bg-white shadow text-[#0B1F4B]' : 'text-slate-500'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Affichage Tableau / Liste */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-serif">Chargement du registre...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">Aucun élève trouvé dans le registre.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#0B1F4B] text-white font-serif text-xs uppercase tracking-wider">
                  <th className="p-4">Matricule</th>
                  <th className="p-4">Élève</th>
                  <th className="p-4">Classe</th>
                  <th className="p-4">Sexe / Âge</th>
                  <th className="p-4">Quartier</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="p-4 font-mono font-medium text-[#1E40AF]">{s.matricule}</td>
                    <td className="p-4 font-bold text-slate-900 uppercase">
                      {s.nomEleve} <span className="font-normal capitalize text-slate-600">{s.prenoms}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-[#1E40AF] rounded-full text-xs font-bold border border-blue-200">
                        {s.classe}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{s.sexe} • {s.age} ans</td>
                    <td className="p-4 text-slate-600">{s.adresseQuartier}</td>
                    <td className="p-4 text-slate-600">{s.telephonePere || s.contactTuteur || 'N/C'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onSelectStudent(s)}
                        className="px-3 py-1.5 bg-[#0B1F4B] text-white rounded-lg text-xs hover:bg-[#1E40AF] transition-colors cursor-pointer"
                      >
                        Voir la Fiche
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#C9A227] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-xs font-bold text-[#1E40AF] bg-blue-50 px-2.5 py-1 rounded">
                      {s.matricule}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-xs font-bold">
                      {s.classe}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 uppercase">
                    {s.nomEleve}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{s.prenoms}</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>📍 Quartier : {s.adresseQuartier}</p>
                    <p>📞 Tél : {s.telephonePere || 'N/C'}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(s)}
                    className="text-sm font-bold text-[#0B1F4B] hover:underline cursor-pointer"
                  >
                    Consulter la fiche →
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(s.id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modale de confirmation de suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 mb-6">Êtes-vous sûr de vouloir supprimer définitivement cette fiche élève du registre ?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
      <h3 className="font-serif text-2xl font-bold text-[#0B1F4B]">{value}</h3>
    </div>
    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      {icon}
    </div>
  </div>
);