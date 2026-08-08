import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local dynamically
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
});

const url = envVars.VITE_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function verify() {
  console.log('🔍 Verifying created PostgreSQL tables on Supabase...');

  const tables = ['workshops', 'clients', 'orders', 'order_payments', 'order_history_events', 'order_measurement_snapshots'];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) {
      console.log(`❌ Table "${t}" error:`, error.message);
    } else {
      console.log(`✅ Table "${t}" is ACTIVE! Total rows:`, data.length);
    }
  }
}

verify();
