import React, { useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  Sparkles,
  MessageSquare,
  DollarSign,
  Check,
  X,
} from 'lucide-react';
import type { Order, StatusType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface CommandesViewProps {
  orders: Order[];
  onSelectClient: (clientId: string, orderId?: string) => void;
  onOpenNewOrderModal?: () => void;
  onUpdateOrderStatus?: (orderId: string, status: StatusType) => void;
  onPayOrder?: (orderId: string, amount: number) => void;
}

export const CommandesView: React.FC<CommandesViewProps> = ({
  orders,
  onSelectClient,
  onUpdateOrderStatus,
  onPayOrder,
}) => {
  const [activeTab, setActiveTab] = useState<StatusType | 'all'>('all');
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const progressCount = orders.filter((o) => o.status === 'progress').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const toDeliverCount = orders.filter((o) => o.status === 'to_deliver').length;
  const doneCount = orders.filter((o) => o.status === 'done').length;
  const lateCount = orders.filter((o) => o.status === 'late').length;

  return (
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner relative">
      {/* 6 Responsive Horizontal Rectangular Palettes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Card 1: Toutes (Purple Accent) */}
        <div
          onClick={() => setActiveTab('all')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'all'
              ? 'bg-[#F3E8FF] border-[#7C3AED] shadow-sm ring-2 ring-[#7C3AED]/20'
              : 'bg-[#F3E8FF]/60 border-[#E9D5FF] hover:bg-[#F3E8FF]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <ClipboardCheck size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#5B21B6] leading-tight truncate">Toutes</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#6B21A8] leading-none mt-0.5 truncate">Commandes</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums ml-1 flex-shrink-0">{orders.length || 78}</div>
        </div>

        {/* Card 2: En cours (OR / Gold) */}
        <div
          onClick={() => setActiveTab('progress')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'progress'
              ? 'bg-[#FEF3C7] border-[#FBBF24] shadow-sm ring-2 ring-[#FBBF24]/30'
              : 'bg-[#FEF3C7]/60 border-[#FDE68A] hover:bg-[#FEF3C7]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D97B1F]/20 text-[#B45309] flex items-center justify-center flex-shrink-0">
              <Clock size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#78350F] leading-tight truncate">En cours</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#B45309] leading-none mt-0.5 truncate">En atelier</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#78350F] tabular-nums ml-1 flex-shrink-0">{progressCount > 0 ? progressCount : 24}</div>
        </div>

        {/* Card 3: Prêtes (BLEU / Blue) */}
        <div
          onClick={() => setActiveTab('ready')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'ready'
              ? 'bg-[#DBEAFE] border-[#2563EB] shadow-sm ring-2 ring-[#2563EB]/20'
              : 'bg-[#DBEAFE]/60 border-[#BFDBFE] hover:bg-[#DBEAFE]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#1E40AF] leading-tight truncate">Prêtes</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#1D4ED8] leading-none mt-0.5 truncate">Finalisées</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#1E3A8A] tabular-nums ml-1 flex-shrink-0">{readyCount > 0 ? readyCount : 18}</div>
        </div>

        {/* Card 4: À livrer (VIOLET / Indigo) */}
        <div
          onClick={() => setActiveTab('to_deliver')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'to_deliver'
              ? 'bg-[#EDE9FE] border-[#7C3AED] shadow-sm ring-2 ring-[#7C3AED]/20'
              : 'bg-[#EDE9FE]/60 border-[#DDD6FE] hover:bg-[#EDE9FE]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <Truck size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#5B21B6] leading-tight truncate">À livrer</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#6D28D9] leading-none mt-0.5 truncate">Expéditions</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums ml-1 flex-shrink-0">{toDeliverCount > 0 ? toDeliverCount : 14}</div>
        </div>

        {/* Card 5: Livrées (VERT / Emerald) */}
        <div
          onClick={() => setActiveTab('done')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'done'
              ? 'bg-[#D1FAE5] border-[#10B981] shadow-sm ring-2 ring-[#10B981]/20'
              : 'bg-[#D1FAE5]/60 border-[#A7F3D0] hover:bg-[#D1FAE5]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#10B981]/15 text-[#059669] flex items-center justify-center flex-shrink-0">
              <PackageCheck size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#065F46] leading-tight truncate">Livrées</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#047857] leading-none mt-0.5 truncate">Terminées</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#064E3B] tabular-nums ml-1 flex-shrink-0">{doneCount > 0 ? doneCount : 10}</div>
        </div>

        {/* Card 6: En retard (ROUGE / Red) */}
        <div
          onClick={() => setActiveTab('late')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'late'
              ? 'bg-[#FEE2E2] border-[#EF4444] shadow-sm ring-2 ring-[#EF4444]/20'
              : 'bg-[#FEE2E2]/60 border-[#FCA5A5] hover:bg-[#FEE2E2]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EF4444]/15 text-[#DC2626] flex items-center justify-center flex-shrink-0">
              <AlertCircle size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#991B1B] leading-tight truncate">En retard</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#B91C1C] leading-none mt-0.5 truncate">Hors délai</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#7F1D1D] tabular-nums ml-1 flex-shrink-0">{lateCount > 0 ? lateCount : 12}</div>
        </div>
      </div>

      {/* Order Cards List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const waMessage = `Bonjour ${order.clientName}, votre commande "${order.title}" (${order.orderNumber}) est prête à l'atelier ! Vous pouvez passer la récupérer.`;
          const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

          return (
            <div
              key={order.id}
              onClick={() => onSelectClient(order.clientId, order.id)}
              className="p-4 rounded-[20px] bg-white cursor-pointer space-y-3 shadow-xs white-element-hover border border-[#EDE9F6]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-caption font-bold text-[#7C3AED] block mb-0.5">
                    {order.orderNumber}
                  </span>
                  <h4 className="text-body-strong font-bold text-primary">{order.title}</h4>
                  <p className="text-caption text-secondary font-medium mt-0.5">Client : {order.clientName}</p>
                </div>

                <StatusBadge status={order.status} />
              </div>

              {/* Action Buttons Bar for Tailor Lifecycle Workflow */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EDE9F6]/60 flex-wrap gap-2">
                <div className="flex items-center space-x-1.5">
                  {(order.status === 'progress' || order.status === 'late') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOrderStatus?.(order.id, 'ready');
                      }}
                      className="px-2.5 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-[11px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                      title="Changer le statut en Prête"
                    >
                      <Sparkles size={12} />
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
                        className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full text-[11px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                        title="Envoyer un message WhatsApp au client"
                      >
                        <MessageSquare size={12} />
                        <span>Message Client</span>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateOrderStatus?.(order.id, 'done');
                          if (order.balanceFCFA > 0) {
                            setPayingOrder(order);
                            setPayAmount(order.balanceFCFA);
                          }
                        }}
                        className="px-2.5 py-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-[11px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                        title="Confirmer la livraison"
                      >
                        <Truck size={12} />
                        <span>Marquer Livrée</span>
                      </button>
                    </>
                  )}

                  {order.status === 'done' && (
                    <span className="text-[11px] font-semibold text-[#059669] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 size={12} />
                      <span>Livrée & Terminée</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-primary font-bold tabular-nums">
                      {order.priceFCFA.toLocaleString('fr-FR')} FCFA
                    </span>
                    {order.balanceFCFA > 0 ? (
                      <span className="text-[11px] text-[#EF4444] font-semibold block">
                        Reste : {order.balanceFCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#059669] font-bold block">
                        ✓ 100% Réglé
                      </span>
                    )}
                  </div>

                  {order.balanceFCFA > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayingOrder(order);
                        setPayAmount(order.balanceFCFA);
                      }}
                      className="px-2 py-1 bg-[#FEF3C7] border border-[#FBBF24] text-[#78350F] hover:bg-[#FDE68A] rounded-full text-[11px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                      title="Encaisser un acompte ou le solde"
                    >
                      <DollarSign size={12} />
                      <span>Encaisser</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Encaisser un acompte / solde */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface text-primary rounded-[24px] border border-subtle w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-primary">
                  Encaisser un règlement
                </h3>
              </div>
              <button
                onClick={() => setPayingOrder(null)}
                className="p-1 text-tertiary hover:text-primary rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-[14px] bg-[#F3E8FF] border border-[#E9D5FF] text-caption font-semibold text-[#5B21B6]">
                Commande : <strong>{payingOrder.orderNumber} ({payingOrder.title})</strong>
                <br />
                Reste à payer : <strong className="text-[#EF4444]">{payingOrder.balanceFCFA.toLocaleString('fr-FR')} FCFA</strong>
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Montant encaissé (FCFA)
                </label>
                <input
                  type="number"
                  placeholder="ex: 15000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface border border-subtle rounded-[14px] text-lg font-bold text-primary focus:outline-none focus:border-[#7C3AED] tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingOrder(null)}
                className="flex-1 py-2.5 bg-surface-alt text-secondary hover:text-primary rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onPayOrder && typeof payAmount === 'number' && payAmount > 0) {
                    onPayOrder(payingOrder.id, payAmount);
                  }
                  setPayingOrder(null);
                }}
                className="flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Check size={16} />
                <span>Valider l'encaissement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
