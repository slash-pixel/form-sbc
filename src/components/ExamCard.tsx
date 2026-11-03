import { useRef, useState } from 'react'
import { ArrowLeft, Printer, PenTool, Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import type { ExamSubmission } from '../types/exam'
import { formatDate } from '../utils/date'
import caveatUrl from '@fontsource/caveat/files/caveat-latin-600-normal.woff2?url'

let fontCssCache: string | null = null

async function getFontEmbedCss(): Promise<string> {
  if (fontCssCache) return fontCssCache
  const res = await fetch(caveatUrl)
  const blob = await res.blob()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  fontCssCache = `@font-face{font-family:'Caveat';font-style:normal;font-weight:600;src:url(${dataUrl}) format('woff2');}`
  return fontCssCache
}

const handwritingStyle = { fontFamily: "'Caveat', cursive", fontWeight: 600 } as const

interface LineProps {
    label: string
    value?: string | null
    handwriting: boolean
    className?: string
}

function Line({ label, value, handwriting, className = '' }: LineProps) {
    return (
        <div className={`flex items-end gap-2 ${className}`}>
            <span className="font-serif text-[13px] text-slate-700 shrink-0">{label} :</span>
            <span
                className={`flex-1 border-b border-dotted border-slate-500 min-h-6 px-1 leading-6 ${handwriting ? 'text-[#1F3A93] text-[22px]' : 'text-slate-900 text-sm font-medium'
                    }`}
                style={handwriting ? handwritingStyle : undefined}
            >
                {value || ''}
            </span>
        </div>
    )
}

function Box({ label, checked }: { label: string; checked: boolean }) {
    return (
        <span className="flex items-center gap-2 font-serif text-[13px] text-slate-700">
            {label}
            <span className="inline-flex w-5 h-5 border border-slate-700 items-center justify-center text-[#1F3A93] font-bold bg-white">
                {checked ? '✓' : ''}
            </span>
        </span>
    )
}

interface Props {
    exam: ExamSubmission
    onBack: () => void
}

export function ExamCard({ exam, onBack }: Props) {
    const [handwriting, setHandwriting] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const sheetRef = useRef<HTMLDivElement>(null)

    const downloadPdf = async () => {
        const el = sheetRef.current
        if (!el) return
        setDownloading(true)
        try {
            await document.fonts.load('600 22px Caveat')
      await document.fonts.ready
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fontEmbedCSS: await getFontEmbedCss(),
        style: { boxShadow: 'none', border: 'none' },
      })

            const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            const ratio = el.offsetHeight / el.offsetWidth

            let w = pageW
            let h = w * ratio
            if (h > pageH) {
                h = pageH
                w = h / ratio
            }
            pdf.addImage(dataUrl, 'PNG', (pageW - w) / 2, 0, w, h)
            pdf.save(`Fiche-examen-${exam.nomCandidat}-${exam.prenoms}.pdf`.replace(/\s+/g, '_'))
        } catch (err) {
            console.error(err)
            alert('Impossible de générer le PDF. Utilisez le bouton Imprimer.')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FBF8F1] py-8 px-4 print:p-0 print:bg-white">
            <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour à la liste
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setHandwriting(!handwriting)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer ${handwriting ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-300 text-slate-700'
                            }`}
                    >
                        <PenTool className="w-4 h-4 text-amber-700" />
                        {handwriting ? 'Style : Manuscrit' : 'Style : Imprimé'}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" /> Imprimer
                    </button>
                    <button
                        onClick={downloadPdf}
                        disabled={downloading}
                        className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold text-sm rounded-lg shadow hover:opacity-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        {downloading ? 'Génération...' : 'Télécharger PDF'}
                    </button>
                </div>
            </div>

            {/* Feuille (un seul bloc, avec la ref) */}
            <div
                ref={sheetRef}
                className="max-w-[160mm] min-h-[230mm] mx-auto bg-white p-[12mm] shadow-xl border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full"
            >
                {/* En-tête */}
                <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                        <div className="font-serif text-[15px] leading-snug font-bold text-[#0B1F4B] uppercase tracking-[0.12em] word-spacing-wide">
                            Collège Catholique St Charles Borromée
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2">✉ 179 / E-Mail : borromeecol@yahoo.com</p>
                        <p className="text-[10px] text-slate-600">☎ (00237) 699 018 208</p>
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="w-12 h-12 rounded-full border-2 border-[#0B1F4B] flex items-center justify-center ml-auto mb-1">
                            <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#0B1F4B] fill-current">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path d="M50 15 L50 85 M20 40 L80 40" stroke="currentColor" strokeWidth="6" />
                            </svg>
                        </div>
                        <p className="text-[10px] leading-tight text-slate-600 whitespace-nowrap">
                            Année scolaire : 2025 - 2026
                        </p>
                    </div>
                </div>

                {/* Titre */}
                <div className="text-center mt-5 mb-6">
                    <div className="font-sans text-[15px] leading-snug font-bold text-slate-900 uppercase tracking-wider">
                        Formulaire Examen OBC Session 2026
                    </div>
                    <p className="text-[10px] italic text-slate-600 underline underline-offset-2 mt-1">
                        (A remplir par chaque candidat)
                    </p>
                </div>

                {/* Champs */}
                <div className="space-y-3.5">
                    <div className="flex gap-4">
                        <Line label="Examen" value={exam.examen} handwriting={handwriting} className="flex-1" />
                        <Line label="Série" value={exam.serie} handwriting={handwriting} className="flex-1" />
                    </div>
                    <Line label="Matricule carte scolaire" value={exam.matriculeCarteScolaire} handwriting={handwriting} />
                    <Line label="N° Acte de naissance" value={exam.numeroActeNaissance} handwriting={handwriting} />
                    <Line label="Noms du candidat" value={exam.nomCandidat?.toUpperCase()} handwriting={handwriting} />
                    <Line label="Prénoms" value={exam.prenoms?.toUpperCase()} handwriting={handwriting} />
                    <div className="flex gap-4">
                        <Line label="Né(e) le" value={formatDate(exam.dateNaissance)} handwriting={handwriting} className="flex-1" />
                        <Line label="à" value={exam.lieuNaissance} handwriting={handwriting} className="flex-1" />
                    </div>

                    <div className="flex items-center gap-24 pt-1">
                        <Box label="Sexe : Masculin" checked={exam.sexe === 'M'} />
                        <Box label="Féminin" checked={exam.sexe === 'F'} />
                    </div>

                    <Line label="Contact du parent" value={exam.contactParent} handwriting={handwriting} />
                    <Line label="Nom du père" value={exam.nomPere} handwriting={handwriting} />
                    <Line label="Nom de la mère" value={exam.nomMere} handwriting={handwriting} />

                    <div className="flex items-center gap-24 pt-1">
                        <Box label="EPS : Apte" checked={exam.eps === 'APTE'} />
                        <Box label="Inapte" checked={exam.eps === 'INAPTE'} />
                    </div>

                    <Line label="Epreuve facultative sollicitée" value={exam.epreuveFacultative} handwriting={handwriting} />
                </div>

                {/* Pied */}
                <div className="mt-8 text-center">
                    <div className="flex justify-center items-end gap-2">
                        <span className="font-serif text-[13px] text-slate-700">Fait à {exam.faitA}, le</span>
                        <span
                            className={`border-b border-dotted border-slate-500 px-3 ${handwriting ? 'text-[#1F3A93] text-[22px]' : 'text-sm font-medium'
                                }`}
                            style={handwriting ? handwritingStyle : undefined}
                        >
                            {formatDate(exam.faitLe)}
                        </span>
                    </div>
                    <p className="font-serif text-[13px] italic underline underline-offset-2 mt-3 text-slate-700">
                        Signature du candidat
                    </p>
                    <div className="h-16" />
                </div>

                <div className="mt-6 flex items-end gap-2 text-[12px] font-serif text-slate-600">
                    Date de réception par le Préfet des Études :
                    <span className="flex-1 border-b border-dotted border-slate-500 min-h-4.5 text-center">
                        {formatDate(exam.dateReceptionPrefet)}
                    </span>
                </div>
            </div>
        </div>
    )
}