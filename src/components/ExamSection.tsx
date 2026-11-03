import { useState } from 'react'
import type { ExamSubmission } from '../types/exam'
import { ExamList } from './ExamList'
import ExamForm from './ExamForm'
import { ExamCard } from './ExamCard'

interface Props {
  onUnauthorized?: () => void
}

export function ExamSection({ onUnauthorized }: Props) {
  const [view, setView] = useState<'list' | 'form' | 'card'>('list')
  const [selected, setSelected] = useState<ExamSubmission | null>(null)
  const [refreshKey, setRefreshKey] = useState(0) // force le rechargement de la liste

  if (view === 'form')
    return (
      <ExamForm
        onBack={() => setView('list')}
        onDone={() => { setRefreshKey((k) => k + 1); setView('list') }}
      />
    )

  if (view === 'card' && selected)
    return <ExamCard exam={selected} onBack={() => setView('list')} />

  return (
    <ExamList
      key={refreshKey}
      onUnauthorized={onUnauthorized}
      onNew={() => setView('form')}
      onSelect={(e) => { setSelected(e); setView('card') }}
    />
  )
}