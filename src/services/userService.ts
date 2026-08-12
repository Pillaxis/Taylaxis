import type {
  UserProfile,
  WorkshopProfile,
  SubscriptionPlan,
  TaylaxisPayment,
  NotificationSettings,
} from '../types';
import { taylaxisDb, queueOutboxOperation } from '../db/taylaxisDb';

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
  name: 'Forfait Gratuit',
  priceFCFA: 0,
  status: 'active',
  period: 'mensuel',
  startDate: "Aujourd'hui",
  nextBillingDate: 'Dans 30 jours',
  features: [
    'Ajouter et gérer des clients',
    'Enregistrer et consulter les mensurations des clients',
  ],
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
    taylaxisDb.user_profiles
      .put({ ...profile, updated_at: new Date().toISOString() })
      .then(() => {
        queueOutboxOperation({
          user_id: profile.id,
          entity_type: 'user_profile',
          entity_id: profile.id || 'usr_self',
          operation_type: 'UPDATE',
          payload: {
            id: profile.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            full_name: profile.fullName,
            phone: profile.phone,
            email: profile.email,
            avatar_url: profile.avatarUrl,
            role: profile.role,
            language: profile.language,
          },
        }).catch(console.error);
      })
      .catch(console.error);
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
    taylaxisDb.workshop_profiles
      .put({ ...workshop, updated_at: new Date().toISOString() })
      .then(() => {
        queueOutboxOperation({
          user_id: workshop.id,
          entity_type: 'workshop_profile',
          entity_id: workshop.id || 'wks_self',
          operation_type: 'UPDATE',
          payload: {
            id: workshop.id,
            name: workshop.name,
            phone: workshop.phone,
            address: workshop.address,
            city: workshop.city,
            country: workshop.country,
            opening_hours: workshop.openingHours,
            description: workshop.description,
            nif_rccm: workshop.nifRccm,
          },
        }).catch(console.error);
      })
      .catch(console.error);
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
