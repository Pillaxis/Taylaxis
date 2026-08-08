import React, { useState } from 'react';
import { Scissors, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
  onContinueAsGuest?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Veuillez remplir l’adresse email et le mot de passe.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Fallback local guest auth if Supabase credentials are not connected
      onAuthSuccess({
        id: 'local_user',
        email,
        user_metadata: { workshop_name: workshopName || 'Mon Atelier' },
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Email ou mot de passe incorrect.');
          } else {
            setErrorMsg(error.message);
          }
        } else if (data.user) {
          onAuthSuccess(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              workshop_name: workshopName || 'Atelier Taylaxis',
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          if (data.session) {
            onAuthSuccess(data.user);
          } else {
            setSuccessMsg('Compte créé avec succès ! Si la confirmation par email est activée, vérifiez votre boîte de réception.');
            setTimeout(() => {
              setMode('login');
            }, 3000);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l’authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A27] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold shadow-xs">
            <Sparkles size={14} className="text-[#7C3AED]" />
            <span>Taylaxis SaaS Atelier V1</span>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/30">
              <Scissors size={26} className="rotate-45" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Taylaxis</h1>
          </div>

          <p className="text-sm text-white/70 font-medium">
            Pilotez votre atelier de couture, vos confections et vos paiements clients en toute sérénité.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="p-6 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-[16px]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-[12px] transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Se connecter
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-[12px] transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-[14px] bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium flex items-center space-x-2 animate-shake">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-[14px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/90 block">Nom de votre atelier / Tailleur</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Atelier Kossi Couture"
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/20 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7C3AED] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 block">Adresse Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="tailleur@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/20 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 block">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/20 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#3155C8] text-white font-bold text-sm hover:opacity-95 active:scale-98 transition-all shadow-lg shadow-[#7C3AED]/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Patientez...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Accéder à mon atelier' : 'Créer mon compte atelier'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Mode */}
          {onContinueAsGuest && (
            <div className="pt-2 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-white/60 hover:text-white underline cursor-pointer transition-colors"
              >
                Tester l'application en mode aperçu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
