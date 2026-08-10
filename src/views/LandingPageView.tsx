import React, { useState, useEffect } from 'react';
import {
  Scissors,
  UserPlus,
  Ruler,
  Calendar,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Award,
  Lock,
  Banknote,
  Download,
  Smartphone,
  Share,
  X,
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onGetStarted, onLogin }) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'clients' | 'commandes' | 'agenda' | 'relances'>('dashboard');

  // PWA & Scroll Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [showScrollInstallBanner, setShowScrollInstallBanner] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
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

    // 2. Listen for PWA beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAlreadyInstalled(true);
      localStorage.setItem('taylaxis_app_installed_v1', 'true');
      setShowScrollInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Detect iOS UserAgent
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 4. Scroll Listener: Automatically propose installation after scrolling a little bit (120px)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120 && !hasDismissedBanner && !isStandalone && !isAlreadyInstalled) {
        setShowScrollInstallBanner(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasDismissedBanner, isStandalone, isAlreadyInstalled]);

  // Install trigger handler
  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsAlreadyInstalled(true);
          localStorage.setItem('taylaxis_app_installed_v1', 'true');
          setShowScrollInstallBanner(false);
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallGuideModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FE] text-gray-900 font-sans selection:bg-[#7C3AED]/20 relative">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0C0A27]/95 backdrop-blur-md border-b border-white/10 text-white py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onGetStarted}>
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/30">
              <Scissors size={20} className="rotate-45" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Taylaxis</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-white/80">
            <a href="#valeur" className="hover:text-white transition-colors">La Valeur</a>
            <a href="#probleme" className="hover:text-white transition-colors">Le Problème</a>
            <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#avantages" className="hover:text-white transition-colors">Avantages</a>
          </nav>

          {/* Action CTAs: Télécharger l'App & Connexion */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Prominent Download Button in Header */}
            <button
              onClick={handleInstallApp}
              className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
              title="Installer l'application Taylaxis"
            >
              <Download size={14} className="text-[#A78BFA]" />
              <span className="hidden xs:inline">Installer l'application</span>
              <span className="xs:hidden">App</span>
            </button>

            {onLogin && (
              <button
                onClick={onLogin}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                Connexion
              </button>
            )}

            <button
              onClick={onGetStarted}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#3155C8] text-white text-xs sm:text-sm font-extrabold rounded-full hover:opacity-95 shadow-md shadow-[#7C3AED]/30 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Démarrer</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Centré) */}
      <section className="bg-[#0C0A27] text-white pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Subtle background ambient lighting glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#3155C8]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold text-[#A78BFA] animate-fadeIn">
            <Sparkles size={14} className="text-[#A78BFA]" />
            <span>Le SaaS N°1 des Ateliers de Couture Africains</span>
          </div>

          {/* Centered Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Oubliez vos cahiers.<br />
            <span className="bg-gradient-to-r from-[#A78BFA] via-[#C084FC] to-[#818CF8] bg-clip-text text-transparent">
              Gérez votre atelier comme un pro.
            </span>
          </h1>

          {/* Centered Subtitle */}
          <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Taylaxis vous aide à gérer vos clients, leurs mensurations, vos commandes, vos rendez-vous et vos relances, au même endroit.
          </p>

          {/* Hero Main CTAs: Commencer maintenant + Bouton Télécharger l'App */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3155C8] text-white font-extrabold text-base rounded-[20px] hover:opacity-95 cursor-pointer shadow-xl shadow-[#7C3AED]/40 active:scale-98 transition-all flex items-center justify-center space-x-2.5 border border-white/20"
            >
              <span>Commencer maintenant</span>
              <ArrowRight size={18} />
            </button>

            {/* Direct App Download Button in Hero */}
            <button
              onClick={handleInstallApp}
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-[20px] backdrop-blur-md border border-white/20 cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2.5"
            >
              <Download size={18} className="text-[#A78BFA]" />
              <span>Installer l'application sur Mobile</span>
              <Smartphone size={18} className="text-white/80" />
            </button>
          </div>

          <div className="text-xs text-white/60 font-medium flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Accès immédiat • Installation en 1 clic sans app store</span>
          </div>

          {/* App & Dashboard Interactive Mockup Showcase + 5 Core Functions */}
          <div className="pt-10 sm:pt-14 space-y-8">
            {/* The 5 Main Functions Header Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-left">
              <div className="p-3 rounded-[16px] bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#A78BFA]">
                  <UserPlus size={14} />
                  <span>1. Client</span>
                </div>
                <p className="text-[11px] text-white/70 leading-tight">Ajouter vos contacts & fiches</p>
              </div>

              <div className="p-3 rounded-[16px] bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <Ruler size={14} />
                  <span>2. Mensurations</span>
                </div>
                <p className="text-[11px] text-white/70 leading-tight">Noter les mesures précises</p>
              </div>

              <div className="p-3 rounded-[16px] bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                  <Scissors size={14} />
                  <span>3. Commande</span>
                </div>
                <p className="text-[11px] text-white/70 leading-tight">Ajouter les confection 3D</p>
              </div>

              <div className="p-3 rounded-[16px] bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400">
                  <Calendar size={14} />
                  <span>4. Rendez-vous</span>
                </div>
                <p className="text-[11px] text-white/70 leading-tight">Planifier les essayages</p>
              </div>

              <div className="p-3 rounded-[16px] bg-white/10 border border-white/15 backdrop-blur-md space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                  <MessageCircle size={14} />
                  <span>5. Relance</span>
                </div>
                <p className="text-[11px] text-white/70 leading-tight">Relancer par WhatsApp</p>
              </div>
            </div>

            {/* Simulated App Dashboard Container */}
            <div className="p-4 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4 text-left max-w-3xl mx-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-white/60 font-mono ml-2">app.taylaxis.com</span>
                </div>
                <span className="text-[11px] font-bold text-[#A78BFA] bg-[#7C3AED]/20 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/40">
                  Aperçu Direct Taylaxis V1
                </span>
              </div>

              {/* Mock Stat Cards 2x2 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-[16px] bg-[#059669] text-white space-y-1">
                  <div className="text-[10px] opacity-90">CA du jour</div>
                  <div className="text-lg font-extrabold">85 000 FCFA</div>
                  <div className="text-[9px] opacity-80">↗ +12% vs hier</div>
                </div>

                <div className="p-3 rounded-[16px] bg-[#6D28D9] text-white space-y-1">
                  <div className="text-[10px] opacity-90">CA du mois</div>
                  <div className="text-lg font-extrabold">1 240 000 FCFA</div>
                  <div className="text-[9px] opacity-80">↗ +18% vs mois dernier</div>
                </div>

                <div className="p-3 rounded-[16px] bg-[#EA580C] text-white space-y-1">
                  <div className="text-[10px] opacity-90">Commandes en cours</div>
                  <div className="text-lg font-extrabold">18</div>
                  <div className="text-[9px] opacity-80">⏱ 2 en retard</div>
                </div>

                <div className="p-3 rounded-[16px] bg-[#2563EB] text-white space-y-1">
                  <div className="text-[10px] opacity-90">À encaisser</div>
                  <div className="text-lg font-extrabold">350 000 FCFA</div>
                  <div className="text-[9px] opacity-80">Sur 12 commandes</div>
                </div>
              </div>

              {/* Mock upcoming delivery list */}
              <div className="p-3 rounded-[18px] bg-white text-gray-900 space-y-2">
                <div className="text-xs font-extrabold text-gray-900 flex items-center justify-between">
                  <span>Livraisons prochaines</span>
                  <span className="text-[10px] text-[#7C3AED] font-bold">Voir tout</span>
                </div>
                <div className="p-2 rounded-[12px] bg-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">K</div>
                    <div>
                      <div className="font-bold text-gray-900">Commande #024</div>
                      <div className="text-[10px] text-gray-500">Kossi A.</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">En retard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION VALEUR & TRANSFORMATION */}
      <section id="valeur" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3 py-1 rounded-full">
            La Transformation de Votre Atelier
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ne vendez plus de simples vêtements. Offrez un service d'exception à vos clients.
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Taylaxis ne se contente pas de remplacer vos cahiers : l'application transforme votre atelier en une entreprise structurée, crédible et rentable.
          </p>
        </div>

        {/* Avant vs Après Taylaxis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Avant (Le Cahier) */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-red-200 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-red-100">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Avant : Le Cahier Traditionnel</h3>
                <p className="text-xs text-red-600">Désordre, retards et pertes financières</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 font-medium">
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span>Mensurations raturées, effacées ou perdues dans les pages.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span>Relances des soldes d'acomptes oubliées (pertes de trésorerie).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span>Retards de livraison causant la colère et la déception des clients.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span>Appels incessants pour chercher les informations d'un vêtement.</span>
              </li>
            </ul>
          </div>

          {/* Après (Avec Taylaxis) */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-[#0C0A27] to-[#1D1850] text-white shadow-xl space-y-5 border border-white/10">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/15">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Après : Avec Taylaxis</h3>
                <p className="text-xs text-emerald-400">Atelier professionnel, serein et rentable</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-white/90 font-medium">
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Mensurations retrouvées en 2 secondes et congelées sur chaque vêtement.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Historique financier clair : 100% des soldes réclamés et encaissés.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Alertes de retards automatiques et livraisons toujours à temps.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Relances instantanées par WhatsApp en un seul clic.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. LE PROBLÈME */}
      <section id="probleme" className="py-16 sm:py-20 bg-white border-y border-gray-200/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
              Le Défi Métier
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Pourquoi 80% des ateliers de couture perdent des revenus avec les cahiers ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-100 space-y-3 hover:border-[#7C3AED]/30 transition-all">
              <div className="w-12 h-12 rounded-[18px] bg-red-100 text-red-600 flex items-center justify-center">
                <Ruler size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">1. Mensurations égarées</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Reprendre les mesures à chaque visite ou utiliser une ancienne note gribouillée cause des erreurs de coupe coûteuses et des heures de retouches gratuites.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-100 space-y-3 hover:border-[#7C3AED]/30 transition-all">
              <div className="w-12 h-12 rounded-[18px] bg-amber-100 text-amber-700 flex items-center justify-center">
                <Banknote size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">2. Acomptes non réclamés</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Sans registre financier structuré, les tailleurs oublient de réclamer le solde restant au moment de remettre le vêtement au client.
              </p>
            </div>

            <div className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-100 space-y-3 hover:border-[#7C3AED]/30 transition-all">
              <div className="w-12 h-12 rounded-[18px] bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">3. Livraisons hors délais</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Les cahiers ne vous préviennent pas des urgences. Résultat : des habits en retard pour les fêtes, mariages ou événements majeurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LES 5 FONCTIONNALITÉS PRINCIPALES (Visuels Explicatifs) */}
      <section id="fonctionnalites" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3 py-1 rounded-full">
            Solution Tout-en-un
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Les 5 piliers pour piloter votre atelier de couture
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Tout ce dont un tailleur professionnel a besoin, réuni dans une interface fluide et intuitive.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Feature 1 */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Clients & Fiches Détaillées</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Créez une fiche pour chaque client avec son nom, numéro de téléphone, adresse et historique complet d'achats. Retrouvez n'importe quel profil en 1 clic grâce à la recherche instantanée.
              </p>
              <div className="pt-1 flex items-center space-x-2 text-xs font-bold text-[#7C3AED]">
                <span>Enregistrer un nouveau client</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="p-4 rounded-[20px] bg-[#FAF9FE] border border-[#EDE9F6] space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-white rounded-[14px] shadow-2xs border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center text-sm">
                  K
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Koffi Mensah</div>
                  <div className="text-[11px] text-gray-500">+228 90 12 34 56 • Lomé</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 order-2 md:order-1">
              <div className="p-4 rounded-[20px] bg-[#FAF9FE] border border-[#EDE9F6] space-y-2">
                <div className="text-xs font-bold text-[#5B21B6] flex items-center gap-1">
                  <Ruler size={14} />
                  <span>Mensurations Costume 3 Pièces</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-[10px] border border-gray-100 font-medium">Tour poitrine: <strong className="text-gray-900">102 cm</strong></div>
                  <div className="p-2 bg-white rounded-[10px] border border-gray-100 font-medium">Carrure épaules: <strong className="text-gray-900">46 cm</strong></div>
                  <div className="p-2 bg-white rounded-[10px] border border-gray-100 font-medium">Longueur manche: <strong className="text-gray-900">64 cm</strong></div>
                  <div className="p-2 bg-white rounded-[10px] border border-gray-100 font-medium">Tour de taille: <strong className="text-gray-900">88 cm</strong></div>
                </div>
              </div>
            </div>

            <div className="space-y-3 order-1 md:order-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Prise de Mensurations Précises & Congelées</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Renseignez toutes les mensurations (veste, chemise, pantalon, robe dame, boubou). Chaque commande gèle un instantané des mesures utilisées pour éliminer toute hésitation lors de la coupe.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Moteur de Commandes V1 (Order Engine 3D)</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Le cœur opérationnel de votre atelier. Suivez en temps réel le statut de fabrication, l'état des versements financiers et l'urgence de la livraison pour ne plus jamais subir de retards.
              </p>
            </div>

            <div className="p-4 rounded-[20px] bg-[#FAF9FE] border border-[#EDE9F6] space-y-2">
              <div className="p-3 bg-white rounded-[14px] border border-gray-100 shadow-2xs space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Veste Blazer & Pantalon</span>
                  <span className="text-[#7C3AED]">#042</span>
                </div>
                <div className="flex gap-1 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">EN CONFECTION</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">ACOMPTE PARTIEL</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">À TEMPS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 & 5 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Agenda & Planning des Essayages</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Organisez vos rendez-vous de prise de mesures, d'essayage et de remise de colis dans un calendrier mensuel clair pour réguler les visites en atelier.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] font-bold text-sm flex items-center justify-center">
                5
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Relances WhatsApp & SMS Automatisées</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Prévenez vos clients en 1 clic dès que leur habit est prêt ou envoyez un rappel courtois pour le règlement du solde restant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRÉSENTATION DE L'INTERFACE TAYLAXIS (Interactive Demo) */}
      <section className="py-16 sm:py-24 bg-[#0C0A27] text-white px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Interface SaaS Moderne
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Une application conçue pour les smartphones d'atelier
            </h2>
            <p className="text-sm text-white/70">
              Navigation fluide à une main, mode sombre/clair réactif et boutons d'action rapide métier.
            </p>
          </div>

          {/* Interactive Navigation Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'dashboard', label: '1. Dashboard Opérationnel' },
              { id: 'clients', label: '2. Fiche & Mensurations' },
              { id: 'commandes', label: '3. Suivie de Commande 3D' },
              { id: 'agenda', label: '4. Agenda & RDV' },
              { id: 'relances', label: '5. Relances WhatsApp' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activePreviewTab === tab.id
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/40'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Screen Showcase Container */}
          <div className="max-w-3xl mx-auto p-4 sm:p-6 rounded-[28px] bg-white/5 border border-white/15 backdrop-blur-md shadow-2xl">
            {activePreviewTab === 'dashboard' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-sm font-bold text-[#A78BFA]">Indicateurs Clés & Alertes de Retard</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-[14px] bg-[#059669] text-white font-bold">CA du jour: 85 000 F</div>
                  <div className="p-3 rounded-[14px] bg-[#6D28D9] text-white font-bold">CA du mois: 1 240 000 F</div>
                  <div className="p-3 rounded-[14px] bg-[#EA580C] text-white font-bold">Encours: 18 (2 retards)</div>
                  <div className="p-3 rounded-[14px] bg-[#2563EB] text-white font-bold">À encaisser: 350 000 F</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'clients' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-sm font-bold text-[#A78BFA]">Consulter & Éditer les Mensurations Client</h4>
                <div className="p-3 rounded-[16px] bg-white/10 text-white text-xs space-y-1.5">
                  <div className="font-bold text-emerald-400">Mensurations Enregistrées :</div>
                  <div>• Tour de poitrine : 102 cm</div>
                  <div>• Tour de taille : 88 cm</div>
                  <div>• Carrure épaules : 46 cm</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'commandes' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-sm font-bold text-[#A78BFA]">Prochaine Action Principale Unique (Order Engine)</h4>
                <div className="p-3 rounded-[16px] bg-white/10 text-white text-xs space-y-2">
                  <div className="font-bold">Commande #038 - Agbada Traditionnel</div>
                  <div className="p-2.5 rounded-[12px] bg-[#7C3AED] text-white text-center font-extrabold cursor-pointer">
                    Marquer Prête pour Essayage ✂️
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'agenda' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-sm font-bold text-[#A78BFA]">Planning des Rendez-vous d'Essayage & Livraisons</h4>
                <div className="p-3 rounded-[16px] bg-white/10 text-white text-xs space-y-1">
                  <div className="font-bold text-amber-300">Aujourd'hui à 15:00 :</div>
                  <div>Essayage Veste Costume avec M. Koffi A.</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'relances' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-sm font-bold text-[#A78BFA]">Boutons de Contact Direct WhatsApp / Téléphone</h4>
                <div className="grid grid-cols-3 gap-2 text-xs text-center font-bold">
                  <div className="p-2 rounded-[10px] bg-emerald-500/20 text-emerald-300">Appeler 📞</div>
                  <div className="p-2 rounded-[10px] bg-green-500/20 text-green-300">WhatsApp 💬</div>
                  <div className="p-2 rounded-[10px] bg-blue-500/20 text-blue-300">SMS 📱</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. LES AVANTAGES POUR LE TAILLEUR */}
      <section id="avantages" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3 py-1 rounded-full">
            Ce que Taylaxis change pour vous
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Les bénéfices concrets au quotidien dans votre atelier
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-xs space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-[#7C3AED] mx-auto flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Gain de Temps de 2h/Jour</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Consacrez plus de temps à la couture et à la création plutôt qu'à chercher des bouts de papier.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-xs space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">+30% d'Encaissements</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Zéro solde oublié : vous récupérez l'intégralité des sommes dues sur chaque vêtement confectionné.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-xs space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Image & Crédibilité Top</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Impressionnez vos clients avec un suivi numérique digne des plus grands ateliers de mode.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-xs space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Lock size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Sécurité & Cloud</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Même si vous perdez votre smartphone, vos mensurations et commandes restent protégées en sécurité.
            </p>
          </div>
        </div>
      </section>

      {/* 8. SECTION PRÊT À MIEUX GÉRER VOTRE ATELIER ? & CTA FINAL */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-14 rounded-[36px] bg-gradient-to-br from-[#0C0A27] via-[#1D1850] to-[#3155C8] text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-white/15">
          {/* Subtle light effect */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7C3AED]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#A78BFA] border border-white/15">
            <Sparkles size={14} />
            <span>Passez à la vitesse supérieure</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Prêt à mieux gérer votre atelier de couture ?
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-medium">
            Rejoignez dès aujourd'hui les ateliers africains qui ont choisi la sérénité et le professionnalisme avec Taylaxis.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-9 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-base rounded-full cursor-pointer shadow-xl shadow-[#7C3AED]/40 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Commencer maintenant</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleInstallApp}
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-full border border-white/20 cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Download size={18} className="text-[#A78BFA]" />
              <span>Télécharger l'application</span>
            </button>
          </div>

          <p className="text-xs text-white/60 font-medium">Gratuit • Démarrage en 30 secondes • Sans engagement</p>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#080619] text-white/70 py-10 px-4 sm:px-8 border-t border-white/10 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={onGetStarted}>
            <div className="w-7 h-7 rounded-[10px] bg-[#7C3AED] flex items-center justify-center text-white font-bold">
              <Scissors size={14} className="rotate-45" />
            </div>
            <span className="text-base font-extrabold text-white">Taylaxis</span>
          </div>

          <div>
            © {new Date().getFullYear()} Taylaxis. La solution SaaS métier pour les tailleurs et ateliers de couture.
          </div>

          <div className="flex space-x-4 font-semibold text-white/80">
            <button onClick={onGetStarted} className="hover:text-white cursor-pointer">Accueil App</button>
            <button onClick={handleInstallApp} className="hover:text-white cursor-pointer flex items-center space-x-1">
              <Download size={13} className="text-[#A78BFA]" />
              <span>Télécharger</span>
            </button>
            <a href="https://wa.me/22890123456" target="_blank" rel="noreferrer" className="hover:text-white">Support WhatsApp</a>
          </div>
        </div>
      </footer>

      {/* 10. SMART SCROLL-TRIGGERED PWA INSTALL BANNER (Appears after scrolling > 120px) */}
      {showScrollInstallBanner && !isStandalone && (
        <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 max-w-md mx-auto px-3.5 pointer-events-none">
          <div className="pointer-events-auto p-4 rounded-[24px] bg-[#0C0A27]/95 text-white border border-[#7C3AED]/50 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C3AED]/40 flex-shrink-0">
                  <Smartphone size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-[#A78BFA] bg-[#7C3AED]/20 px-2 py-0.5 rounded-full border border-[#7C3AED]/40">
                      Proposer à l'utilisateur
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug mt-0.5">
                    Installez l'application Taylaxis sur votre écran d'accueil
                  </h4>
                  <p className="text-[11px] text-white/75 leading-tight mt-0.5">
                    Accès instantané 1-clic, fonctionnel même hors-ligne dans votre atelier.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowScrollInstallBanner(false);
                  setHasDismissedBanner(true);
                }}
                className="text-white/60 hover:text-white p-1.5 rounded-full bg-white/10 cursor-pointer flex-shrink-0"
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-white/10">
              <button
                onClick={handleInstallApp}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3155C8] text-white font-extrabold text-xs rounded-full shadow-lg shadow-[#7C3AED]/40 hover:opacity-95 cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1.5 border border-white/20"
              >
                <Download size={15} />
                <span>Installer l'application immédiatement</span>
              </button>

              <button
                onClick={() => {
                  setShowScrollInstallBanner(false);
                  setHasDismissedBanner(true);
                }}
                className="px-3 py-2.5 text-xs text-white/60 hover:text-white font-medium cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. PWA INSTALLATION GUIDE MODAL (For iOS Safari vs Android Chrome) */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#120F38] border border-white/20 rounded-[28px] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInstallGuideModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-full bg-white/10 cursor-pointer"
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
              className="w-full py-3 rounded-[14px] bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] cursor-pointer transition-colors shadow-md"
            >
              Compris, j'installe maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
