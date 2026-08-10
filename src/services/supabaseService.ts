import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, Client, ManufacturingStatus } from '../types';
import { OrderEngine } from './orderEngine';

export class SupabaseService {
  /**
   * Check if Supabase connection is active
   */
  static isReady(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  }

  /**
   * Fetch all clients for a specific user from Supabase database
   */
  static async fetchClients(userId?: string): Promise<Client[]> {
    if (!this.isReady() || !supabase) return [];
    try {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchClients notice:', error.message);
        return [];
      }
      return (data || []).map((row) => ({
        id: row.id,
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
      }));
    } catch (e) {
      console.error('Supabase fetchClients exception:', e);
      return [];
    }
  }

  /**
   * Fetch all orders for a specific user from Supabase database
   */
  static async fetchOrders(userId?: string): Promise<Order[]> {
    if (!this.isReady() || !supabase) return [];
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchOrders notice:', error.message);
        return [];
      }

      return (data || []).map((row) => {
        const mfgStatus = (row.manufacturing_status as ManufacturingStatus) || OrderEngine.mapLegacyToManufacturingStatus(row.status || 'progress');
        const paymentStatus = OrderEngine.calculatePaymentStatus(Number(row.price_fcfa), Number(row.paid_fcfa));
        const dueDateStatus = OrderEngine.calculateDueDateStatus(row.delivery_date, mfgStatus);
        const priority = OrderEngine.calculatePriority({ priceFCFA: Number(row.price_fcfa), paidFCFA: Number(row.paid_fcfa), balanceFCFA: Number(row.balance_fcfa) }, mfgStatus, paymentStatus, dueDateStatus);
        const legacyStatus = OrderEngine.mapManufacturingStatusToLegacy(mfgStatus, dueDateStatus === 'EN_RETARD');

        return {
          id: row.id,
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
        };
      });
    } catch (e) {
      console.error('Supabase fetchOrders exception:', e);
      return [];
    }
  }

  /**
   * Save a new client to Supabase linked to user_id
   */
  static async saveClient(client: Client, userId?: string): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('clients').insert({
        id: client.id,
        user_id: userId,
        name: client.name,
        phone: client.phone,
        initials: client.initials,
        location: client.location,
        status: client.status,
        is_new: client.isNew ?? true,
        address: client.address,
        birth_date: client.birthDate,
        gender: client.gender,
        age_group: client.ageGroup,
        age: client.age,
        notes: client.notes,
        total_spent_fcfa: client.totalSpentFCFA || 0,
        custom_measurements: client.customMeasurements || [],
      });
      if (error) {
        console.error('Save client Supabase error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Save client exception:', e);
      return false;
    }
  }

  /**
   * Subscribe to real-time order changes
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
}
