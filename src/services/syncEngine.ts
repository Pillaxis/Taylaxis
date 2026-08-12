import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  taylaxisDb,
  type LocalClientRecord,
  type LocalOrderRecord,
  type LocalAppointmentRecord,
} from '../db/taylaxisDb';

export type SyncState = 'synced' | 'offline' | 'syncing' | 'pending_sync' | 'error';

export type SyncStateListener = (state: SyncState, pendingCount: number, lastError?: string) => void;

export class SyncEngine {
  private static isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private static currentSyncState: SyncState = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
  private static pendingCount: number = 0;
  private static lastErrorMessage?: string;
  private static listeners: Set<SyncStateListener> = new Set();
  private static syncInProgress: boolean = false;
  private static initialized: boolean = false;

  /**
   * Initialize Sync Engine listeners and background triggers
   */
  static init(userId?: string) {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineStatus = true;
        this.updateState(this.pendingCount > 0 ? 'pending_sync' : 'synced');
        this.sync(userId);
      });

      window.addEventListener('offline', () => {
        this.isOnlineStatus = false;
        this.updateState('offline');
      });

      window.addEventListener('focus', () => {
        if (this.isOnlineStatus) {
          this.sync(userId);
        }
      });
    }

    // Periodic sync attempt every 30s if online
    setInterval(() => {
      if (this.isOnlineStatus && !this.syncInProgress) {
        this.sync(userId);
      }
    }, 30000);

    // Initial check
    this.checkPendingCount().then(() => {
      if (this.isOnlineStatus) {
        this.sync(userId);
      } else {
        this.updateState('offline');
      }
    });
  }

  static subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSyncState, this.pendingCount, this.lastErrorMessage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static updateState(state: SyncState, errorMsg?: string) {
    this.currentSyncState = state;
    if (errorMsg !== undefined) {
      this.lastErrorMessage = errorMsg;
    }
    this.listeners.forEach((fn) => fn(this.currentSyncState, this.pendingCount, this.lastErrorMessage));
  }

  private static async checkPendingCount(): Promise<number> {
    try {
      const count = await taylaxisDb.outbox
        .filter((item) => item.sync_status === 'pending' || item.sync_status === 'failed')
        .count();
      this.pendingCount = count;
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Main synchronization trigger (Push outbox + Pull remote changes)
   */
  static async sync(userId?: string): Promise<{ success: boolean; pushed: number; pulled: number }> {
    if (this.syncInProgress) {
      return { success: false, pushed: 0, pulled: 0 };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnlineStatus = false;
      this.updateState('offline');
      return { success: false, pushed: 0, pulled: 0 };
    }

    if (!isSupabaseConfigured || !supabase) {
      await this.checkPendingCount();
      this.updateState(this.pendingCount > 0 ? 'pending_sync' : 'synced');
      return { success: true, pushed: 0, pulled: 0 };
    }

    this.syncInProgress = true;
    this.updateState('syncing');

    let pushed = 0;
    let pulled = 0;

    try {
      // 1. Push local outbox changes to Supabase
      pushed = await this.pushLocalChanges(userId);

      // 2. Pull remote updates from Supabase to Dexie DB
      pulled = await this.pullRemoteChanges(userId);

      await this.checkPendingCount();

      if (this.pendingCount > 0) {
        this.updateState('pending_sync');
      } else {
        this.updateState('synced');
      }

      this.syncInProgress = false;
      return { success: true, pushed, pulled };
    } catch (e: any) {
      console.error('SyncEngine sync error:', e);
      await this.checkPendingCount();
      this.updateState('error', e.message || 'Erreur de synchronisation réseau');
      this.syncInProgress = false;
      return { success: false, pushed, pulled };
    }
  }

  /**
   * Push pending Outbox items to Supabase idempotently
   */
  private static async pushLocalChanges(userId?: string): Promise<number> {
    if (!supabase) return 0;

    const pendingItems = await taylaxisDb.outbox
      .filter((item) => item.sync_status === 'pending' || item.sync_status === 'failed')
      .sortBy('created_at');

    if (pendingItems.length === 0) return 0;

    let successCount = 0;

    for (const item of pendingItems) {
      try {
        await taylaxisDb.outbox.update(item.id, { sync_status: 'syncing' });

        const effectiveUserId = item.user_id || userId;
        let queryError: any = null;

        if (item.operation_type === 'DELETE') {
          const tableName = this.mapEntityTypeToTable(item.entity_type);
          const { error } = await supabase.from(tableName).delete().eq('id', item.entity_id);
          queryError = error;
        } else {
          // INSERT or UPDATE -> Idempotent Upsert
          const tableName = this.mapEntityTypeToTable(item.entity_type);
          const payloadWithUser = {
            ...item.payload,
            user_id: effectiveUserId || item.payload?.user_id,
            updated_at: item.updated_at || new Date().toISOString(),
          };

          const { error } = await supabase.from(tableName).upsert(payloadWithUser, { onConflict: 'id' });
          queryError = error;
        }

        if (queryError) {
          console.warn(`Outbox item ${item.id} sync failed:`, queryError.message);
          const nextRetry = (item.retry_count || 0) + 1;
          await taylaxisDb.outbox.update(item.id, {
            sync_status: 'failed',
            retry_count: nextRetry,
            last_error: queryError.message,
            updated_at: new Date().toISOString(),
          });
        } else {
          // Successfully synced -> Remove from outbox
          await taylaxisDb.outbox.delete(item.id);
          successCount++;
        }
      } catch (err: any) {
        console.error(`Outbox item ${item.id} exception:`, err);
        await taylaxisDb.outbox.update(item.id, {
          sync_status: 'failed',
          retry_count: (item.retry_count || 0) + 1,
          last_error: err.message,
          updated_at: new Date().toISOString(),
        });
      }
    }

    return successCount;
  }

  /**
   * Pull remote changes from Supabase and update local Dexie DB deterministically
   */
  private static async pullRemoteChanges(userId?: string): Promise<number> {
    if (!supabase) return 0;
    let recordsUpdated = 0;

    try {
      // Pull Clients
      let clientQuery = supabase.from('clients').select('*');
      if (userId) clientQuery = clientQuery.eq('user_id', userId);
      const { data: remoteClients } = await clientQuery;

      if (remoteClients && remoteClients.length > 0) {
        for (const r of remoteClients) {
          const localOutbox = await taylaxisDb.outbox.where({ entity_id: r.id }).first();
          
          // Only overwrite if local has no pending outbox edit
          if (!localOutbox) {
            const mappedClient: LocalClientRecord = {
              id: r.id,
              user_id: r.user_id,
              name: r.name,
              phone: r.phone,
              initials: r.initials || r.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
              location: r.location || 'Lomé',
              status: r.status || 'actif',
              isNew: r.is_new,
              address: r.address,
              birthDate: r.birth_date,
              gender: r.gender,
              ageGroup: r.age_group,
              age: r.age,
              notes: r.notes,
              totalSpentFCFA: Number(r.total_spent_fcfa || 0),
              mensurationsCount: Array.isArray(r.custom_measurements) ? r.custom_measurements.length : 0,
              customMeasurements: r.custom_measurements || [],
              ordersCount: 0,
              created_at: r.created_at || new Date().toISOString(),
              updated_at: r.updated_at || new Date().toISOString(),
              is_deleted: r.is_deleted || false,
            };
            await taylaxisDb.clients.put(mappedClient);
            recordsUpdated++;
          }
        }
      }

      // Pull Orders
      let orderQuery = supabase.from('orders').select('*');
      if (userId) orderQuery = orderQuery.eq('user_id', userId);
      const { data: remoteOrders } = await orderQuery;

      if (remoteOrders && remoteOrders.length > 0) {
        for (const r of remoteOrders) {
          const localOutbox = await taylaxisDb.outbox.where({ entity_id: r.id }).first();
          if (!localOutbox) {
            const mappedOrder: LocalOrderRecord = {
              id: r.id,
              user_id: r.user_id,
              orderNumber: r.order_number,
              clientName: r.client_name,
              clientId: r.client_id || '',
              title: r.title,
              priceFCFA: Number(r.price_fcfa || 0),
              paidFCFA: Number(r.paid_fcfa || 0),
              balanceFCFA: Number(r.balance_fcfa || 0),
              orderDate: r.order_date,
              deliveryDate: r.delivery_date,
              status: r.status || 'progress',
              manufacturingStatus: r.manufacturing_status || 'EN_COURS',
              paymentStatus: r.payment_status || 'NON_PAYEE',
              dueDateStatus: r.due_date_status || 'A_TEMPS',
              priority: r.priority || 'NORMALE',
              garmentType: r.garment_type,
              fabricNotes: r.fabric_notes,
              created_at: r.created_at || new Date().toISOString(),
              updated_at: r.updated_at || new Date().toISOString(),
              is_deleted: r.is_deleted || false,
            };
            await taylaxisDb.orders.put(mappedOrder);
            recordsUpdated++;
          }
        }
      }

      // Pull Appointments
      let aptQuery = supabase.from('appointments').select('*');
      if (userId) aptQuery = aptQuery.eq('user_id', userId);
      const { data: remoteApts } = await aptQuery;

      if (remoteApts && remoteApts.length > 0) {
        for (const r of remoteApts) {
          const localOutbox = await taylaxisDb.outbox.where({ entity_id: r.id }).first();
          if (!localOutbox) {
            const mappedApt: LocalAppointmentRecord = {
              id: r.id,
              user_id: r.user_id,
              time: r.time,
              duration: r.duration,
              clientName: r.client_name,
              clientId: r.client_id,
              type: r.type,
              garment: r.garment,
              badgeLabel: r.badge_label,
              colorCategory: r.color_category || 'purple',
              date: r.date,
              notes: r.notes,
              created_at: r.created_at || new Date().toISOString(),
              updated_at: r.updated_at || new Date().toISOString(),
              is_deleted: r.is_deleted || false,
            };
            await taylaxisDb.appointments.put(mappedApt);
            recordsUpdated++;
          }
        }
      }

      // Pull Subscription Status
      if (userId) {
        const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
        if (subData) {
          await taylaxisDb.subscriptions.put({
            user_id: userId,
            plan: subData.plan === 'pro' ? 'pro' : 'free',
            status: subData.status || 'active',
            started_at: subData.started_at,
            expires_at: subData.expires_at,
            transaction_id: subData.transaction_id,
            feature_intent: subData.feature_intent,
            updated_at: subData.updated_at || new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.warn('pullRemoteChanges notice:', e);
    }

    return recordsUpdated;
  }

  private static mapEntityTypeToTable(entityType: string): string {
    switch (entityType) {
      case 'client':
        return 'clients';
      case 'order':
        return 'orders';
      case 'appointment':
        return 'appointments';
      case 'user_profile':
        return 'user_profiles';
      case 'workshop_profile':
        return 'workshop_profiles';
      default:
        return entityType;
    }
  }
}
