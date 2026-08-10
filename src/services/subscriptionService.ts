import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserSubscription {
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'canceled';
  isPro: boolean;
  transactionId?: string;
  featureIntent?: string;
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
  maxClients: 10,
  maxMeasurements: 10,
  maxOrdersMonthly: 5,
  maxAppointmentsMonthly: 5,
  advancedRelances: false,
  advancedStats: false,
  advancedSearch: false,
};

export class SubscriptionService {
  private static localCache: Record<string, UserSubscription> = {};

  /**
   * Save feature intent before auth or payment (e.g. 'relances', 'stats', 'clients', 'orders', 'agenda')
   */
  static savePendingFeatureIntent(featureKey: string) {
    localStorage.setItem('taylaxis_pending_feature_v1', featureKey);
  }

  static getPendingFeatureIntent(): string | null {
    return localStorage.getItem('taylaxis_pending_feature_v1');
  }

  static clearPendingFeatureIntent() {
    localStorage.removeItem('taylaxis_pending_feature_v1');
  }

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
        const fallback: UserSubscription = { plan: 'free', status: 'inactive', isPro: false };
        this.cacheSub(userId, fallback);
        return fallback;
      }

      const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
      const isActivePro = (data.plan === 'pro' || data.plan === 'business' || data.plan === 'enterprise') &&
        data.status === 'active' &&
        !isExpired;

      const subResult: UserSubscription = {
        plan: isActivePro ? (data.plan as any) : 'free',
        status: isExpired ? 'expired' : (data.status as any) || 'inactive',
        isPro: isActivePro,
        transactionId: data.transaction_id,
        featureIntent: data.feature_intent,
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
    resourceType: 'clients' | 'measurements' | 'orders' | 'appointments' | 'relances' | 'stats' | 'search',
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
            message: `Vous avez atteint la limite de ${FREE_LIMITS.maxClients} clients du forfait gratuit.`,
            featureName: 'Clients Illimités',
          };
        }
        return { allowed: true };

      case 'measurements':
        if (currentCount >= FREE_LIMITS.maxMeasurements) {
          return {
            allowed: false,
            limit: FREE_LIMITS.maxMeasurements,
            current: currentCount,
            message: `Vous avez atteint la limite de ${FREE_LIMITS.maxMeasurements} fiches du forfait gratuit.`,
            featureName: 'Mensurations Illimitées',
          };
        }
        return { allowed: true };

      case 'orders':
        if (currentCount >= FREE_LIMITS.maxOrdersMonthly) {
          return {
            allowed: false,
            limit: FREE_LIMITS.maxOrdersMonthly,
            current: currentCount,
            message: `Vous avez atteint la limite de ${FREE_LIMITS.maxOrdersMonthly} commandes par mois du forfait gratuit.`,
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
            message: `Vous avez atteint la limite de ${FREE_LIMITS.maxAppointmentsMonthly} rendez-vous par mois du forfait gratuit.`,
            featureName: 'Agenda Illimité',
          };
        }
        return { allowed: true };

      case 'relances':
        return {
          allowed: false,
          message: 'La fonctionnalité de relances clients est disponible avec TAYLAXIS Pro.',
          featureName: 'Relances Clients Automatiques',
        };

      case 'stats':
        return {
          allowed: false,
          message: 'Les statistiques financières et rapports de CA sont disponibles avec TAYLAXIS Pro.',
          featureName: 'Statistiques & CA Avancés',
        };

      case 'search':
        return {
          allowed: false,
          message: 'La recherche et les filtres avancés sont disponibles avec TAYLAXIS Pro.',
          featureName: 'Recherche & Filtres Avancés',
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
    featureIntent?: string;
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
  ): Promise<{ isPro: boolean; status: string; featureIntent?: string; error?: string }> {
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
          featureIntent: data.featureIntent,
        };
        this.cacheSub(userId, sub);
        return { isPro: true, status: 'approved', featureIntent: data.featureIntent };
      }
      return { isPro: false, status: data.status || 'pending', error: data.error };
    } catch (e: any) {
      console.error('verifyTransaction exception:', e);
      return { isPro: false, status: 'error', error: e.message };
    }
  }
}
