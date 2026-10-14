import React, { useState } from 'react';
import type { Student } from '../types/student';
import { User, Users, Phone, FileText, ChevronLeft, CheckCircle2, XCircle, Camera } from 'lucide-react';

interface Props {
  studentToEdit?: (Student & { photoUrl?: string }) | null;
  onSave: () => void;
  onCancel: () => void;
}

export const StudentForm: React.FC<Props> = ({ studentToEdit, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  // Calcul initial de l'âge
  const calculateAgeFromDate = (dateString: string): number => {
    if (!dateString) return 12;
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return 12;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 12;
  };

  // État du formulaire
  const [formData, setFormData] = useState({
    anneeScolaire: studentToEdit?.anneeScolaire || '2026-2027',
    classe: studentToEdit?.classe || '6ème A',
    nomEleve: studentToEdit?.nomEleve || '',
    prenoms: studentToEdit?.prenoms || '',
    sexe: studentToEdit?.sexe || 'M',
    dateNaissance: studentToEdit?.dateNaissance || '',
    age: studentToEdit?.age || calculateAgeFromDate(studentToEdit?.dateNaissance || ''),
    lieuNaissance: studentToEdit?.lieuNaissance || 'Douala',
    nationalite: studentToEdit?.nationalite || 'Camerounaise',
    redoublant: studentToEdit?.redoublant || false,
    
    nomPere: studentToEdit?.nomPere || '',
    professionPere: studentToEdit?.professionPere || '',
    telephonePere: studentToEdit?.telephonePere || '',
    
    nomMere: studentToEdit?.nomMere || '',
    professionMere: studentToEdit?.professionMere || '',
    telephoneMere: studentToEdit?.telephoneMere || '',
    
    adresseQuartier: studentToEdit?.adresseQuartier || '',
    nomTuteur: studentToEdit?.nomTuteur || '',
    contactTuteur: studentToEdit?.contactTuteur || '',
    
    personneUrgence: studentToEdit?.personneUrgence || '',
    contactUrgence: studentToEdit?.contactUrgence || '',
    observations: studentToEdit?.observations || '',
    photoUrl: studentToEdit?.photoUrl || studentToEdit?.photoDataUrl || ''
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'nomEleve' && typeof value === 'string' ? value.toUpperCase() : value
    }));
    if (errorField === field) {
      setErrorField(null);
      setError('');
    }
  };

  const handleDateChange = (dateString: string) => {
    const age = calculateAgeFromDate(dateString);
    setFormData(prev => ({
      ...prev,
      dateNaissance: dateString,
      age
    }));
    if (errorField === 'dateNaissance') {
      setErrorField(null);
      setError('');
    }
  };

  // Gestion et contrôle strict du format photo 4x4 (carré) + Upload Cloudinary
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      // Vérification des dimensions 4x4 (Largeur égale à la hauteur)
      if (img.width !== img.height) {
        setImageError(`Format invalide (${img.width}x${img.height}px). La photo doit impérativement être au format carré 4x4.`);
        return;
      }

      setUploadingImage(true);
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'm_default'); // Corrigé ici : ml_default

      try {
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dkpckq62b/image/upload',
          { method: 'POST', body: data }
        );
        const resData = await response.json();
        if (resData.secure_url) {
          handleChange('photoUrl', resData.secure_url);
        } else {
          setImageError(resData.error?.message || "Échec de l'envoi vers Cloudinary.");
        }
      } catch (err) {
        console.error(err);
        setImageError("Erreur réseau lors de l'envoi de la photo.");
      } finally {
        setUploadingImage(false);
      }
    };
  };

  // Validation locale stricte
  const validateForm = (): boolean => {
    setError('');
    setErrorField(null);

    if (!formData.nomEleve.trim()) {
      setError("Le champ 'Nom de l'élève' est mal rempli ou vide.");
      setErrorField('nomEleve');
      setStep(1);
      return false;
    }
    if (!formData.prenoms.trim()) {
      setError("Le champ 'Prénom(s)' est mal rempli ou vide.");
      setErrorField('prenoms');
      setStep(1);
      return false;
    }
    if (!formData.dateNaissance.trim()) {
      setError("La 'Date de naissance' est obligatoire.");
      setErrorField('dateNaissance');
      setStep(1);
      return false;
    }
    if (!formData.lieuNaissance.trim()) {
      setError("Le 'Lieu de naissance' est obligatoire.");
      setErrorField('lieuNaissance');
      setStep(1);
      return false;
    }
    if (!formData.photoUrl.trim()) {
      setError("La photo d'identité au format 4x4 est obligatoire.");
      setStep(1);
      return false;
    }
    if (!formData.adresseQuartier.trim()) {
      setError("L' 'Adresse / Quartier de résidence' est obligatoire.");
      setErrorField('adresseQuartier');
      setStep(2);
      return false;
    }
    if (!formData.nomPere.trim() && !formData.nomMere.trim()) {
      setError("Vous devez renseigner au moins le nom du Père ou de la Mère.");
      setErrorField('nomPere');
      setStep(2);
      return false;
    }
    if (!formData.personneUrgence.trim()) {
      setError("Le champ 'Personne à contacter en urgence' est obligatoire.");
      setErrorField('personneUrgence');
      setStep(3);
      return false;
    }
    if (!formData.contactUrgence.trim()) {
      setError("Le 'Contact d'urgence' est obligatoire.");
      setErrorField('contactUrgence');
      setStep(3);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSuccessMessage(true);
    setTimeout(() => {
      onSave();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1] py-8 px-4 text-slate-900">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* En-tête du Formulaire */}
        <div className="bg-gradient-to-r from-[#071533] via-[#0B1F4B] to-[#1E40AF] text-white p-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-[#E6C65A]">
              {studentToEdit ? 'Modifier la fiche de l’élève' : 'Nouvelle Fiche de Renseignement'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">Collège Catholique St Charles Borromée • Validation Locale</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Retour
          </button>
        </div>

        {/* Stepper / Étapes */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-center text-xs font-serif font-bold">
          <div className={`p-3 border-r border-slate-200 ${step === 1 ? 'text-[#1E40AF] bg-white border-b-2 border-b-[#1E40AF]' : 'text-slate-400'}`}>
            1. Identité & Photo
          </div>
          <div className={`p-3 border-r border-slate-200 ${step === 2 ? 'text-[#1E40AF] bg-white border-b-2 border-b-[#1E40AF]' : 'text-slate-400'}`}>
            2. Famille
          </div>
          <div className={`p-3 border-r border-slate-200 ${step === 3 ? 'text-[#1E40AF] bg-white border-b-2 border-b-[#1E40AF]' : 'text-slate-400'}`}>
            3. Contacts & Urgence
          </div>
          <div className={`p-3 ${step === 4 ? 'text-[#1E40AF] bg-white border-b-2 border-b-[#1E40AF]' : 'text-slate-400'}`}>
            4. Récapitulatif
          </div>
        </div>

        {/* Message d'erreur de non-validation */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center gap-3">
            <XCircle className="w-6 h-6 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">Formulaire non validé :</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Message de validation globale */}
        {successMessage && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900">Formulaire validé avec succès !</p>
              <p>Tous les champs obligatoires et la photo 4x4 sont conformes.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* ÉTAPE 1 : IDENTITÉ & PHOTO */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#0B1F4B] border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9A227]" /> État civil et Photo d'identité (4x4)
              </h3>

              {/* Bloc Upload Photo 4x4 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Aperçu 4x4" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Photo d'identité 4x4 (Carrée) *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-1">Format requis : 4x4 strict (largeur égale à la hauteur).</p>
                  {uploadingImage && <p className="text-xs text-[#1E40AF] font-medium mt-1">Envoi vers Cloudinary en cours...</p>}
                  {imageError && <p className="text-xs text-red-600 font-bold mt-1">⚠️ {imageError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Classe *</label>
                  <select
                    value={formData.classe}
                    onChange={(e) => handleChange('classe', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF] cursor-pointer"
                  >
                    {['6ème A', '6ème B', '5ème A', '4ème B', '3ème C', '2nde C', '1ère D', 'Tle C'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Sexe *</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexe"
                        checked={formData.sexe === 'M'}
                        onChange={() => handleChange('sexe', 'M')}
                        className="text-[#1E40AF]"
                      />
                      <span className="text-sm font-bold">Masculin (M)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexe"
                        checked={formData.sexe === 'F'}
                        onChange={() => handleChange('sexe', 'F')}
                        className="text-[#1E40AF]"
                      />
                      <span className="text-sm font-bold">Féminin (F)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nom de l'élève * (MAJUSCULES)</label>
                  <input
                    type="text"
                    value={formData.nomEleve}
                    onChange={(e) => handleChange('nomEleve', e.target.value)}
                    placeholder="Ex: NJIKE"
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm uppercase focus:outline-none ${
                      errorField === 'nomEleve' ? 'border-red-500 bg-red-50/35 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Prénom(s) *</label>
                  <input
                    type="text"
                    value={formData.prenoms}
                    onChange={(e) => handleChange('prenoms', e.target.value)}
                    placeholder="Ex: Franck Junior"
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none ${
                      errorField === 'prenoms' ? 'border-red-500 bg-red-50/35 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    value={formData.dateNaissance}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none ${
                      errorField === 'dateNaissance' ? 'border-red-500 bg-red-50/35 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Âge calculé (ans)</label>
                  <input
                    type="number"
                    disabled
                    value={formData.age}
                    className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Lieu de naissance *</label>
                  <input
                    type="text"
                    value={formData.lieuNaissance}
                    onChange={(e) => handleChange('lieuNaissance', e.target.value)}
                    placeholder="Ex: Douala"
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none ${
                      errorField === 'lieuNaissance' ? 'border-red-500 bg-red-50/35 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nationalité</label>
                  <input
                    type="text"
                    value={formData.nationalite}
                    onChange={(e) => handleChange('nationalite', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : FAMILLE */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#0B1F4B] border-b pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9A227]" /> Informations Parentales et Résidence
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nom du père (ou Mère requis)</label>
                  <input
                    type="text"
                    value={formData.nomPere}
                    onChange={(e) => handleChange('nomPere', e.target.value)}
                    placeholder="Ex: NJIKE Oscar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm uppercase focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Profession du père</label>
                  <input
                    type="text"
                    value={formData.professionPere}
                    onChange={(e) => handleChange('professionPere', e.target.value)}
                    placeholder="Ex: Électricien"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nom de la mère</label>
                  <input
                    type="text"
                    value={formData.nomMere}
                    onChange={(e) => handleChange('nomMere', e.target.value)}
                    placeholder="Ex: KAMBOU Robertine"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm uppercase focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Profession de la mère</label>
                  <input
                    type="text"
                    value={formData.professionMere}
                    onChange={(e) => handleChange('professionMere', e.target.value)}
                    placeholder="Ex: Couturière"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Adresse / Quartier de résidence * (Douala)</label>
                  <input
                    type="text"
                    value={formData.adresseQuartier}
                    onChange={(e) => handleChange('adresseQuartier', e.target.value)}
                    placeholder="Ex: Bepanda Omnisport"
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none ${
                      errorField === 'adresseQuartier' ? 'border-red-500 bg-red-50/35 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : CONTACTS & URGENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#0B1F4B] border-b pb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A227]" /> Contacts téléphoniques et Urgences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Téléphone du père</label>
                  <input
                    type="tel"
                    value={formData.telephonePere}
                    onChange={(e) => handleChange('telephonePere', e.target.value)}
                    placeholder="Ex: 674743509"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Téléphone de la mère</label>
                  <input
                    type="tel"
                    value={formData.telephoneMere}
                    onChange={(e) => handleChange('telephoneMere', e.target.value)}
                    placeholder="Ex: 699123456"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Personne à contacter en urgence *</label>
                  <input
                    type="text"
                    value={formData.personneUrgence}
                    onChange={(e) => handleChange('personneUrgence', e.target.value)}
                    placeholder="Ex: NJIKE Oscar"
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none ${
                      errorField === 'personneUrgence' ? 'border-red-500 bg-red-50/35 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact d'urgence *</label>
                  <input
                    type="text"
                    value={formData.contactUrgence}
                    onChange={(e) => handleChange('contactUrgence', e.target.value)}
                    placeholder="Ex: 674743509"
                    className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none ${
                      errorField === 'contactUrgence' ? 'border-red-500 bg-red-50/30 ring-2 ring-red-200' : 'border-slate-300 focus:border-[#1E40AF]'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Observations / Remarques</label>
                  <textarea
                    rows={3}
                    value={formData.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    placeholder="Informations médicales ou particulières..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-[#1E40AF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : RÉCAPITULATIF */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#0B1F4B] border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C9A227]" /> Récapitulatif avant validation finale
              </h3>
              
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-sm space-y-2">
                <div className="flex items-center gap-3 pb-2 border-b border-amber-200">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Photo 4x4" className="w-12 h-12 rounded object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">Vide</div>
                  )}
                  <div>
                    <p className="font-bold">{formData.nomEleve || '—'} {formData.prenoms || '—'}</p>
                    <p className="text-xs text-slate-600">
                      {formData.photoUrl ? "Photo 4x4 validée et prête" : "⚠️ Aucune photo 4x4 chargée"}
                    </p>
                  </div>
                </div>
                <p><strong>Classe :</strong> {formData.classe} ({formData.sexe}, {formData.age} ans)</p>
                <p><strong>Naissance :</strong> {formData.dateNaissance || '—'} à {formData.lieuNaissance}</p>
                <p><strong>Quartier :</strong> {formData.adresseQuartier || '—'}</p>
                <p><strong>Père :</strong> {formData.nomPere || 'Non renseigné'} ({formData.telephonePere || '—'})</p>
                <p><strong>Mère :</strong> {formData.nomMere || 'Non renseigné'} ({formData.telephoneMere || '—'})</p>
                <p><strong>Contact d'urgence :</strong> {formData.personneUrgence || '—'} ({formData.contactUrgence || '—'})</p>
              </div>
            </div>
          )}

          {/* Boutons de navigation bas de formulaire */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F4B] text-white rounded-lg text-sm font-medium hover:bg-[#1E40AF] cursor-pointer"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold rounded-lg shadow-md hover:opacity-95 cursor-pointer"
              >
                Valider le Formulaire
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};