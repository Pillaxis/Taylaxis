import Dexie, { type Table } from 'dexie';
import type {
  Client,
  Order,
  Appointment,
  UserProfile,
  WorkshopProfile,
} from '../types';

export interface LocalOutboxItem {
  id: string;
  user_id?: string;
  entity_type: 'client' | 'order' | 'appointment' | 'user_profile' | 'workshop_profile';
  entity_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  retry_count: number;
  last_error?: string;
}

export interface LocalClientRecord extends Client {
  user_id?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface LocalOrderRecord extends Order {
  user_id?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface LocalAppointmentRecord extends Appointment {
  user_id?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface LocalUserProfileRecord extends UserProfile {
  updated_at: string;
}

export interface LocalWorkshopProfileRecord extends WorkshopProfile {
  user_id?: string;
  updated_at: string;
}

export interface LocalSubscriptionRecord {
  user_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'canceled';
  started_at?: string;
  expires_at?: string;
  transaction_id?: string;
  feature_intent?: string;
  updated_at: string;
}

export class TaylaxisDatabase extends Dexie {
  clients!: Table<LocalClientRecord, string>;
  orders!: Table<LocalOrderRecord, string>;
  appointments!: Table<LocalAppointmentRecord, string>;
  user_profiles!: Table<LocalUserProfileRecord, string>;
  workshop_profiles!: Table<LocalWorkshopProfileRecord, string>;
  subscriptions!: Table<LocalSubscriptionRecord, string>;
  outbox!: Table<LocalOutboxItem, string>;

  constructor() {
    super('TaylaxisOfflineDB');

    this.version(1).stores({
      clients: 'id, user_id, name, phone, status, updated_at, is_deleted',
      orders: 'id, user_id, clientId, orderNumber, manufacturingStatus, deliveryDate, updated_at, is_deleted',
      appointments: 'id, user_id, clientId, date, updated_at, is_deleted',
      user_profiles: 'id, updated_at',
      workshop_profiles: 'id, user_id, updated_at',
      subscriptions: 'user_id, plan, status, updated_at',
      outbox: 'id, user_id, entity_type, entity_id, sync_status, created_at, updated_at',
    });
  }
}

export const taylaxisDb = new TaylaxisDatabase();

/**
 * Generate a client-side stable unique UUID
 */
export function generateEntityId(prefix: string = 'ent'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add an operation to the local Outbox queue
 */
export async function queueOutboxOperation(params: {
  user_id?: string;
  entity_type: 'client' | 'order' | 'appointment' | 'user_profile' | 'workshop_profile';
  entity_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
}): Promise<LocalOutboxItem> {
  const nowStr = new Date().toISOString();
  const idempotencyKey = `idempotent_${params.entity_type}_${params.entity_id}_${Date.now()}`;
  
  const outboxItem: LocalOutboxItem = {
    id: generateEntityId('op'),
    user_id: params.user_id,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    operation_type: params.operation_type,
    payload: params.payload,
    idempotency_key: idempotencyKey,
    created_at: nowStr,
    updated_at: nowStr,
    sync_status: 'pending',
    retry_count: 0,
  };

  await taylaxisDb.outbox.put(outboxItem);
  return outboxItem;
}
