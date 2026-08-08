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

const SEED_CLIENTS = [
  { name: 'Kossi A.', phone: '90 12 34 56', initials: 'KA', location: 'Lomé', status: 'actif', totalSpentFCFA: 320000 },
  { name: 'Akouvi E.', phone: '98 76 54 32', initials: 'AE', location: 'Lomé', status: 'actif', totalSpentFCFA: 240000 },
  { name: 'Jean P.', phone: '91 23 45 67', initials: 'JP', location: 'Agoè', status: 'actif', totalSpentFCFA: 195000 },
  { name: 'Komlan D.', phone: '70 45 67 89', initials: 'KD', location: 'Adidogomé', status: 'actif', totalSpentFCFA: 280000 },
  { name: 'Afiwa B.', phone: '97 65 43 21', initials: 'AB', location: 'Bè', status: 'actif', totalSpentFCFA: 120000 },
];

const SEED_ORDERS = [
  { orderNumber: '#024', clientName: 'Kossi A.', title: 'Costume 3 pièces', priceFCFA: 45000, paidFCFA: 20000, balanceFCFA: 25000, orderDate: '18 Mai 2024', deliveryDate: 'Demain 10:00', status: 'late' },
  { orderNumber: '#028', clientName: 'Akouvi E.', title: 'Robe longue', priceFCFA: 30000, paidFCFA: 10000, balanceFCFA: 20000, orderDate: '20 Mai 2024', deliveryDate: '15 Mai 15:00', status: 'to_deliver' },
  { orderNumber: '#031', clientName: 'Jean P.', title: 'Chemise homme', priceFCFA: 20000, paidFCFA: 10000, balanceFCFA: 10000, orderDate: '22 Mai 2024', deliveryDate: '16 Mai 11:00', status: 'progress' },
  { orderNumber: '#034', clientName: 'Komlan D.', title: 'Pantalon + Veste', priceFCFA: 50000, paidFCFA: 25000, balanceFCFA: 25000, orderDate: '23 Mai 2024', deliveryDate: '19 Mai 09:00', status: 'progress' },
  { orderNumber: '#037', clientName: 'Afiwa B.', title: 'Robe courte', priceFCFA: 25000, paidFCFA: 25000, balanceFCFA: 0, orderDate: '26 Mai 2024', deliveryDate: '26 Mai 2024', status: 'ready' },
];

async function seed() {
  console.log('🌱 Seeding initial full-stack data into Supabase...');

  for (const c of SEED_CLIENTS) {
    const { error } = await supabase.from('clients').insert({
      name: c.name,
      phone: c.phone,
      initials: c.initials,
      location: c.location,
      status: c.status,
      is_new: false,
      total_spent_fcfa: c.totalSpentFCFA,
      custom_measurements: [
        { id: 'm-poitrine', label: 'Tour de poitrine', valueCm: 102, iconName: 'Shirt' },
        { id: 'm-taille', label: 'Tour de taille', valueCm: 86, iconName: 'Ruler' },
        { id: 'm-longueur', label: 'Longueur vêtement', valueCm: 108, iconName: 'MoveDown' },
        { id: 'm-carrure', label: 'Carrure épaules', valueCm: 47, iconName: 'Maximize2' },
      ],
    });

    if (error) {
      console.log(`Client ${c.name} seed notice:`, error.message);
    }
  }
  console.log('✅ Clients seeded!');

  const { data: clientsData } = await supabase.from('clients').select('id, name');
  const clientMap = new Map((clientsData || []).map((c) => [c.name, c.id]));

  for (const o of SEED_ORDERS) {
    const clientId = clientMap.get(o.clientName) || null;
    const mfgStatus = o.status === 'ready' ? 'PRETE' : o.status === 'to_deliver' ? 'A_LIVRER' : 'EN_COURS';

    const { data: insertedOrder, error: oErr } = await supabase.from('orders').insert({
      order_number: o.orderNumber,
      client_name: o.clientName,
      client_id: clientId,
      title: o.title,
      price_fcfa: o.priceFCFA,
      paid_fcfa: o.paidFCFA,
      balance_fcfa: o.balanceFCFA,
      order_date: o.orderDate,
      delivery_date: o.deliveryDate,
      manufacturing_status: mfgStatus,
      payment_status: o.balanceFCFA === 0 ? 'PAYEE' : o.paidFCFA > 0 ? 'PARTIELLEMENT_PAYEE' : 'NON_PAYEE',
      due_date_status: o.status === 'late' ? 'EN_RETARD' : 'A_TEMPS',
      priority: o.status === 'late' ? 'CRITIQUE' : 'NORMALE',
    }).select().single();

    if (oErr) {
      console.log(`Order ${o.orderNumber} seed notice:`, oErr.message);
    } else if (insertedOrder) {
      await supabase.from('order_payments').insert({
        order_id: insertedOrder.id,
        amount_fcfa: o.paidFCFA,
        payment_date: o.orderDate,
        payment_method: 'ESPECES',
        note: 'Acompte initial',
      });

      await supabase.from('order_history_events').insert({
        order_id: insertedOrder.id,
        timestamp_str: `${o.orderDate} • 09:00`,
        type: 'COMMANDE_CREEE',
        title: 'Commande créée',
        description: `Création de la commande ${o.title} (${o.orderNumber}) de ${o.priceFCFA.toLocaleString('fr-FR')} FCFA.`,
        performed_by: 'Atelier Taylaxis',
      });
    }
  }

  console.log('🎉 Full-stack data seeding successfully completed!');
}

seed();
