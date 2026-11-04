import { useState } from 'react';
import StudentForm from './components/StudentForm';
import ExamForm from './components/ExamForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [section, setSection] = useState<'eleves' | 'examens'>('eleves');

  const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C65A] focus-visible:ring-offset-2';

  // Boutons d'espace (dans l'en-tête marine)
  const spaceBtn = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${focusRing} focus-visible:ring-offset-[#0B1F4B] ${
      active
        ? 'bg-[#C9A227] text-[#0B1F4B] shadow-md'
        : 'text-white/85 hover:bg-white/10 hover:text-white'
    }`;

  // Boutons de section (sur fond clair)
  const sectionBtn = (active: boolean) =>
    `px-5 py-2.5 text-sm font-bold rounded-full border-2 transition cursor-pointer ${focusRing} focus-visible:ring-offset-[#F5F6FA] ${
      active
        ? 'bg-[#0B1F4B] text-[#E6C65A] border-[#C9A227] shadow-md'
        : 'bg-white text-[#0B1F4B] border-slate-300 hover:border-[#C9A227] hover:bg-[#FBF7E8]'
    }`;

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-900 font-sans">
      <header className="bg-[#0B1F4B] border-b-4 border-[#C9A227] py-4 px-4 sm:px-6 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center print:hidden">
        <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span aria-hidden="true">🎓</span>
          <span>
            Portail Scolaire
            <span className="block text-xs font-medium text-[#E6C65A] tracking-wide">
              Collège Catholique Saint Charles Borromée
            </span>
          </span>
        </h1>

        <div className="flex gap-1 bg-white/10 p-1 rounded-full">
          <button
            type="button"
            onClick={() => setView('student')}
            aria-pressed={view === 'student'}
            className={spaceBtn(view === 'student')}
          >
            Espace Élève
          </button>
          <button
            type="button"
            onClick={() => setView('admin')}
            aria-pressed={view === 'admin'}
            className={spaceBtn(view === 'admin')}
          >
            Espace Administrateur
          </button>
        </div>
      </header>

      <main className="py-6">
        {view === 'student' ? (
          <>
            <div className="max-w-3xl mx-auto px-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSection('eleves')}
                aria-pressed={section === 'eleves'}
                className={sectionBtn(section === 'eleves')}
              >
                📋 Fiche élève
              </button>
              <button
                type="button"
                onClick={() => setSection('examens')}
                aria-pressed={section === 'examens'}
                className={sectionBtn(section === 'examens')}
              >
                🎓 Fiche d'examen
              </button>
            </div>
            {section === 'eleves' ? <StudentForm /> : <ExamForm />}
          </>
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}