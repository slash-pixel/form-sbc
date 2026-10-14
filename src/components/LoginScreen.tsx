import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://formapi-l768.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        localStorage.setItem('admin_token', json.token);
        onLoginSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutTime(60);
          const interval = setInterval(() => {
            setLockoutTime((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setAttempts(0);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        setError(json.message || 'Mot de passe incorrect');
      }
    } catch {
      // Mode démo local si le serveur backend n'est pas joignable
      if (password === 'admin123' || password === 'SaintCharles2026') {
        localStorage.setItem('admin_token', 'demo_token');
        onLoginSuccess();
      } else {
        setError('Erreur de connexion avec l’API Render. Vérifiez votre réseau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBF8F1]">
      {/* Panneau gauche : Identité Bleu & Or */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#071533] via-[#0B1F4B] to-[#1E40AF] p-12 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-full border-2 border-[#C9A227] flex items-center justify-center bg-amber-50/10">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#C9A227] fill-current">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M50 15 L50 85 M20 40 L80 40" stroke="currentColor" strokeWidth="6" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-sm tracking-wider uppercase text-[#E6C65A]">Collège Catholique</h2>
            <p className="font-bold text-lg tracking-tight">St Charles Borromée</p>
          </div>
        </div>

        <div className="my-auto z-10 py-12">
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-4">
            Discipline, <span className="text-[#E6C65A]">Savoir</span> et Piété.
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-md">
            Portail officiel de gestion des dossiers et des fiches de renseignement des élèves - Douala, Cameroun.
          </p>
        </div>

        <div className="text-xs text-slate-400 z-10">
          © 2026 CSCC Borromée • Sécurisé par Hono & Prisma
        </div>
      </div>

      {/* Panneau droit : Formulaire */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#0B1F4B]">Espace Administration</h2>
            <p className="text-sm text-slate-500 mt-1">Veuillez vous authentifier pour accéder au registre.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2 animate-bounce">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Identifiant</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  defaultValue="administration@borromee.cm"
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Mot de passe administrateur</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={lockoutTime > 0}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#3B82F6]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-[#1E40AF] focus:ring-[#1E40AF]" />
                Se souvenir de moi
              </label>
              <button
                type="button"
                onClick={() => alert('Veuillez contacter l’administration du collège.')}
                className="text-[#1E40AF] hover:underline font-medium cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTime > 0}
              className="w-full py-3 bg-gradient-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold rounded-lg shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {lockoutTime > 0
                ? `Patientez ${lockoutTime}s...`
                : loading
                ? 'Connexion en cours...'
                : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};