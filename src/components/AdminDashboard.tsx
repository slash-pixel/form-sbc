import { useState, useEffect, useCallback, type FormEvent } from 'react';
import PrintableSheet from './PrintableSheet';
import type { Submission } from '../types/student';

const API_URL = import.meta.env.VITE_API_URL || 'https://formapi-l768.onrender.com/api';

export default function AdminDashboard() {
  const [token, setToken] = useState<string>(localStorage.getItem('admin_token') || '');
  const [password, setPassword] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedClasse, setSelectedClasse] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogout = useCallback(() => {
    setToken('');
    localStorage.removeItem('admin_token');
    setSubmissions([]);
  }, []);

  const fetchSubmissions = useCallback(async (authToken: string, classe: string = '') => {
    try {
      const url = classe 
        ? `${API_URL}/admin/submissions?classe=${encodeURIComponent(classe)}` 
        : `${API_URL}/admin/submissions`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissions(data.data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  }, [handleLogout]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Échec de la connexion');

      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
      fetchSubmissions(data.token, selectedClasse);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette fiche ?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
      } else {
        alert(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Synchronisation sécurisée pour ESLint (annulation des requêtes obsolètes)
  useEffect(() => {
    let isMounted = true;

    if (token) {
      const loadData = async () => {
        try {
          const url = selectedClasse 
            ? `${API_URL}/admin/submissions?classe=${encodeURIComponent(selectedClasse)}` 
            : `${API_URL}/admin/submissions`;

          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();

          if (isMounted) {
            if (res.ok && data.success) {
              setSubmissions(data.data);
            } else if (res.status === 401 || res.status === 403) {
              handleLogout();
            }
          }
        } catch (err) {
          console.error(err);
        }
      };

      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [token, selectedClasse, handleLogout]);

  if (selectedSubmission) {
    return (
      <PrintableSheet 
        submission={selectedSubmission} 
        onBack={() => setSelectedSubmission(null)} 
      />
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Administration - Connexion</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe administrateur</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 transition shadow"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6 bg-white p-4 shadow rounded-lg">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Tableau de bord Administrateur</h1>
          <p className="text-sm text-gray-500">Gestion des fiches d'inscription scolaires</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition">
          Déconnexion
        </button>
      </div>

      <div className="mb-6 flex gap-4 items-center bg-white p-4 shadow rounded-lg">
        <label className="text-sm font-medium text-gray-700">Filtrer par classe :</label>
        <input 
          type="text" 
          placeholder="ex: 1ère D, 6ème A..." 
          value={selectedClasse} 
          onChange={e => setSelectedClasse(e.target.value)} 
          className="border border-gray-300 rounded-md p-2 text-sm w-64"
        />
        {selectedClasse && (
          <button onClick={() => setSelectedClasse('')} className="text-sm text-blue-600 hover:underline">
            Réinitialiser le filtre
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
            <tr>
              <th className="p-3">Classe</th>
              <th className="p-3">Élève</th>
              <th className="p-3">Sexe</th>
              <th className="p-3">Tuteur / Contact</th>
              <th className="p-3">Date soumission</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">Aucune fiche trouvée.</td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{sub.classe}</td>
                  <td className="p-3">
                    <span 
                      onClick={() => setSelectedSubmission(sub)} 
                      className="text-blue-600 font-semibold cursor-pointer hover:underline"
                    >
                      {sub.nomEleve} {sub.prenoms}
                    </span>
                  </td>
                  <td className="p-3">{sub.sexe}</td>
                  <td className="p-3">{sub.nomTuteur} ({sub.contactTuteur})</td>
                  <td className="p-3 text-gray-500">{new Date(sub.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedSubmission(sub)} 
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-100 transition"
                    >
                      📄 Voir la fiche
                    </button>
                    <button 
                      onClick={() => handleDelete(sub.id)} 
                      className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-100 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}