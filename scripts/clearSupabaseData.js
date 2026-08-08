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

async function clearData() {
  console.log('🧹 Clearing all test data from Supabase tables for clean production startup...');

  const tables = ['order_measurement_snapshots', 'order_history_events', 'order_payments', 'orders', 'clients', 'workshops'];

  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.log(`Notice clearing ${t}:`, error.message);
    } else {
      console.log(`✅ Table "${t}" cleaned!`);
    }
  }

  console.log('✨ Supabase database is now 100% clean and ready for real users!');
}

clearData();
