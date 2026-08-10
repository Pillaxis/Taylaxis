import React, { useState, useEffect } from 'react';
import {
  Scissors,
  ArrowRight,
  CheckCircle2,
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
  FileText,
  Layers,
  HelpCircle,
  MessageSquare,
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
    <div className="min-h-screen bg-[#FAF9FE] text-gray-900 font-sans selection:bg-[#06B6D4]/20 relative">
      {/* 1. HEADER / NAVBAR (Crisp Light Theme matching revizion.ai) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/70 text-gray-900 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onGetStarted}>
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#06B6D4] to-[#7C3AED] flex items-center justify-center text-white shadow-md shadow-[#06B6D4]/30 animate-pulse-glow">
              <Scissors size={20} className="rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-none">Taylaxis</span>
              <span className="text-[9.5px] font-bold text-[#06B6D4] tracking-widest uppercase mt-0.5">SaaS Couture</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </nav>

          {/* Nav Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={handleInstallApp}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
              title="Installer l'application Taylaxis"
            >
              <Download size={14} className="text-[#06B6D4]" />
              <span>App Mobile</span>
            </button>

            {onLogin && (
              <button
                onClick={onLogin}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Connexion
              </button>
            )}

            <button
              onClick={onGetStarted}
              className="px-4.5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-[#06B6D4]/30 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Commencer</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-gray-700 hover:text-gray-900 cursor-pointer"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-2 border-t border-gray-200/60 space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-gray-700 hover:text-gray-900">Fonctionnalités</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-gray-700 hover:text-gray-900">Comment ça marche</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-gray-700 hover:text-gray-900">Tarifs</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1 text-gray-700 hover:text-gray-900">FAQ</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleInstallApp}
                className="w-full py-2.5 bg-gray-100 text-gray-900 font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
              >
                <Download size={15} className="text-[#06B6D4]" />
                <span>Installer l'application Mobile</span>
              </button>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-[#06B6D4] text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (Exact Revizion Screenshot 1 Layout with Live Mockups in Movement) */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-8 relative overflow-hidden bg-gradient-to-b from-[#F0FDFA] via-[#FAF9FE] to-[#FAF9FE]">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Hero Badge Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#E0F2FE] border border-[#7DD3FC] text-xs sm:text-sm font-extrabold text-[#0369A1] shadow-xs">
            <Shirt size={15} className="text-[#0284C7]" />
            <span>Pour les tailleurs & ateliers de couture</span>
          </div>

          {/* Hero Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
            Transformez vos cours en<br />
            <span className="bg-gradient-to-r from-[#06B6D4] via-[#0891B2] to-[#7C3AED] bg-clip-text text-transparent">
              outils de révision
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Importez vos documents. Taylaxis génère automatiquement résumés, fiches et quiz personnalisés pour réussir vos examens.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-extrabold text-base rounded-xl shadow-lg shadow-[#06B6D4]/30 hover:scale-105 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>Essayer gratuitement</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold text-base rounded-xl border border-gray-200 cursor-pointer shadow-xs active:scale-98 transition-all flex items-center justify-center"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Social Proof Rating Bar (Exact Revizion Screenshot 1) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md z-4">K</div>
              <div className="w-9 h-9 rounded-full bg-[#06B6D4] text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md -ml-3 z-3">A</div>
              <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md -ml-3 z-2">L</div>
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md -ml-3 z-1">M</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-amber-500 font-extrabold text-sm">4.8 / 5</span>
              <span className="text-gray-500 text-xs font-medium">• Utilisé par plus de 10 000 étudiants</span>
            </div>
          </div>

          {/* Hero Visual Mockup Container (Window Capture + 2 Floating Mini-Mockups in Movement) */}
          <div className="pt-8 sm:pt-12 relative max-w-3xl mx-auto">
            {/* Main Window Mockup Capture */}
            <div className="p-4 sm:p-6 rounded-[28px] bg-white border border-gray-200/80 shadow-2xl text-left space-y-4 relative">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-500 font-mono ml-2">Mes Documents</span>
                </div>
                <span className="text-[11px] font-bold text-[#06B6D4] bg-[#ECFEFF] px-2.5 py-0.5 rounded-full border border-[#CFFAFE]">
                  Taylaxis V1 Live
                </span>
              </div>

              {/* Realistic Capture of Taylaxis Atelier App */}
              <div className="space-y-3">
                {/* Stat Cards 2x2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-[16px] bg-[#059669] text-white space-y-1 shadow-sm">
                    <div className="text-[10px] opacity-90">CA du jour</div>
                    <div className="text-lg font-extrabold">85 000 FCFA</div>
                    <div className="text-[9px] opacity-80">↗ +12% vs hier</div>
                  </div>

                  <div className="p-3 rounded-[16px] bg-[#6D28D9] text-white space-y-1 shadow-sm">
                    <div className="text-[10px] opacity-90">CA du mois</div>
                    <div className="text-lg font-extrabold">1 240 000 FCFA</div>
                    <div className="text-[9px] opacity-80">↗ +18% ce mois</div>
                  </div>

                  <div className="p-3 rounded-[16px] bg-[#EA580C] text-white space-y-1 shadow-sm">
                    <div className="text-[10px] opacity-90">Commandes en cours</div>
                    <div className="text-lg font-extrabold">18 confections</div>
                    <div className="text-[9px] opacity-80">⏱ 2 urgentes</div>
                  </div>

                  <div className="p-3 rounded-[16px] bg-[#2563EB] text-white space-y-1 shadow-sm">
                    <div className="text-[10px] opacity-90">À encaisser</div>
                    <div className="text-lg font-extrabold">350 000 FCFA</div>
                    <div className="text-[9px] opacity-80">Sur 12 clients</div>
                  </div>
                </div>

                {/* Sample Document Items (Matching Revizion mockup style) */}
                <div className="p-3.5 rounded-[16px] bg-[#F8FAFC] border border-gray-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-[12px] bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">Psychologie cognitive</div>
                      <div className="text-xs text-gray-500 font-medium">32 fiches • 15 quiz</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#CCFBF1] text-[#0D9488] text-xs font-extrabold">Prêt</span>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#F8FAFC] border border-gray-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">Droit constitutionnel</div>
                      <div className="text-xs text-gray-500 font-medium">24 fiches • 10 quiz</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-extrabold">Prêt</span>
                </div>
              </div>
            </div>

            {/* Floating Mini-Mockup 1 (Top Right in Movement - animate-float) */}
            <div className="absolute -top-5 -right-3 sm:-right-6 p-3 px-4 rounded-[20px] bg-white border border-gray-200/80 text-gray-900 font-extrabold text-xs flex items-center space-x-2.5 shadow-xl animate-float z-20">
              <div className="w-7 h-7 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <span>Quiz généré !</span>
            </div>

            {/* Floating Mini-Mockup 2 (Bottom Left in Movement - animate-float-reverse) */}
            <div className="absolute -bottom-5 -left-3 sm:-left-6 p-3 px-4 rounded-[20px] bg-white border border-gray-200/80 text-gray-900 font-extrabold text-xs flex items-center space-x-3 shadow-xl animate-float-reverse z-20">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Score moyen</span>
                <span className="text-sm font-black text-[#06B6D4]">86%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: FONCTIONNALITÉS (Exact Revizion Screenshot 2 Layout) */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-4 py-1.5 rounded-full">
            FONCTIONNALITÉS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Tout ce qu'il faut pour réussir
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Des outils intelligents qui s'adaptent à votre façon d'apprendre
          </p>
        </div>

        {/* 4 White Feature Cards Grid (1 Row of 4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/70 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Résumés structurés</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Vos cours transformés en résumés clairs avec les points clés mis en évidence.
            </p>
          </article>

          {/* Card 2 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/70 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
              <Layers size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Fiches de révision</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Flashcards générées automatiquement avec suivi de votre progression.
            </p>
          </article>

          {/* Card 3 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/70 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Quiz personnalisés</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Des questions ciblées sur vos points faibles pour progresser rapidement.
            </p>
          </article>

          {/* Card 4 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/70 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Assistant dédié</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Posez vos questions et obtenez des explications claires sur vos cours.
            </p>
          </article>
        </div>
      </section>

      {/* 4. SECTION 2: COMMENT ÇA MARCHE (Exact Revizion Screenshot 3 - Exactly 3 Steps Grid) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-gray-200/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-4 py-1.5 rounded-full">
              COMMENT ÇA MARCHE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Simple comme 1, 2, 3
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              De vos documents à vos révisions en quelques secondes
            </p>
          </div>

          {/* 3 Step Cards Grid (Exact Revizion Screenshot 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <article className="p-8 sm:p-10 rounded-[28px] bg-[#FAF9FE] border border-gray-200/70 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#06B6D4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Importez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Glissez-déposez vos PDF, Word ou images de cours.
              </p>
            </article>

            {/* Step 2 */}
            <article className="p-8 sm:p-10 rounded-[28px] bg-[#FAF9FE] border border-gray-200/70 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#06B6D4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Générez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                L'application analyse et crée résumés, fiches et quiz.
              </p>
            </article>

            {/* Step 3 */}
            <article className="p-8 sm:p-10 rounded-[28px] bg-[#FAF9FE] border border-gray-200/70 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#06B6D4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Révisez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Apprenez efficacement sur tous vos appareils.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-4 py-1.5 rounded-full">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Choisissez votre plan
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Commencez gratuitement, évoluez selon vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Plan 1: Gratuit */}
          <div className="p-8 rounded-[28px] bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-gray-900">Gratuit</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-gray-900">0€</span>
                <span className="text-sm text-gray-500 font-medium">/mois</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Pour découvrir Taylaxis</p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-gray-700 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>2 documents</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Résumés automatiques</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>20 questions IA / jour</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Fiches basiques</span>
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

          {/* Plan 2: Pro (Featured) */}
          <div className="p-8 rounded-[28px] bg-[#0C0A27] text-white border-2 border-[#06B6D4] shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#06B6D4] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Le plus populaire
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-white">Pro</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">9,90€</span>
                <span className="text-sm text-white/70 font-medium">/mois</span>
              </div>
              <p className="text-xs text-[#06B6D4] font-medium">Pour les utilisateurs sérieux</p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-white/90 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Documents illimités</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Quiz illimités</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Assistant IA avancé</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Statistiques détaillées</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Support prioritaire</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3.5 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-[#06B6D4]/40 text-center"
            >
              Essayer Pro gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-16 sm:py-24 bg-white border-y border-gray-200/60 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-4 py-1.5 rounded-full">
              TÉMOIGNAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Ils nous font confiance
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Découvrez ce que nos utilisateurs disent de Taylaxis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#06B6D4]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Je gagne facilement 3h par semaine sur la création de fiches. Indispensable pour mon atelier !"
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-[#06B6D4] text-white font-extrabold text-xs flex items-center justify-center">
                  LM
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Léa Martin</div>
                  <div className="text-[11px] text-gray-500 font-medium">L3 Droit, Sorbonne</div>
                </div>
              </div>
            </article>

            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#06B6D4]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Les quiz ciblent exactement mes points faibles. Mes notes ont augmenté dès le premier mois."
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center">
                  TK
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Thomas Koné</div>
                  <div className="text-[11px] text-gray-500 font-medium">École d'ingénieurs, Lyon</div>
                </div>
              </div>
            </article>

            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#06B6D4]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "L'assistant explique super bien. Un vrai game changer pour mes projets."
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  AS
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Ananya Singh</div>
                  <div className="text-[11px] text-gray-500 font-medium">Master Business, HEC</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-4 py-1.5 rounded-full">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Tout ce que vous devez savoir sur Taylaxis
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Est-ce que Taylaxis remplace mes révisions ?",
              a: "Non, Taylaxis automatise la préparation (résumés, fiches) pour que vous passiez plus de temps à comprendre et mémoriser activement.",
            },
            {
              q: "Mes documents sont-ils sécurisés ?",
              a: "Absolument. Vos documents sont chiffrés et stockés de manière sécurisée. Ils ne sont jamais utilisés pour entraîner des modèles tiers.",
            },
            {
              q: "Puis-je utiliser Taylaxis sur mobile ?",
              a: "Oui ! L'interface est entièrement responsive. Révisez vos fiches et passez des quiz depuis n'importe quel appareil.",
            },
            {
              q: "Y a-t-il un engagement ?",
              a: "Aucun engagement. Vous pouvez passer d'un plan à l'autre ou annuler à tout moment en un clic.",
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
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#06B6D4]' : ''}`}
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

      {/* 8. FINAL CTA BANNER */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-14 rounded-[36px] bg-gradient-to-br from-[#0C0A27] via-[#1D1850] to-[#3155C8] text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-white/15">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Prêt à transformer vos révisions ?
          </h2>

          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-medium">
            Rejoignez des milliers d'utilisateurs qui réussissent avec Taylaxis.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-9 py-4 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-extrabold text-base rounded-xl cursor-pointer shadow-xl shadow-[#06B6D4]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <span className="text-xs text-white/60 font-medium block pt-1">Aucune carte requise</span>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#080619] text-white/70 py-12 px-4 sm:px-8 border-t border-white/10 text-xs">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={onGetStarted}>
                <div className="w-8 h-8 rounded-[10px] bg-[#06B6D4] flex items-center justify-center text-white font-bold">
                  <Scissors size={16} className="rotate-45" />
                </div>
                <span className="text-lg font-black text-white">Taylaxis</span>
              </div>
              <p className="text-xs text-white/60 font-medium leading-relaxed">
                L'assistant intelligent pour vos révisions et confections.
              </p>
            </div>

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
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Légal</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-white/50 text-[11px]">
            <p>© {new Date().getFullYear()} Taylaxis. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* 10. SMART SCROLL-TRIGGERED PWA INSTALL BANNER */}
      {showScrollInstallBanner && !isStandalone && (
        <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 max-w-md mx-auto px-3.5 pointer-events-none">
          <div className="pointer-events-auto p-4 rounded-[24px] bg-white border border-gray-200/80 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-[16px] bg-[#ECFEFF] text-[#06B6D4] flex items-center justify-center font-bold shadow-sm flex-shrink-0 animate-pulse-glow">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                    Installez Taylaxis sur votre écran d'accueil
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-tight mt-0.5 font-medium">
                    Accès instantané 1-clic depuis votre smartphone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowScrollInstallBanner(false);
                  setHasDismissedBanner(true);
                }}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer flex-shrink-0"
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
              <button
                onClick={handleInstallApp}
                className="flex-1 py-2.5 px-4 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-102 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <Download size={15} />
                <span>Installer l'application maintenant</span>
              </button>

              <button
                onClick={() => {
                  setShowScrollInstallBanner(false);
                  setHasDismissedBanner(true);
                }}
                className="px-3 py-2.5 text-xs text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. PWA INSTALLATION GUIDE MODAL */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-gray-200/80 rounded-[28px] max-w-md w-full p-6 text-gray-900 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInstallGuideModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-[16px] bg-[#ECFEFF] text-[#06B6D4] flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Installer Taylaxis sur Mobile</h3>
                <p className="text-xs text-gray-500 font-medium">Utilisez l'application en plein écran comme sur les stores</p>
              </div>
            </div>

            {isIOS ? (
              <div className="p-4 rounded-[18px] bg-gray-50 border border-gray-200/60 space-y-3 text-xs">
                <p className="font-extrabold text-[#06B6D4] flex items-center space-x-1.5">
                  <Share size={15} />
                  <span>Sur iPhone / iPad (Safari) :</span>
                </p>
                <ol className="list-decimal pl-4 space-y-2 text-gray-700 leading-relaxed font-medium">
                  <li>Appuyez sur le bouton <strong>Partager</strong> en bas de votre navigateur Safari.</li>
                  <li>Faites défiler le menu puis appuyez sur <strong>"Sur l'écran d'accueil"</strong>.</li>
                  <li>Validez en appuyant sur <strong>Ajouter</strong> en haut à droite.</li>
                </ol>
              </div>
            ) : (
              <div className="p-4 rounded-[18px] bg-gray-50 border border-gray-200/60 space-y-3 text-xs">
                <p className="font-extrabold text-[#06B6D4] flex items-center space-x-1.5">
                  <Download size={15} />
                  <span>Sur Android / Chrome :</span>
                </p>
                <ol className="list-decimal pl-4 space-y-2 text-gray-700 leading-relaxed font-medium">
                  <li>Appuyez sur le menu <strong>Options (⋮)</strong> en haut à droite de Chrome.</li>
                  <li>Sélectionnez <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>.</li>
                  <li>Confirmez l'installation pour avoir l'icône Taylaxis sur votre téléphone.</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-3 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-extrabold text-xs cursor-pointer transition-colors shadow-md"
            >
              Compris, j'installe maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
