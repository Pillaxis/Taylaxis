/**
 * Taylaxis Payment Gateway Integration Service
 * Supports FedaPay, CinetPay, Paystack & Stripe for FCFA Payments (TMoney, Flooz, Orange Money, Wave, Cards)
 */

export interface PaymentConfig {
  fedaPayPublicKey?: string;
  cinetPaySiteId?: string;
  cinetPayApiKey?: string;
  paystackPublicKey?: string;
  stripePublicKey?: string;
}

export const getPaymentConfig = (): PaymentConfig => {
  return {
    fedaPayPublicKey: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_live_dKHNwYdLIFa2Nw5YYys1mfim',
    cinetPaySiteId: import.meta.env.VITE_CINETPAY_SITE_ID || '',
    cinetPayApiKey: import.meta.env.VITE_CINETPAY_API_KEY || '',
    paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  };
};

export const isPaymentGatewayConfigured = (): boolean => {
  const config = getPaymentConfig();
  return Boolean(
    config.fedaPayPublicKey ||
      (config.cinetPaySiteId && config.cinetPayApiKey) ||
      config.paystackPublicKey ||
      config.stripePublicKey
  );
};

export const paymentService = {
  /**
   * Initiate subscription or order payment
   */
  async initiatePayment(options: {
    amountFCFA: number;
    description: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    onSuccess?: (transactionId: string) => void;
    onError?: (errorMsg: string) => void;
  }): Promise<boolean> {
    const config = getPaymentConfig();

    // 1. FEDAPAY INTEGRATION (Primary West African Mobile Money & Card Gateway)
    if (config.fedaPayPublicKey) {
      try {
        console.log('Initiating FedaPay transaction for', options.amountFCFA, 'FCFA');
        // FedaPay Checkout Script / Modal integration
        if ((window as any).FedaPay) {
          const customerData: any = {
            email: options.customerEmail || 'client@taylaxis.com',
            lastname: options.customerName || 'Tailleur Taylaxis',
          };
          if (options.customerPhone && options.customerPhone.trim().length > 3) {
            customerData.phone_number = {
              number: options.customerPhone.replace(/\s+/g, ''),
            };
          }

          const isLive = config.fedaPayPublicKey.startsWith('pk_live');
          const widget = (window as any).FedaPay.init({
            public_key: config.fedaPayPublicKey,
            environment: isLive ? 'live' : 'sandbox',
            transaction: {
              amount: options.amountFCFA,
              description: options.description,
            },
            customer: customerData,
            onComplete: (resp: any) => {
              console.log('FedaPay response:', resp);
              const isCompleted =
                resp.reason === 'CHECKOUT COMPLETE' ||
                resp.reason === (window as any).FedaPay?.CHECKOUT_COMPLETED;

              if (isCompleted && resp.transaction) {
                options.onSuccess?.(String(resp.transaction.id || `feda_${Date.now()}`));
              } else {
                options.onError?.('Paiement annulé ou non finalisé.');
              }
            },
          });
          widget.open();
          return true;
        }
      } catch (err: any) {
        console.warn('FedaPay error:', err);
      }
    }

    // 2. CINETPAY INTEGRATION
    if (config.cinetPaySiteId && config.cinetPayApiKey) {
      try {
        if ((window as any).CinetPay) {
          (window as any).CinetPay.setConfig({
            apikey: config.cinetPayApiKey,
            site_id: config.cinetPaySiteId,
            notify_url: `${window.location.origin}/api/cinetpay-notify`,
            mode: 'PRODUCTION',
          });

          (window as any).CinetPay.getCheckout({
            transaction_id: `tx_${Date.now()}`,
            amount: options.amountFCFA,
            currency: 'XOF',
            channels: 'ALL',
            description: options.description,
            customer_name: options.customerName,
            customer_email: options.customerEmail || 'atelier@taylaxis.com',
            customer_phone_number: options.customerPhone || '',
          });

          (window as any).CinetPay.waitResponse((data: any) => {
            if (data.status === 'ACCEPTED') {
              options.onSuccess?.(data.operator_id || data.transaction_id);
            } else {
              options.onError?.('Paiement non validé.');
            }
          });
          return true;
        }
      } catch (err: any) {
        console.warn('CinetPay error:', err);
      }
    }

    // 3. PAYSTACK INTEGRATION
    if (config.paystackPublicKey) {
      try {
        if ((window as any).PaystackPop) {
          const handler = (window as any).PaystackPop.setup({
            key: config.paystackPublicKey,
            email: options.customerEmail || 'atelier@taylaxis.com',
            amount: options.amountFCFA * 100, // Paystack uses sub-units
            currency: 'XOF',
            ref: `paystack_${Date.now()}`,
            callback: (response: any) => {
              options.onSuccess?.(response.reference);
            },
            onClose: () => {
              options.onError?.('Session de paiement fermée.');
            },
          });
          handler.openIframe();
          return true;
        }
      } catch (err: any) {
        console.warn('Paystack error:', err);
      }
    }

    // Fallback mode if no keys are filled in .env.local yet
    console.warn('Aucune clé API de paiement configurée dans .env.local.');
    return false;
  },
};
