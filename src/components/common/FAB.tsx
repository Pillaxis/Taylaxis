import React, { useState } from 'react';
import { Plus, UserPlus, ShoppingBag, Calendar, X } from 'lucide-react';
import type { TabType } from '../layout/BottomNav';

interface FABProps {
  activeTab?: TabType;
  onOpenNewClient?: () => void;
  onOpenNewOrder?: () => void;
  onOpenNewAppointment?: () => void;
}

export const FAB: React.FC<FABProps> = ({
  onOpenNewClient,
  onOpenNewOrder,
  onOpenNewAppointment,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (actionFn?: () => void) => {
    setIsOpen(false);
    if (actionFn) actionFn();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[80px] right-4 z-40 w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:bg-brand-600 active:scale-95 transition-all focus:outline-none cursor-pointer"
        aria-label="Action rapide"
      >
        <Plus size={28} className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Quick Action Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md md:max-w-xl bg-surface border-t border-subtle rounded-t-[24px] p-5 shadow-2xl z-10 transition-transform duration-200 transform translate-y-0">
            <div className="flex items-center justify-between pb-3 border-b border-subtle mb-4">
              <h3 className="text-h2 text-primary font-semibold">Actions rapides</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-tertiary hover:text-primary rounded-full cursor-pointer"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleAction(onOpenNewClient)}
                className="w-full flex items-center space-x-3 p-3.5 rounded-[14px] bg-surface-alt hover:bg-canvas text-primary font-medium transition-colors text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <div className="text-body-strong">Nouveau Client</div>
                  <div className="text-caption text-secondary">Ajouter une nouvelle fiche client</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(onOpenNewOrder)}
                className="w-full flex items-center space-x-3 p-3.5 rounded-[14px] bg-surface-alt hover:bg-canvas text-primary font-medium transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] dark:text-[#3ECF8E] flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div className="text-body-strong">Nouvelle Commande</div>
                  <div className="text-caption text-secondary">Créer une commande ou mesure</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(onOpenNewAppointment)}
                className="w-full flex items-center space-x-3 p-3.5 rounded-[14px] bg-surface-alt hover:bg-canvas text-primary font-medium transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#D97B1F]/10 text-[#D97B1F] dark:text-[#E8A050] flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-body-strong">Nouveau Rendez-vous</div>
                  <div className="text-caption text-secondary">Programmer un essayage ou livraison</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
