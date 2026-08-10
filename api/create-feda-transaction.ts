import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Seul POST est accepté.' });
  }

  try {
    const { userId, customerEmail, customerName, customerPhone, featureIntent } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'ID Utilisateur (userId) manquant.' });
    }

    if (!FEDAPAY_SECRET_KEY) {
      return res.status(500).json({
        error: 'Clé secrète FEDAPAY_SECRET_KEY non configurée sur le serveur.',
        isConfigured: false,
      });
    }

    // Determine FedaPay API Endpoint (Sandbox vs Live)
    const isSandbox = FEDAPAY_SECRET_KEY.startsWith('sk_sandbox');
    const fedaBaseUrl = isSandbox
      ? 'https://sandbox-api.fedapay.com/v1'
      : 'https://api.fedapay.com/v1';

    // 1. Create Transaction on FedaPay Server API
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
        callback_url: `${req.headers.origin || 'https://taylaxis.vercel.app'}/?feda_tx_id={id}&status=callback`,
        customer: {
          email: customerEmail || 'client@taylaxis.com',
          firstname: customerName || 'Tailleur',
          lastname: 'Taylaxis',
          phone_number: customerPhone ? { number: customerPhone } : undefined,
        },
        custom_metadata: {
          user_id: userId,
          plan: 'PRO',
          feature_intent: featureIntent || '',
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

    // 2. Generate Payment Token / Checkout URL
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

    // 3. Save initial pending transaction in Supabase Database using Service Role
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabaseAdmin.from('payment_transactions').insert({
          feda_transaction_id: String(fedaTxId),
          user_id: userId,
          amount: 5000,
          currency: 'XOF',
          status: 'pending',
          feature_intent: featureIntent || null,
          raw_response: transaction,
        });

        // Set pending subscription
        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
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
