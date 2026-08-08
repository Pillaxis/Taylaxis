import fs from 'fs';
import path from 'path';

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

const url = envVars.VITE_SUPABASE_URL || '';
const projectRef = url.replace('https://', '').replace('.supabase.co', '');
const accessToken = envVars.SUPABASE_ACCESS_TOKEN;

async function executeMigration() {
  console.log('⚡ Executing full database schema migration on Supabase project:', projectRef);

  const schemaSql = fs.readFileSync(path.join(process.cwd(), 'docs', 'schema.sql'), 'utf8');

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: schemaSql }),
  });

  if (response.ok) {
    console.log('🎉 SUCCESS! Tables, indexes, and RLS policies created automatically on Supabase!');
  } else {
    const errText = await response.text();
    console.log('Management API status:', response.status, '| Error details:', errText);
  }
}

executeMigration();
