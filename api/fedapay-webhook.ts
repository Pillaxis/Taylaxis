import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    const payload = req.body;
    console.log('⚡ FedaPay Webhook Event Received:', payload?.event || payload?.name);

    if (!payload) {
      return res.status(400).json({ error: 'Payload vide.' });
    }

    const eventName = payload.event || payload.name || '';
    const transaction = payload.entity || payload.transaction || payload;
    const fedaTxId = String(transaction.id || payload.id || '');
    const customMetadata = transaction.custom_metadata || {};
    const userId = customMetadata.user_id || payload.user_id;

    const isApproved = eventName.includes('approved') || eventName.includes('paid') || transaction.status === 'approved';
    const isCanceled = eventName.includes('canceled') || eventName.includes('declined') || transaction.status === 'canceled' || transaction.status === 'declined';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase service role keys missing for Webhook');
      return res.status(200).json({ received: true, warning: 'Supabase unconfigured' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (fedaTxId) {
      // Update payment_transactions status
      await supabaseAdmin
        .from('payment_transactions')
        .update({
          status: isApproved ? 'approved' : isCanceled ? 'canceled' : 'failed',
          raw_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('feda_transaction_id', fedaTxId);
    }

    if (isApproved && userId) {
      console.log(`🎉 Webhook activating PRO subscription for User: ${userId}`);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        plan: 'pro',
        status: 'active',
        transaction_id: fedaTxId,
        amount: 5000,
        currency: 'XOF',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });
    } else if (isCanceled && userId) {
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        plan: 'free',
        status: 'inactive',
        transaction_id: fedaTxId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    return res.status(200).json({ success: true, event: eventName, status: isApproved ? 'approved' : 'processed' });
  } catch (err: any) {
    console.error('FedaPay Webhook Exception:', err);
    return res.status(500).json({ error: err.message });
  }
}
