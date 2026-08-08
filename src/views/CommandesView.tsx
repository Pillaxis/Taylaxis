import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  Plus,
  ClipboardList,
} from 'lucide-react';
import type { Order, StatusType, ManufacturingStatus } from '../types';
import { OrderEngine } from '../services/orderEngine';
import type { ContextualAction } from '../services/orderEngine';
import { OrderService } from '../services/orderService';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

interface CommandesViewProps {
  orders?: Order[];
  onSelectClient: (clientId: string, orderId?: string) => void;
  onOpenNewOrderModal?: () => void;
  onUpdateOrderStatus?: (orderId: string, status: StatusType) => void;
  onPayOrder?: (orderId: string, amount: number) => void;
}

export const CommandesView: React.FC<CommandesViewProps> = ({
  orders: propOrders,
  onSelectClient,
  onOpenNewOrderModal,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => propOrders || OrderService.getOrders());
  const [activeTab, setActiveTab] = useState<ManufacturingStatus | 'all' | 'late'>('all');
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

  const filteredOrders = orders.filter((o) => {
    const mfgStatus = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    const dueDateStatus = o.dueDateStatus || OrderEngine.calculateDueDateStatus(o.deliveryDate, mfgStatus);

    if (activeTab === 'all') return true;
    if (activeTab === 'late') return dueDateStatus === 'EN_RETARD';
    return mfgStatus === activeTab;
  });

  const progressCount = orders.filter((o) => (o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status)) === 'EN_COURS').length;
  const readyCount = orders.filter((o) => (o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status)) === 'PRETE').length;
  const toDeliverCount = orders.filter((o) => (o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status)) === 'A_LIVRER').length;
  const doneCount = orders.filter((o) => (o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status)) === 'LIVREE').length;
  const lateCount = orders.filter((o) => (o.dueDateStatus || OrderEngine.calculateDueDateStatus(o.deliveryDate, o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status))) === 'EN_RETARD').length;

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
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner relative">
      {/* 6 Responsive Horizontal Rectangular Palettes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Card 1: Toutes */}
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
          <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums ml-1 flex-shrink-0">{orders.length}</div>
        </div>

        {/* Card 2: En cours */}
        <div
          onClick={() => setActiveTab('EN_COURS')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'EN_COURS'
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
          <div className="text-base sm:text-lg font-extrabold text-[#78350F] tabular-nums ml-1 flex-shrink-0">{progressCount}</div>
        </div>

        {/* Card 3: Prêtes */}
        <div
          onClick={() => setActiveTab('PRETE')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'PRETE'
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
          <div className="text-base sm:text-lg font-extrabold text-[#1E3A8A] tabular-nums ml-1 flex-shrink-0">{readyCount}</div>
        </div>

        {/* Card 4: À livrer */}
        <div
          onClick={() => setActiveTab('A_LIVRER')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'A_LIVRER'
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
          <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums ml-1 flex-shrink-0">{toDeliverCount}</div>
        </div>

        {/* Card 5: Livrées */}
        <div
          onClick={() => setActiveTab('LIVREE')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeTab === 'LIVREE'
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
          <div className="text-base sm:text-lg font-extrabold text-[#064E3B] tabular-nums ml-1 flex-shrink-0">{doneCount}</div>
        </div>

        {/* Card 6: En retard */}
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
          <div className="text-base sm:text-lg font-extrabold text-[#7F1D1D] tabular-nums ml-1 flex-shrink-0">{lateCount}</div>
        </div>
      </div>

      {/* Order Cards List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 rounded-[24px] bg-surface border border-subtle text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <div>
              <h4 className="text-body-strong font-bold text-primary">Aucune commande trouvée</h4>
              <p className="text-caption text-secondary mt-1">Créez votre première commande pour suivre les confections, paiements et livraisons d'atelier.</p>
            </div>
            <button
              onClick={onOpenNewOrderModal}
              className="px-4 py-2 rounded-full bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] transition-all shadow-xs cursor-pointer inline-flex items-center space-x-2"
            >
              <Plus size={14} />
              <span>Créer une commande</span>
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
          const mfgStatus = order.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(order.status);
          const dueDateStatus = order.dueDateStatus || OrderEngine.calculateDueDateStatus(order.deliveryDate, mfgStatus);
          const nextActions = OrderEngine.getNextActions(order);

          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="p-4 rounded-[20px] bg-surface cursor-pointer space-y-3 shadow-xs white-element-hover border border-subtle"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="text-caption font-bold text-[#7C3AED]">
                      {order.orderNumber}
                    </span>
                    {dueDateStatus === 'EN_RETARD' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-extrabold flex items-center gap-0.5 animate-pulse">
                        <AlertCircle size={10} />
                        EN RETARD
                      </span>
                    )}
                  </div>
                  <h4 className="text-body-strong font-bold text-primary">{order.title}</h4>
                  <p className="text-caption text-secondary font-medium mt-0.5">Client : {order.clientName}</p>
                </div>

                <StatusBadge status={mfgStatus} />
              </div>

              {/* Order Card Action Bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-subtle flex-wrap gap-2">
                <div>
                  {nextActions.primaryAction && (
                    <button
                      onClick={(e) => handleExecutePrimaryAction(order, nextActions.primaryAction!, e)}
                      className={`px-3 py-1.5 rounded-full text-caption font-bold text-white shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 ${
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

                <div className="flex items-center space-x-2 text-right">
                  <div>
                    <span className="text-primary font-bold tabular-nums text-caption block">
                      {order.priceFCFA.toLocaleString('fr-FR')} FCFA
                    </span>
                    {order.balanceFCFA > 0 ? (
                      <span className="text-[11px] text-[#EF4444] font-semibold block">
                        Reste : {order.balanceFCFA.toLocaleString('fr-FR')} F
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#059669] font-bold block">
                        ✓ 100% Réglé
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Full Order Detail Modal */}
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
