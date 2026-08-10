import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'taylaxis-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/create-feda-transaction') && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr || '{}');
                  const secretKey = env.FEDAPAY_SECRET_KEY || process.env.FEDAPAY_SECRET_KEY || '';
                  if (!secretKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'FEDAPAY_SECRET_KEY non trouvée dans .env.local' }));
                    return;
                  }

                  const isSandbox = secretKey.startsWith('sk_sandbox');
                  const fedaBaseUrl = isSandbox
                    ? 'https://sandbox-api.fedapay.com/v1'
                    : 'https://api.fedapay.com/v1';

                  const txRes = await fetch(`${fedaBaseUrl}/transactions`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${secretKey}`,
                    },
                    body: JSON.stringify({
                      description: 'Abonnement Taylaxis Pro (5 000 FCFA / mois)',
                      amount: 5000,
                      currency: { iso: 'XOF' },
                      callback_url: `http://${req.headers.host || 'localhost:5173'}/?feda_tx_id={id}&status=callback`,
                      customer: {
                        email: body.email || body.customerEmail || 'client@taylaxis.com',
                        firstname: body.name || body.customerName || 'Tailleur',
                        lastname: 'Taylaxis',
                        phone_number:
                          body.phone || body.customerPhone
                            ? { number: String(body.phone || body.customerPhone).replace(/\s+/g, '') }
                            : undefined,
                      },
                      custom_metadata: {
                        user_id: body.userId || 'dev_user',
                        plan: 'PRO',
                        feature_intent: body.featureIntent || '',
                      },
                    }),
                  });

                  if (!txRes.ok) {
                    const errTxt = await txRes.text();
                    console.error('FedaPay dev API error:', txRes.status, errTxt);
                    res.statusCode = txRes.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Erreur FedaPay API', details: errTxt }));
                    return;
                  }

                  const txData = (await txRes.json()) as any;
                  const transaction = txData.v1?.transaction || txData.transaction || txData;
                  const fedaTxId = transaction.id;

                  const tokenRes = await fetch(`${fedaBaseUrl}/transactions/${fedaTxId}/token`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${secretKey}`,
                    },
                  });

                  let checkoutUrl = transaction.url || '';
                  if (tokenRes.ok) {
                    const tokenData = (await tokenRes.json()) as any;
                    checkoutUrl = tokenData.url || tokenData.v1?.token?.url || checkoutUrl;
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      transactionId: fedaTxId,
                      url: checkoutUrl,
                    })
                  );
                } catch (e: any) {
                  console.error('Dev middleware exception:', e);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
  };
});
