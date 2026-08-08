import type {
  UserProfile,
  WorkshopProfile,
  SubscriptionPlan,
  TaylaxisPayment,
  NotificationSettings,
} from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_new',
  firstName: '',
  lastName: '',
  fullName: 'Tailleur Taylaxis',
  phone: '',
  email: '',
  avatarUrl: '',
  role: 'Maître Tailleur',
  isVerified: false,
  language: 'Français (FR)',
};

export const DEFAULT_WORKSHOP_PROFILE: WorkshopProfile = {
  id: 'wks_new',
  name: 'Mon Atelier de Couture',
  logoUrl: '',
  phone: '',
  address: '',
  city: 'Lomé',
  country: 'Togo',
  openingHours: 'Lun - Sam : 08h00 - 19h00',
  description: '',
  nifRccm: '',
};

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: 'FREE',
  name: 'Plan Démarrage Gratuit',
  priceFCFA: 0,
  status: 'active',
  period: 'mensuel',
  startDate: "Aujourd'hui",
  nextBillingDate: 'Dans 30 jours',
  features: [
    'Clients illimités',
    'Catalogues de mensurations personnalisés',
    'Suivi des commandes & versements',
    'Sauvegarde automatique Cloud',
  ],
  maxClients: 999,
  maxOrdersMonth: 999,
};

export const MOCK_PAYMENTS: TaylaxisPayment[] = [];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  ordersCreated: true,
  ordersStatusChange: true,
  ordersReady: true,
  ordersDeliveryNear: true,
  appointmentsFitting: true,
  appointmentsDelivery: true,
  paymentsReceived: true,
  paymentsBalance: true,
  systemSecurity: true,
  systemNews: false,
};

const STORAGE_KEY_PROFILE = 'taylaxis_user_profile';
const STORAGE_KEY_WORKSHOP = 'taylaxis_workshop_profile';
const STORAGE_KEY_SUB = 'taylaxis_sub_plan';
const STORAGE_KEY_NOTIFS = 'taylaxis_notif_settings';

export const userService = {
  getUserProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return DEFAULT_USER_PROFILE;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): UserProfile {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    return profile;
  },

  getWorkshopProfile(): WorkshopProfile {
    const raw = localStorage.getItem(STORAGE_KEY_WORKSHOP);
    if (!raw) return DEFAULT_WORKSHOP_PROFILE;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_WORKSHOP_PROFILE;
    }
  },

  saveWorkshopProfile(workshop: WorkshopProfile): WorkshopProfile {
    localStorage.setItem(STORAGE_KEY_WORKSHOP, JSON.stringify(workshop));
    return workshop;
  },

  getSubscriptionPlan(): SubscriptionPlan {
    const raw = localStorage.getItem(STORAGE_KEY_SUB);
    if (!raw) return DEFAULT_SUBSCRIPTION_PLAN;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SUBSCRIPTION_PLAN;
    }
  },

  saveSubscriptionPlan(plan: SubscriptionPlan): SubscriptionPlan {
    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(plan));
    return plan;
  },

  getPayments(): TaylaxisPayment[] {
    return MOCK_PAYMENTS;
  },

  getNotificationSettings(): NotificationSettings {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  },

  saveNotificationSettings(notifs: NotificationSettings): NotificationSettings {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    return notifs;
  },
};
