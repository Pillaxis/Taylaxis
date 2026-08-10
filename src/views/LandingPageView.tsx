import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Ruler,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Download,
  Smartphone,
  Share,
  X,
  Star,
  Quote,
  ChevronDown,
  Check,
  Shirt,
  Menu,
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onGetStarted, onLogin }) => {
  // FAQ accordion active state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // PWA & Scroll Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [showScrollInstallBanner, setShowScrollInstallBanner] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isAlreadyInstalled] = useState<boolean>(() => {
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

  // 4. Scroll Listener: Automatically propose installation after scrolling (120px)
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
          localStorage.setItem('taylaxis_app_installed_v1', 'true');
          setShowScrollInstallBanner(false);
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FE] text-gray-900 font-sans selection:bg-[#7C3AED]/20 relative">
      {/* 1. HEADER / NAVBAR (Exact Revizion Structure) */}
      <header className="sticky top-0 z-40 bg-[#0C0A27]/95 backdrop-blur-md border-b border-white/10 text-white py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onGetStarted}>
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/30 animate-pulse-glow">
              <Scissors size={20} className="rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">Taylaxis</span>
              <span className="text-[9.5px] font-bold text-[#A78BFA] tracking-widest uppercase mt-0.5">SaaS Couture</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-white/80">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Témoignages</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Nav Actions */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <button
              onClick={handleInstallApp}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
              title="Installer l'application Taylaxis"
            >
              <Download size={14} className="text-[#A78BFA]" />
              <span>App Mobile</span>
            </button>

            {onLogin && (
              <button
                onClick={onLogin}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                Connexion
              </button>
            )}

            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#3155C8] text-white text-xs sm:text-sm font-extrabold rounded-lg hover:opacity-95 shadow-md shadow-[#7C3AED]/30 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Commencer</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-white/80 hover:text-white cursor-pointer"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-2 border-t border-white/10 space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-white/80 hover:text-white">Fonctionnalités</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-white/80 hover:text-white">Comment ça marche</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-white/80 hover:text-white">Tarifs</a>
              <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-white/80 hover:text-white">Témoignages</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-white/80 hover:text-white">FAQ</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleInstallApp}
                className="w-full py-2.5 bg-white/10 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2"
              >
                <Download size={15} className="text-[#A78BFA]" />
                <span>Installer l'application Mobile</span>
              </button>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-[#7C3AED] text-white font-extrabold text-xs rounded-lg flex items-center justify-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (Exact Revizion Layout) */}
      <section className="bg-[#0C0A27] text-white pt-14 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Hero Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#7C3AED]/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Hero Badge Pill (Revizion Style) */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs sm:text-sm font-extrabold text-[#C084FC] shadow-lg shadow-[#7C3AED]/20 animate-fadeIn">
            <Shirt size={15} className="text-[#A78BFA]" />
            <span>Pour les tailleurs, couturiers & ateliers ambitieux</span>
          </div>

          {/* Hero Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Transformez vos cahiers en<br />
            <span className="bg-gradient-to-r from-[#A78BFA] via-[#C084FC] to-[#818CF8] bg-clip-text text-transparent">
              outils de gestion intelligents
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Importez vos mensurations clients. Taylaxis génère automatiquement fiches congelées, suivi 3D des confections et relances d'acomptes pour réussir votre atelier.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3155C8] text-white font-extrabold text-base rounded-xl hover:opacity-95 cursor-pointer shadow-xl shadow-[#7C3AED]/40 active:scale-98 transition-all flex items-center justify-center space-x-2.5 border border-white/20 animate-pulse-glow"
            >
              <span>Essayer gratuitement</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-xl backdrop-blur-md border border-white/20 cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Social Proof Rating Bar (Revizion Avatars + Stars) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center border-2 border-[#0C0A27] shadow-md z-4">K</div>
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-[#0C0A27] shadow-md -ml-3 z-3">A</div>
              <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-[#0C0A27] shadow-md -ml-3 z-2">L</div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-[#0C0A27] shadow-md -ml-3 z-1">M</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-amber-400 font-extrabold text-sm">4.9 / 5</span>
              <span className="text-white/70 text-xs font-medium">• Utilisé par 500+ ateliers</span>
            </div>
          </div>

          {/* Hero Visual Container (Main Mockup Card + Floating Badges) */}
          <div className="pt-8 sm:pt-12 relative max-w-3xl mx-auto">
            <div className="p-4 sm:p-6 rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-left space-y-4 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-white/70 font-mono ml-2">Atelier Taylaxis — Fiches & Commandes</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  ● Confections prêtes
                </span>
              </div>

              {/* Sample Document List */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-[16px] bg-white/10 border border-white/15 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-[12px] bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">Costume 3 Pièces Sur-Mesure</div>
                      <div className="text-xs text-white/70">Client: Kossi Mensah • 6 mensurations congelées</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">Prêt</span>
                </div>

                <div className="p-3.5 rounded-[16px] bg-white/10 border border-white/15 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-[12px] bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                      <Ruler size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">Robe de Soirée & Pagne</div>
                      <div className="text-xs text-white/70">Cliente: Aminata Diallo • Solde versé: 50 000 FCFA</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">En atelier</span>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="hidden sm:flex absolute -top-4 -left-6 p-3 rounded-[16px] bg-[#7C3AED] text-white font-extrabold text-xs items-center space-x-2 shadow-2xl animate-float">
              <CheckCircle2 size={16} />
              <span>Relance WhatsApp envoyée !</span>
            </div>

            <div className="hidden sm:flex absolute -bottom-4 -right-6 p-3.5 rounded-[16px] bg-white text-gray-900 font-extrabold text-xs items-center space-x-3 shadow-2xl animate-float-reverse">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                100%
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-500 uppercase font-bold">Soldes d'acomptes</div>
                <div className="text-xs font-extrabold text-emerald-700">Aucun oubli financier</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF CITIES / LOGOS BAR */}
      <section className="py-8 bg-white border-b border-gray-200/60 text-center">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Utilisé par les plus grands ateliers de couture à
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-sm sm:text-base font-extrabold text-gray-400">
            <span className="hover:text-gray-900 transition-colors">Lomé</span>
            <span className="hover:text-gray-900 transition-colors">Cotonou</span>
            <span className="hover:text-gray-900 transition-colors">Abidjan</span>
            <span className="hover:text-gray-900 transition-colors">Dakar</span>
            <span className="hover:text-gray-900 transition-colors">Douala</span>
            <span className="hover:text-gray-900 transition-colors">Paris</span>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID SECTION (Exact Revizion Order) */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3.5 py-1 rounded-full border border-[#7C3AED]/20">
            Fonctionnalités
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Tout ce qu'il faut pour réussir votre atelier
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Des outils intelligents qui s'adaptent au quotidien du tailleur sur-mesure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <article className="p-6 rounded-[24px] bg-white border border-gray-200/80 shadow-xs space-y-4 hover:border-[#7C3AED] hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-[16px] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Ruler size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Prise de mensurations 3D</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Conservez chaque mesure client et gèlez un instantané sur chaque vêtement pour zéro hésitation à la coupe.
            </p>
          </article>

          {/* Card 2 */}
          <article className="p-6 rounded-[24px] bg-white border border-gray-200/80 shadow-xs space-y-4 hover:border-[#7C3AED] hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-[16px] bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Scissors size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Moteur de Confection 3D</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Suivi tridimensionnel : fabrication en cours, statut du versement d'acompte et calcul dynamique du délai.
            </p>
          </article>

          {/* Card 3 */}
          <article className="p-6 rounded-[24px] bg-white border border-gray-200/80 shadow-xs space-y-4 hover:border-[#7C3AED] hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-[16px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Banknote size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Gestion des Acomptes & Soldes</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Règlement en plusieurs fois (Espèces, Mobile Money). Historique comptable clair pour ne rien oublier.
            </p>
          </article>

          {/* Card 4 */}
          <article className="p-6 rounded-[24px] bg-white border border-gray-200/80 shadow-xs space-y-4 hover:border-[#7C3AED] hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-[16px] bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Relances WhatsApp 1-Clic</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Prévenez le client instantanément dès que l'habit est prêt pour l'essayage ou la livraison en un clic.
            </p>
          </article>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION (Revizion 1, 2, 3 Step Grid) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-gray-200/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3.5 py-1 rounded-full border border-[#7C3AED]/20">
              Comment ça marche
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Simple comme 1, 2, 3
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              De la prise de mesure à la livraison du vêtement en quelques secondes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <article className="p-8 rounded-[28px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Importez & Mesurez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Enregistrez le client avec ses numéros et notez ses mensurations (veste, boubou, robe).
              </p>
            </article>

            {/* Step 2 */}
            <article className="p-8 rounded-[28px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Confectionnez & Suivez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Passez de la coupe à la finition. L'application calcule les délais et enregistre l'acompte perçu.
              </p>
            </article>

            {/* Step 3 */}
            <article className="p-8 rounded-[28px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Livrez & Encaissez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Envoyez le SMS/WhatsApp "Prêt", remettez le colis au client et percevez le solde restant sans aucun doute.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION (Exact Revizion 2-Card Grid) */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3.5 py-1 rounded-full border border-[#7C3AED]/20">
            Tarifs
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Choisissez votre formule
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Commencez gratuitement, évoluez selon les besoins de votre atelier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Plan 1: Gratuit */}
          <div className="p-8 rounded-[28px] bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-gray-900">Découverte</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-gray-900">0 FCFA</span>
                <span className="text-sm text-gray-500 font-medium">/mois</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Pour découvrir Taylaxis</p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-gray-700 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Jusqu'à 10 clients</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Fiches de mensurations basiques</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Gestion des commandes</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Support communautaire</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3.5 rounded-xl border-2 border-gray-900 text-gray-900 font-extrabold text-sm hover:bg-gray-900 hover:text-white transition-all cursor-pointer text-center"
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Plan 2: Pro (Featured Card) */}
          <div className="p-8 rounded-[28px] bg-[#0C0A27] text-white border-2 border-[#7C3AED] shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#7C3AED] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Le plus populaire
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-white">Atelier Pro</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">9 900 FCFA</span>
                <span className="text-sm text-white/70 font-medium">/mois</span>
              </div>
              <p className="text-xs text-[#A78BFA] font-medium">Pour les tailleurs & couturiers sérieux</p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-white/90 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Clients & mensurations illimités</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Instantanés 3D de coupe congelés</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Relances WhatsApp & SMS 1-Clic</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Chiffre d'affaires jour/mois & statistiques</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Support prioritaire 7j/7</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3155C8] text-white font-extrabold text-sm hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-[#7C3AED]/40 text-center"
            >
              Essayer Pro gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION (Revizion Quote Cards) */}
      <section id="testimonials" className="py-16 sm:py-24 bg-white border-y border-gray-200/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3.5 py-1 rounded-full border border-[#7C3AED]/20">
              Témoignages
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Ils nous font confiance
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Découvrez ce que les tailleurs et créateurs de mode disent de Taylaxis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Testimonial 1 */}
            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#7C3AED]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Je gagne facilement 2h par jour sur la recherche de fiches. Mes clients sont impressionnés par la précision des coupes !"
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center">
                  LK
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Léandre Kouassi</div>
                  <div className="text-[11px] text-gray-500 font-medium">Maître Tailleur, Cotonou</div>
                </div>
              </div>
            </article>

            {/* Testimonial 2 */}
            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#7C3AED]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Plus aucun solde d'acompte oublié. Mon chiffre d'affaires a augmenté de 25% dès le premier mois d'utilisation."
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  AD
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Awa Diallo</div>
                  <div className="text-[11px] text-gray-500 font-medium">Atelier Mode & Couture, Dakar</div>
                </div>
              </div>
            </article>

            {/* Testimonial 3 */}
            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#7C3AED]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Les relances WhatsApp en 1 clic évitent les appels longs. Un vrai soutien pour mon atelier !"
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
                  KM
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Koffi Mensah</div>
                  <div className="text-[11px] text-gray-500 font-medium">Styliste Sur-Mesure, Lomé</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION (Accordion List) */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider bg-[#F3E8FF] px-3.5 py-1 rounded-full border border-[#7C3AED]/20">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Tout ce que vous devez savoir sur la plateforme Taylaxis
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Est-ce que Taylaxis remplace mes cahiers de couture ?",
              a: "Oui ! Taylaxis digitalise vos fiches de mensurations, le registre de vos commandes et le suivi des acomptes pour que vous ne perdiez plus aucune donnée.",
            },
            {
              q: "Mes mensurations et données sont-elles sécurisées ?",
              a: "Absolument. Vos fiches clients et mensurations sont chiffrées et sauvegardées en sécurité. Même si vous changez de téléphone, vos données sont conservées.",
            },
            {
              q: "Puis-je utiliser Taylaxis sur mobile sans application app store ?",
              a: "Oui ! Taylaxis est une Progressive Web App (PWA). Vous pouvez l'installer directement sur votre écran d'accueil en 1 seul clic sans passer par un app store.",
            },
            {
              q: "Y a-t-il un engagement ou une carte bancaire requise ?",
              a: "Aucun engagement ni carte bancaire. Vous pouvez démarrer gratuitement en 30 secondes et utiliser l'application au quotidien.",
            },
          ].map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-[20px] bg-white border border-gray-200/80 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-extrabold text-sm sm:text-base text-gray-900 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#7C3AED]' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-medium border-t border-gray-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CTA BANNER (Exact Revizion Section) */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-14 rounded-[36px] bg-gradient-to-br from-[#0C0A27] via-[#1D1850] to-[#3155C8] text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-white/15">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7C3AED]/30 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Prêt à transformer la gestion de votre atelier ?
          </h2>

          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-medium">
            Rejoignez des centaines de tailleurs et créateurs qui réussissent avec Taylaxis.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-9 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-base rounded-xl cursor-pointer shadow-xl shadow-[#7C3AED]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <span className="text-xs text-white/60 font-medium block pt-1">Aucune carte requise • Démarrage en 30 secondes</span>
        </div>
      </section>

      {/* 10. FOOTER (Exact Revizion Column Layout) */}
      <footer className="bg-[#080619] text-white/70 py-12 px-4 sm:px-8 border-t border-white/10 text-xs">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={onGetStarted}>
                <div className="w-8 h-8 rounded-[10px] bg-[#7C3AED] flex items-center justify-center text-white font-bold">
                  <Scissors size={16} className="rotate-45" />
                </div>
                <span className="text-lg font-black text-white">Taylaxis</span>
              </div>
              <p className="text-xs text-white/60 font-medium leading-relaxed">
                L'assistant intelligent pour vos révisions et confections en atelier de couture.
              </p>
            </div>

            {/* Links Columns */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Produit</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Ressources</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="https://wa.me/22890123456" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Support WhatsApp</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Légal</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-white/50 text-[11px]">
            <p>© {new Date().getFullYear()} Taylaxis. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* 11. SMART SCROLL-TRIGGERED PWA INSTALL BANNER */}
      {showScrollInstallBanner && !isStandalone && (
        <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 max-w-md mx-auto px-3.5 pointer-events-none">
          <div className="pointer-events-auto p-4 rounded-[24px] bg-[#0C0A27]/95 text-white border border-[#7C3AED]/50 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C3AED]/40 flex-shrink-0 animate-pulse-glow">
                  <Smartphone size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-[#A78BFA] bg-[#7C3AED]/20 px-2 py-0.5 rounded-full border border-[#7C3AED]/40">
                      Installer l'application Taylaxis
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug mt-0.5">
                    Installez Taylaxis sur votre écran d'accueil
                  </h4>
                  <p className="text-[11px] text-white/75 leading-tight mt-0.5">
                    Accès instantané 1-clic, fonctionnel en atelier.
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
                <span>Installer l'application maintenant</span>
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

      {/* 12. PWA INSTALLATION GUIDE MODAL */}
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
