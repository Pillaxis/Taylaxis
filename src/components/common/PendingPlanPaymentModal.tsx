import React, { useState } from 'react';
import { Check, Sparkles, X, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { userService } from '../../services/userService';
import { SubscriptionService } from '../../services/subscriptionService';

interface PendingPlanPaymentModalProps {
  onClose: () => void;
  onSuccess: (planName: string) => void;
}

export const PendingPlanPaymentModal: React.FC<PendingPlanPaymentModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const profile = userService.getUserProfile();
  const workshop = userService.getWorkshopProfile();

  const handleConfirmAndPay = async () => {
    setLoading(true);
    setErrorMsg(null);

    const idempotencyKey = `taylaxis_pro_${profile.id || 'anon'}_${Date.now()}`;
    const pendingFeature = SubscriptionService.getPendingFeatureIntent() || '';

    // 1. Initiate FedaPay transaction via backend server API
    const serverRes = await SubscriptionService.createFedaPayment({
      userId: profile.id,
      email: profile.email,
      name: profile.fullName,
      phone: profile.phone,
      featureIntent: pendingFeature,
      idempotencyKey,
    });

    if (serverRes.success && serverRes.url) {
      window.location.href = serverRes.url;
      return;
    }

    // 2. Client-side FedaPay Widget fallback (if popup script is active)
    const launched = await paymentService.initiatePayment({
      amountFCFA: 5000,
      description: `Abonnement Taylaxis Pro - Atelier ${workshop.name || 'Couture'}`,
      customerName: profile.fullName || 'Tailleur Taylaxis',
      customerEmail: profile.email || 'atelier@taylaxis.com',
      customerPhone: profile.phone || '',
      onSuccess: async (txId) => {
        // Confirm server-side approval before granting Pro
        const verifyRes = await SubscriptionService.verifyTransaction(txId, profile.id);
        if (verifyRes.isPro) {
          localStorage.removeItem('taylaxis_pending_plan_v1');
          setLoading(false);
          onSuccess(`Taylaxis Pro (Réf: ${txId})`);
        } else {
          setLoading(false);
          setErrorMsg('Paiement non confirmé par la passerelle FedaPay.');
        }
      },
      onError: (err) => {
        setLoading(false);
        setErrorMsg(`Paiement non finalisé : ${err}`);
      },
    });

    if (!launched && !serverRes.success) {
      setLoading(false);
      setErrorMsg(serverRes.error || 'Impossible d\'initialiser le paiement FedaPay. Vérifiez votre connexion.');
    }
  };

  const handleDecline = () => {
    localStorage.removeItem('taylaxis_pending_plan_v1');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#0C0A27] via-[#1D1850] to-[#7C3AED] p-6 text-white text-center relative">
          <button
            onClick={handleDecline}
            disabled={loading}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Sparkles size={28} className="text-[#06B6D4]" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] text-xs font-black uppercase tracking-wider mb-2">
            <span>Confirmation du forfait Pro</span>
          </div>

          <h3 className="text-2xl font-black text-white leading-tight">
            Activer l'Atelier Pro
          </h3>
          <p className="text-xs text-white/70 mt-1 font-medium">
            Pour {workshop.name || 'votre atelier de couture'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Price Tag */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9FE] border border-[#7C3AED]/20">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Formule Choisie</span>
              <span className="text-lg font-black text-gray-900">Taylaxis Pro</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#7C3AED]">5 000 F</span>
              <span className="text-xs text-gray-500 font-medium block">CFA / mois</span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">Ce que vous débloquez :</span>
            <ul className="space-y-2 text-xs font-semibold text-gray-700">
              <li className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Clients, commandes & rendez-vous illimités</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Relances WhatsApp & SMS 1-Clic</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Statistiques financières & Chiffre d'Affaires</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Historique complet et filtres avancés</span>
              </li>
            </ul>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-start space-x-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmAndPay}
              disabled={loading}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#3155C8] hover:opacity-95 text-white font-black text-sm sm:text-base shadow-lg shadow-[#7C3AED]/30 active:scale-98 transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion à FedaPay...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Continuer vers le paiement — 5 000 FCFA</span>
                </>
              )}
            </button>

            <button
              onClick={handleDecline}
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              Conserver le plan gratuit pour l'instant
            </button>
          </div>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 font-medium text-center">
            <Lock size={12} />
            <span>Paiement sécurisé par FedaPay (TMoney, Flooz, Wave, Carte)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
