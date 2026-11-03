import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { SubmissionInput } from '../types/student';

const API_URL = import.meta.env.VITE_API_URL || 'https://formapi-l768.onrender.com/api';
const CLOUDINARY_CLOUD_NAME = 'dkpckq62b';
const CLOUDINARY_PRESET = 'm';

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
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');

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

  /**
   * Traitement de l'image :
   * 1. Rognage automatique au format carré 4x4 (Ratio 1:1)
   * 2. Compression JPEG à 80% de qualité
   * 3. Upload vers Cloudinary
   */
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // --- ÉTAPE 1 : FORMATTAGE PHOTO D'IDENTITÉ 4x4 ET COMPRESSION ---
        const canvas = document.createElement('canvas');
        const TARGET_SIZE = 500; // Taille standard 500x500px pour photo 4x4
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError("Erreur lors du traitement de l'image.");
          setUploadingImage(false);
          return;
        }

        // Calcul du recadrage centré (Crop Carré)
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (img.width > img.height) {
          sourceWidth = img.height;
          sourceX = (img.width - img.height) / 2;
        } else if (img.height > img.width) {
          sourceHeight = img.width;
          sourceY = (img.height - img.width) / 2;
        }

        // Dessiner l'image recadrée et redimensionnée sur le canvas
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, TARGET_SIZE, TARGET_SIZE
        );

        // Export de l'image compressée au format JPEG (qualité 0.8)
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setError("Échec de la compression de l'image.");
            setUploadingImage(false);
            return;
          }

          // Aperçu local immédiat
          const previewUrl = URL.createObjectURL(blob);
          setImagePreview(previewUrl);

          // --- ÉTAPE 2 : ENVOI DE L'IMAGE COMPRESSÉE VERS CLOUDINARY ---
          const cloudinaryData = new FormData();
          cloudinaryData.append('file', blob, 'photo_4x4.jpg');
          cloudinaryData.append('upload_preset', CLOUDINARY_PRESET);

          try {
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: 'POST', body: cloudinaryData }
            );

            const resData = await response.json();

            if (resData.secure_url) {
              setFormData(prev => ({ ...prev, photoUrl: resData.secure_url }));
            } else {
              throw new Error(resData.error?.message || "Erreur lors de l'envoi de la photo.");
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi de la photo vers Cloudinary.";
            setError(msg);
          } finally {
            setUploadingImage(false);
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verification contrainte parent (au moins un parent requis)
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

    // Vérification de la photo d'identité obligatoire
    if (!formData.photoUrl) {
      setError("La photo d'identité au format 4x4 est obligatoire.");
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

        {/* Section Upload Photo d'identité 4x4 Cloudinary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Photo d'identité (Format 4x4 / Carte) *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            La photo sera automatiquement recadrée au format officiel (carré 4x4) et optimisée pour le dossier.
          </p>

          <input 
            type="file" 
            accept="image/*" 
            required={!formData.photoUrl}
            onChange={handleImageUpload} 
            className="block w-full border border-gray-300 rounded-md p-2 text-sm bg-white file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer" 
          />

          {uploadingImage && (
            <p className="text-xs text-blue-600 font-semibold mt-2">
              ⏳ Traitement, compression et transfert vers Cloudinary en cours...
            </p>
          )}

          {imagePreview && (
            <div className="mt-3 flex items-center space-x-4">
              <img 
                src={imagePreview} 
                alt="Aperçu Photo 4x4" 
                className="w-24 h-24 object-cover rounded-md border-2 border-blue-900 shadow-sm" 
              />
              <div>
                <p className="text-xs text-green-700 font-bold">✓ Photo 4x4 validée & chargée</p>
                <p className="text-xs text-gray-500">Prête pour le dossier administratif</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Observations</label>
          <textarea name="observations" value={formData.observations} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={2}></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading || uploadingImage} 
          className="w-full bg-blue-900 text-white font-semibold py-3 rounded-md hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Envoi du dossier...' : 'Soumettre la fiche'}
        </button>
      </form>
    </div>
  );
}