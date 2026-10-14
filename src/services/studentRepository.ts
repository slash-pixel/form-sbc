import type { Student } from '../types/student';

const API_BASE = 'https://formapi-l768.onrender.com/api';

export const StudentRepository = {
  async getAll(): Promise<Student[]> {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/admin/submissions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Erreur de récupération');
      const json = await res.json();
      return (json.data || []).map((item: Record<string, unknown>) => ({
        ...item,
        matricule: (item.matricule as string) || `STC-${Math.floor(1000 + Math.random() * 9000)}`,
        anneeScolaire: '2026-2027'
      }));
    } catch {
      console.warn('Mode hors-ligne / API injoignable, registre vide initialisé.');
      return [];
    }
  },

  async create(data: Omit<Student, 'id' | 'matricule'>): Promise<Student> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors de l’enregistrement');
    }
    const json = await res.json();
    return json.data;
  },

  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Impossible de supprimer la fiche');
  }
};