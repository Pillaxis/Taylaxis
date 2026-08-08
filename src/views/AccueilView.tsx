import React from 'react';
import {
  TrendingUp,
  Wallet,
  ClipboardList,
  AlertTriangle,
  Calendar,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_ORDERS } from '../data/mockData';
import type { Order, StatusType } from '../types';
import { Sparkles, MessageSquare, Truck } from 'lucide-react';

interface AccueilViewProps {
  orders?: Order[];
  onNavigateToCommandes: () => void;
  onNavigateToAgenda: () => void;
  onSelectClient: (clientId: string) => void;
  onOpenNewClientModal: () => void;
  onOpenNewOrderModal: () => void;
  onUpdateOrderStatus?: (orderId: string, status: StatusType) => void;
  onPayOrder?: (orderId: string, amount: number) => void;
}

export const AccueilView: React.FC<AccueilViewProps> = ({
  orders,
  onNavigateToCommandes,
  onNavigateToAgenda,
  onSelectClient,
  onOpenNewClientModal,
  onOpenNewOrderModal,
  onUpdateOrderStatus,
}) => {
  const displayOrders = orders || MOCK_ORDERS;

  return (
    <div className="bg-[#0C0A27] min-h-screen text-white">
      {/* Top Dark Region: 4 Stat Cards + Red Alert Banner */}
      <div className="px-3.5 pt-1 pb-3 space-y-2.5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
        {/* 4 Stat Cards Grid (2x2 on Mobile, 4x1 on Tablet) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Card 1: CA du jour (Emerald Green) */}
          <div className="p-2.5 px-3 rounded-[16px] bg-gradient-to-br from-[#059669] to-[#10B981] text-white shadow-xs space-y-1 cursor-pointer palette-card-hover active:scale-98">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">CA du jour</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={13} className="text-white" />
              </div>
            </div>
            <div className="text-body-strong font-bold text-base tabular-nums">85 000 FCFA</div>
            <div className="text-[10px] font-medium opacity-85">↗ +12% vs hier</div>
          </div>

          {/* Card 2: CA du mois (Purple) */}
          <div className="p-2.5 px-3 rounded-[16px] bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white shadow-xs space-y-1 cursor-pointer palette-card-hover active:scale-98">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">CA du mois</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Wallet size={13} className="text-white" />
              </div>
            </div>
            <div className="text-body-strong font-bold text-base tabular-nums">1 240 000 FCFA</div>
            <div className="text-[10px] font-medium opacity-85">↗ +18% vs mois dernier</div>
          </div>

          {/* Card 3: Commandes en cours (GOLD / Or) */}
          <div
            onClick={onNavigateToCommandes}
            className="p-2.5 px-3 rounded-[16px] bg-gradient-to-br from-[#B45309] via-[#D97B1F] to-[#F59E0B] text-white shadow-xs space-y-1 cursor-pointer palette-card-hover active:scale-98"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">Commandes en cours</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={13} className="text-white" />
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums">18</div>
            <div className="text-[10px] font-medium opacity-85">🕒 2 en retard</div>
          </div>

          {/* Card 4: À encaisser (Royal Blue) */}
          <div
            onClick={onNavigateToCommandes}
            className="p-2.5 px-3 rounded-[16px] bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-white shadow-xs space-y-1 cursor-pointer palette-card-hover active:scale-98"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">À encaisser</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Briefcase size={13} className="text-white" />
              </div>
            </div>
            <div className="text-body-strong font-bold text-base tabular-nums">350 000 FCFA</div>
            <div className="text-[10px] font-medium opacity-85">Sur 12 commandes</div>
          </div>
        </div>

        {/* Red Alert Banner Card */}
        <div
          onClick={onNavigateToCommandes}
          className="p-2.5 px-3.5 rounded-[16px] bg-[#191438] text-white flex items-center justify-between cursor-pointer shadow-xs border border-white/5 palette-card-hover active:scale-98"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle size={17} />
            </div>
            <div>
              <div className="text-caption font-bold text-white leading-tight">
                2 commandes en retard de livraison
              </div>
              <div className="text-[11px] text-white/70 leading-tight mt-0.5">
                Vérifiez-les pour éviter l'insatisfaction client.
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-white/60 flex-shrink-0" />
        </div>
      </div>

      {/* White Rounded Sheet */}
      <div className="bg-white text-[#110E2D] rounded-t-[28px] pt-4 px-4 pb-mobile-safe space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-xl min-h-[500px]">
        {/* Section: Livraisons prochaines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h2 font-bold text-[#110E2D]">Livraisons prochaines</h3>
            <button
              onClick={onNavigateToCommandes}
              className="text-caption font-semibold text-[#7C3AED] hover:underline cursor-pointer py-1 px-2"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-2.5">
            {displayOrders.slice(0, 4).map((order) => {
              const waMessage = `Bonjour ${order.clientName}, votre commande "${order.title}" (${order.orderNumber}) est prête à l'atelier ! Vous pouvez passer la récupérer.`;
              const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectClient(order.clientId)}
                  className="p-3.5 rounded-[20px] bg-white border border-[#EDE9F6] space-y-2 cursor-pointer white-element-hover active:scale-98 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {order.clientName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-body-strong text-[#110E2D] font-bold">
                          Commande {order.orderNumber} • {order.title}
                        </div>
                        <div className="text-caption text-[#605B80]">{order.clientName}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right text-caption text-[#605B80] flex items-center space-x-1">
                        <Calendar size={13} className="text-[#7C3AED]" />
                        <span className="font-medium text-[#110E2D] text-[11px]">{order.deliveryDate.split(' ')[0]}</span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Tailor Workflow Quick Actions Bar */}
                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-[#EDE9F6]/50">
                    {(order.status === 'progress' || order.status === 'late') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateOrderStatus?.(order.id, 'ready');
                        }}
                        className="px-2.5 py-0.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-[10px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer active:scale-95"
                      >
                        <Sparkles size={11} />
                        <span>Marquer Prête</span>
                      </button>
                    )}

                    {(order.status === 'ready' || order.status === 'to_deliver') && (
                      <>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full text-[10px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <MessageSquare size={11} />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateOrderStatus?.(order.id, 'done');
                          }}
                          className="px-2.5 py-0.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-[10px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer active:scale-95"
                        >
                          <Truck size={11} />
                          <span>Marquer Livrée</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Actions rapides */}
        <div className="space-y-3">
          <h3 className="text-h2 font-bold text-[#110E2D]">Actions rapides</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Nouveau client */}
            <button
              onClick={onOpenNewClientModal}
              className="p-3 bg-white rounded-[20px] border border-[#EDE9F6] flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#110E2D] leading-tight">
                Nouveau client
              </span>
            </button>

            {/* Nouvelle commande */}
            <button
              onClick={onOpenNewOrderModal}
              className="p-3 bg-white rounded-[20px] border border-[#EDE9F6] flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#110E2D] leading-tight">
                Nouvelle<br />commande
              </span>
            </button>

            {/* Ajouter rendez-vous */}
            <button
              onClick={onNavigateToAgenda}
              className="p-3 bg-white rounded-[20px] border border-[#EDE9F6] flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <CalendarPlus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#110E2D] leading-tight">
                Ajouter<br />rendez-vous
              </span>
            </button>

            {/* Enregistrer paiement */}
            <button
              onClick={onNavigateToCommandes}
              className="p-3 bg-white rounded-[20px] border border-[#EDE9F6] flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#110E2D] leading-tight">
                Enregistrer<br />paiement
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
