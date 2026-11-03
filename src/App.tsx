import { useState } from 'react';
import StudentForm from './components/StudentForm';
import ExamForm from './components/ExamForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [section, setSection] = useState<'eleves' | 'examens'>('eleves');

  const spaceBtn = (active: boolean) =>
    `px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
      active ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
    }`;

  const sectionBtn = (active: boolean) =>
    `px-5 py-2 text-sm font-bold rounded-full border transition cursor-pointer ${
      active
        ? 'bg-[#0B1F4B] text-[#E6C65A] border-[#C9A227]'
        : 'bg-white text-slate-600 border-slate-300 hover:border-[#C9A227]'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center print:hidden">
        <h1 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          🎓 Portail Scolaire des Inscriptions
        </h1>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setView('student')} className={spaceBtn(view === 'student')}>
            Espace Élève (Formulaire)
          </button>
          <button onClick={() => setView('admin')} className={spaceBtn(view === 'admin')}>
            Espace Administrateur
          </button>
        </div>
      </header>

      <main className="py-6">
        {view === 'student' ? (
          <>
            <div className="max-w-3xl mx-auto px-4 flex gap-3">
              <button onClick={() => setSection('eleves')} className={sectionBtn(section === 'eleves')}>
                📋 Fiche élève
              </button>
              <button onClick={() => setSection('examens')} className={sectionBtn(section === 'examens')}>
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