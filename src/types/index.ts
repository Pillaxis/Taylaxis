export type ThemeMode = 'light' | 'dark' | 'system';
export type TextScale = 'small' | 'medium' | 'large';

export type StatusType = 'new' | 'progress' | 'review' | 'ready' | 'done' | 'cancelled' | 'late' | 'to_deliver' | 'upcoming';

export type ManufacturingStatus =
  | 'BROUILLON'
  | 'CONFIRMEE'
  | 'EN_COURS'
  | 'PRETE'
  | 'A_LIVRER'
  | 'LIVREE'
  | 'TERMINEE';

export type PaymentStatus = 'NON_PAYEE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE';

export type DueDateStatus = 'A_TEMPS' | 'AUJOURD_HUI' | 'BIENTOT' | 'EN_RETARD';

export type OrderPriority = 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'NORMALE';

export interface OrderPaymentRecord {
  id: string;
  orderId: string;
  amountFCFA: number;
  date: string;
  paymentMethod: 'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CARTE' | 'AUTRE';
  reference?: string;
  note?: string;
}

export interface OrderHistoryEvent {
  id: string;
  orderId: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  performedBy?: string;
}

export interface OrderMeasurementSnapshot {
  takenAt: string;
  measurements: Measurement[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  avatarUrl?: string;
  initials: string;
  location?: string;
  status: 'actif' | 'prospect' | 'inactif';
  isNew?: boolean;
  lastOrderDate?: string;
  lastActivity?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  ageGroup?: 'adulte' | 'enfant';
  age?: number;
  notes?: string;
  totalSpentFCFA?: number;
  mensurationsCount?: number;
  customMeasurements?: Measurement[];
}

export interface Measurement {
  id: string;
  label: string;
  valueCm: number;
  iconName: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#024"
  clientName: string;
  clientId: string;
  title: string;
  priceFCFA: number;
  paidFCFA: number;
  balanceFCFA: number;
  orderDate: string;
  deliveryDate: string;
  status: StatusType;
  progressPercent?: number;

  // Taylaxis V1 Order Engine Multi-Dimensional Properties
  manufacturingStatus?: ManufacturingStatus;
  paymentStatus?: PaymentStatus;
  dueDateStatus?: DueDateStatus;
  priority?: OrderPriority;
  paymentHistory?: OrderPaymentRecord[];
  eventTimeline?: OrderHistoryEvent[];
  measurementSnapshot?: OrderMeasurementSnapshot;
  garmentType?: string;
  fabricNotes?: string;
}

export interface Appointment {
  id: string;
  time: string;
  duration?: string;
  clientName: string;
  clientId?: string;
  type: 'Essayage' | 'Livraison' | 'Rendez-vous' | 'Prise de mesures';
  badgeLabel?: string;
  garment?: string;
  colorCategory: 'purple' | 'orange' | 'red' | 'blue';
  date: string; // e.g. "2024-05-14"
  notes?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isVerified: boolean;
  language: string;
}

export interface WorkshopProfile {
  id: string;
  name: string;
  logoUrl?: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  openingHours: string;
  description: string;
  nifRccm?: string;
}

export type SubscriptionPlanType = 'FREE' | 'PRO';

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  priceFCFA: number;
  status: 'active' | 'expired' | 'canceled' | 'trial';
  period: 'mensuel' | 'annuel';
  startDate?: string;
  nextBillingDate?: string;
  features: string[];
  maxClients?: number;
  maxOrdersMonth?: number;
}

export interface TaylaxisPayment {
  id: string;
  amountFCFA: number;
  date: string;
  planName: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  reference: string;
  paymentMethod: string;
}

export interface NotificationSettings {
  ordersCreated: boolean;
  ordersStatusChange: boolean;
  ordersReady: boolean;
  ordersDeliveryNear: boolean;
  appointmentsFitting: boolean;
  appointmentsDelivery: boolean;
  paymentsReceived: boolean;
  paymentsBalance: boolean;
  systemSecurity: boolean;
  systemNews: boolean;
}

