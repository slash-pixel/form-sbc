import type { Submission } from '../types/student';

interface PrintableSheetProps {
  submission: Submission;
  onBack: () => void;
}

export default function PrintableSheet({ submission, onBack }: PrintableSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (!submission) return null;

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white p-8 shadow-2xl rounded-lg print:shadow-none print:m-0 print:p-2">
      <div className="flex justify-between items-center mb-6 pb-4 border-b print:hidden">
        <button onClick={onBack} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
          ← Retour à la liste
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2">
            🖨️ Imprimer
          </button>
          <button onClick={handleDownloadPDF} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 shadow flex items-center gap-2">
            📥 Télécharger en PDF
          </button>
        </div>
      </div>

      <div className="border-2 border-black p-4 text-sm font-sans bg-white">
        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
          <div className="text-center w-full">
            <h1 className="font-bold text-base uppercase tracking-wider">COLLÈGE CATHOLIQUE ST. CHARLES BORROMÉE</h1>
            <p className="text-xs">DOUALA</p>
            <p className="text-xs">✉7204 / E-mail : borromeecol@yahoo.com ☎ (237) 699 01 82 08</p>
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div className="border border-black px-6 py-2 font-bold uppercase text-center bg-gray-50">
            FICHE DE RENSEIGNEMENT DE L'ÉLÈVE
          </div>
          <div className="w-28 h-32 border border-black flex items-center justify-center bg-gray-100 overflow-hidden">
            {submission.photoUrl ? (
              <img src={submission.photoUrl} alt="Photo élève" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-center text-gray-500">PHOTO 4×4</span>
            )}
          </div>
        </div>

        <div className="text-center font-bold bg-gray-200 border border-black py-1 mb-0 uppercase tracking-widest text-xs">
          INFORMATIONS
        </div>

        <table className="w-full border-collapse border border-black text-left">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-semibold w-1/3">Classe</td>
              <td className="border border-black p-1.5">{submission.classe}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Nom de l'élève</td>
              <td className="border border-black p-1.5 uppercase">{submission.nomEleve}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Prénom(s)</td>
              <td className="border border-black p-1.5 capitalize">{submission.prenoms}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Sexe</td>
              <td className="border border-black p-1.5">
                M [{submission.sexe === 'M' ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; F [{submission.sexe === 'F' ? 'X' : ' '}]
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Âge</td>
              <td className="border border-black p-1.5">{submission.age} ans</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Redoublant(e)</td>
              <td className="border border-black p-1.5">
                OUI [{submission.redoublant ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; NON [{!submission.redoublant ? 'X' : ' '}]
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Date de naissance</td>
              <td className="border border-black p-1.5">{new Date(submission.dateNaissance).toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Lieu de naissance</td>
              <td className="border border-black p-1.5">{submission.lieuNaissance}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Nationalité</td>
              <td className="border border-black p-1.5">{submission.nationalite}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Nom du père</td>
              <td className="border border-black p-1.5">{submission.nomPere || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Profession du père</td>
              <td className="border border-black p-1.5">{submission.professionPere || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Nom de la mère</td>
              <td className="border border-black p-1.5">{submission.nomMere || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Profession de la mère</td>
              <td className="border border-black p-1.5">{submission.professionMere || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Adresse (quartier)</td>
              <td className="border border-black p-1.5">{submission.adresseQuartier}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Numéro de téléphone du père</td>
              <td className="border border-black p-1.5">{submission.telephonePere || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Numéro de téléphone de la mère</td>
              <td className="border border-black p-1.5">{submission.telephoneMere || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Nom du tuteur (le cas échéant)</td>
              <td className="border border-black p-1.5">{submission.nomTuteur}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Contact du tuteur</td>
              <td className="border border-black p-1.5">{submission.contactTuteur}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Personne à contacter en cas d'urgence</td>
              <td className="border border-black p-1.5">{submission.personneUrgence}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Contact d'urgence</td>
              <td className="border border-black p-1.5">{submission.contactUrgence}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Observations</td>
              <td className="border border-black p-1.5 italic">{submission.observations || 'Aucune observation'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}