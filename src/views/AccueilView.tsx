import React, { useState, useEffect } from 'react';
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
import type { Order, StatusType } from '../types';
import { OrderEngine } from '../services/orderEngine';
import type { ContextualAction } from '../services/orderEngine';
import { OrderService } from '../services/orderService';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

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
  orders: propOrders,
  onNavigateToCommandes,
  onNavigateToAgenda,
  onSelectClient,
  onOpenNewClientModal,
  onOpenNewOrderModal,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => propOrders || OrderService.getOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders);
    } else {
      setOrders(OrderService.getOrders());
      const unsubscribe = OrderService.subscribe((updated) => setOrders(updated));
      return unsubscribe;
    }
  }, [propOrders]);

  // Derived metrics from V1 Order Engine
  const activeOrders = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    return mfg !== 'LIVREE' && mfg !== 'TERMINEE';
  });

  const lateOrders = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    const due = o.dueDateStatus || OrderEngine.calculateDueDateStatus(o.deliveryDate, mfg);
    return due === 'EN_RETARD';
  });

  const totalBalanceToCollect = orders.reduce((sum, o) => sum + (o.balanceFCFA || 0), 0);
  const ordersWithBalanceCount = orders.filter((o) => (o.balanceFCFA || 0) > 0).length;

  const handleExecutePrimaryAction = (order: Order, action: ContextualAction, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action.actionKey) {
      case 'CONFIRMER_COMMANDE':
        OrderService.updateManufacturingStatus(order.id, 'CONFIRMEE');
        break;
      case 'DEMARRER_CONFECTION':
        OrderService.updateManufacturingStatus(order.id, 'EN_COURS');
        break;
      case 'MARQUER_PRETE':
        OrderService.updateManufacturingStatus(order.id, 'PRETE');
        break;
      case 'MARQUER_A_LIVRER':
        OrderService.updateManufacturingStatus(order.id, 'A_LIVRER');
        break;
      case 'MARQUER_LIVREE':
        OrderService.updateManufacturingStatus(order.id, 'LIVREE');
        break;
      case 'TERMINER_COMMANDE':
        OrderService.updateManufacturingStatus(order.id, 'TERMINEE');
        break;
      case 'ENCAISSER_SOLDE':
      case 'PREVENIR_CLIENT':
      default:
        setSelectedOrder(order);
        break;
    }
  };

  return (
    <div className="bg-[#0C0A27] min-h-screen text-white">
      {/* Top Dark Region: 4 Stat Cards + Red Alert Banner */}
      <div className="px-3.5 pt-1 pb-3 space-y-2.5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
        {/* 4 Stat Cards Grid (2x2 on Mobile, 4x1 on Tablet) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Card 1: CA du jour */}
          <div className="p-2.5 px-3 rounded-[16px] bg-gradient-to-br from-[#059669] to-[#10B981] text-white shadow-xs space-y-1 cursor-pointer palette-card-hover active:scale-98">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">CA du jour</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={13} className="text-white" />
              </div>
            </div>
            <div className="text-body-strong font-bold text-base tabular-nums">
              {orders.length === 0 ? '0 FCFA' : `${orders.reduce((s, o) => s + (o.paidFCFA || 0), 0).toLocaleString('fr-FR')} FCFA`}
            </div>
            <div className="text-[10px] font-medium opacity-85">Aujourd'hui</div>
          </div>

          {/* Card 2: CA du mois */}
          <div className="p-2.5 px-3 rounded-[16px] bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white shadow-xs space-y-1 cursor-pointer palette-card-hover active:scale-98">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">CA du mois</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Wallet size={13} className="text-white" />
              </div>
            </div>
            <div className="text-body-strong font-bold text-base tabular-nums">
              {orders.length === 0 ? '0 FCFA' : `${orders.reduce((s, o) => s + (o.paidFCFA || 0), 0).toLocaleString('fr-FR')} FCFA`}
            </div>
            <div className="text-[10px] font-medium opacity-85">Ce mois-ci</div>
          </div>

          {/* Card 3: Commandes en cours */}
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
            <div className="text-lg font-bold tabular-nums">{activeOrders.length}</div>
            <div className="text-[10px] font-medium opacity-85">
              🕒 {lateOrders.length} en retard
            </div>
          </div>

          {/* Card 4: À encaisser */}
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
            <div className="text-body-strong font-bold text-base tabular-nums">
              {totalBalanceToCollect.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="text-[10px] font-medium opacity-85">
              Sur {ordersWithBalanceCount} commandes
            </div>
          </div>
        </div>

        {/* Dynamic Red Alert Banner Card for Late Orders */}
        {lateOrders.length > 0 && (
          <div
            onClick={onNavigateToCommandes}
            className="p-2.5 px-3.5 rounded-[16px] bg-[#191438] text-white flex items-center justify-between cursor-pointer shadow-xs border border-white/5 palette-card-hover active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
                <AlertTriangle size={17} />
              </div>
              <div>
                <div className="text-caption font-bold text-white leading-tight">
                  {lateOrders.length} {lateOrders.length === 1 ? 'commande en retard de livraison' : 'commandes en retard de livraison'}
                </div>
                <div className="text-[11px] text-white/70 leading-tight mt-0.5">
                  Vérifiez-les pour éviter l'insatisfaction client.
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/60 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Main White Rounded Sheet */}
      <div className="bg-canvas text-primary rounded-t-[28px] pt-4 px-4 pb-mobile-safe space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-xl min-h-[500px]">
        {/* Section: Livraisons prochaines / Commandes prioritaires */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h2 font-bold text-primary">Livraisons & Priorités</h3>
            <button
              onClick={onNavigateToCommandes}
              className="text-caption font-semibold text-[#7C3AED] hover:underline cursor-pointer py-1 px-2"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.length === 0 ? (
              <div className="p-6 rounded-[24px] bg-surface border border-subtle text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="text-body-strong font-bold text-primary">Bienvenue sur Taylaxis !</h4>
                  <p className="text-caption text-secondary mt-1">Aucune commande pour le moment. Créez votre première commande d'atelier pour démarrer.</p>
                </div>
                <button
                  onClick={onOpenNewOrderModal}
                  className="px-4 py-2 rounded-full bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] transition-all shadow-xs cursor-pointer inline-flex items-center space-x-2"
                >
                  <CalendarPlus size={14} />
                  <span>Nouvelle commande</span>
                </button>
              </div>
            ) : (
              orders.slice(0, 4).map((order) => {
                const mfgStatus = order.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(order.status);
                const nextActions = OrderEngine.getNextActions(order);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-3.5 rounded-[20px] bg-surface border border-subtle space-y-2 cursor-pointer white-element-hover active:scale-98 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {order.clientName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="text-body-strong text-primary font-bold">
                            Commande {order.orderNumber} • {order.title}
                          </div>
                          <div className="text-caption text-secondary">{order.clientName}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right text-caption text-secondary flex items-center space-x-1">
                          <Calendar size={13} className="text-[#7C3AED]" />
                          <span className="font-medium text-primary text-[11px]">
                            {order.deliveryDate.split(' ')[0]}
                          </span>
                        </div>
                        <StatusBadge status={mfgStatus} />
                      </div>
                    </div>

                    {/* Dynamic Action Button Bar */}
                    <div className="flex items-center justify-end space-x-2 pt-1 border-t border-subtle">
                      {nextActions.primaryAction && (
                        <button
                          onClick={(e) => handleExecutePrimaryAction(order, nextActions.primaryAction!, e)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all ${
                            nextActions.primaryAction.intent === 'danger'
                              ? 'bg-red-600 hover:bg-red-700'
                              : nextActions.primaryAction.intent === 'warning'
                              ? 'bg-[#D97B1F] hover:bg-amber-600'
                              : nextActions.primaryAction.intent === 'success'
                              ? 'bg-[#10B981] hover:bg-emerald-600'
                              : nextActions.primaryAction.intent === 'info'
                              ? 'bg-[#2563EB] hover:bg-blue-600'
                              : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                          }`}
                        >
                          <span>{nextActions.primaryAction.label}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section: Actions rapides */}
        <div className="space-y-3">
          <h3 className="text-h2 font-bold text-primary">Actions rapides</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Nouveau client */}
            <button
              onClick={onOpenNewClientModal}
              className="p-3 bg-surface rounded-[20px] border border-subtle flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-primary leading-tight">
                Nouveau client
              </span>
            </button>

            {/* Nouvelle commande */}
            <button
              onClick={onOpenNewOrderModal}
              className="p-3 bg-surface rounded-[20px] border border-subtle flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
              <span className="text-[11px] font-semibold text-primary leading-tight">
                Nouvelle<br />commande
              </span>
            </button>

            {/* Ajouter rendez-vous */}
            <button
              onClick={onNavigateToAgenda}
              className="p-3 bg-surface rounded-[20px] border border-subtle flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <CalendarPlus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-primary leading-tight">
                Ajouter<br />rendez-vous
              </span>
            </button>

            {/* Enregistrer paiement */}
            <button
              onClick={onNavigateToCommandes}
              className="p-3 bg-surface rounded-[20px] border border-subtle flex flex-col items-center justify-center space-y-2 cursor-pointer text-center shadow-xs white-element-hover active:scale-95 min-h-[84px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-semibold text-primary leading-tight">
                Enregistrer<br />paiement
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSelectClient={onSelectClient}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            setOrders(OrderService.getOrders());
          }}
        />
      )}
    </div>
  );
};
