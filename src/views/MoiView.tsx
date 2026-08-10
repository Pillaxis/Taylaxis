import React, { useState } from 'react';
import {
  User,
  Building,
  CreditCard,
  Receipt,
  Bell,
  Palette,
  Shield,
  Lock,
  FileText,
  HelpCircle,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Camera,
  Check,
  X,
  AlertTriangle,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import type {
  UserProfile,
  WorkshopProfile,
  SubscriptionPlan,
  SubscriptionPlanType,
  TaylaxisPayment,
  NotificationSettings,
  TextScale,
} from '../types';

interface MoiViewProps {
  onSignOut?: () => void;
  onViewLandingPage?: () => void;
}

export const MoiView: React.FC<MoiViewProps> = ({ onSignOut, onViewLandingPage }) => {
  const { textScale, setTextScale, brandColor, setBrandColor } = useTheme();

  // State data
  const [userProfile, setUserProfile] = useState<UserProfile>(() => userService.getUserProfile());
  const [workshop, setWorkshop] = useState<WorkshopProfile>(() => userService.getWorkshopProfile());
  const [subscription, setSubscription] = useState<SubscriptionPlan>(() => userService.getSubscriptionPlan());
  const [payments] = useState<TaylaxisPayment[]>(() => userService.getPayments());
  const [notifications, setNotifications] = useState<NotificationSettings>(() => userService.getNotificationSettings());

  // UI Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditWorkshopModal, setShowEditWorkshopModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportBugModal, setShowReportBugModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Profile Edit Form State
  const [editFirstName, setEditFirstName] = useState(userProfile.firstName);
  const [editLastName, setEditLastName] = useState(userProfile.lastName);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editLanguage, setEditLanguage] = useState(userProfile.language);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Workshop Edit Form State
  const [editWName, setEditWName] = useState(workshop.name);
  const [editWPhone, setEditWPhone] = useState(workshop.phone);
  const [editWAddress, setEditWAddress] = useState(workshop.address);
  const [editWCity, setEditWCity] = useState(workshop.city);
  const [editWCountry, setEditWCountry] = useState(workshop.country);
  const [editWHours, setEditWHours] = useState(workshop.openingHours);
  const [editWDesc, setEditWDesc] = useState(workshop.description);
  const [editWNifRccm, setEditWNifRccm] = useState(workshop.nifRccm || '');
  const [workshopLogoUrl, setWorkshopLogoUrl] = useState(workshop.logoUrl || '');
  const [isSavingWorkshop, setIsSavingWorkshop] = useState(false);

  // Password Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Bug Report Form State
  const [bugCategory, setBugCategory] = useState('Affichage');
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  // Account Deletion Confirmation State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Handlers
  const handleOpenEditProfile = () => {
    setEditFirstName(userProfile.firstName);
    setEditLastName(userProfile.lastName);
    setEditPhone(userProfile.phone);
    setEditEmail(userProfile.email);
    setEditLanguage(userProfile.language);
    setProfileAvatarUrl(userProfile.avatarUrl || '');
    setProfileError('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (!editFirstName.trim() || !editLastName.trim()) {
      setProfileError('Veuillez renseigner votre prénom et nom.');
      return;
    }

    if (editEmail && !editEmail.includes('@')) {
      setProfileError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsSavingProfile(true);
    setTimeout(() => {
      const updated = userService.saveUserProfile({
        ...userProfile,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        email: editEmail,
        language: editLanguage,
        avatarUrl: profileAvatarUrl,
      });
      setUserProfile(updated);
      setIsSavingProfile(false);
      setShowEditProfileModal(false);
      showToast('Profil mis à jour avec succès !');
    }, 600);
  };

  const handleOpenEditWorkshop = () => {
    setEditWName(workshop.name);
    setEditWPhone(workshop.phone);
    setEditWAddress(workshop.address);
    setEditWCity(workshop.city);
    setEditWCountry(workshop.country);
    setEditWHours(workshop.openingHours);
    setEditWDesc(workshop.description);
    setEditWNifRccm(workshop.nifRccm || '');
    setWorkshopLogoUrl(workshop.logoUrl || '');
    setShowEditWorkshopModal(true);
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWName.trim()) return;

    setIsSavingWorkshop(true);
    setTimeout(() => {
      const updated = userService.saveWorkshopProfile({
        ...workshop,
        name: editWName,
        phone: editWPhone,
        address: editWAddress,
        city: editWCity,
        country: editWCountry,
        openingHours: editWHours,
        description: editWDesc,
        nifRccm: editWNifRccm,
        logoUrl: workshopLogoUrl,
      });
      setWorkshop(updated);
      setIsSavingWorkshop(false);
      setShowEditWorkshopModal(false);
      showToast('Informations de l\'atelier enregistrées !');
    }, 600);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowSecurityModal(false);
      showToast('Mot de passe modifié avec succès !');
    }, 700);
  };

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    userService.saveNotificationSettings(updated);
    showToast('Préférences de notification mises à jour.');
  };

  const handleChangeSubscription = async (planId: SubscriptionPlanType) => {
    const plans: Record<SubscriptionPlanType, SubscriptionPlan> = {
      FREE: {
        id: 'FREE',
        name: 'Taylaxis Free',
        priceFCFA: 0,
        status: 'active',
        period: 'mensuel',
        features: ['Jusqu\'à 15 clients', 'Agenda de base', 'Reçus simples'],
        maxClients: 15,
        maxOrdersMonth: 20,
      },
      PRO: {
        id: 'PRO',
        name: 'Taylaxis Pro',
        priceFCFA: 5000,
        status: 'active',
        period: 'mensuel',
        startDate: 'Aujourd\'hui',
        nextBillingDate: 'Dans 30 jours',
        features: [
          'Clients illimités',
          'Catalogues de mensurations sur-mesure',
          'Rappels WhatsApp & SMS',
          'Impression reçus PDF & Logo Atelier',
          'Sauvegarde Cloud automatique',
        ],
        maxClients: 999,
        maxOrdersMonth: 999,
      },
      PREMIUM: {
        id: 'PREMIUM',
        name: 'Taylaxis Premium Multi-Atelier',
        priceFCFA: 10000,
        status: 'active',
        period: 'mensuel',
        startDate: 'Aujourd\'hui',
        nextBillingDate: 'Dans 30 jours',
        features: [
          'Tout le plan Pro',
          'Gestion multi-apprentis & employés',
          'Export comptable avancé',
          'Support téléphonique prioritaire 24/7',
        ],
        maxClients: 9999,
        maxOrdersMonth: 9999,
      },
    };

    const targetPlan = plans[planId];

    if (targetPlan.priceFCFA > 0) {
      showToast('Ouverture du paiement FCFA...');
      const launched = await paymentService.initiatePayment({
        amountFCFA: targetPlan.priceFCFA,
        description: `Abonnement ${targetPlan.name} (1 mois)`,
        customerName: userProfile.fullName || 'Tailleur Taylaxis',
        customerEmail: userProfile.email,
        customerPhone: userProfile.phone,
        onSuccess: (txId) => {
          const newPlan = userService.saveSubscriptionPlan(targetPlan);
          setSubscription(newPlan);
          setShowSubscriptionModal(false);
          showToast(`Succès ! Abonnement ${newPlan.name} activé (Réf: ${txId}) !`);
        },
        onError: (err) => {
          showToast(`Paiement: ${err}`);
        },
      });

      if (!launched) {
        const newPlan = userService.saveSubscriptionPlan(targetPlan);
        setSubscription(newPlan);
        setShowSubscriptionModal(false);
        showToast(`Abonnement ${newPlan.name} activé (Mode démonstration).`);
      }
    } else {
      const newPlan = userService.saveSubscriptionPlan(targetPlan);
      setSubscription(newPlan);
      setShowSubscriptionModal(false);
      showToast(`Formule ${newPlan.name} sélectionnée !`);
    }
  };

  const handleSubmitBugReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) return;

    setIsSubmittingBug(true);
    setTimeout(() => {
      setIsSubmittingBug(false);
      setBugDescription('');
      setShowReportBugModal(false);
      showToast('Votre message a été transmis à l\'équipe Taylaxis !');
    }, 700);
  };

  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmText.toUpperCase() !== 'SUPPRIMER') return;
    localStorage.clear();
    setShowDeleteAccountModal(false);
    if (onSignOut) {
      onSignOut();
    } else {
      window.location.reload();
    }
  };

  const handleSignOutConfirm = () => {
    setShowSignOutModal(false);
    showToast('Déconnexion en cours...');
    setTimeout(() => {
      if (onSignOut) {
        onSignOut();
      } else {
        window.location.reload();
      }
    }, 400);
  };

  const accentColors = [
    { name: 'Violet Signature', hex: '#7C3AED' },
    { name: 'Bleu Taylaxis', hex: '#2563EB' },
    { name: 'Vert Émeraude', hex: '#10B981' },
    { name: 'Orange Chaud', hex: '#D97B1F' },
    { name: 'Rouge Rubis', hex: '#EF4444' },
  ];

  return (
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner transition-colors duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-xl text-caption font-bold text-white flex items-center space-x-2 animate-fadeIn ${
            toastType === 'success' ? 'bg-[#10B981]' : 'bg-red-500'
          }`}
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-surface rounded-[24px] p-5 border border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative group">
            {profileAvatarUrl ? (
              <img
                src={profileAvatarUrl}
                alt={userProfile.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#7C3AED]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-extrabold text-2xl flex items-center justify-center flex-shrink-0 border border-[#7C3AED]/30">
                {userProfile.fullName ? userProfile.fullName[0].toUpperCase() : 'T'}
              </div>
            )}
            <button
              onClick={handleOpenEditProfile}
              className="absolute -bottom-1 -right-1 bg-[#7C3AED] text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Changer la photo"
            >
              <Camera size={12} />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-h2 font-bold text-primary">{userProfile.fullName}</h2>
              {userProfile.isVerified && (
                <span className="inline-flex items-center text-[11px] font-bold text-[#10B981] bg-[#D1FAE5] dark:bg-[#064E3B] dark:text-[#6EE7B7] px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} className="mr-0.5" />
                  Vérifié
                </span>
              )}
            </div>
            <p className="text-caption text-secondary font-medium mt-0.5">
              {userProfile.role} • {workshop.name}
            </p>
            <p className="text-caption text-tertiary">{userProfile.phone}</p>
          </div>
        </div>

        <button
          onClick={handleOpenEditProfile}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] rounded-[14px] text-caption font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <User size={16} />
          <span>Modifier le profil</span>
        </button>
      </div>

      {onViewLandingPage && (
        <button
          onClick={onViewLandingPage}
          className="w-full p-4 bg-gradient-to-r from-[#0C0A27] via-[#1D1850] to-[#3155C8] text-white rounded-[22px] flex items-center justify-between text-left cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-98 border border-white/10"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#7C3AED] to-[#3155C8] text-white flex items-center justify-center font-bold shadow-xs">
              🌐
            </div>
            <div>
              <div className="text-body-strong font-extrabold text-white">Landing Page Officielle Taylaxis</div>
              <div className="text-caption text-white/70 font-medium">Présentation complète de la plateforme SaaS</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#A78BFA]" />
        </button>
      )}

      {/* SECTION 1: PROFIL ET ATELIER */}
      <div className="space-y-3">
        <label className="text-micro font-bold text-secondary tracking-wider block px-1">
          Compte & Atelier
        </label>

        <div className="bg-surface rounded-[20px] border border-subtle divide-y divide-subtle overflow-hidden shadow-xs">
          {/* Mon Profil */}
          <button
            onClick={handleOpenEditProfile}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Mon Profil</div>
                <div className="text-caption text-tertiary">Nom, téléphone, email & langue</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>

          {/* Mon Atelier */}
          <button
            onClick={handleOpenEditWorkshop}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                <Building size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Mon Atelier</div>
                <div className="text-caption text-tertiary">{workshop.name} • Horaires & Adresse</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>
        </div>
      </div>

      {/* SECTION 2: ABONNEMENT ET PAIEMENTS */}
      <div className="space-y-3">
        <label className="text-micro font-bold text-secondary tracking-wider block px-1">
          Abonnement & Facturation Taylaxis
        </label>

        <div className="bg-surface rounded-[20px] border border-subtle divide-y divide-subtle overflow-hidden shadow-xs">
          {/* Formule actuelle */}
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-body font-semibold text-primary">{subscription.name}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981]">
                    {subscription.status === 'active' ? 'Actif' : 'Essai'}
                  </span>
                </div>
                <div className="text-caption text-tertiary">
                  {subscription.priceFCFA === 0
                    ? 'Formule Gratuite'
                    : `${subscription.priceFCFA.toLocaleString('fr-FR')} FCFA / mois`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-caption text-[#7C3AED] font-bold">
              <span>Gérer</span>
              <ChevronRight size={18} />
            </div>
          </button>

          {/* Historique des paiements */}
          <button
            onClick={() => setShowPaymentsModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#D97B1F]/10 text-[#D97B1F] flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Historique des paiements</div>
                <div className="text-caption text-tertiary">Consulter les reçus et factures Taylaxis</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>
        </div>
      </div>

      {/* SECTION 3: APPARENCE & PERSONNALISATION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-micro font-bold text-secondary tracking-wider block">
            Apparence & Personnalisation
          </label>
        </div>

        <div className="bg-surface rounded-[24px] p-4 border border-subtle space-y-4 shadow-xs">

          {/* Text Scale Selector */}
          <div className="pt-2 border-t border-subtle flex items-center justify-between">
            <span className="text-body font-semibold text-primary">Taille du texte</span>
            <div className="flex space-x-1 bg-surface-alt p-1 rounded-[12px] border border-subtle">
              {(['small', 'medium', 'large'] as TextScale[]).map((scale) => {
                const labels = { small: 'Petit', medium: 'Moyen', large: 'Grand' };
                const isSelected = textScale === scale;
                return (
                  <button
                    key={scale}
                    onClick={() => setTextScale(scale)}
                    className={`px-3 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {labels[scale]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Palette Picker */}
          <div className="pt-2 border-t border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body font-semibold text-primary">Couleur d'accentuation</span>
              <span className="text-caption text-[#7C3AED] font-mono font-bold">{brandColor}</span>
            </div>
            <div className="flex items-center space-x-3 overflow-x-auto pb-1 no-scrollbar">
              {accentColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setBrandColor(c.hex)}
                  className="relative w-9 h-9 rounded-full transition-transform active:scale-90 flex-shrink-0 cursor-pointer shadow-xs"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={`Couleur ${c.name}`}
                >
                  {brandColor.toLowerCase() === c.hex.toLowerCase() && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              ))}
              <label
                className="relative w-9 h-9 rounded-full border border-subtle bg-surface-alt flex items-center justify-center cursor-pointer hover:border-[#7C3AED] transition-colors flex-shrink-0"
                title="Choisir une couleur sur mesure"
              >
                <Palette size={16} className="text-secondary" />
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: NOTIFICATIONS & PRÉFÉRENCES */}
      <div className="space-y-3">
        <label className="text-micro font-bold text-secondary tracking-wider block px-1">
          Préférences de notifications
        </label>

        <div className="bg-surface rounded-[24px] p-4 border border-subtle space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-[#7C3AED]" />
              <div>
                <div className="text-body font-semibold text-primary">Rappels de livraisons proches</div>
                <div className="text-caption text-tertiary">Alertes avant les échéances clients</div>
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('ordersDeliveryNear')}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                notifications.ordersDeliveryNear ? 'bg-[#7C3AED] justify-end' : 'bg-subtle justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
          </div>

          <div className="pt-2 border-t border-subtle flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-[#2563EB]" />
              <div>
                <div className="text-body font-semibold text-primary">Rendez-vous & Essayages</div>
                <div className="text-caption text-tertiary">Rappels pour les rendez-vous du jour</div>
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('appointmentsFitting')}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                notifications.appointmentsFitting ? 'bg-[#7C3AED] justify-end' : 'bg-subtle justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
          </div>

          <div className="pt-2 border-t border-subtle flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-[#10B981]" />
              <div>
                <div className="text-body font-semibold text-primary">Paiements & Nouveaux soldes</div>
                <div className="text-caption text-tertiary">Notifications de règlements clients</div>
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('paymentsReceived')}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                notifications.paymentsReceived ? 'bg-[#7C3AED] justify-end' : 'bg-subtle justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-[#FFFFFF] rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: SÉCURITÉ & CONFIDENTIALITÉ */}
      <div className="space-y-3">
        <label className="text-micro font-bold text-secondary tracking-wider block px-1">
          Sécurité & Confidentialité
        </label>

        <div className="bg-surface rounded-[20px] border border-subtle divide-y divide-subtle overflow-hidden shadow-xs">
          {/* Sécurité et mot de passe */}
          <button
            onClick={() => setShowSecurityModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Sécurité du compte</div>
                <div className="text-caption text-tertiary">Mot de passe & Sessions actives</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>

          {/* Confidentialité & Données */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Confidentialité & Données</div>
                <div className="text-caption text-tertiary">Politique de confidentialité & RGPD</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>
        </div>
      </div>

      {/* SECTION 6: AIDE, SUPPORT ET À PROPOS */}
      <div className="space-y-3">
        <label className="text-micro font-bold text-secondary tracking-wider block px-1">
          Support & Informations
        </label>

        <div className="bg-surface rounded-[20px] border border-subtle divide-y divide-subtle overflow-hidden shadow-xs">
          {/* Aide et assistance */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Aide & FAQ</div>
                <div className="text-caption text-tertiary">Tutoriels, questions fréquentes & assistance</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>

          {/* Signaler un problème */}
          <button
            onClick={() => setShowReportBugModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#D97B1F]/10 text-[#D97B1F] flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">Signaler un problème</div>
                <div className="text-caption text-tertiary">Proposer une amélioration ou signaler un bug</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>

          {/* À propos de Taylaxis */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                <Info size={20} />
              </div>
              <div>
                <div className="text-body font-semibold text-primary">À propos de Taylaxis</div>
                <div className="text-caption text-tertiary">Version v1.0.0 • Mentions légales</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>
        </div>
      </div>

      {/* SECTION 7: DÉCONNEXION & DESTRUCTION */}
      <div className="pt-2 space-y-3">
        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full py-3.5 px-4 bg-surface hover:bg-red-500/10 border border-red-500/20 text-red-500 rounded-[20px] text-body-strong font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
        >
          <LogOut size={18} />
          <span>Se déconnecter de Taylaxis</span>
        </button>

        <div className="text-center">
          <button
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteAccountModal(true);
            }}
            className="text-caption text-tertiary hover:text-red-500 transition-colors cursor-pointer inline-flex items-center space-x-1"
          >
            <Trash2 size={13} />
            <span>Supprimer mon compte et mes données</span>
          </button>
        </div>
      </div>

      {/* App Version Info Footer */}
      <div className="pt-2 text-center text-caption text-tertiary space-y-1">
        <p className="font-semibold text-secondary">Taylaxis v1.0.0 (Production Build)</p>
        <p>Le carnet numérique du tailleur africain moderne</p>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: MODIFIER LE PROFIL */}
      {/* ========================================================================= */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <User size={20} className="text-[#7C3AED]" />
                <span>Modifier mon profil</span>
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {profileError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-[12px] text-caption font-bold text-red-500">
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Photo de profil URL / Preview */}
              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Photo de profil (URL ou image)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profileAvatarUrl}
                    onChange={(e) => setProfileAvatarUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                  {profileAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatarUrl('')}
                      className="px-3 py-2 bg-red-500/10 text-red-500 text-caption font-bold rounded-[12px] hover:bg-red-500/20"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption text-secondary font-semibold block mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-caption text-secondary font-semibold block mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Langue de l'application</label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Français (FR)">Français (FR)</option>
                  <option value="English (EN)">English (EN)</option>
                  <option value="Ewe (Togo)">Ewé (Togo)</option>
                  <option value="Fon (Bénin)">Fon (Bénin)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-body font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingProfile ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MODIFIER L'ATELIER */}
      {/* ========================================================================= */}
      {showEditWorkshopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <Building size={20} className="text-[#2563EB]" />
                <span>Informations de l'Atelier</span>
              </h3>
              <button
                onClick={() => setShowEditWorkshopModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-3.5">
              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Nom commercial de l'atelier
                </label>
                <input
                  type="text"
                  required
                  value={editWName}
                  onChange={(e) => setEditWName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Logo de l'atelier (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={workshopLogoUrl}
                  onChange={(e) => setWorkshopLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption text-secondary font-semibold block mb-1">
                    Téléphone pro
                  </label>
                  <input
                    type="text"
                    value={editWPhone}
                    onChange={(e) => setEditWPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-caption text-secondary font-semibold block mb-1">Ville</label>
                  <input
                    type="text"
                    value={editWCity}
                    onChange={(e) => setEditWCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Adresse complète</label>
                <input
                  type="text"
                  value={editWAddress}
                  onChange={(e) => setEditWAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Horaires d'ouverture</label>
                <input
                  type="text"
                  value={editWHours}
                  onChange={(e) => setEditWHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  NIF / RCCM (Mention factures)
                </label>
                <input
                  type="text"
                  placeholder="ex: NIF 100234598"
                  value={editWNifRccm}
                  onChange={(e) => setEditWNifRccm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Description courte</label>
                <textarea
                  rows={2}
                  value={editWDesc}
                  onChange={(e) => setEditWDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditWorkshopModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingWorkshop}
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-body font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingWorkshop ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ABONNEMENT TAYLAXIS */}
      {/* ========================================================================= */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <CreditCard size={20} className="text-[#10B981]" />
                <span>Formules d'Abonnement Taylaxis</span>
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* FREE PLAN */}
              <div
                className={`p-4 rounded-[18px] border transition-all ${
                  subscription.id === 'FREE'
                    ? 'border-[#10B981] bg-[#10B981]/10'
                    : 'border-subtle bg-surface-alt'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-body-strong font-bold text-primary">FREE</h4>
                    <p className="text-caption text-secondary">0 FCFA / mois</p>
                  </div>
                  {subscription.id === 'FREE' ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#10B981] text-white text-xs font-bold">
                      Actuel
                    </span>
                  ) : (
                    <button
                      onClick={() => handleChangeSubscription('FREE')}
                      className="px-3 py-1.5 rounded-[12px] bg-surface text-primary border border-subtle text-caption font-bold hover:bg-surface-alt"
                    >
                      Choisir
                    </button>
                  )}
                </div>
              </div>

              {/* PRO PLAN */}
              <div
                className={`p-4 rounded-[18px] border transition-all ${
                  subscription.id === 'PRO'
                    ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                    : 'border-subtle bg-surface-alt'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-body-strong font-bold text-primary">PRO</h4>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-[#7C3AED] text-white rounded-full">
                        Recommandé
                      </span>
                    </div>
                    <p className="text-caption text-[#7C3AED] font-bold">5 000 FCFA / mois</p>
                  </div>
                  {subscription.id === 'PRO' ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#7C3AED] text-white text-xs font-bold">
                      Actuel
                    </span>
                  ) : (
                    <button
                      onClick={() => handleChangeSubscription('PRO')}
                      className="px-3 py-1.5 rounded-[12px] bg-[#7C3AED] text-white text-caption font-bold hover:bg-[#6D28D9]"
                    >
                      Choisir PRO
                    </button>
                  )}
                </div>
                <ul className="mt-3 text-caption text-secondary space-y-1">
                  <li>✓ Clients & Commandes illimités</li>
                  <li>✓ Reçus PDF avec votre logo</li>
                  <li>✓ Rappels clients WhatsApp & SMS</li>
                </ul>
              </div>

              {/* PREMIUM PLAN */}
              <div
                className={`p-4 rounded-[18px] border transition-all ${
                  subscription.id === 'PREMIUM'
                    ? 'border-[#2563EB] bg-[#2563EB]/10'
                    : 'border-subtle bg-surface-alt'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-body-strong font-bold text-primary">PREMIUM (Multi-Atelier)</h4>
                    <p className="text-caption text-[#2563EB] font-bold">10 000 FCFA / mois</p>
                  </div>
                  {subscription.id === 'PREMIUM' ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#2563EB] text-white text-xs font-bold">
                      Actuel
                    </span>
                  ) : (
                    <button
                      onClick={() => handleChangeSubscription('PREMIUM')}
                      className="px-3 py-1.5 rounded-[12px] bg-[#2563EB] text-white text-caption font-bold hover:bg-[#1D4ED8]"
                    >
                      Choisir Premium
                    </button>
                  )}
                </div>
                <ul className="mt-3 text-caption text-secondary space-y-1">
                  <li>✓ Gestion d'équipe & apprentis</li>
                  <li>✓ Support prioritaire 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PAIEMENTS ET REÇUS */}
      {/* ========================================================================= */}
      {showPaymentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <Receipt size={20} className="text-[#D97B1F]" />
                <span>Paiements Taylaxis</span>
              </h3>
              <button
                onClick={() => setShowPaymentsModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-[16px] bg-surface-alt border border-subtle flex items-center justify-between"
                >
                  <div>
                    <div className="text-body-strong font-bold text-primary">{p.planName}</div>
                    <div className="text-caption text-tertiary">
                      {p.date} • Réf: {p.reference}
                    </div>
                    <div className="text-micro text-secondary font-mono mt-0.5">{p.paymentMethod}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-strong font-bold text-[#10B981]">
                      {p.amountFCFA.toLocaleString('fr-FR')} FCFA
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#10B981]/20 text-[#10B981]">
                      Payé
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SÉCURITÉ & MOT DE PASSE */}
      {/* ========================================================================= */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <Lock size={20} className="text-[#EF4444]" />
                <span>Sécurité du Compte</span>
              </h3>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-[12px] text-caption font-bold text-red-500">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-2 border-t border-subtle space-y-2">
                <label className="text-micro font-bold text-secondary tracking-wider block">
                  Session active
                </label>
                <div className="p-3 rounded-[14px] bg-surface-alt border border-subtle flex items-center justify-between text-caption">
                  <div>
                    <span className="font-bold text-primary block">Appareil actuel (Android/Browser)</span>
                    <span className="text-tertiary">Lomé, Togo • En ligne</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded-full">
                    Actif
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex-1 py-3 bg-[#EF4444] text-white rounded-[14px] text-body font-semibold hover:bg-red-600 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingPassword ? 'Mise à jour...' : 'Changer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CONFIDENTIALITÉ */}
      {/* ========================================================================= */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <FileText size={20} className="text-[#7C3AED]" />
                <span>Confidentialité & Données</span>
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-caption text-secondary">
              <p>
                <strong>Vos données restent votre propriété exclusive.</strong> Taylaxis ne vend ni ne partage les mesures ou informations financières de vos clients.
              </p>
              <p>
                Chaque atelier dispose d'un espace sécurisé et isolé par des politiques RLS (Row Level Security) hébergées sur Supabase Cloud.
              </p>
              <div className="p-3 bg-surface-alt rounded-[14px] border border-subtle space-y-1">
                <span className="font-bold text-primary block">Protection & Chiffrement</span>
                <span>Toutes les communications réseau utilisent HTTPS/TLS. Vos sauvegardes cloud sont chiffrées au repos.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: AIDE & FAQ */}
      {/* ========================================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <HelpCircle size={20} className="text-[#2563EB]" />
                <span>Aide & FAQ Taylaxis</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <details className="p-3.5 bg-surface-alt rounded-[16px] border border-subtle cursor-pointer group">
                <summary className="text-body-strong font-bold text-primary flex items-center justify-between">
                  <span>Comment ajouter un nouveau client et ses mensurations ?</span>
                  <ChevronRight size={16} className="text-tertiary group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-caption text-secondary mt-2">
                  Rendez-vous sur la page <strong>Clients</strong> et cliquez sur le bouton <strong>+ Nouveau Client</strong>. Vous pourrez enregistrer son nom, téléphone ainsi que ses mesures de référence.
                </p>
              </details>

              <details className="p-3.5 bg-surface-alt rounded-[16px] border border-subtle cursor-pointer group">
                <summary className="text-body-strong font-bold text-primary flex items-center justify-between">
                  <span>Mes données sont-elles conservées si je change de téléphone ?</span>
                  <ChevronRight size={16} className="text-tertiary group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-caption text-secondary mt-2">
                  Oui ! En vous connectant à votre compte Taylaxis sur le nouvel appareil, vous retrouverez l'ensemble de votre atelier, clients et commandes synchronisés automatiquement depuis le cloud.
                </p>
              </details>

              <details className="p-3.5 bg-surface-alt rounded-[16px] border border-subtle cursor-pointer group">
                <summary className="text-body-strong font-bold text-primary flex items-center justify-between">
                  <span>Comment contacter l'assistance Taylaxis ?</span>
                  <ChevronRight size={16} className="text-tertiary group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 flex space-x-2">
                  <a
                    href="https://wa.me/22890000000"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-[#25D366] text-white rounded-[12px] text-caption font-bold flex items-center justify-center space-x-1.5"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: SIGNALER UN PROBLÈME */}
      {/* ========================================================================= */}
      {showReportBugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary flex items-center space-x-2">
                <AlertTriangle size={20} className="text-[#D97B1F]" />
                <span>Signaler un problème</span>
              </h3>
              <button
                onClick={() => setShowReportBugModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBugReport} className="space-y-3.5">
              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Catégorie</label>
                <select
                  value={bugCategory}
                  onChange={(e) => setBugCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Affichage">Affichage & Thème</option>
                  <option value="Commandes">Commandes & Client</option>
                  <option value="Paiements">Paiements & Abonnement</option>
                  <option value="Suggestion">Suggestion de fonction</option>
                </select>
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Décrivez ce qui s'est passé..."
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportBugModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBug}
                  className="flex-1 py-3 bg-[#D97B1F] text-white rounded-[14px] text-body font-semibold hover:bg-amber-600 cursor-pointer shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>{isSubmittingBug ? 'Envoi...' : 'Envoyer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: À PROPOS */}
      {/* ========================================================================= */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
              T
            </div>
            <div>
              <h3 className="text-h1 font-bold text-primary">Taylaxis SaaS</h3>
              <p className="text-caption text-secondary">v1.0.0 (Production)</p>
            </div>
            <p className="text-caption text-tertiary">
              Le carnet de couture numérique pensé spécifiquement pour les ateliers et maîtres tailleurs.
            </p>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3 bg-[#7C3AED] text-white rounded-[14px] text-body font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: DÉCONNEXION */}
      {/* ========================================================================= */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <LogOut size={24} />
            </div>
            <div>
              <h3 className="text-h2 font-bold text-primary">Se déconnecter ?</h3>
              <p className="text-caption text-secondary mt-1">
                Vous devrez vous réauthentifier pour accéder à votre atelier.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSignOutConfirm}
                className="flex-1 py-3 bg-red-500 text-white rounded-[14px] text-body font-semibold hover:bg-red-600 cursor-pointer shadow-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11: SUPPRESSION COMPTE (DANGER ZONE) */}
      {/* ========================================================================= */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-red-500/40 p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-red-500 pb-2 border-b border-subtle">
              <AlertTriangle size={22} />
              <h3 className="text-h2 font-bold">Zone de Danger — Suppression</h3>
            </div>

            <p className="text-caption text-secondary">
              Cette action est <strong>définitive</strong>. Toutes les données de votre atelier, vos clients et vos historiques de commandes seront supprimés du serveur.
            </p>

            <div>
              <label className="text-caption text-secondary font-semibold block mb-1">
                Saisissez <strong>SUPPRIMER</strong> pour confirmer :
              </label>
              <input
                type="text"
                placeholder="SUPPRIMER"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-red-500/30 rounded-[14px] text-body text-primary focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
              >
                Annuler
              </button>
              <button
                disabled={deleteConfirmText.toUpperCase() !== 'SUPPRIMER'}
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-3 bg-red-600 text-white rounded-[14px] text-body font-semibold hover:bg-red-700 cursor-pointer shadow-sm disabled:opacity-40"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
