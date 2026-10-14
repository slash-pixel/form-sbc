import React, { useState } from 'react';
import { Printer, Edit, ArrowLeft, PenTool } from 'lucide-react';
import type { Student } from '../types/student';

interface Props {
  student: Student & { photoUrl?: string };
  onEdit?: (id: string) => void;
  onBack?: () => void;
}

export const StudentCard: React.FC<Props> = ({ student, onEdit, onBack }) => {
  const [useHandwriting, setUseHandwriting] = useState<boolean>(true);

  // Formater la date au format JJ / MM / AAAA
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const currentPhoto = student.photoDataUrl || student.photoUrl;

  return (
    <div className="min-h-screen bg-[#FBF8F1] py-8 px-4 text-slate-900 font-sans print:p-0 print:bg-white">
      {/* Barre d'actions (Cachée à l'impression) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-slate-700 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au registre
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseHandwriting(!useHandwriting)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              useHandwriting
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <PenTool className="w-4 h-4 text-amber-700" />
            {useHandwriting ? 'Style : Manuscrit (Stylo)' : 'Style : Imprimé'}
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(student.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold text-sm rounded-lg shadow hover:opacity-95 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            Télécharger PDF / Imprimer
          </button>
        </div>
      </div>

      {/* Feuille A4 de la Fiche - Reproduction exacte */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[12mm] shadow-xl border border-slate-200 rounded-none relative print:shadow-none print:border-none print:p-[8mm] print:m-0 print:w-full overflow-hidden">
        
        {/* Filigrane d'arrière-plan discret (Blason) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-[150mm] h-[150mm] text-[#0B1F4B] fill-current">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M50 15 L50 85 M20 40 L80 40" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        {/* EN-TÊTE DU COLLÈGE */}
        <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-400 relative z-10">
          {/* Blason / Logo */}
          <div className="w-14 h-14 rounded-full border-2 border-[#0B1F4B] flex items-center justify-center p-1 bg-amber-50 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#0B1F4B] fill-current">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M50 15 L50 85 M20 40 L80 40" stroke="currentColor" strokeWidth="6" />
              <path d="M30 60 Q50 50 70 60 T30 80 Z" fill="none" stroke="#C9A227" strokeWidth="3" />
            </svg>
          </div>

          {/* Titre Institutionnel */}
          <div className="text-center flex-1 px-4">
            <h1 className="font-serif text-sm md:text-base font-bold tracking-tight text-[#0B1F4B] uppercase">
              Collège Catholique St Charles Borromée
            </h1>
            <p className="font-bold text-[11px] tracking-widest text-slate-800 uppercase mt-0.5">DOUALA</p>
            <p className="text-[9px] text-slate-600 mt-0.5 font-mono">
              ✉ 7204 / E-mail : borromeecol@yahoo.com ☎ (237) 699 01 82 08
            </p>
          </div>
        </div>

        {/* SECTION TITRE + PHOTO */}
        <div className="mt-5 flex items-start justify-between gap-6 relative z-10">
          {/* Cadre Titre */}
          <div className="flex-1 mt-1 border-2 border-[#0B1F4B] rounded-2xl p-3 text-center bg-amber-50/20 shadow-xs relative overflow-hidden">
            <div className="absolute inset-0 border border-[#C9A227] rounded-xl m-1 pointer-events-none" />
            <h2 className="font-serif text-sm md:text-base font-extrabold uppercase tracking-wide text-[#0B1F4B]">
              Fiche de Renseignement
              <br />
              de l'Élève
            </h2>
            <div className="mt-1 text-[10px] font-mono font-bold text-[#1E40AF]">
              Matricule : {student.matricule || 'STC-2026'}
            </div>
          </div>

          {/* Photo d'identité 3:4 */}
          <div className="w-[30mm] h-[38mm] border-2 border-slate-400 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm rounded-sm">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`Photo de ${student.nomEleve}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-400 text-center px-1 font-serif">Photo 3x4</span>
            )}
          </div>
        </div>

        {/* TABLEAU DES INFORMATIONS (21 Lignes exactes) */}
        <div className="mt-4 border-2 border-[#0B1F4B] rounded-sm overflow-hidden relative z-10">
          {/* Bandeau Titre du Tableau */}
          <div className="bg-[#0B1F4B] text-white text-center py-1 font-serif font-bold uppercase text-xs tracking-widest">
            Informations
          </div>

          {/* Grille des champs */}
          <div className="divide-y divide-slate-400 text-xs font-serif">
            
            <Row label="Classe" value={student.classe} handwriting={useHandwriting} />
            <Row label="Nom de l'élève" value={student.nomEleve?.toUpperCase()} handwriting={useHandwriting} />
            <Row label="Prénom(s)" value={student.prenoms} handwriting={useHandwriting} />
            
            {/* Sexe (M / F) */}
            <div className="flex divide-x divide-slate-400">
              <div className="w-[45%] p-1.5 font-bold text-slate-900 bg-slate-50/50 flex items-center">Sexe</div>
              <div className="w-[55%] p-1.5 flex items-center gap-8">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold">M</span>
                  <span className="inline-block w-4 h-4 border border-slate-700 text-center leading-3 text-xs font-sans font-bold bg-white">
                    {student.sexe === 'M' ? 'X' : ''}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-bold">F</span>
                  <span className="inline-block w-4 h-4 border border-slate-700 text-center leading-3 text-xs font-sans font-bold bg-white">
                    {student.sexe === 'F' ? 'X' : ''}
                  </span>
                </span>
              </div>
            </div>

            <Row label="Âge" value={student.age ? `${student.age} ans` : ''} handwriting={useHandwriting} />

            {/* Redoublant (e) */}
            <div className="flex divide-x divide-slate-400">
              <div className="w-[45%] p-1.5 font-bold text-slate-900 bg-slate-50/50 flex items-center">Redoublant (e)</div>
              <div className="w-[55%] p-1.5 flex items-center gap-6">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-[11px]">OUI</span>
                  <span className="inline-block w-4 h-4 border border-slate-700 text-center leading-3 text-xs font-sans font-bold bg-white">
                    {student.redoublant ? 'X' : ''}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-[11px]">NON</span>
                  <span className="inline-block w-4 h-4 border border-slate-700 text-center leading-3 text-xs font-sans font-bold bg-white">
                    {!student.redoublant ? 'X' : ''}
                  </span>
                </span>
              </div>
            </div>

            <Row label="Date de naissance" value={formatDate(student.dateNaissance)} handwriting={useHandwriting} />
            <Row label="Lieu de naissance" value={student.lieuNaissance} handwriting={useHandwriting} />
            <Row label="Nationalité" value={student.nationalite || 'Camerounaise'} handwriting={useHandwriting} />

            <Row label="Nom du père" value={student.nomPere} handwriting={useHandwriting} />
            <Row label="Profession du père" value={student.professionPere} handwriting={useHandwriting} />
            
            <Row label="Nom de la mère" value={student.nomMere} handwriting={useHandwriting} />
            <Row label="Profession de la mère" value={student.professionMere} handwriting={useHandwriting} />

            <Row label="Adresse (quartier)" value={student.adresseQuartier} handwriting={useHandwriting} />

            <Row label="Numéro de téléphone du père" value={student.telephonePere} handwriting={useHandwriting} />
            <Row label="Numéro de téléphone de la mère" value={student.telephoneMere} handwriting={useHandwriting} />

            <Row label="Nom du tuteur (le cas échéant)" value={student.nomTuteur} handwriting={useHandwriting} />
            <Row label="Contact du tuteur" value={student.contactTuteur} handwriting={useHandwriting} />

            <Row label="Personne à contacter en cas d'urgence" value={student.personneUrgence} handwriting={useHandwriting} minHeight="min-h-[26px]" />
            <Row label="Contact d'urgence / D.E.F" value={student.contactUrgence} handwriting={useHandwriting} />

            <Row label="Observations" value={student.observations} handwriting={useHandwriting} minHeight="min-h-[38px]" />
          </div>
        </div>

        {/* PIED DE PAGE ET SIGNATURES */}
        <div className="mt-6 flex justify-between items-end text-[10px] text-slate-600 font-serif relative z-10">
          <div>
            Fiche générée le {new Date().toLocaleDateString('fr-FR')}
            <br />
            Année Scolaire : <span className="font-bold">2026-2027</span>
          </div>

          <div className="text-center">
            <p className="font-bold text-slate-800 mb-8">Cachet de l'établissement / Signature du Parent</p>
            <div className="w-44 border-b border-slate-400 border-dashed mx-auto" />
          </div>
        </div>

      </div>
    </div>
  );
};

// Composant interne pour une ligne du tableau
interface RowProps {
  label: string;
  value?: string | null;
  handwriting?: boolean;
  minHeight?: string;
}

const Row: React.FC<RowProps> = ({ label, value, handwriting = true, minHeight = '' }) => {
  return (
    <div className={`flex divide-x divide-slate-400 ${minHeight}`}>
      <div className="w-[45%] p-1.5 font-bold text-slate-900 bg-slate-50/50 flex items-center">
        {label}
      </div>
      <div className="w-[55%] p-1.5 flex items-center text-slate-900">
        <span
          className={
            handwriting
              ? 'font-serif text-[#1F3A93] font-bold text-[13px] tracking-wide'
              : 'font-sans font-medium text-xs text-slate-800'
          }
        >
          {value || ''}
        </span>
      </div>
    </div>
  );
};