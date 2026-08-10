import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserSubscription {
  plan: 'free' | 'pro';
  status: 'active' | 'inactive' | 'pending' | 'expired';
  isPro: boolean;
  transactionId?: string;
  startedAt?: string;
  expiresAt?: string;
}

export interface LimitCheckResult {
  allowed: boolean;
  limit?: number;
  current?: number;
  message?: string;
  featureName?: string;
}

export const FREE_LIMITS = {
  maxClients: 5,
  maxMeasurements: 5,
  maxOrdersMonthly: 10,
  maxAppointmentsMonthly: 10,
  advancedRelances: false,
  advancedStats: false,
};

export class SubscriptionService {
  private static localCache: Record<string, UserSubscription> = {};

  /**
   * Get cached or live subscription for user
   */
  static getCachedSubscription(userId?: string): UserSubscription {
    if (!userId) return { plan: 'free', status: 'inactive', isPro: false };
    if (this.localCache[userId]) return this.localCache[userId];

    const raw = localStorage.getItem(`taylaxis_subscription_${userId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          return { plan: 'free', status: 'expired', isPro: false };
        }
        return parsed;
      } catch {
        // Fallback
      }
    }
    return { plan: 'free', status: 'inactive', isPro: false };
  }

  /**
   * Fetch active subscription from Supabase DB
   */
  static async fetchUserSubscription(userId?: string): Promise<UserSubscription> {
    if (!userId) return { plan: 'free', status: 'inactive', isPro: false };

    if (!isSupabaseConfigured || !supabase) {
      return this.getCachedSubscription(userId);
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        const fallback = { plan: 'free' as const, status: 'inactive' as const, isPro: false };
        this.cacheSub(userId, fallback);
        return fallback;
      }

      const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
      const isActivePro = data.plan === 'pro' && data.status === 'active' && !isExpired;

      const subResult: UserSubscription = {
        plan: isActivePro ? 'pro' : 'free',
        status: isExpired ? 'expired' : (data.status as any) || 'inactive',
        isPro: isActivePro,
        transactionId: data.transaction_id,
        startedAt: data.started_at,
        expiresAt: data.expires_at,
      };

      this.cacheSub(userId, subResult);
      return subResult;
    } catch (e) {
      console.warn('fetchUserSubscription exception:', e);
      return this.getCachedSubscription(userId);
    }
  }

  private static cacheSub(userId: string, sub: UserSubscription) {
    this.localCache[userId] = sub;
    localStorage.setItem(`taylaxis_subscription_${userId}`, JSON.stringify(sub));
  }

  /**
   * Check if action is allowed based on user plan limits
   */
  static checkLimit(
    userId: string | null | undefined,
    resourceType: 'clients' | 'measurements' | 'orders' | 'appointments' | 'relances' | 'stats',
    currentCount: number
  ): LimitCheckResult {
    const sub = this.getCachedSubscription(userId || undefined);
    if (sub.isPro) {
      return { allowed: true };
    }

    switch (resourceType) {
      case 'clients':
        if (currentCount >= FREE_LIMITS.maxClients) {
          return {
            allowed: false,
            limit: FREE_LIMITS.maxClients,
            current: currentCount,
            message: `Le plan Gratuit est limité à ${FREE_LIMITS.maxClients} clients maximum. Passez au Plan Pro pour ajouter des clients en illimité !`,
            featureName: 'Gestion Clients Illimitée',
          };
        }
        return { allowed: true };

      case 'measurements':
        if (currentCount >= FREE_LIMITS.maxMeasurements) {
          return {
            allowed: false,
            limit: FREE_LIMITS.maxMeasurements,
            current: currentCount,
            message: `Le plan Gratuit est limité à ${FREE_LIMITS.maxMeasurements} fiches de mensurations. Débloquez les mensurations illimitées avec le Plan Pro !`,
            featureName: 'Fiches de Mensurations Illimitées',
          };
        }
        return { allowed: true };

      case 'orders':
        if (currentCount >= FREE_LIMITS.maxOrdersMonthly) {
          return {
            allowed: false,
            limit: FREE_LIMITS.maxOrdersMonthly,
            current: currentCount,
            message: `Le plan Gratuit est limité à ${FREE_LIMITS.maxOrdersMonthly} commandes par mois. Passez au Plan Pro pour créer des commandes illimitées !`,
            featureName: 'Commandes Illimitées',
          };
        }
        return { allowed: true };

      case 'appointments':
        if (currentCount >= FREE_LIMITS.maxAppointmentsMonthly) {
          return {
            allowed: false,
            limit: FREE_LIMITS.maxAppointmentsMonthly,
            current: currentCount,
            message: `Le plan Gratuit est limité à ${FREE_LIMITS.maxAppointmentsMonthly} rendez-vous par mois. Profitez d'un agenda illimité avec le Plan Pro !`,
            featureName: 'Agenda Rendez-vous Illimité',
          };
        }
        return { allowed: true };

      case 'relances':
        return {
          allowed: false,
          message: 'Les relances clients automatiques (WhatsApp & SMS) sont réservées aux ateliers Taylaxis Pro.',
          featureName: 'Relances WhatsApp & SMS',
        };

      case 'stats':
        return {
          allowed: false,
          message: 'Les rapports de chiffre d\'affaires et statistiques financières sont réservés au Plan Pro.',
          featureName: 'Statistiques & CA Avancés',
        };

      default:
        return { allowed: true };
    }
  }

  /**
   * Initiate FedaPay transaction via Serverless API
   */
  static async createFedaPayment(params: {
    userId: string;
    email?: string;
    name?: string;
    phone?: string;
  }): Promise<{ success: boolean; url?: string; token?: string; transactionId?: string; error?: string }> {
    try {
      const res = await fetch('/api/create-feda-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Erreur lors du traitement FedaPay.' };
      }

      return {
        success: true,
        url: data.url,
        token: data.token,
        transactionId: String(data.transactionId),
      };
    } catch (e: any) {
      console.error('createFedaPayment exception:', e);
      return { success: false, error: 'Impossible de contacter le serveur de paiement.' };
    }
  }

  /**
   * Verify FedaPay payment completion via Serverless API
   */
  static async verifyTransaction(
    transactionId: string,
    userId: string
  ): Promise<{ isPro: boolean; status: string; error?: string }> {
    try {
      const res = await fetch('/api/verify-feda-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, userId }),
      });

      const data = await res.json();
      if (data.isPro) {
        const sub: UserSubscription = {
          plan: 'pro',
          status: 'active',
          isPro: true,
          transactionId,
        };
        this.cacheSub(userId, sub);
        return { isPro: true, status: 'approved' };
      }
      return { isPro: false, status: data.status || 'pending', error: data.error };
    } catch (e: any) {
      console.error('verifyTransaction exception:', e);
      return { isPro: false, status: 'error', error: e.message };
    }
  }
}
