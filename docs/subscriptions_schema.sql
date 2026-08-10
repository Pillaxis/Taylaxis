-- =========================================================
-- TAYLAXIS PRO — SCHEMA GESTION ABONNEMENTS & TRANSACTIONS FEDAPAY
-- Évolutif : Plans (FREE, PRO, BUSINESS, ENTERPRISE)
-- V2 : Sécurité renforcée + idempotence + expiration
-- =========================================================

-- 1. TABLE DES ABONNEMENTS (SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending', 'expired', 'canceled')),
    transaction_id TEXT,
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'XOF',
    feature_intent TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLE DES TRANSACTIONS DE PAIEMENT (PAYMENT_TRANSACTIONS)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feda_transaction_id TEXT UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 5000,
    currency TEXT DEFAULT 'XOF',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'canceled', 'declined', 'failed', 'refunded')),
    feature_intent TEXT,
    idempotency_key TEXT,
    raw_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES POUR ACCÉLÉRER LES REQUÊTES
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_feda_id ON payment_transactions(feda_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency ON payment_transactions(idempotency_key);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) — V2 SÉCURITÉ RENFORCÉE
-- Les utilisateurs peuvent UNIQUEMENT LIRE leur propre abonnement.
-- Seul le service_role (API serveur) peut modifier les abonnements.
-- =========================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques permissives
DROP POLICY IF EXISTS "Subscriptions user isolation" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "Payment transactions user isolation" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_select_own" ON payment_transactions;

-- SUBSCRIPTIONS : Lecture seule pour l'utilisateur authentifié
CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- PAYMENT_TRANSACTIONS : Lecture seule pour l'utilisateur authentifié
CREATE POLICY "payment_transactions_select_own" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- NOTE: INSERT/UPDATE/DELETE sont BLOQUÉS pour le rôle authenticated.
-- Seul le service_role (utilisé par les API serverless) peut modifier ces tables.
-- Cela empêche tout utilisateur de modifier son propre plan/statut via le frontend.
