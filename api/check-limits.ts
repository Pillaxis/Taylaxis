import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const FREE_LIMITS = {
  maxClients: 5,
  maxOrdersMonthly: 10,
  maxAppointmentsMonthly: 10,
};

async function getAuthenticatedUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    const { resourceType, userId: bodyUserId } = req.body || {};
    const authUser = await getAuthenticatedUser(req);
    const userId = authUser?.id || bodyUserId;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié. Connexion requise.' });
    }

    if (!resourceType) {
      return res.status(400).json({ error: 'Ressource non spécifiée.' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Configuration Supabase incomplète.' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check user subscription status in DB
    const { data: subData } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    const isExpired = subData?.expires_at ? new Date(subData.expires_at) < new Date() : false;
    const isPro = subData?.plan === 'pro' && subData?.status === 'active' && !isExpired;

    if (isPro) {
      return res.status(200).json({
        allowed: true,
        plan: 'pro',
        message: 'Accès illimité actif avec Taylaxis Pro.',
      });
    }

    // Pro-exclusive features for Free users
    if (['relances', 'stats', 'search'].includes(resourceType)) {
      return res.status(200).json({
        allowed: false,
        plan: 'free',
        message: `La fonctionnalité ${resourceType} est disponible uniquement avec TAYLAXIS Pro.`,
        featureName: resourceType === 'relances' ? 'Relances Clients' : resourceType === 'stats' ? 'Statistiques Avancées' : 'Recherche Avancée',
      });
    }

    // 2. Resource limit counts for Free tier
    if (resourceType === 'clients') {
      const { count } = await supabaseAdmin
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      const clientCount = count || 0;
      if (clientCount >= FREE_LIMITS.maxClients) {
        return res.status(200).json({
          allowed: false,
          plan: 'free',
          limit: FREE_LIMITS.maxClients,
          current: clientCount,
          message: `Vous avez atteint la limite de ${FREE_LIMITS.maxClients} clients du forfait gratuit.`,
          featureName: 'Clients Illimités',
        });
      }
      return res.status(200).json({ allowed: true, plan: 'free', current: clientCount, limit: FREE_LIMITS.maxClients });
    }

    if (resourceType === 'orders') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth);

      const orderCount = count || 0;
      if (orderCount >= FREE_LIMITS.maxOrdersMonthly) {
        return res.status(200).json({
          allowed: false,
          plan: 'free',
          limit: FREE_LIMITS.maxOrdersMonthly,
          current: orderCount,
          message: `Vous avez atteint la limite de ${FREE_LIMITS.maxOrdersMonthly} commandes par mois du forfait gratuit.`,
          featureName: 'Commandes Illimitées',
        });
      }
      return res.status(200).json({ allowed: true, plan: 'free', current: orderCount, limit: FREE_LIMITS.maxOrdersMonthly });
    }

    return res.status(200).json({ allowed: true, plan: 'free' });
  } catch (err: any) {
    console.error('Check Limits Exception:', err);
    return res.status(500).json({ error: err.message });
  }
}
