import React, { useState, useEffect } from 'react';
import {
  Scissors,
  ArrowRight,
  CheckCircle2,
  Download,
  Smartphone,
  Share,
  X,
  Quote,
  ChevronDown,
  Check,
  Shirt,
  Menu,
  FileText,
  Users,
  Ruler,
  Calendar,
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

      {/* 2. HERO SECTION */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-8 relative overflow-hidden bg-gradient-to-b from-[#F0FDFA] via-[#FAF9FE] to-[#FAF9FE]">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-xs sm:text-sm font-extrabold text-[#7C3AED] shadow-xs">
            <Shirt size={15} className="text-[#7C3AED]" />
            <span>POUR LES TAILLEURS ET ATELIERS DE COUTURE</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            <span className="text-[#0C0A27] block">Oubliez vos cahiers.</span>
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3155C8] bg-clip-text text-transparent block">
              Gérez votre atelier comme un pro.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Clients, mensurations, commandes, rendez-vous et relances : Taylaxis vous aide à organiser votre atelier et à ne plus rien oublier.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-base rounded-xl shadow-lg shadow-[#7C3AED]/30 hover:scale-105 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Commencer</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleInstallApp}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-base rounded-xl border border-gray-200 cursor-pointer shadow-xs hover:scale-105 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Download size={18} className="text-[#7C3AED]" />
              <span>Installer l'application</span>
            </button>
          </div>

          {/* Compact Mockup Container with Animated Main Mockup & 2 Overlapping Floating Badges */}
          <div className="pt-8 sm:pt-10 relative max-w-xl mx-auto">
            {/* Main Window Mockup Capture in Movement (Compact & Floating) */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-gray-200/80 shadow-2xl text-left space-y-3 relative animate-float">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-[11px] text-gray-500 font-mono ml-2">Taylaxis — Commandes Atelier</span>
                </div>
                <span className="text-[10px] font-bold text-[#7C3AED] bg-[#F3E8FF] px-2 py-0.5 rounded-full border border-[#E9D5FF]">
                  ● Live Atelier
                </span>
              </div>

              {/* Taylaxis Atelier App Compact Items */}
              <div className="space-y-2 relative">
                {/* First Order Line Container (Reference Element for Both Floating Notifications) */}
                <div className="p-3 rounded-[14px] bg-[#F8FAFC] border border-gray-200/60 flex items-center justify-between relative">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-[10px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
                      <Scissors size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-gray-900">Costume 3 Pièces Sur-Mesure</div>
                      <div className="text-[11px] text-gray-500 font-medium">Kossi Mensah • 6 mensurations</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ECFEFF] text-[#0891B2] text-[11px] font-extrabold">Prêt</span>

                  {/* 1. Left Notification (« Soldes encaissés 100% ») - Centered vertically around the 1st Order Line */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-6 lg:-left-8 p-2 px-3 sm:px-3.5 rounded-[18px] bg-white/95 border border-gray-200/90 text-gray-900 font-extrabold text-xs flex flex-col text-left shadow-xl shadow-gray-900/10 backdrop-blur-md animate-float z-30 pointer-events-none select-none">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Soldes encaissés</span>
                    <span className="text-xs font-black text-[#06B6D4] leading-tight mt-0.5">100%</span>
                  </div>

                  {/* 2. Right Notification (« Confection prête ! ») - Aligned with upper part of the 1st Order Line */}
                  <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-5 lg:-right-6 p-2 px-3 sm:px-3.5 rounded-[18px] bg-white/95 border border-gray-200/90 text-gray-900 font-extrabold text-xs flex items-center space-x-2 shadow-xl shadow-gray-900/10 backdrop-blur-md animate-float-reverse z-30 pointer-events-none select-none">
                    <div className="w-5.5 h-5.5 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="whitespace-nowrap">Confection prête !</span>
                  </div>
                </div>

                {/* Second Order Line Container */}
                <div className="p-3 rounded-[14px] bg-[#F8FAFC] border border-gray-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-[10px] bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-gray-900">Robe de Soirée & Pagne</div>
                      <div className="text-[11px] text-gray-500 font-medium">Aminata Diallo • Solde versé: 50k F</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold">En atelier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: FONCTIONNALITÉS */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider bg-[#7C3AED]/10 border border-[#7C3AED]/30 px-4 py-1.5 rounded-full">
            FONCTIONNALITÉS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0C0A27] tracking-tight">
            Tout ce qu’il faut pour gérer votre atelier.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Clients, mensurations, commandes et rendez-vous : Taylaxis centralise l’essentiel de votre activité.
          </p>
        </div>

        {/* 4 White Feature Cards Grid (1 Row of 4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#7C3AED]/40 transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Gérez vos clients</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Ajoutez, consultez et organisez toutes les informations de vos clients au même endroit.
            </p>
          </article>

          {/* Card 2 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#7C3AED]/40 transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Ruler size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Enregistrez les mensurations</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Conservez les mensurations de chaque client et retrouvez-les facilement au moment de créer une commande.
            </p>
          </article>

          {/* Card 3 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#7C3AED]/40 transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Scissors size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Gérez vos commandes</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Créez et suivez les commandes de vos clients avec une organisation claire de votre activité.
            </p>
          </article>

          {/* Card 4 */}
          <article className="p-8 rounded-[24px] bg-white border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#7C3AED]/40 transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-[16px] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Planifiez vos rendez-vous</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Organisez vos essayages, prises de mesures, livraisons et autres rendez-vous avec vos clients.
            </p>
          </article>
        </div>
      </section>

      {/* 4. SECTION 2: COMMENT ÇA MARCHE (Tailor Application Content + Exactly 3 Steps Grid) */}
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
              De la prise de mesure à la livraison du vêtement en quelques secondes
            </p>
          </div>

          {/* 3 Step Cards Grid (Tailor Application Process) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <article className="p-8 sm:p-10 rounded-[28px] bg-[#FAF9FE] border border-gray-200/70 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#06B6D4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Enregistrez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Saisissez votre client et ses mensurations précises (poitrine, longueur, carrure).
              </p>
            </article>

            {/* Step 2 */}
            <article className="p-8 sm:p-10 rounded-[28px] bg-[#FAF9FE] border border-gray-200/70 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#06B6D4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Confectionnez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                L'application suit l'avancement du vêtement et enregistre les acomptes perçus.
              </p>
            </article>

            {/* Step 3 */}
            <article className="p-8 sm:p-10 rounded-[28px] bg-[#FAF9FE] border border-gray-200/70 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#06B6D4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Livrez & Encaissez</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Prévenez le client par WhatsApp et percevez le solde en toute sérénité.
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
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Jusqu'à 10 clients</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Fiches de mensurations basiques</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Gestion des commandes</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
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

          {/* Plan 2: Pro (Featured) */}
          <div className="p-8 rounded-[28px] bg-[#0C0A27] text-white border-2 border-[#06B6D4] shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#06B6D4] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Le plus populaire
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-white">Atelier Pro</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">9 900 FCFA</span>
                <span className="text-sm text-white/70 font-medium">/mois</span>
              </div>
              <p className="text-xs text-[#06B6D4] font-medium">Pour les tailleurs & ateliers sérieux</p>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-white/90 font-medium">
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Clients & mensurations illimités</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Instantanés 3D de coupe congelés</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Relances WhatsApp & SMS 1-Clic</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Rapports financiers CA du jour/mois</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check size={16} className="text-[#06B6D4] flex-shrink-0" />
                  <span>Support prioritaire 7j/7</span>
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
              Découvrez ce que les tailleurs et créateurs de mode disent de Taylaxis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#06B6D4]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Je gagne facilement 2h par jour sur la recherche de fiches. Mes clients sont impressionnés !"
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-[#06B6D4] text-white font-extrabold text-xs flex items-center justify-center">
                  LK
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Léandre Kouassi</div>
                  <div className="text-[11px] text-gray-500 font-medium">Maître Tailleur, Cotonou</div>
                </div>
              </div>
            </article>

            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#06B6D4]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Plus aucun solde d'acompte oublié. Mon chiffre d'affaires a augmenté de 25% dès le premier mois."
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center">
                  AD
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Awa Diallo</div>
                  <div className="text-[11px] text-gray-500 font-medium">Atelier Mode, Dakar</div>
                </div>
              </div>
            </article>

            <article className="p-6 rounded-[24px] bg-[#FAF9FE] border border-gray-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Quote size={28} className="text-[#06B6D4]/30" />
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-semibold italic">
                  "Les relances WhatsApp en 1 clic évitent les appels longs. Un vrai soutien pour mon atelier !"
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
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
              q: "Est-ce que Taylaxis remplace mes cahiers de couture ?",
              a: "Oui ! Taylaxis digitalise vos fiches de mensurations, le registre de vos commandes et le suivi des acomptes pour ne plus rien perdre.",
            },
            {
              q: "Mes mensurations et données sont-elles sécurisées ?",
              a: "Absolument. Vos fiches clients et mensurations sont chiffrées et sauvegardées en sécurité sur nos serveurs.",
            },
            {
              q: "Puis-je utiliser Taylaxis sur mon smartphone ?",
              a: "Oui ! Taylaxis est une Progressive Web App (PWA). Vous pouvez l'installer sur votre écran d'accueil en 1 clic.",
            },
            {
              q: "Y a-t-il un engagement ou une carte bancaire requise ?",
              a: "Aucun engagement ni carte bancaire. Vous pouvez démarrer gratuitement en 30 secondes et l'utiliser au quotidien.",
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
            Prêt à transformer la gestion de votre atelier ?
          </h2>

          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-medium">
            Rejoignez des centaines de tailleurs et créateurs qui réussissent avec Taylaxis.
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

          <span className="text-xs text-white/60 font-medium block pt-1">Aucune carte requise • Démarrage en 30 secondes</span>
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
                La solution SaaS métier pour les tailleurs et ateliers de couture.
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
                <li><a href="https://wa.me/22890123456" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Support WhatsApp</a></li>
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
