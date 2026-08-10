import React, { useState, useEffect } from 'react';
import { Scissors, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle, Download, Smartphone, Share, X } from 'lucide-react';
import { userService } from '../services/userService';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

interface RegisteredAccount {
  identifier: string;
  passwordHash: string;
  userName?: string;
  workshopName: string;
}

const STORAGE_KEY_REGISTRY = 'taylaxis_registered_accounts_v1';

const getRegisteredAccounts = (): RegisteredAccount[] => {
  const raw = localStorage.getItem(STORAGE_KEY_REGISTRY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveRegisteredAccount = (account: RegisteredAccount) => {
  const list = getRegisteredAccounts();
  const filtered = list.filter((a) => a.identifier.toLowerCase() !== account.identifier.toLowerCase());
  filtered.push(account);
  localStorage.setItem(STORAGE_KEY_REGISTRY, JSON.stringify(filtered));
};

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workshopName, setWorkshopName] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mobile PWA App installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [showAlreadyInstalledModal, setShowAlreadyInstalledModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState<boolean>(() => {
    return localStorage.getItem('taylaxis_app_installed_v1') === 'true';
  });

  useEffect(() => {
    // 1. Check if running inside installed standalone PWA app
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);

    // 2. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsAlreadyInstalled(true);
      localStorage.setItem('taylaxis_app_installed_v1', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (isAlreadyInstalled) {
      setShowAlreadyInstalledModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsAlreadyInstalled(true);
        localStorage.setItem('taylaxis_app_installed_v1', 'true');
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const credentialIdentifier = authMethod === 'email' ? email.trim() : phone.trim();

    if (!credentialIdentifier) {
      setErrorMsg(`Veuillez renseigner votre ${authMethod === 'email' ? 'adresse email' : 'numéro de téléphone'}.`);
      return;
    }

    if (!password) {
      setErrorMsg('Veuillez renseigner votre mot de passe.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('La confirmation du mot de passe ne correspond pas.');
        return;
      }

      // Check if account already exists locally
      const existingAccounts = getRegisteredAccounts();
      const alreadyRegistered = existingAccounts.some(
        (a) => a.identifier.toLowerCase() === credentialIdentifier.toLowerCase()
      );

      if (alreadyRegistered) {
        setErrorMsg('Un compte existe déjà avec ce numéro ou cet email. Allez sur "Se connecter".');
        return;
      }

      // Save to local accounts registry
      saveRegisteredAccount({
        identifier: credentialIdentifier,
        passwordHash: password,
        userName: userName.trim(),
        workshopName: workshopName || 'Mon Atelier',
      });
    }

    if (mode === 'login') {
      const existingAccounts = getRegisteredAccounts();
      const matchedAccount = existingAccounts.find(
        (a) => a.identifier.toLowerCase() === credentialIdentifier.toLowerCase()
      );

      if (matchedAccount) {
        if (matchedAccount.passwordHash === password) {
          // Save profile details to local userService state
          const displayFirstName = matchedAccount.userName ? matchedAccount.userName.split(' ')[0] : 'Tailleur';
          userService.saveUserProfile({
            ...userService.getUserProfile(),
            firstName: displayFirstName,
            fullName: matchedAccount.userName || (matchedAccount.workshopName ? `Atelier ${matchedAccount.workshopName}` : 'Tailleur Taylaxis'),
            phone: authMethod === 'phone' ? credentialIdentifier : '',
            email: authMethod === 'email' ? credentialIdentifier : '',
          });

          userService.saveWorkshopProfile({
            ...userService.getWorkshopProfile(),
            name: matchedAccount.workshopName || 'Mon Atelier de Couture',
          });

          onAuthSuccess({
            id: `usr_${Date.now()}`,
            email: authMethod === 'email' ? credentialIdentifier : undefined,
            phone: authMethod === 'phone' ? credentialIdentifier : undefined,
            user_metadata: { workshop_name: matchedAccount.workshopName || 'Mon Atelier', user_name: matchedAccount.userName },
          });
          return;
        } else {
          setErrorMsg('Mot de passe incorrect. Veuillez vérifier votre mot de passe.');
          return;
        }
      } else {
        setErrorMsg('Ce numéro de téléphone ou email n’est pas encore enregistré. Cliquez sur "Créer un compte" pour démarrer.');
        return;
      }
    }

    // Registration mode
    const displayFirstName = userName.trim() ? userName.trim().split(' ')[0] : 'Tailleur';
    userService.saveUserProfile({
      ...userService.getUserProfile(),
      firstName: displayFirstName,
      fullName: userName.trim() || 'Tailleur Taylaxis',
      phone: authMethod === 'phone' ? credentialIdentifier : '',
      email: authMethod === 'email' ? credentialIdentifier : '',
    });

    userService.saveWorkshopProfile({
      ...userService.getWorkshopProfile(),
      name: workshopName || 'Mon Atelier de Couture',
      phone: authMethod === 'phone' ? credentialIdentifier : '',
    });

    onAuthSuccess({
      id: `usr_${Date.now()}`,
      email: authMethod === 'email' ? credentialIdentifier : undefined,
      phone: authMethod === 'phone' ? credentialIdentifier : undefined,
      user_metadata: { workshop_name: workshopName || 'Mon Atelier', user_name: userName.trim() },
    });
  };

  return (
    <div className="min-h-screen bg-[#0C0A27] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] flex items-center justify-center text-white shadow-xl shadow-[#7C3AED]/40 border border-white/20">
            <Scissors size={30} className="rotate-45" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight pt-1">Taylaxis</h1>

          <p className="text-sm text-white/70 font-medium max-w-xs">
            Gestion professionnelle de vos confections, clients et finances d'atelier.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="p-6 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-5">
          {/* Mode Switcher Tabs (Se connecter / Créer un compte) */}
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

          {/* Identifier Toggle (Téléphone en 1er, Email en option) */}
          <div className="flex items-center justify-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center space-x-1.5 cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-[#7C3AED] text-white shadow-xs border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Phone size={13} />
              <span>Numéro de téléphone</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center space-x-1.5 cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mail size={13} />
              <span>Email</span>
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
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/90 block">Votre Prénom & Nom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Nasser"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/20 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7C3AED] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/90 block">Nom de votre atelier</label>
                  <div className="relative">
                    <Scissors size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
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
              </>
            )}

            {authMethod === 'email' ? (
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
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/90 block">Numéro de Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    required
                    placeholder="+228 90 12 34 56"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/20 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7C3AED] transition-all"
                  />
                </div>
              </div>
            )}

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

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/90 block">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/20 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7C3AED] transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#3155C8] text-white font-bold text-sm hover:opacity-95 active:scale-98 transition-all shadow-lg shadow-[#7C3AED]/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{mode === 'login' ? 'Accéder à mon atelier' : 'Créer mon compte atelier'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Button to Download Mobile App - Hidden when running inside installed standalone app */}
        {!isStandalone && (
          <div className="pt-1 text-center space-y-2">
            <button
              type="button"
              onClick={handleInstallApp}
              className="w-full py-3 px-4 rounded-[18px] bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center justify-center space-x-2.5 cursor-pointer transition-all active:scale-98 shadow-md"
            >
              <Download size={16} className="text-[#7C3AED]" />
              <span>
                {isAlreadyInstalled
                  ? "Application Taylaxis déjà installée (Ouvrir)"
                  : "Télécharger l'application Taylaxis sur Mobile"}
              </span>
              <Smartphone size={16} className="text-white/80" />
            </button>
          </div>
        )}
      </div>

      {/* PWA Mobile Installation Guide Modal */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#120F38] border border-white/20 rounded-[28px] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInstallGuideModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-[16px] bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED]">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Installer Taylaxis sur Mobile</h3>
                <p className="text-xs text-white/70">Utilisez l'application en plein écran comme sur les stores</p>
              </div>
            </div>

            {isIOS ? (
              <div className="p-4 rounded-[18px] bg-white/5 border border-white/10 space-y-3 text-xs">
                <p className="font-bold text-[#7C3AED] flex items-center space-x-1.5">
                  <Share size={15} />
                  <span>Sur iPhone / iPad (Safari) :</span>
                </p>
                <ol className="list-decimal pl-4 space-y-2 text-white/90 leading-relaxed font-medium">
                  <li>Appuyez sur le bouton <strong>Partager</strong> en bas de votre navigateur Safari.</li>
                  <li>Faites défiler le menu puis appuyez sur <strong>"Sur l'écran d'accueil"</strong>.</li>
                  <li>Validez en appuyant sur <strong>Ajouter</strong> en haut à droite.</li>
                </ol>
              </div>
            ) : (
              <div className="p-4 rounded-[18px] bg-white/5 border border-white/10 space-y-3 text-xs">
                <p className="font-bold text-[#7C3AED] flex items-center space-x-1.5">
                  <Download size={15} />
                  <span>Sur Android / Chrome :</span>
                </p>
                <ol className="list-decimal pl-4 space-y-2 text-white/90 leading-relaxed font-medium">
                  <li>Appuyez sur le menu <strong>Options (⋮)</strong> en haut à droite de Chrome.</li>
                  <li>Sélectionnez <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>.</li>
                  <li>Confirmez l'installation pour avoir l'icône Taylaxis sur votre téléphone.</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-2.5 rounded-[14px] bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] cursor-pointer transition-colors"
            >
              Compris, j'installe maintenant
            </button>
          </div>
        </div>
      )}

      {/* Modal: Application Déjà Installée */}
      {showAlreadyInstalledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#120F38] border border-emerald-500/30 rounded-[28px] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowAlreadyInstalledModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Application déjà installée !</h3>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                L'application Taylaxis est déjà installée sur votre téléphone. Vous pouvez l'ouvrir directement depuis l'icône sur votre écran d'accueil.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowAlreadyInstalledModal(false);
                  window.location.href = '/';
                }}
                className="w-full py-3 rounded-[16px] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:opacity-95 cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <Smartphone size={16} />
                <span>Ouvrir l'application Taylaxis</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAlreadyInstalledModal(false)}
                className="w-full py-2 text-xs text-white/60 hover:text-white cursor-pointer"
              >
                Rester dans le navigateur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
