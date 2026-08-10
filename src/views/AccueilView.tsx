import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  ClipboardList,
  Banknote,
  AlertTriangle,
  ChevronRight,
  Calendar,
  UserPlus,
} from 'lucide-react';
import type { Order, Client, StatusType } from '../types';
import { OrderEngine } from '../services/orderEngine';
import { OrderService } from '../services/orderService';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

interface AccueilViewProps {
  orders?: Order[];
  clients?: Client[];
  onNavigateToClients?: () => void;
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
  clients = [],
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

  // Derived Metrics directly from database / state
  const activeOrders = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    return mfg !== 'LIVREE' && mfg !== 'TERMINEE';
  });

  const lateOrders = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    const due = o.dueDateStatus || OrderEngine.calculateDueDateStatus(o.deliveryDate, mfg);
    return due === 'EN_RETARD';
  });

  const totalUnpaidBalance = orders.reduce((sum, o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    if (mfg !== 'TERMINEE' && o.balanceFCFA > 0) {
      return sum + o.balanceFCFA;
    }
    return sum;
  }, 0);

  const unpaidOrdersCount = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    return mfg !== 'TERMINEE' && o.balanceFCFA > 0;
  }).length;

  // Real CA calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  const caJour = orders.reduce((sum, o) => {
    let dayPaid = 0;
    if (o.paymentHistory && o.paymentHistory.length > 0) {
      o.paymentHistory.forEach((p) => {
        if (p.date) {
          const pDate = new Date(p.date);
          if (
            !isNaN(pDate.getTime()) &&
            pDate.getFullYear() === currentYear &&
            pDate.getMonth() === currentMonth &&
            pDate.getDate() === currentDay
          ) {
            dayPaid += p.amountFCFA;
          }
        }
      });
    }
    return sum + dayPaid;
  }, 0);

  const caMois = orders.reduce((sum, o) => {
    let monthPaid = 0;
    if (o.paymentHistory && o.paymentHistory.length > 0) {
      o.paymentHistory.forEach((p) => {
        if (p.date) {
          const pDate = new Date(p.date);
          if (
            !isNaN(pDate.getTime()) &&
            pDate.getFullYear() === currentYear &&
            pDate.getMonth() === currentMonth
          ) {
            monthPaid += p.amountFCFA;
          }
        }
      });
    } else {
      monthPaid += o.paidFCFA || 0;
    }
    return sum + monthPaid;
  }, 0);

  // Exact real values matching the DB
  const displayCaJour = `${caJour.toLocaleString('fr-FR')} FCFA`;
  const displayCaMois = `${caMois.toLocaleString('fr-FR')} FCFA`;
  const displayActiveOrdersCount = activeOrders.length;
  const displayLateOrdersCount = lateOrders.length;
  const displayUnpaidBalance = `${totalUnpaidBalance.toLocaleString('fr-FR')} FCFA`;

  // Real upcoming deliveries from DB (non-delivered active orders)
  const actualUpcomingDeliveries = activeOrders.slice(0, 5).map((o, idx) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    const due = o.dueDateStatus || OrderEngine.calculateDueDateStatus(o.deliveryDate, mfg);

    let badgeLabel = 'À venir';
    let badgeColor = 'bg-[#F3F4F6] text-[#4B5563]';

    if (due === 'EN_RETARD') {
      badgeLabel = 'En retard';
      badgeColor = 'bg-[#FEE2E2] text-[#DC2626]';
    } else if (mfg === 'A_LIVRER') {
      badgeLabel = 'À livrer';
      badgeColor = 'bg-[#FEF3C7] text-[#D97706]';
    } else if (mfg === 'PRETE') {
      badgeLabel = 'Prête';
      badgeColor = 'bg-[#D1FAE5] text-[#059669]';
    }

    return {
      id: o.id,
      orderNumber: `Commande ${o.orderNumber}`,
      clientName: o.clientName,
      clientId: o.clientId,
      dateText: o.deliveryDate || 'Sous 7 jours',
      badgeLabel,
      badgeColor,
      avatarBg: idx % 2 === 0 ? 'bg-indigo-700 text-white' : 'bg-emerald-700 text-white',
      avatarInitial: o.clientName ? o.clientName[0].toUpperCase() : 'C',
    };
  });

  return (
    <div className="bg-[#0C0A27] min-h-screen text-white pb-6">
      {/* Top Dark Section: 4 Stat Cards & Alert Banner */}
      <div className="px-4 pt-1 pb-4 space-y-3 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
        {/* 4 Stat Cards 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: CA du jour (Emerald Green) */}
          <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#059669] text-white shadow-xs space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/90">CA du jour</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={16} className="text-white" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
              {displayCaJour}
            </div>
            <div className="text-[11px] font-semibold text-white/90">
              {caJour > 0 ? 'Encaissé aujourd’hui' : '0 FCFA encaissé aujourd’hui'}
            </div>
          </div>

          {/* Card 2: CA du mois (Purple) */}
          <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#6D28D9] text-white shadow-xs space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/90">CA du mois</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Wallet size={16} className="text-white" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
              {displayCaMois}
            </div>
            <div className="text-[11px] font-semibold text-white/90">
              {caMois > 0 ? 'Encaissé ce mois-ci' : '0 FCFA encaissé ce mois-ci'}
            </div>
          </div>

          {/* Card 3: Commandes en cours (Bright Orange) */}
          <div
            onClick={onNavigateToCommandes}
            className="p-3.5 sm:p-4 rounded-[20px] bg-[#EA580C] text-white shadow-xs space-y-1.5 relative overflow-hidden cursor-pointer hover:opacity-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/90">Commandes en cours</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={16} className="text-white" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
              {displayActiveOrdersCount}
            </div>
            <div className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
              <span>
                {displayLateOrdersCount > 0 ? `⏱ ${displayLateOrdersCount} en retard` : 'Toutes à temps'}
              </span>
            </div>
          </div>

          {/* Card 4: À encaisser (Royal Blue) */}
          <div
            onClick={onNavigateToCommandes}
            className="p-3.5 sm:p-4 rounded-[20px] bg-[#2563EB] text-white shadow-xs space-y-1.5 relative overflow-hidden cursor-pointer hover:opacity-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white/90">À encaisser</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Banknote size={16} className="text-white" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
              {displayUnpaidBalance}
            </div>
            <div className="text-[11px] font-semibold text-white/90">
              Sur {unpaidOrdersCount} commande{unpaidOrdersCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Critical Red Alert Banner - Rendered ONLY if there are late orders in DB */}
        {displayLateOrdersCount > 0 && (
          <div
            onClick={onNavigateToCommandes}
            className="p-3.5 rounded-[20px] bg-[#1E112A] border border-red-500/20 text-white flex items-center justify-between cursor-pointer hover:bg-[#271638] transition-all shadow-md active:scale-98"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#EF4444] text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {displayLateOrdersCount} {displayLateOrdersCount === 1 ? 'commande en retard' : 'commandes en retard'} de livraison
                </h4>
                <p className="text-xs text-white/70 truncate mt-0.5">
                  Vérifiez-les pour éviter l'insatisfaction client.
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/60 flex-shrink-0 ml-2" />
          </div>
        )}
      </div>

      {/* Main White Canvas Sheet */}
      <div className="bg-canvas text-primary rounded-t-[32px] pt-6 px-4 pb-mobile-safe space-y-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-2xl min-h-[450px]">
        {/* Section 1: Livraisons prochaines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-base sm:text-lg font-extrabold text-primary">Livraisons prochaines</h3>
            {actualUpcomingDeliveries.length > 0 && (
              <button
                onClick={onNavigateToCommandes}
                className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
              >
                Voir tout
              </button>
            )}
          </div>

          {actualUpcomingDeliveries.length === 0 ? (
            <div className="py-8 text-center px-4 bg-surface rounded-[24px] border border-subtle space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-body-strong font-bold text-primary">Aucune livraison prévue</h4>
                <p className="text-caption text-secondary max-w-xs mx-auto">
                  {clients.length === 0
                    ? 'Pour fixer des livraisons et gérer votre atelier, commencez par ajouter votre premier client.'
                    : 'Vous n’avez aucune commande en cours à livrer actuellement.'}
                </p>
              </div>
              <div className="pt-1">
                {clients.length === 0 ? (
                  <button
                    onClick={onOpenNewClientModal}
                    className="px-4 py-2.5 rounded-[14px] bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] cursor-pointer shadow-xs active:scale-95 transition-all inline-flex items-center space-x-2"
                  >
                    <UserPlus size={15} />
                    <span>+ Ajouter mon premier client</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenNewOrderModal}
                    className="px-4 py-2.5 rounded-[14px] bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] cursor-pointer shadow-xs active:scale-95 transition-all inline-flex items-center space-x-2"
                  >
                    <ClipboardList size={15} />
                    <span>+ Nouvelle commande</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-[24px] border border-subtle p-2 space-y-1.5 shadow-xs">
              {actualUpcomingDeliveries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const foundOrder = orders.find((o) => o.id === item.id);
                    if (foundOrder) {
                      setSelectedOrder(foundOrder);
                    } else if (item.clientId) {
                      onSelectClient(item.clientId);
                    } else {
                      onNavigateToCommandes();
                    }
                  }}
                  className="p-2.5 px-3 rounded-[18px] bg-white flex items-center justify-between cursor-pointer white-element-hover active:scale-98 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${item.avatarBg}`}
                    >
                      {item.avatarInitial}
                    </div>

                    <div className="min-w-0">
                      <div className="text-body-strong font-extrabold text-primary truncate">
                        {item.orderNumber}
                      </div>
                      <div className="text-caption text-secondary font-medium truncate">
                        {item.clientName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                    <div className="flex items-center space-x-1 text-caption font-semibold text-secondary tabular-nums">
                      <Calendar size={15} className="text-[#7C3AED]" />
                      <span>{item.dateText}</span>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                      {item.badgeLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Actions rapides */}
        <div className="space-y-3 pt-1">
          <h3 className="text-base sm:text-lg font-extrabold text-primary px-0.5">Actions rapides</h3>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* 1. Nouveau client */}
            <div
              onClick={onOpenNewClientModal}
              className="p-3 rounded-[20px] bg-surface border border-subtle shadow-xs flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:shadow-md hover:border-[#7C3AED]/30 active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-[16px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shadow-2xs">
                <UserPlus size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-primary leading-tight text-center">
                Nouveau client
              </span>
            </div>

            {/* 2. Nouvelle commande */}
            <div
              onClick={onOpenNewOrderModal}
              className="p-3 rounded-[20px] bg-surface border border-subtle shadow-xs flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:shadow-md hover:border-[#7C3AED]/30 active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-[16px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shadow-2xs">
                <ClipboardList size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-primary leading-tight text-center">
                Nouvelle commande
              </span>
            </div>

            {/* 3. Ajouter rendez-vous */}
            <div
              onClick={onNavigateToAgenda}
              className="p-3 rounded-[20px] bg-surface border border-subtle shadow-xs flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:shadow-md hover:border-[#7C3AED]/30 active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-[16px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shadow-2xs">
                <Calendar size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-primary leading-tight text-center">
                Ajouter rendez-vous
              </span>
            </div>

            {/* 4. Enregistrer paiement */}
            <div
              onClick={onNavigateToCommandes}
              className="p-3 rounded-[20px] bg-surface border border-subtle shadow-xs flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:shadow-md hover:border-[#7C3AED]/30 active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-[16px] bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shadow-2xs">
                <Wallet size={20} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-primary leading-tight text-center">
                Enregistrer paiement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          client={clients.find((c) => c.id === selectedOrder.clientId || c.name === selectedOrder.clientName)}
          onClose={() => setSelectedOrder(null)}
          onSelectClient={onSelectClient}
          onOrderUpdated={() => setOrders(OrderService.getOrders())}
        />
      )}
    </div>
  );
};
