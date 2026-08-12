import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserSubscription {
  plan: 'free' | 'pro';
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

export class SubscriptionService {
  private static localCache: Record<string, UserSubscription> = {};

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    if (!isSupabaseConfigured || !supabase) return {};
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        return { Authorization: `Bearer ${data.session.access_token}` };
      }
    } catch (e) {
      console.warn('Could not get auth session token:', e);
    }
    return {};
  }

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
      const isActivePro = data.plan === 'pro' && data.status === 'active' && !isExpired;

      const subResult: UserSubscription = {
        plan: isActivePro ? 'pro' : 'free',
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
   * Check if action is allowed based on user plan limits (Client side evaluation)
   */
  static checkLimit(
    userId: string | null | undefined,
    resourceType: 'clients' | 'measurements' | 'orders' | 'appointments' | 'relances' | 'stats' | 'search',
    _currentCount: number = 0
  ): LimitCheckResult {
    const sub = this.getCachedSubscription(userId || undefined);
    if (sub.isPro) {
      return { allowed: true };
    }

    switch (resourceType) {
      case 'clients':
      case 'measurements':
        return { allowed: true };

      case 'orders':
        return {
          allowed: false,
          message: 'La gestion des commandes nécessite le forfait Taylaxis Pro (5 000 FCFA/mois).',
          featureName: 'Commandes',
        };

      case 'appointments':
        return {
          allowed: false,
          message: 'La planification des rendez-vous nécessite le forfait Taylaxis Pro (5 000 FCFA/mois).',
          featureName: 'Agenda & Rendez-vous',
        };

      case 'relances':
        return {
          allowed: false,
          message: 'Les relances clients sont disponibles avec le forfait Taylaxis Pro (5 000 FCFA/mois).',
          featureName: 'Relances Clients',
        };

      case 'stats':
        return {
          allowed: false,
          message: 'Les statistiques financières sont disponibles avec le forfait Taylaxis Pro (5 000 FCFA/mois).',
          featureName: 'Statistiques & CA',
        };

      case 'search':
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }

  /**
   * Perform authoritative server-side limit check via Serverless API
   */
  static async checkLimitOnServer(resourceType: string): Promise<LimitCheckResult> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const res = await fetch('/api/check-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ resourceType }),
      });

      if (!res.ok) {
        return { allowed: false, message: 'Erreur de vérification des limites serveur.' };
      }

      const data = await res.json();
      return {
        allowed: Boolean(data.allowed),
        limit: data.limit,
        current: data.current,
        message: data.message,
        featureName: data.featureName,
      };
    } catch (e) {
      console.error('checkLimitOnServer exception:', e);
      return { allowed: true }; // Fallback client
    }
  }

  /**
   * Initiate FedaPay transaction via Serverless API with JWT auth
   */
  static async createFedaPayment(params: {
    userId: string;
    email?: string;
    name?: string;
    phone?: string;
    featureIntent?: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; url?: string; token?: string; transactionId?: string; error?: string }> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const res = await fetch('/api/create-feda-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
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
   * Verify FedaPay payment completion via Serverless API with JWT auth
   */
  static async verifyTransaction(
    transactionId: string,
    userId: string
  ): Promise<{ isPro: boolean; status: string; featureIntent?: string; error?: string }> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const res = await fetch('/api/verify-feda-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
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
