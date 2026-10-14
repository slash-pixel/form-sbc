import { useState } from 'react';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          🎓 Portail Scolaire des Inscriptions
        </h1>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('student')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'student' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Espace Élève (Formulaire)
          </button>
          <button 
            onClick={() => setView('admin')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Espace Administrateur
          </button>
        </div>
      </header>

      <main className="py-6">
        {view === 'student' ? <StudentForm /> : <AdminDashboard />}
      </main>
    </div>
  );
}