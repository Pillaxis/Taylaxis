import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || '';

/**
 * Extracts and verifies the Supabase JWT from the Authorization header.
 * Returns the authenticated user or null.
 */
async function getAuthenticatedUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Seul POST est accepté.' });
  }

  try {
    const { userId, customerEmail, customerName, customerPhone, featureIntent, idempotencyKey } = req.body || {};

    // 1. Verify JWT authentication
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentification requise. Veuillez vous connecter.' });
    }

    // 2. Verify userId matches the JWT user (prevent impersonation)
    const verifiedUserId = authUser.id;
    if (userId && userId !== verifiedUserId) {
      return res.status(403).json({ error: 'Accès interdit. L\'identifiant utilisateur ne correspond pas.' });
    }

    if (!FEDAPAY_SECRET_KEY) {
      return res.status(500).json({
        error: 'Clé secrète FEDAPAY_SECRET_KEY non configurée sur le serveur.',
        isConfigured: false,
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Configuration Supabase incomplète sur le serveur.' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3. Check if user already has an active Pro subscription
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', verifiedUserId)
      .maybeSingle();

    if (existingSub &&
        existingSub.plan === 'pro' &&
        existingSub.status === 'active' &&
        existingSub.expires_at &&
        new Date(existingSub.expires_at) > new Date()) {
      return res.status(400).json({
        error: 'Vous avez déjà un abonnement Pro actif.',
        isPro: true,
      });
    }

    // 4. Check idempotency — prevent duplicate transactions from double-clicks
    if (idempotencyKey) {
      const { data: existingTx } = await supabaseAdmin
        .from('payment_transactions')
        .select('feda_transaction_id, status')
        .eq('idempotency_key', idempotencyKey)
        .eq('user_id', verifiedUserId)
        .maybeSingle();

      if (existingTx && existingTx.status === 'pending') {
        // Return existing pending transaction instead of creating a new one
        return res.status(200).json({
          success: true,
          transactionId: existingTx.feda_transaction_id,
          url: '', // Client should redirect using stored URL
          deduplicated: true,
        });
      }
    }

    // 5. Create Transaction on FedaPay Server API
    const isSandbox = FEDAPAY_SECRET_KEY.startsWith('sk_sandbox');
    const fedaBaseUrl = isSandbox
      ? 'https://sandbox-api.fedapay.com/v1'
      : 'https://api.fedapay.com/v1';

    const callbackOrigin = req.headers.origin || 'https://taylaxis.vercel.app';

    const txResponse = await fetch(`${fedaBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        description: 'Abonnement Taylaxis Pro (5 000 FCFA / mois)',
        amount: 5000,
        currency: { iso: 'XOF' },
        callback_url: `${callbackOrigin}/?feda_tx_id={id}&status=callback`,
        customer: {
          email: customerEmail || authUser.email || 'client@taylaxis.com',
          firstname: customerName || 'Tailleur',
          lastname: 'Taylaxis',
          phone_number: customerPhone ? { number: String(customerPhone).replace(/\s+/g, '') } : undefined,
        },
        custom_metadata: {
          user_id: verifiedUserId,
          plan: 'PRO',
          feature_intent: featureIntent || '',
          idempotency_key: idempotencyKey || '',
        },
      }),
    });

    if (!txResponse.ok) {
      const errText = await txResponse.text();
      console.error('FedaPay API error:', txResponse.status, errText);
      return res.status(txResponse.status).json({
        error: 'Échec de la création de transaction chez FedaPay.',
        details: errText,
      });
    }

    const txData = await txResponse.json();
    const transaction = txData.v1?.transaction || txData.transaction || txData;
    const fedaTxId = transaction.id;

    // 6. Generate Payment Token / Checkout URL
    const tokenResponse = await fetch(`${fedaBaseUrl}/transactions/${fedaTxId}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      },
    });

    let checkoutUrl = transaction.url || '';
    let token = '';

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      token = tokenData.token || tokenData.v1?.token?.token || '';
      checkoutUrl = tokenData.url || tokenData.v1?.token?.url || checkoutUrl;
    }

    // 7. Save initial pending transaction in Supabase Database using Service Role
    try {
      await supabaseAdmin.from('payment_transactions').insert({
        feda_transaction_id: String(fedaTxId),
        user_id: verifiedUserId,
        amount: 5000,
        currency: 'XOF',
        status: 'pending',
        feature_intent: featureIntent || null,
        idempotency_key: idempotencyKey || null,
        raw_response: transaction,
      });

      // Set pending subscription status
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: verifiedUserId,
        plan: 'free',
        status: 'pending',
        transaction_id: String(fedaTxId),
        amount: 5000,
        currency: 'XOF',
        feature_intent: featureIntent || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (dbErr) {
      console.warn('Supabase record notice:', dbErr);
    }

    return res.status(200).json({
      success: true,
      transactionId: fedaTxId,
      url: checkoutUrl,
      token: token,
      mode: isSandbox ? 'sandbox' : 'live',
    });

  } catch (err: any) {
    console.error('Create Feda Transaction Exception:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne du serveur.' });
  }
}
