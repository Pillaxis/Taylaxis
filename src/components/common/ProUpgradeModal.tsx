import React, { useState } from 'react';
import { Sparkles, Check, X, Lock, ArrowRight, Zap } from 'lucide-react';

interface ProUpgradeModalProps {
  reasonMessage?: string;
  featureName?: string;
  onClose: () => void;
  onStartCheckout: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  reasonMessage,
  onClose,
  onStartCheckout,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleCheckoutClick = () => {
    setSubmitting(true);
    onStartCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header Gradient */}
        <div className="bg-gradient-to-br from-[#0C0A27] via-[#1D1850] to-[#7C3AED] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Zap size={28} className="text-[#06B6D4] animate-pulse" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Passez à la vitesse supérieure</span>
          </div>

          <h3 className="text-2xl font-black text-white leading-tight">
            Débloquez Taylaxis Pro
          </h3>
          <p className="text-xs text-white/75 mt-1 font-medium">
            Propulsez la gestion de votre atelier sans aucune restriction
          </p>
        </div>

        {/* Reason Alert Banner */}
        {reasonMessage && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-5 py-3 flex items-start space-x-2.5 text-amber-900">
            <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              !
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {reasonMessage}
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Price Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9FE] border border-[#7C3AED]/20">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Plan Recommandé</span>
              <span className="text-lg font-black text-gray-900">Taylaxis Pro</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#7C3AED]">5 000 F</span>
              <span className="text-xs text-gray-500 font-medium block">CFA / mois</span>
            </div>
          </div>

          {/* Features Comparison Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">Avantages inclus dans le Plan Pro :</span>
            <ul className="space-y-2 text-xs font-semibold text-gray-700">
              <li className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Clients & mensurations <strong>illimités</strong></span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Commandes & Agenda d'essayage <strong>illimités</strong></span>
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
                <span>Reçus PDF professionnels avec Logo Atelier</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckoutClick}
              disabled={submitting}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#3155C8] hover:opacity-95 text-white font-black text-sm sm:text-base shadow-lg shadow-[#7C3AED]/30 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Passer à Pro — 5 000 FCFA</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={submitting}
              className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors text-center cursor-pointer"
            >
              Continuer en version limitée
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
