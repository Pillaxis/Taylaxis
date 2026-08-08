import type {
  UserProfile,
  WorkshopProfile,
  SubscriptionPlan,
  TaylaxisPayment,
  NotificationSettings,
} from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_nasser_01',
  firstName: 'Nasser',
  lastName: 'Diallo',
  fullName: 'Nasser Diallo',
  phone: '+228 90 12 34 56',
  email: 'nasser.tailleur@taylaxis.app',
  avatarUrl: '',
  role: 'Maître Tailleur',
  isVerified: true,
  language: 'Français (FR)',
};

export const DEFAULT_WORKSHOP_PROFILE: WorkshopProfile = {
  id: 'wks_01',
  name: 'Atelier Nasser Haute Couture',
  logoUrl: '',
  phone: '+228 98 76 54 32',
  address: 'Rue des Nîmes, Quartier Bè Boulevard',
  city: 'Lomé',
  country: 'Togo',
  openingHours: 'Lun - Sam : 08h00 - 19h00',
  description: 'Atelier de couture haut de gamme spécialisé en costumes sur-mesure, boubous traditionnels et robes d\'apparat.',
  nifRccm: 'NIF 100234598 / RCCM TG-LOM-2023-B-89',
};

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: 'PRO',
  name: 'Taylaxis Pro',
  priceFCFA: 5000,
  status: 'active',
  period: 'mensuel',
  startDate: '01 Août 2026',
  nextBillingDate: '01 Septembre 2026',
  features: [
    'Clients illimités',
    'Catalogues de mensurations personnalisés',
    'Rappels SMS & WhatsApp clients',
    'Impression de reçus & factures PDF',
    'Gestion de l\'agenda & rendez-vous d\'essayage',
    'Sauvegarde automatique Cloud',
  ],
  maxClients: 999,
  maxOrdersMonth: 999,
};

export const MOCK_PAYMENTS: TaylaxisPayment[] = [
  {
    id: 'pay_1092',
    amountFCFA: 5000,
    date: '01 Août 2026',
    planName: 'Abonnement Taylaxis Pro (1 mois)',
    status: 'succeeded',
    reference: 'TAY-20260801-889',
    paymentMethod: 'T-Money / Mobile Money (+228 90**34)',
  },
  {
    id: 'pay_0984',
    amountFCFA: 5000,
    date: '01 Juillet 2026',
    planName: 'Abonnement Taylaxis Pro (1 mois)',
    status: 'succeeded',
    reference: 'TAY-20260701-441',
    paymentMethod: 'T-Money / Mobile Money (+228 90**34)',
  },
  {
    id: 'pay_0821',
    amountFCFA: 5000,
    date: '01 Juin 2026',
    planName: 'Abonnement Taylaxis Pro (1 mois)',
    status: 'succeeded',
    reference: 'TAY-20260601-112',
    paymentMethod: 'Carte Visa (*4242)',
  },
];

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

class UserService {
  private USER_KEY = 'taylaxis_user_profile';
  private WORKSHOP_KEY = 'taylaxis_workshop_profile';
  private SUBSCRIPTION_KEY = 'taylaxis_subscription_plan';
  private NOTIFICATIONS_KEY = 'taylaxis_notification_settings';

  getUserProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(this.USER_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  saveUserProfile(profile: UserProfile): UserProfile {
    profile.fullName = `${profile.firstName} ${profile.lastName}`.trim();
    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
    return profile;
  }

  getWorkshopProfile(): WorkshopProfile {
    try {
      const saved = localStorage.getItem(this.WORKSHOP_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WORKSHOP_PROFILE;
    } catch {
      return DEFAULT_WORKSHOP_PROFILE;
    }
  }

  saveWorkshopProfile(workshop: WorkshopProfile): WorkshopProfile {
    localStorage.setItem(this.WORKSHOP_KEY, JSON.stringify(workshop));
    return workshop;
  }

  getSubscriptionPlan(): SubscriptionPlan {
    try {
      const saved = localStorage.getItem(this.SUBSCRIPTION_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTION_PLAN;
    } catch {
      return DEFAULT_SUBSCRIPTION_PLAN;
    }
  }

  saveSubscriptionPlan(plan: SubscriptionPlan): SubscriptionPlan {
    localStorage.setItem(this.SUBSCRIPTION_KEY, JSON.stringify(plan));
    return plan;
  }

  getPayments(): TaylaxisPayment[] {
    return MOCK_PAYMENTS;
  }

  getNotificationSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem(this.NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  saveNotificationSettings(settings: NotificationSettings): NotificationSettings {
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(settings));
    return settings;
  }
}

export const userService = new UserService();
