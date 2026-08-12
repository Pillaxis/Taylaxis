import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, Client, ManufacturingStatus } from '../types';
import { OrderEngine } from './orderEngine';
import {
  taylaxisDb,
  queueOutboxOperation,
  generateEntityId,
  type LocalClientRecord,
  type LocalOrderRecord,
} from '../db/taylaxisDb';
import { SyncEngine } from './syncEngine';
import { MOCK_CLIENTS } from '../data/mockData';

export class SupabaseService {
  /**
   * Check if Supabase connection is active
   */
  static isReady(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  }

  /**
   * Fetch all clients for a specific user (Offline-First: instant Dexie DB read + background sync)
   */
  static async fetchClients(userId?: string): Promise<Client[]> {
    try {
      // 1. Instant local read from IndexedDB / Dexie
      const localRecords = await taylaxisDb.clients
        .filter((c) => !c.is_deleted && (!userId || c.user_id === userId))
        .toArray();

      if (localRecords.length > 0) {
        // Trigger background sync non-blocking
        SyncEngine.sync(userId).catch(console.error);
        return localRecords.map(this.mapLocalRecordToClient);
      }

      // 2. If local database is empty on first boot, attempt remote fetch or seed initial defaults
      if (this.isReady() && supabase) {
        let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data } = await query;

        if (data && data.length > 0) {
          const mapped: LocalClientRecord[] = data.map((row) => ({
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            phone: row.phone,
            initials: row.initials || row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            location: row.location || 'Lomé',
            status: row.status || 'actif',
            isNew: row.is_new,
            address: row.address,
            birthDate: row.birth_date,
            gender: row.gender,
            ageGroup: row.age_group,
            age: row.age,
            notes: row.notes,
            totalSpentFCFA: Number(row.total_spent_fcfa || 0),
            mensurationsCount: Array.isArray(row.custom_measurements) ? row.custom_measurements.length : 0,
            customMeasurements: row.custom_measurements || [],
            ordersCount: 0,
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString(),
            is_deleted: false,
          }));

          await taylaxisDb.clients.bulkPut(mapped);
          return mapped.map(this.mapLocalRecordToClient);
        }
      }

      // 3. Fallback Seed for fresh installation
      const seeded: LocalClientRecord[] = MOCK_CLIENTS.map((c) => ({
        ...c,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
      }));
      await taylaxisDb.clients.bulkPut(seeded);
      return seeded.map(this.mapLocalRecordToClient);
    } catch (e) {
      console.error('SupabaseService fetchClients error:', e);
      return MOCK_CLIENTS;
    }
  }

  /**
   * Fetch all orders for a specific user (Offline-First: instant Dexie DB read + background sync)
   */
  static async fetchOrders(userId?: string): Promise<Order[]> {
    try {
      // 1. Instant local read from IndexedDB / Dexie
      const localRecords = await taylaxisDb.orders
        .filter((o) => !o.is_deleted && (!userId || o.user_id === userId))
        .toArray();

      if (localRecords.length > 0) {
        // Trigger background sync non-blocking
        SyncEngine.sync(userId).catch(console.error);
        return localRecords.map(this.mapLocalRecordToOrder);
      }

      // 2. If local database is empty on first boot, attempt remote fetch
      if (this.isReady() && supabase) {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data } = await query;

        if (data && data.length > 0) {
          const mapped: LocalOrderRecord[] = data.map((row) => {
            const mfgStatus = (row.manufacturing_status as ManufacturingStatus) || OrderEngine.mapLegacyToManufacturingStatus(row.status || 'progress');
            const paymentStatus = OrderEngine.calculatePaymentStatus(Number(row.price_fcfa), Number(row.paid_fcfa));
            const dueDateStatus = OrderEngine.calculateDueDateStatus(row.delivery_date, mfgStatus);
            const priority = OrderEngine.calculatePriority({ priceFCFA: Number(row.price_fcfa), paidFCFA: Number(row.paid_fcfa), balanceFCFA: Number(row.balance_fcfa) }, mfgStatus, paymentStatus, dueDateStatus);
            const legacyStatus = OrderEngine.mapManufacturingStatusToLegacy(mfgStatus, dueDateStatus === 'EN_RETARD');

            return {
              id: row.id,
              user_id: row.user_id,
              orderNumber: row.order_number,
              clientName: row.client_name,
              clientId: row.client_id || '',
              title: row.title,
              priceFCFA: Number(row.price_fcfa || 0),
              paidFCFA: Number(row.paid_fcfa || 0),
              balanceFCFA: Number(row.balance_fcfa || 0),
              orderDate: row.order_date,
              deliveryDate: row.delivery_date,
              status: legacyStatus,
              manufacturingStatus: mfgStatus,
              paymentStatus,
              dueDateStatus,
              priority,
              garmentType: row.garment_type,
              fabricNotes: row.fabric_notes,
              created_at: row.created_at || new Date().toISOString(),
              updated_at: row.updated_at || new Date().toISOString(),
              is_deleted: false,
            };
          });

          await taylaxisDb.orders.bulkPut(mapped);
          return mapped.map(this.mapLocalRecordToOrder);
        }
      }

      return [];
    } catch (e) {
      console.error('SupabaseService fetchOrders error:', e);
      return [];
    }
  }

  /**
   * Save a client (Offline-First: updates Dexie DB immediately + queues Outbox operation)
   */
  static async saveClient(client: Client, userId?: string): Promise<boolean> {
    try {
      const nowStr = new Date().toISOString();
      const clientRecord: LocalClientRecord = {
        ...client,
        id: client.id || generateEntityId('c'),
        user_id: userId,
        created_at: nowStr,
        updated_at: nowStr,
        is_deleted: false,
      };

      // 1. Immediate local save
      await taylaxisDb.clients.put(clientRecord);

      // 2. Queue in Outbox
      await queueOutboxOperation({
        user_id: userId,
        entity_type: 'client',
        entity_id: clientRecord.id,
        operation_type: 'INSERT',
        payload: {
          id: clientRecord.id,
          user_id: userId,
          name: clientRecord.name,
          phone: clientRecord.phone,
          initials: clientRecord.initials,
          location: clientRecord.location,
          status: clientRecord.status,
          is_new: clientRecord.isNew ?? true,
          address: clientRecord.address,
          birth_date: clientRecord.birthDate,
          gender: clientRecord.gender,
          age_group: clientRecord.ageGroup,
          age: clientRecord.age,
          notes: clientRecord.notes,
          total_spent_fcfa: clientRecord.totalSpentFCFA || 0,
          custom_measurements: clientRecord.customMeasurements || [],
        },
      });

      // 3. Trigger background sync non-blocking
      SyncEngine.sync(userId).catch(console.error);
      return true;
    } catch (e) {
      console.error('SupabaseService saveClient error:', e);
      return false;
    }
  }

  /**
   * Save an order (Offline-First: updates Dexie DB immediately + queues Outbox operation)
   */
  static async saveOrder(order: Order, userId?: string): Promise<boolean> {
    try {
      const nowStr = new Date().toISOString();
      const orderRecord: LocalOrderRecord = {
        ...order,
        id: order.id || generateEntityId('ord'),
        user_id: userId,
        created_at: nowStr,
        updated_at: nowStr,
        is_deleted: false,
      };

      // 1. Immediate local save
      await taylaxisDb.orders.put(orderRecord);

      // 2. Queue in Outbox
      await queueOutboxOperation({
        user_id: userId,
        entity_type: 'order',
        entity_id: orderRecord.id,
        operation_type: 'INSERT',
        payload: {
          id: orderRecord.id,
          user_id: userId,
          order_number: orderRecord.orderNumber,
          client_name: orderRecord.clientName,
          client_id: orderRecord.clientId,
          title: orderRecord.title,
          price_fcfa: orderRecord.priceFCFA,
          paid_fcfa: orderRecord.paidFCFA,
          balance_fcfa: orderRecord.balanceFCFA,
          order_date: orderRecord.orderDate,
          delivery_date: orderRecord.deliveryDate,
          manufacturing_status: orderRecord.manufacturingStatus || 'EN_COURS',
          payment_status: orderRecord.paymentStatus || 'NON_PAYEE',
          due_date_status: orderRecord.dueDateStatus || 'A_TEMPS',
          priority: orderRecord.priority || 'NORMALE',
          garment_type: orderRecord.garmentType,
          fabric_notes: orderRecord.fabricNotes,
        },
      });

      // 3. Trigger background sync non-blocking
      SyncEngine.sync(userId).catch(console.error);
      return true;
    } catch (e) {
      console.error('SupabaseService saveOrder error:', e);
      return false;
    }
  }

  /**
   * Subscribe to realtime order changes
   */
  static subscribeToOrders(onUpdate: () => void): () => void {
    if (!this.isReady() || !supabase) return () => {};

    const client = supabase;
    const channel = client
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  private static mapLocalRecordToClient(r: LocalClientRecord): Client {
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      initials: r.initials,
      location: r.location,
      status: r.status,
      isNew: r.isNew,
      address: r.address,
      birthDate: r.birthDate,
      gender: r.gender,
      ageGroup: r.ageGroup,
      age: r.age,
      notes: r.notes,
      totalSpentFCFA: r.totalSpentFCFA,
      mensurationsCount: r.mensurationsCount || (r.customMeasurements ? r.customMeasurements.length : 0),
      customMeasurements: r.customMeasurements || [],
      ordersCount: r.ordersCount || 0,
    };
  }

  private static mapLocalRecordToOrder(r: LocalOrderRecord): Order {
    return {
      id: r.id,
      orderNumber: r.orderNumber,
      clientName: r.clientName,
      clientId: r.clientId,
      title: r.title,
      priceFCFA: r.priceFCFA,
      paidFCFA: r.paidFCFA,
      balanceFCFA: r.balanceFCFA,
      orderDate: r.orderDate,
      deliveryDate: r.deliveryDate,
      status: r.status,
      manufacturingStatus: r.manufacturingStatus,
      paymentStatus: r.paymentStatus,
      dueDateStatus: r.dueDateStatus,
      priority: r.priority,
      garmentType: r.garmentType,
      fabricNotes: r.fabricNotes,
      paymentHistory: r.paymentHistory || [],
      eventTimeline: r.eventTimeline || [],
      measurementSnapshot: r.measurementSnapshot,
    };
  }
}
