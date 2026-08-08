import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
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

console.log('⚡ Initializing Taylaxis Database on Supabase project:', url);

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function runSetup() {
  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'docs', 'schema.sql'), 'utf8');

    // Try executing schema SQL via management endpoint or query API
    console.log('Sending schema DDL to Supabase...');

    const projectRef = url.replace('https://', '').replace('.supabase.co', '');

    // Send SQL query via REST / SQL API
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: schemaSql }),
    });

    if (response.ok) {
      console.log('🎉 SUCCESS! Tables and RLS policies created automatically in Supabase!');
    } else {
      const errText = await response.text();
      console.log('Management API response status:', response.status, errText);
    }

    // Verify created tables
    console.log('Verifying created tables...');
    const { data: clients, error: cErr } = await supabaseAdmin.from('clients').select('*');
    if (cErr) {
      console.log('Clients table status:', cErr.message);
    } else {
      console.log('✅ "clients" table is active and verified!');
    }

  } catch (err) {
    console.error('Setup script exception:', err.message);
  }
}

runSetup();
