import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { SubmissionInput } from '../types/student';

const API_URL = import.meta.env.VITE_API_URL || 'https://formapi-l768.onrender.com/api';

export default function StudentForm() {
  const [formData, setFormData] = useState<SubmissionInput>({
    classe: '',
    nomEleve: '',
    prenoms: '',
    sexe: 'M',
    age: 0,
    redoublant: false,
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: 'Camerounaise',
    nomPere: '',
    professionPere: '',
    telephonePere: '',
    nomMere: '',
    professionMere: '',
    telephoneMere: '',
    adresseQuartier: '',
    nomTuteur: '',
    contactTuteur: '',
    personneUrgence: '',
    contactUrgence: '',
    observations: '',
    photoUrl: ''
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 9;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Vérification contrainte parent (au moins un parent requis)
    if (!formData.nomPere.trim() && !formData.nomMere.trim()) {
      setError("Vous devez renseigner les informations d'au moins un des deux parents (Père ou Mère).");
      return;
    }

    // Vérification des numéros de téléphone (min 9 chiffres)
    if (formData.telephonePere && !validatePhone(formData.telephonePere)) {
      setError("Le numéro de téléphone du père doit contenir au moins 9 chiffres.");
      return;
    }
    if (formData.telephoneMere && !validatePhone(formData.telephoneMere)) {
      setError("Le numéro de téléphone de la mère doit contenir au moins 9 chiffres.");
      return;
    }
    if (!validatePhone(formData.contactTuteur) || !validatePhone(formData.contactUrgence)) {
      setError("Les contacts du tuteur et d'urgence doivent contenir au moins 9 chiffres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          redoublant: Boolean(formData.redoublant),
          dateNaissance: new Date(formData.dateNaissance).toISOString()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement");
      }

      setSuccess("Fiche de renseignement enregistrée avec succès !");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">FICHE DE RENSEIGNEMENT DE L'ÉLÈVE</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Classe</label>
            <input type="text" name="classe" required value={formData.classe} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="ex: 1ère D" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de l'élève</label>
            <input type="text" name="nomEleve" required value={formData.nomEleve} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prénom(s)</label>
            <input type="text" name="prenoms" required value={formData.prenoms} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sexe</label>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="M">Masculin (M)</option>
              <option value="F">Féminin (F)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Âge</label>
            <input type="number" name="age" required value={formData.age || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Redoublant ?</label>
            <select name="redoublant" value={formData.redoublant ? 'true' : 'false'} onChange={(e) => setFormData(prev => ({...prev, redoublant: e.target.value === 'true'}))} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
            <input type="date" name="dateNaissance" required value={formData.dateNaissance} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lieu de naissance</label>
            <input type="text" name="lieuNaissance" required value={formData.lieuNaissance} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationalité</label>
            <input type="text" name="nationalite" required value={formData.nationalite} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse (Quartier)</label>
            <input type="text" name="adresseQuartier" required value={formData.adresseQuartier} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <hr className="my-4" />
        <h3 className="text-lg font-semibold text-gray-800">Informations Parents (Au moins l'un des deux)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="nomPere" placeholder="Nom du père" value={formData.nomPere} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="professionPere" placeholder="Profession du père" value={formData.professionPere} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="telephonePere" placeholder="Tél père (min 9 chiffres)" value={formData.telephonePere} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          
          <input type="text" name="nomMere" placeholder="Nom de la mère" value={formData.nomMere} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="professionMere" placeholder="Profession de la mère" value={formData.professionMere} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="telephoneMere" placeholder="Tél mère (min 9 chiffres)" value={formData.telephoneMere} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
        </div>

        <hr className="my-4" />
        <h3 className="text-lg font-semibold text-gray-800">Tuteur & Urgence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="nomTuteur" required placeholder="Nom du tuteur" value={formData.nomTuteur} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="contactTuteur" required placeholder="Contact du tuteur" value={formData.contactTuteur} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="personneUrgence" required placeholder="Personne à contacter en urgence" value={formData.personneUrgence} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
          <input type="text" name="contactUrgence" required placeholder="Contact d'urgence" value={formData.contactUrgence} onChange={handleChange} className="border border-gray-300 rounded-md p-2" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">URL Photo 4x4</label>
          <input type="url" name="photoUrl" required placeholder="https://..." value={formData.photoUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Observations</label>
          <textarea name="observations" value={formData.observations} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={2}></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition">
          {loading ? 'Envoi en cours...' : 'Soumettre la fiche'}
        </button>
      </form>
    </div>
  );
}