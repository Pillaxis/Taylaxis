import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zusmwpwkonmoyziaxbvo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || Buffer.from('c2Jfc2VjcmV0X0g5elpQVElOOHJQUktabXhmZ041WUFfdTVxMkpNQTk=', 'base64').toString('utf-8');

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
    const eventName = payload?.event || payload?.name || '';
    console.log(`⚡ FedaPay Webhook Event: ${eventName}`);

    if (!payload) {
      return res.status(400).json({ error: 'Payload vide.' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase service role keys missing for Webhook');
      return res.status(200).json({ received: true, warning: 'Supabase unconfigured' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const transaction = payload.entity || payload.transaction || payload;
    const fedaTxId = String(transaction.id || payload.id || '');
    const customMetadata = transaction.custom_metadata || {};
    const userId = customMetadata.user_id || payload.user_id;
    const featureIntent = customMetadata.feature_intent || '';

    const isApproved = eventName.includes('approved') || eventName.includes('paid') ||
                       transaction.status === 'approved' || transaction.status === 'transferred';
    const isCanceled = eventName.includes('canceled') || eventName.includes('declined') ||
                       transaction.status === 'canceled' || transaction.status === 'declined';
    const isRefunded = eventName.includes('refunded') || transaction.status === 'refunded';

    // IDEMPOTENCY CHECK: Verify if this transaction was already processed
    if (fedaTxId) {
      const { data: existingTx } = await supabaseAdmin
        .from('payment_transactions')
        .select('status')
        .eq('feda_transaction_id', fedaTxId)
        .maybeSingle();

      // If already approved, don't re-process (idempotent)
      if (existingTx && existingTx.status === 'approved' && isApproved) {
        console.log(`⏭️ Transaction ${fedaTxId} already approved — skipping duplicate webhook.`);
        return res.status(200).json({ success: true, event: eventName, status: 'already_processed' });
      }

      // Update payment_transactions status
      await supabaseAdmin
        .from('payment_transactions')
        .update({
          status: isApproved ? 'approved' : isCanceled ? 'canceled' : isRefunded ? 'refunded' : 'failed',
          raw_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('feda_transaction_id', fedaTxId);
    }

    if (isApproved && userId) {
      console.log(`🎉 Webhook activating PRO subscription for User: ${userId}`);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        plan: 'pro',
        status: 'active',
        transaction_id: fedaTxId,
        amount: Number(transaction.amount || 5000),
        currency: 'XOF',
        feature_intent: featureIntent || null,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        canceled_at: null,
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });

    } else if (isRefunded && userId) {
      // REFUND: Revoke Pro access
      console.log(`💸 Webhook revoking PRO for refunded transaction. User: ${userId}`);

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        plan: 'free',
        status: 'inactive',
        transaction_id: fedaTxId,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    } else if (isCanceled && userId) {
      // Only revert to free if subscription is still pending (not already active from a different tx)
      const { data: currentSub } = await supabaseAdmin
        .from('subscriptions')
        .select('status, transaction_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (currentSub && currentSub.status === 'pending' && currentSub.transaction_id === fedaTxId) {
        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          plan: 'free',
          status: 'inactive',
          transaction_id: fedaTxId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }
    }

    return res.status(200).json({
      success: true,
      event: eventName,
      status: isApproved ? 'approved' : isRefunded ? 'refunded' : 'processed',
    });
  } catch (err: any) {
    console.error('FedaPay Webhook Exception:', err);
    return res.status(500).json({ error: err.message });
  }
}
