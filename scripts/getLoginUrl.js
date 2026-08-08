import { exec } from 'child_process';

console.log('Fetching Supabase login URL...');

const child = exec('npx -y supabase login --no-browser');

child.stdout.on('data', (data) => {
  console.log('CLI OUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('CLI ERR:', data.toString());
});

child.on('close', (code) => {
  console.log('CLI exited with code', code);
});
