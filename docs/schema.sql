-- =========================================================
-- TAYLAXIS V1 — SCHEMA POSTGRESQL & POLITIQUES RLS SUPABASE
-- Copiez et collez ce script dans le "SQL Editor" de Supabase
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES ATELIERS (WORKSHOPS)
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Lomé',
    country TEXT DEFAULT 'Togo',
    nif_rccm TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE DES CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    initials TEXT,
    location TEXT,
    status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'prospect', 'inactif')),
    is_new BOOLEAN DEFAULT false,
    address TEXT,
    birth_date TEXT,
    gender TEXT,
    age_group TEXT CHECK (age_group IN ('adulte', 'enfant')),
    age INTEGER,
    notes TEXT,
    total_spent_fcfa NUMERIC DEFAULT 0,
    custom_measurements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    title TEXT NOT NULL,
    price_fcfa NUMERIC NOT NULL DEFAULT 0,
    paid_fcfa NUMERIC NOT NULL DEFAULT 0,
    balance_fcfa NUMERIC NOT NULL DEFAULT 0,
    order_date TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    manufacturing_status TEXT NOT NULL DEFAULT 'CONFIRMEE' 
        CHECK (manufacturing_status IN ('BROUILLON', 'CONFIRMEE', 'EN_COURS', 'PRETE', 'A_LIVRER', 'LIVREE', 'TERMINEE')),
    payment_status TEXT NOT NULL DEFAULT 'NON_PAYEE'
        CHECK (payment_status IN ('NON_PAYEE', 'PARTIELLEMENT_PAYEE', 'PAYEE')),
    due_date_status TEXT NOT NULL DEFAULT 'A_TEMPS'
        CHECK (due_date_status IN ('A_TEMPS', 'AUJOURD_HUI', 'BIENTOT', 'EN_RETARD')),
    priority TEXT NOT NULL DEFAULT 'NORMALE'
        CHECK (priority IN ('CRITIQUE', 'HAUTE', 'MOYENNE', 'NORMALE')),
    garment_type TEXT,
    fabric_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. REGISTRE DES PAIEMENTS DE COMMANDE
CREATE TABLE IF NOT EXISTS order_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_fcfa NUMERIC NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('ESPECES', 'MOBILE_MONEY', 'VIREMENT', 'CARTE', 'AUTRE')),
    reference TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TIMELINE DES ÉVÉNEMENTS ATELIER
CREATE TABLE IF NOT EXISTS order_history_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp_str TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SNAPSHOTS DES MENSURATIONS PAR COMMANDE
CREATE TABLE IF NOT EXISTS order_measurement_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    taken_at TEXT NOT NULL,
    measurements JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================
-- ACTIVATION ET POLITIQUES RLS (ROW LEVEL SECURITY)
-- Seul le propriétaire des données (tailleur authentifié) peut y accéder
-- =========================================================

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_measurement_snapshots ENABLE ROW LEVEL SECURITY;

-- Politiques Workshops
CREATE POLICY "Workshops user isolation" ON workshops
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politiques Clients
CREATE POLICY "Clients user isolation" ON clients
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politiques Orders
CREATE POLICY "Orders user isolation" ON orders
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politiques Order Payments
CREATE POLICY "Order Payments user isolation" ON order_payments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politiques Timeline Events
CREATE POLICY "Timeline Events user isolation" ON order_history_events
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politiques Measurement Snapshots
CREATE POLICY "Measurement Snapshots user isolation" ON order_measurement_snapshots
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
