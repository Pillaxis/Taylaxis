import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || '';

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

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    const transactionId = req.query.transactionId || req.body?.transactionId;
    const userIdReq = req.query.userId || req.body?.userId;

    // 1. Determine effective user ID
    const authUser = await getAuthenticatedUser(req);
    const verifiedUserId = authUser?.id || userIdReq;

    if (!verifiedUserId) {
      return res.status(401).json({ error: 'Non authentifié. Connexion requise.' });
    }

    if (!transactionId) {
      return res.status(400).json({ error: 'Identifiant de transaction manquant.' });
    }

    if (!FEDAPAY_SECRET_KEY) {
      return res.status(500).json({ error: 'FEDAPAY_SECRET_KEY non configurée.' });
    }

    const isSandbox = FEDAPAY_SECRET_KEY.startsWith('sk_sandbox');
    const fedaBaseUrl = isSandbox
      ? 'https://sandbox-api.fedapay.com/v1'
      : 'https://api.fedapay.com/v1';

    // 2. Fetch real transaction status directly from FedaPay Server API
    const fedaRes = await fetch(`${fedaBaseUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      },
    });

    if (!fedaRes.ok) {
      const errText = await fedaRes.text();
      return res.status(fedaRes.status).json({
        error: 'Impossible d\'interroger FedaPay pour vérifier la transaction.',
        details: errText,
      });
    }

    const fedaData = await fedaRes.json();
    const transaction = fedaData.v1?.transaction || fedaData.transaction || fedaData;
    const realStatus = (transaction.status || '').toLowerCase();
    const isApproved = realStatus === 'approved' || realStatus === 'transferred';

    const customMetadata = transaction.custom_metadata || {};
    const featureIntent = customMetadata.feature_intent || '';

    // 3. If approved, activate PRO subscription in Supabase securely
    if (isApproved && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: verifiedUserId,
        plan: 'pro',
        status: 'active',
        transaction_id: String(transactionId),
        amount: Number(transaction.amount || 5000),
        currency: 'XOF',
        feature_intent: featureIntent || null,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });

      await supabaseAdmin.from('payment_transactions').upsert({
        feda_transaction_id: String(transactionId),
        user_id: verifiedUserId,
        amount: Number(transaction.amount || 5000),
        currency: 'XOF',
        status: 'approved',
        feature_intent: featureIntent || null,
        raw_response: transaction,
        updated_at: now.toISOString(),
      }, { onConflict: 'feda_transaction_id' });
    }

    return res.status(200).json({
      success: isApproved,
      status: realStatus,
      isPro: isApproved,
      transactionId: transactionId,
      featureIntent: featureIntent,
    });
  } catch (err: any) {
    console.error('Verify Feda Transaction Exception:', err);
    return res.status(500).json({ error: err.message });
  }
}
