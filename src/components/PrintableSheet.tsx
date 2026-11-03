import { useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { Submission } from '../types/student';

interface PrintableSheetProps {
  submission: Submission;
  onBack: () => void;
}

export default function PrintableSheet({ submission, onBack }: PrintableSheetProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      setIsGenerating(true);

      const imgData = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fontEmbedCSS: '', // évite la lecture des feuilles de style externes
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;

      const ratio = element.offsetHeight / element.offsetWidth;
      let w = maxW;
      let h = w * ratio;
      if (h > maxH) {
        h = maxH;
        w = h / ratio;
      }

      pdf.addImage(imgData, 'JPEG', (pageW - w) / 2, margin, w, h);

      const fileName = `Fiche_${submission.nomEleve}_${submission.prenoms}.pdf`.replace(/\s+/g, '_');
      pdf.save(fileName);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      alert("Une erreur est survenue lors de la génération du PDF. Utilisez le bouton Imprimer.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!submission) return null;

  const rows: [string, string][] = [
    ['Classe', submission.classe],
    ["Nom de l'élève", submission.nomEleve?.toUpperCase()],
    ['Prénom(s)', submission.prenoms],
    ['Âge', `${submission.age} ans`],
    ['Date de naissance', new Date(submission.dateNaissance).toLocaleDateString('fr-FR')],
    ['Lieu de naissance', submission.lieuNaissance],
    ['Nationalité', submission.nationalite],
    ['Nom du père', submission.nomPere || '-'],
    ['Profession du père', submission.professionPere || '-'],
    ['Nom de la mère', submission.nomMere || '-'],
    ['Profession de la mère', submission.professionMere || '-'],
    ['Adresse (quartier)', submission.adresseQuartier],
    ['Numéro de téléphone du père', submission.telephonePere || '-'],
    ['Numéro de téléphone de la mère', submission.telephoneMere || '-'],
    ['Nom du tuteur (le cas échéant)', submission.nomTuteur || '-'],
    ['Contact du tuteur', submission.contactTuteur || '-'],
    ["Personne à contacter en cas d'urgence", submission.personneUrgence],
    ["Contact d'urgence", submission.contactUrgence],
  ];

  const cellLabel = 'border border-black p-1.5 font-semibold w-1/3';
  const cellValue = 'border border-black p-1.5';

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white p-8 shadow-2xl rounded-lg print:shadow-none print:m-0 print:p-0">
      {/* Barre d'action (masquée à l'impression) */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b print:hidden">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition cursor-pointer"
        >
          ← Retour à la liste
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer font-medium"
          >
            🖨️ Imprimer la fiche
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 shadow flex items-center gap-2 cursor-pointer font-medium disabled:opacity-50"
          >
            {isGenerating ? 'Génération en cours...' : '📥 Télécharger le PDF'}
          </button>
        </div>
      </div>

      {/* Contenu exporté en PDF / imprimé */}
      <div ref={printRef} className="border-2 border-black p-4 text-sm font-sans bg-white">
        {/* En-tête du Collège */}
        <div className="border-b-2 border-black pb-2 mb-4 text-center">
          <div className="font-bold text-base leading-snug uppercase tracking-[0.12em]">
            Collège Catholique St Charles Borromée
          </div>
          <p className="text-xs mt-1">DOUALA</p>
          <p className="text-xs">✉ 7204 / E-mail : borromeecol@yahoo.com ☎ (237) 699 01 82 08</p>
        </div>

        {/* Titre et photo */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="border border-black px-6 py-2 font-bold uppercase text-center bg-gray-50 leading-snug">
            Fiche de renseignement de l'élève
          </div>
          <div className="w-28 h-32 shrink-0 border border-black flex items-center justify-center bg-gray-100 overflow-hidden">
            {submission.photoUrl && !photoFailed ? (
              <img
                src={submission.photoUrl}
                alt="Photo élève"
                crossOrigin="anonymous"
                onError={() => setPhotoFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-center text-gray-500">PHOTO 4×4</span>
            )}
          </div>
        </div>

        <div className="text-center font-bold bg-gray-200 border border-black py-1 uppercase tracking-widest text-xs">
          Informations
        </div>

        <table className="w-full border-collapse border border-black text-left">
          <tbody>
            {rows.slice(0, 3).map(([label, value]) => (
              <tr key={label}>
                <td className={cellLabel}>{label}</td>
                <td className={cellValue}>{value}</td>
              </tr>
            ))}

            <tr>
              <td className={cellLabel}>Sexe</td>
              <td className={cellValue}>
                M [{submission.sexe === 'M' ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; F [{submission.sexe === 'F' ? 'X' : ' '}]
              </td>
            </tr>

            <tr>
              <td className={cellLabel}>Âge</td>
              <td className={cellValue}>{submission.age} ans</td>
            </tr>

            <tr>
              <td className={cellLabel}>Redoublant(e)</td>
              <td className={cellValue}>
                OUI [{submission.redoublant ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; NON [{!submission.redoublant ? 'X' : ' '}]
              </td>
            </tr>

            {rows.slice(4).map(([label, value]) => (
              <tr key={label}>
                <td className={cellLabel}>{label}</td>
                <td className={cellValue}>{value}</td>
              </tr>
            ))}

            <tr>
              <td className={cellLabel}>Observations</td>
              <td className={`${cellValue} italic`}>{submission.observations || 'Aucune observation'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}