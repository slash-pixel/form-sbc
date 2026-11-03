import type { ExamSubmission } from '../types/exam'

const API_URL = import.meta.env.VITE_API_URL || 'https://formapi-l768.onrender.com/api'

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
})

export class UnauthorizedError extends Error {}

export const ExamRepository = {
  async getAll(): Promise<ExamSubmission[]> {
    const res = await fetch(`${API_URL}/admin/exams`, { headers: headers() })
    if (res.status === 401 || res.status === 403) throw new UnauthorizedError()
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Erreur de chargement')
    return json.data
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/admin/exams/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })
    if (res.status === 401 || res.status === 403) throw new UnauthorizedError()
    if (!res.ok) throw new Error('Erreur de suppression')
  },
}