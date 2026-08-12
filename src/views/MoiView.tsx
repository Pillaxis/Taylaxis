import React, { useState } from 'react';
import {
  User,
  Building,
  CreditCard,
  Receipt,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Camera,
  Check,
  X,
  AlertTriangle,
  Send,
  MessageCircle,
  Users,
  BookOpen,
  Globe,
  RefreshCw,
  WifiOff,
  LifeBuoy,
  Tv,
  Sliders,
  Sparkles,
  Clock,
  Store,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import { SubscriptionService } from '../services/subscriptionService';
import { SyncEngine } from '../services/syncEngine';
import { TAYLAXIS_PLANS } from '../config/plans';
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
  onSignOut: () => void;
}

export const MoiView: React.FC<MoiViewProps> = ({ onSignOut }) => {
  const { textScale, setTextScale } = useTheme();

  // State data
  const [userProfile, setUserProfile] = useState<UserProfile>(() => userService.getUserProfile());
  const [workshop, setWorkshop] = useState<WorkshopProfile>(() => userService.getWorkshopProfile());
  const [subscription, setSubscription] = useState<SubscriptionPlan>(() => userService.getSubscriptionPlan());
  const [payments] = useState<TaylaxisPayment[]>(() => userService.getPayments());
  const [notifications, setNotifications] = useState<NotificationSettings>(() => userService.getNotificationSettings());

  // Accordion state (all closed by default as in compact screenshot)
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  // UI Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  React.useEffect(() => {
    async function syncSub() {
      if (userProfile.id) {
        const liveSub = await SubscriptionService.fetchUserSubscription(userProfile.id);
        if (liveSub.isPro) {
          const proPlan: SubscriptionPlan = {
            id: 'PRO',
            name: 'Taylaxis Pro',
            priceFCFA: 5000,
            status: 'active',
            period: 'mensuel',
            startDate: liveSub.startedAt ? new Date(liveSub.startedAt).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
            nextBillingDate: liveSub.expiresAt ? new Date(liveSub.expiresAt).toLocaleDateString('fr-FR') : 'Dans 30 jours',
            features: [
              'Ajouter et gérer des clients',
              'Enregistrer et consulter les mensurations des clients',
              'Ajouter et gérer les commandes',
              'Planifier et gérer les rendez-vous',
              'Relancer les clients',
            ],
          };
          setSubscription(proPlan);
        } else {
          const freePlan: SubscriptionPlan = {
            id: 'FREE',
            name: 'Gratuit',
            priceFCFA: 0,
            status: 'active',
            period: 'mensuel',
            features: [
              'Ajouter et gérer des clients',
              'Enregistrer et consulter les mensurations des clients',
            ],
          };
          setSubscription(freePlan);
        }
      }
    }
    syncSub();
  }, [userProfile.id]);

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
  const [showSignOutModal, setShowSignOutModal] = useState(false);

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
        fullName: `${editFirstName.trim()} ${editLastName.trim()}`,
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
    if (planId === 'PRO') {
      showToast('Connexion à la passerelle FedaPay...');
      const serverRes = await SubscriptionService.createFedaPayment({
        userId: userProfile.id,
        email: userProfile.email,
        name: userProfile.fullName,
        phone: userProfile.phone,
        featureIntent: 'pro_upgrade',
      });

      if (serverRes.success && serverRes.url) {
        window.location.href = serverRes.url;
        return;
      }

      const launched = await paymentService.initiatePayment({
        amountFCFA: 5000,
        description: `Abonnement Taylaxis Pro (1 mois)`,
        customerName: userProfile.fullName || 'Tailleur Taylaxis',
        customerEmail: userProfile.email,
        customerPhone: userProfile.phone,
        onSuccess: async (txId) => {
          const verifyRes = await SubscriptionService.verifyTransaction(txId, userProfile.id);
          if (verifyRes.isPro) {
            setShowSubscriptionModal(false);
            showToast(`Succès ! Abonnement Taylaxis Pro activé avec succès !`);
            setSubscription({
              id: 'PRO',
              name: 'Taylaxis Pro',
              priceFCFA: 5000,
              status: 'active',
              period: 'mensuel',
              startDate: 'Aujourd\'hui',
              nextBillingDate: 'Dans 30 jours',
              features: TAYLAXIS_PLANS[1].features,
            });
          } else {
            showToast('Paiement non confirmé par FedaPay.');
          }
        },
        onError: (err) => {
          showToast(`Paiement non finalisé : ${err}`);
        },
      });

      if (!launched && !serverRes.success) {
        showToast(serverRes.error || 'Impossible de lancer FedaPay. Vérifiez vos clés et votre connexion.');
      }
    } else {
      setShowSubscriptionModal(false);
      setSubscription({
        id: 'FREE',
        name: 'Gratuit',
        priceFCFA: 0,
        status: 'active',
        period: 'mensuel',
        features: TAYLAXIS_PLANS[0].features,
      });
      showToast(`Votre compte utilise la formule Gratuit (0 FCFA/mois).`);
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

  const isProActive = subscription.id === 'PRO';

  return (
    <div className="-mt-3 pt-4 px-4 pb-28 bg-[#FAF9FE] rounded-t-[32px] space-y-4 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl transition-colors duration-200">
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

      {/* Carte profil */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EDE9F6] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative group flex-shrink-0">
            {profileAvatarUrl ? (
              <img
                src={profileAvatarUrl}
                alt={userProfile.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#7C3AED]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-extrabold text-2xl flex items-center justify-center flex-shrink-0 border border-[#7C3AED]/30">
                {userProfile.fullName ? userProfile.fullName[0].toUpperCase() : 'K'}
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

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-gray-900 truncate">
              {userProfile.fullName || 'Kossi A.'}
            </h2>
            <p className="text-sm font-medium text-gray-600 truncate mt-0.5">
              {workshop.name || 'Sourire pour la Beauté'}
            </p>
            <div className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] text-xs font-bold">
              Tailleur – Couturier
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenEditProfile}
          className="w-full sm:w-auto px-4 py-2 border border-[#7C3AED]/30 hover:bg-[#7C3AED]/10 text-[#7C3AED] rounded-[14px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 flex-shrink-0"
        >
          <User size={15} />
          <span>Modifier mon profil</span>
        </button>
      </div>

      {/* ACCORDION SECTIONS (All closed by default as shown in screenshot 2) */}
      <div className="space-y-3.5">

        {/* ACCORDION 1: MON ATELIER */}
        <div className="bg-white rounded-[24px] border border-[#EDE9F6] overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => toggleSection('atelier')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Store size={20} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Mon atelier</h3>
            </div>
            <div className="text-gray-400 p-1">
              {openSection === 'atelier' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </button>

          {openSection === 'atelier' && (
            <div className="border-t border-[#EDE9F6] divide-y divide-[#EDE9F6] bg-gray-50/40 animate-fadeIn">
              {/* Informations de l'atelier */}
              <button
                onClick={handleOpenEditWorkshop}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Informations de l'atelier</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Horaires d'ouverture */}
              <button
                onClick={handleOpenEditWorkshop}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Horaires d'ouverture</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Équipe / employés */}
              <button
                onClick={() => showToast('Gestion de l\'équipe disponible prochainement')}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Équipe / employés</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Catalogue */}
              <button
                onClick={() => showToast('Catalogue de modèles disponible dans votre atelier')}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Catalogue</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* ACCORDION 2: ABONNEMENT & PAIEMENT */}
        <div className="bg-white rounded-[24px] border border-[#EDE9F6] overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => toggleSection('abonnement')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Abonnement & paiement</h3>
            </div>
            <div className="text-gray-400 p-1">
              {openSection === 'abonnement' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </button>

          {openSection === 'abonnement' && (
            <div className="border-t border-[#EDE9F6] divide-y divide-[#EDE9F6] bg-gray-50/40 animate-fadeIn">
              {/* Mon abonnement (displays plan badge on right) */}
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Mon abonnement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 rounded-[12px] bg-[#F3E8FF] text-[#7C3AED] text-xs font-bold text-center">
                    <div>{isProActive ? 'Taylaxis Pro' : 'Gratuit'}</div>
                    <div className="text-[10px] font-normal text-[#7C3AED]/80">
                      {isProActive ? '5 000 FCFA / mois' : '0 FCFA / mois'}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </button>

              {/* Changer d'offre */}
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <RefreshCw size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Changer d'offre</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Historique des paiements */}
              <button
                onClick={() => setShowPaymentsModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Receipt size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Historique des paiements</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Mode de paiement */}
              <button
                onClick={() => setShowPaymentsModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Mode de paiement</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* ACCORDION 3: NOTIFICATIONS */}
        <div className="bg-white rounded-[24px] border border-[#EDE9F6] overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Bell size={20} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Notifications</h3>
            </div>
            <div className="text-gray-400 p-1">
              {openSection === 'notifications' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </button>

          {openSection === 'notifications' && (
            <div className="border-t border-[#EDE9F6] divide-y divide-[#EDE9F6] bg-gray-50/40 animate-fadeIn">
              {/* Notifications clients */}
              <div className="py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Notifications clients</span>
                </div>
                <button
                  onClick={() => handleToggleNotification('ordersCreated')}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                    notifications.ordersCreated ? 'bg-[#7C3AED] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Rappels de livraison */}
              <div className="py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Bell size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Rappels de livraison</span>
                </div>
                <button
                  onClick={() => handleToggleNotification('ordersDeliveryNear')}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                    notifications.ordersDeliveryNear ? 'bg-[#7C3AED] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Rappels de rendez-vous */}
              <div className="py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Rappels de rendez-vous</span>
                </div>
                <button
                  onClick={() => handleToggleNotification('appointmentsFitting')}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                    notifications.appointmentsFitting ? 'bg-[#7C3AED] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 4: PARAMÈTRES */}
        <div className="bg-white rounded-[24px] border border-[#EDE9F6] overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => toggleSection('parametres')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Sliders size={20} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Paramètres</h3>
            </div>
            <div className="text-gray-400 p-1">
              {openSection === 'parametres' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </button>

          {openSection === 'parametres' && (
            <div className="border-t border-[#EDE9F6] divide-y divide-[#EDE9F6] bg-gray-50/40 animate-fadeIn">
              {/* Paramètres généraux */}
              <div className="py-3.5 px-4 sm:px-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Sliders size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Paramètres généraux</span>
                </div>
                <div className="pl-11 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Taille du texte</span>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      {(['small', 'medium', 'large'] as TextScale[]).map((scale) => (
                        <button
                          key={scale}
                          onClick={() => setTextScale(scale)}
                          className={`px-2 py-0.5 text-xs font-bold rounded ${
                            textScale === scale ? 'bg-[#7C3AED] text-white' : 'text-gray-600'
                          }`}
                        >
                          {scale === 'small' ? 'P' : scale === 'medium' ? 'M' : 'G'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Langue */}
              <button
                onClick={handleOpenEditProfile}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Globe size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Langue</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Sécurité */}
              <button
                onClick={() => setShowSecurityModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Sécurité</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Confidentialité */}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Confidentialité</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Synchronisation */}
              <button
                onClick={async () => {
                  showToast('Synchronisation en cours...');
                  const res = await SyncEngine.sync();
                  if (res.success) {
                    showToast(`Synchronisation terminée (${res.pushed} envoyés, ${res.pulled} reçus)`);
                  } else {
                    showToast('Mode hors connexion - Données enregistrées en local');
                  }
                }}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <RefreshCw size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Synchroniser maintenant</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Mode hors connexion */}
              <div className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <WifiOff size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">Mode offline-first actif</span>
                    <span className="text-xs text-gray-500 block">Base local IndexedDB Dexie.js + Outbox queue</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 5: AIDE */}
        <div className="bg-white rounded-[24px] border border-[#EDE9F6] overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => toggleSection('aide')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-[14px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Aide</h3>
            </div>
            <div className="text-gray-400 p-1">
              {openSection === 'aide' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </button>

          {openSection === 'aide' && (
            <div className="border-t border-[#EDE9F6] divide-y divide-[#EDE9F6] bg-gray-50/40 animate-fadeIn">
              {/* Centre d'aide */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <LifeBuoy size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Centre d'aide</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Tutoriels */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <Tv size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Tutoriels</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Contacter Taylaxis */}
              <button
                onClick={() => window.open('https://wa.me/22890000000', '_blank')}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Contacter Taylaxis</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>

              {/* Signaler un problème */}
              <button
                onClick={() => setShowReportBugModal(true)}
                className="w-full py-3.5 px-4 sm:px-6 flex items-center justify-between hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Signaler un problème</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* FOOTER CARD: À propos & Se déconnecter (Matching Screenshot Architecture) */}
      <div className="pt-2">
        <div className="bg-[#F8FAFC] rounded-[24px] border border-[#EDE9F6] p-4 flex items-center justify-between shadow-2xs">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">À propos de Taylaxis</span>
            <span className="text-xs text-gray-500 font-medium mt-0.5">Version 1.0.0</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={() => setShowSignOutModal(true)}
              className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <LogOut size={18} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* MODAL 1: MODIFIER LE PROFIL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <User size={20} className="text-[#7C3AED]" />
                <span>Modifier mon profil</span>
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] text-xs font-bold text-red-600">
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">
                  Photo de profil (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={profileAvatarUrl}
                  onChange={(e) => setProfileAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700 font-semibold block mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 font-semibold block mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Téléphone</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-[14px] text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-sm font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingProfile ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MODIFIER L'ATELIER */}
      {showEditWorkshopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Building size={20} className="text-[#7C3AED]" />
                <span>Informations de l'Atelier</span>
              </h3>
              <button
                onClick={() => setShowEditWorkshopModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Nom de l'atelier</label>
                <input
                  type="text"
                  required
                  value={editWName}
                  onChange={(e) => setEditWName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Horaires d'ouverture</label>
                <input
                  type="text"
                  value={editWHours}
                  onChange={(e) => setEditWHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditWorkshopModal(false)}
                  className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-[14px] text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingWorkshop}
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-sm font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingWorkshop ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ABONNEMENT TAYLAXIS (STRICTLY 2 PLANS) */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[28px] border border-gray-200 p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-xl font-black text-gray-900 flex items-center space-x-2">
                <Sparkles size={22} className="text-[#7C3AED]" />
                <span>Forfaits Taylaxis</span>
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PLAN 1: GRATUIT */}
              <div
                className={`p-5 rounded-[22px] border flex flex-col justify-between space-y-4 transition-all ${
                  subscription.id === 'FREE'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div>
                  <h4 className="text-lg font-black text-gray-900">GRATUIT</h4>
                  <div className="text-2xl font-black text-gray-900 mt-1">0 FCFA<span className="text-xs text-gray-500 font-normal">/mois</span></div>
                  <ul className="mt-4 space-y-2 text-xs font-semibold text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#10B981] flex-shrink-0" />
                      <span>Clients</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#10B981] flex-shrink-0" />
                      <span>Mensurations</span>
                    </li>
                  </ul>
                </div>

                {subscription.id === 'FREE' ? (
                  <span className="w-full py-2.5 text-center text-xs font-bold text-gray-500 bg-gray-200 rounded-[14px]">
                    Plan Actuel
                  </span>
                ) : (
                  <button
                    onClick={() => handleChangeSubscription('FREE')}
                    className="w-full py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[14px] transition-colors cursor-pointer"
                  >
                    Sélectionner Gratuit
                  </button>
                )}
              </div>

              {/* PLAN 2: PRO */}
              <div
                className={`p-5 rounded-[22px] border flex flex-col justify-between space-y-4 transition-all relative ${
                  subscription.id === 'PRO'
                    ? 'border-[#7C3AED] bg-[#7C3AED]/5 shadow-md'
                    : 'border-[#7C3AED]/40 bg-white shadow-sm'
                }`}
              >
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-extrabold uppercase">
                  Recommandé
                </div>

                <div>
                  <h4 className="text-lg font-black text-[#7C3AED]">PRO</h4>
                  <div className="text-2xl font-black text-[#7C3AED] mt-1">5 000 FCFA<span className="text-xs text-gray-500 font-normal">/mois</span></div>
                  <ul className="mt-4 space-y-2 text-xs font-semibold text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span>Clients</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span>Mensurations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span>Commandes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span>Rendez-vous</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={14} className="text-[#7C3AED] flex-shrink-0" />
                      <span>Relances</span>
                    </li>
                  </ul>
                </div>

                {subscription.id === 'PRO' ? (
                  <span className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#7C3AED] rounded-[14px]">
                    Plan Actuel Pro
                  </span>
                ) : (
                  <button
                    onClick={() => handleChangeSubscription('PRO')}
                    className="w-full py-2.5 text-xs font-extrabold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-[14px] shadow-md transition-all cursor-pointer"
                  >
                    Passer à Pro
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PAIEMENTS ET REÇUS */}
      {showPaymentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Receipt size={20} className="text-[#7C3AED]" />
                <span>Paiements Taylaxis</span>
              </h3>
              <button
                onClick={() => setShowPaymentsModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Aucun paiement enregistré pour le moment.</p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-[16px] bg-gray-50 border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900">{p.planName}</div>
                      <div className="text-xs text-gray-500">{p.date} • Réf: {p.reference}</div>
                    </div>
                    <div className="text-right font-bold text-[#10B981]">
                      {p.amountFCFA.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SÉCURITÉ */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Shield size={20} className="text-[#7C3AED]" />
                <span>Sécurité du Compte</span>
              </h3>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] text-xs font-bold text-red-600">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-[14px] text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-sm font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingPassword ? 'Mise à jour...' : 'Changer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIDENTIALITÉ */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <FileText size={20} className="text-[#7C3AED]" />
                <span>Confidentialité & Données</span>
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed font-medium">
              <p>
                <strong>Vos données restent votre propriété exclusive.</strong> Taylaxis ne vend ni ne partage les mesures de vos clients.
              </p>
              <p>
                Chaque atelier dispose d'un espace sécurisé et isolé hébergé sur Supabase Cloud avec sauvegardes automatiques.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: AIDE & FAQ */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <HelpCircle size={20} className="text-[#7C3AED]" />
                <span>Aide Taylaxis</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p>Besoin d'assistance avec l'utilisation de l'application Taylaxis ?</p>
              <a
                href="https://wa.me/22890000000"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#25D366] text-white rounded-[14px] font-bold flex items-center justify-center space-x-2"
              >
                <MessageCircle size={18} />
                <span>Contacter le support WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: SIGNALER UN PROBLÈME */}
      {showReportBugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <AlertTriangle size={20} className="text-amber-500" />
                <span>Signaler un problème</span>
              </h3>
              <button
                onClick={() => setShowReportBugModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBugReport} className="space-y-3.5">
              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Catégorie</label>
                <select
                  value={bugCategory}
                  onChange={(e) => setBugCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Affichage">Affichage & Thème</option>
                  <option value="Commandes">Commandes & Client</option>
                  <option value="Paiements">Paiements & Abonnement</option>
                  <option value="Suggestion">Suggestion de fonction</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Décrivez ce qui s'est passé..."
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-sm text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportBugModal(false)}
                  className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-[14px] text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBug}
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-sm font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>{isSubmittingBug ? 'Envoi...' : 'Envoyer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: DÉCONNEXION */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-gray-200 p-5 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
              <LogOut size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Se déconnecter ?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Vous devrez vous réauthentifier pour accéder à votre atelier.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-[14px] text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSignOutConfirm}
                className="flex-1 py-3 bg-red-500 text-white rounded-[14px] text-sm font-semibold hover:bg-red-600 cursor-pointer shadow-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
