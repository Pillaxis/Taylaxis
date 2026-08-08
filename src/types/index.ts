export type ThemeMode = 'light' | 'dark' | 'system';
export type TextScale = 'small' | 'medium' | 'large';

export type StatusType = 'new' | 'progress' | 'review' | 'ready' | 'done' | 'cancelled' | 'late' | 'to_deliver' | 'upcoming';

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
}

export interface Appointment {
  id: string;
  time: string;
  duration?: string;
  clientName: string;
  type: 'Essayage' | 'Livraison' | 'Rendez-vous' | 'Prise de mesures';
  badgeLabel?: string;
  garment?: string;
  colorCategory: 'purple' | 'orange' | 'red' | 'blue';
  date: string; // e.g. "2024-05-14"
}
