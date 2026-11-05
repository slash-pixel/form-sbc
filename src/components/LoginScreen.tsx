import React, { useEffect, useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  FileText,
  ClipboardList,
  ArrowBigUp,
  Loader2,
} from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0); // relance l'animation d'erreur
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slowServer, setSlowServer] = useState(false);

  // Compte à rebours du verrouillage (nettoyé automatiquement)
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const id = setTimeout(() => {
      setLockoutTime(lockoutTime - 1);
      if (lockoutTime - 1 === 0) setAttempts(0);
    }, 1000);
    return () => clearTimeout(id);
  }, [lockoutTime]);

  // Serveur Render en veille : on prévient l'utilisateur au bout de 6 s
  useEffect(() => {
    if (!loading) {
      setSlowServer(false);
      return;
    }
    const id = setTimeout(() => setSlowServer(true), 6000);
    return () => clearTimeout(id);
  }, [loading]);

  const showError = (message: string) => {
    setError(message);
    setErrorKey((k) => k + 1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://formapi-l768.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        localStorage.setItem('admin_token', json.token);
        onLoginSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) setLockoutTime(LOCKOUT_SECONDS);
        showError(json.message || 'Mot de passe incorrect');
      }
    } catch {
      // Mode démo local si le serveur backend n'est pas joignable
      if (password === 'admin123' || password === 'SaintCharles2026') {
        localStorage.setItem('admin_token', 'demo_token');
        onLoginSuccess();
      } else {
        showError('Erreur de connexion avec l’API Render. Vérifiez votre réseau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  const remaining = MAX_ATTEMPTS - attempts;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBF8F1]">
      <style>{`
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes login-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(201, 162, 39, 0.45); }
          100% { box-shadow: 0 0 0 14px rgba(201, 162, 39, 0); }
        }
      `}</style>

      {/* Panneau gauche : Identité Bleu & Or */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#071533] via-[#0B1F4B] to-[#1E40AF] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#C9A227]/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div
            className="w-14 h-14 rounded-full border-2 border-[#C9A227] flex items-center justify-center bg-amber-50/10"
            style={{ animation: 'login-pulse-ring 2.4s ease-out infinite' }}
          >
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

        <div className="my-auto z-10 py-10 md:py-12">
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-4">
            Discipline, <span className="text-[#E6C65A]">Savoir</span> et Piété.
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-md">
            Portail officiel de gestion des dossiers et des fiches de renseignement des élèves - Douala, Cameroun.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { icon: ClipboardList, label: 'Fiches élèves' },
              { icon: FileText, label: 'Export PDF' },
              { icon: ShieldCheck, label: 'Accès sécurisé' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#E6C65A] backdrop-blur-sm"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 z-10">
          © 2026 CSCC Borromée • Sécurisé par Hono & Prisma
        </div>
      </div>

      {/* Panneau droit : Formulaire */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-8">
        <div
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 border-t-4 border-t-[#C9A227]"
          style={{ animation: 'login-rise 0.5s ease-out both' }}
        >
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#0B1F4B]">Espace Administration</h2>
            <p className="text-sm text-slate-500 mt-1">Veuillez vous authentifier pour accéder au registre.</p>
          </div>

          {error && (
            <div
              key={errorKey}
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2"
              style={{ animation: 'login-shake 0.4s ease-in-out' }}
            >
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
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Mot de passe administrateur
              </label>
              <div className="group relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 transition-colors group-focus-within:text-[#C9A227]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKey}
                  onKeyDown={handleKey}
                  onBlur={() => setCapsLock(false)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  autoFocus
                  required
                  disabled={lockoutTime > 0}
                  className="w-full pl-10 pr-28 py-2.5 bg-white border border-slate-300 rounded-lg text-sm tracking-wide focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25 transition-all disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className={`absolute inset-y-1.5 right-1.5 flex items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    showPassword
                      ? 'bg-[#0B1F4B] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-[#C9A227]/20 hover:text-[#0B1F4B]'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              {/* Aides à la saisie */}
              <div className="mt-1.5 flex items-start justify-between gap-3 min-h-[1.25rem]">
                {capsLock ? (
                  <p className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                    <ArrowBigUp className="w-3.5 h-3.5" />
                    Verr. Maj activé
                  </p>
                ) : (
                  <span />
                )}
                {password.length > 0 && (
                  <p className="text-xs text-slate-500 tabular-nums">
                    {password.length} caractère{password.length > 1 ? 's' : ''}
                  </p>
                )}
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

            {/* Tentatives restantes */}
            {attempts > 0 && lockoutTime === 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-colors ${i < attempts ? 'bg-red-400' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {remaining} tentative{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Verrouillage */}
            {lockoutTime > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">
                  Trop de tentatives. Réessayez dans {lockoutTime} s.
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-red-100">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(lockoutTime / LOCKOUT_SECONDS) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || lockoutTime > 0}
              className="w-full py-3 bg-gradient-to-r from-[#8A6D1D] via-[#C9A227] to-[#E6C65A] text-[#071533] font-bold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {lockoutTime > 0
                ? `Patientez ${lockoutTime}s...`
                : loading
                ? 'Connexion en cours...'
                : 'Se connecter'}
            </button>

            {slowServer && (
              <p className="text-center text-xs text-slate-500">
                Le serveur se réveille, cela peut prendre une trentaine de secondes.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};