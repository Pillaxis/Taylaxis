import React, { useState, useEffect } from 'react';
import {
  Users,
  ClipboardList,
  Ruler,
  Calendar,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  MessageCircle,
  Phone,
  MessageSquare,
  AlertTriangle,
  Scissors,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
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
  onNavigateToClients,
  onNavigateToCommandes,
  onNavigateToAgenda,
  onSelectClient,
  onOpenNewClientModal,
  onOpenNewOrderModal,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => propOrders || OrderService.getOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNeedsClientModal, setShowNeedsClientModal] = useState<string | null>(null);

  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders);
    } else {
      setOrders(OrderService.getOrders());
      const unsubscribe = OrderService.subscribe((updated) => setOrders(updated));
      return unsubscribe;
    }
  }, [propOrders]);

  const hasClients = clients.length > 0;

  // V1 Core Derived Metrics
  const activeOrders = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    return mfg !== 'LIVREE' && mfg !== 'TERMINEE';
  });

  const lateOrders = orders.filter((o) => {
    const mfg = o.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(o.status);
    const due = o.dueDateStatus || OrderEngine.calculateDueDateStatus(o.deliveryDate, mfg);
    return due === 'EN_RETARD';
  });

  // Clients with measurements filled
  const clientsWithMeasurements = clients.filter(
    (c) => (c.customMeasurements && c.customMeasurements.length > 0) || (c.mensurationsCount && c.mensurationsCount > 0)
  );

  const handleStepClick = (stepName: string, action: () => void) => {
    if (!hasClients && stepName !== 'client') {
      setShowNeedsClientModal(stepName);
    } else {
      action();
    }
  };

  return (
    <div className="bg-[#0C0A27] min-h-screen text-white">
      {/* Top Dark Region: 5-Step Stepper & 4 Stat Cards */}
      <div className="px-3.5 pt-2 pb-3 space-y-3 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-body-strong font-extrabold text-white text-base">Atelier Taylaxis V1</h2>
            <p className="text-[11px] text-white/70">Parcours naturel du tailleur (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5)</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA]">
            {hasClients ? `${clients.length} client(s)` : '0 client'}
          </span>
        </div>

        {/* 5-Step Stepper Banner */}
        <div className="p-3 rounded-[20px] bg-white/5 border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/90">
            <span>Flux de confection Atelier</span>
            <span className="text-[#7C3AED] text-[10px]">{hasClients ? 'Étapes débloquées' : 'Étape 1 requise'}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
            {/* Step 1 */}
            <div
              onClick={onOpenNewClientModal}
              className="p-1.5 rounded-[12px] bg-[#7C3AED] text-white cursor-pointer active:scale-95 transition-all shadow-xs flex flex-col items-center space-y-1"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</div>
              <span className="truncate w-full">Client</span>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => handleStepClick('mensurations', () => onNavigateToClients?.())}
              className={`p-1.5 rounded-[12px] flex flex-col items-center space-y-1 cursor-pointer transition-all ${
                clientsWithMeasurements.length > 0
                  ? 'bg-emerald-500 text-white'
                  : hasClients
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/5 text-white/40 border border-dashed border-white/10'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {!hasClients ? <Lock size={10} /> : '2'}
              </div>
              <span className="truncate w-full">Mesures</span>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => handleStepClick('commande', onOpenNewOrderModal)}
              className={`p-1.5 rounded-[12px] flex flex-col items-center space-y-1 cursor-pointer transition-all ${
                activeOrders.length > 0
                  ? 'bg-amber-500 text-white'
                  : hasClients
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/5 text-white/40 border border-dashed border-white/10'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {!hasClients ? <Lock size={10} /> : '3'}
              </div>
              <span className="truncate w-full">Commande</span>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => handleStepClick('rendezvous', onNavigateToAgenda)}
              className={`p-1.5 rounded-[12px] flex flex-col items-center space-y-1 cursor-pointer transition-all ${
                hasClients
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/5 text-white/40 border border-dashed border-white/10'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {!hasClients ? <Lock size={10} /> : '4'}
              </div>
              <span className="truncate w-full">RDV</span>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => handleStepClick('relance', onNavigateToCommandes)}
              className={`p-1.5 rounded-[12px] flex flex-col items-center space-y-1 cursor-pointer transition-all ${
                hasClients
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/5 text-white/40 border border-dashed border-white/10'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {!hasClients ? <Lock size={10} /> : '5'}
              </div>
              <span className="truncate w-full">Relance</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Grid (2x2 on Mobile, 4x1 on Tablet) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Card 1: Nombre de clients (TOUJOURS ACTIF) */}
          <div
            onClick={onNavigateToClients}
            className="p-3 rounded-[18px] bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white shadow-xs space-y-1.5 cursor-pointer palette-card-hover active:scale-98"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">1. Clients</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-white" />
              </div>
            </div>
            <div className="text-xl font-extrabold tabular-nums">{clients.length}</div>
            <div className="text-[10px] font-medium opacity-85">Toujours accessible</div>
          </div>

          {/* Card 2: Mensurations */}
          <div
            onClick={() => handleStepClick('mensurations', () => onNavigateToClients?.())}
            className={`p-3 rounded-[18px] text-white shadow-xs space-y-1.5 transition-all ${
              hasClients
                ? 'bg-gradient-to-br from-[#059669] to-[#10B981] cursor-pointer palette-card-hover active:scale-98'
                : 'bg-white/10 border border-white/10 opacity-70 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">2. Mensurations</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {hasClients ? <Ruler size={14} className="text-white" /> : <Lock size={13} className="text-white/80" />}
              </div>
            </div>
            <div className="text-xl font-extrabold tabular-nums">{clientsWithMeasurements.length}</div>
            <div className="text-[10px] font-medium opacity-85">
              {hasClients ? 'Fiches complétées' : 'Requièrent 1 client'}
            </div>
          </div>

          {/* Card 3: Commandes */}
          <div
            onClick={() => handleStepClick('commande', onOpenNewOrderModal)}
            className={`p-3 rounded-[18px] text-white shadow-xs space-y-1.5 transition-all ${
              hasClients
                ? 'bg-gradient-to-br from-[#B45309] via-[#D97B1F] to-[#F59E0B] cursor-pointer palette-card-hover active:scale-98'
                : 'bg-white/10 border border-white/10 opacity-70 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">3. Commandes</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {hasClients ? <ClipboardList size={14} className="text-white" /> : <Lock size={13} className="text-white/80" />}
              </div>
            </div>
            <div className="text-xl font-extrabold tabular-nums">{activeOrders.length}</div>
            <div className="text-[10px] font-medium opacity-85">
              {hasClients ? `${lateOrders.length} en retard` : 'Requièrent 1 client'}
            </div>
          </div>

          {/* Card 4: Rendez-vous */}
          <div
            onClick={() => handleStepClick('rendezvous', onNavigateToAgenda)}
            className={`p-3 rounded-[18px] text-white shadow-xs space-y-1.5 transition-all ${
              hasClients
                ? 'bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] cursor-pointer palette-card-hover active:scale-98'
                : 'bg-white/10 border border-white/10 opacity-70 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">4. Rendez-vous</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {hasClients ? <Calendar size={14} className="text-white" /> : <Lock size={13} className="text-white/80" />}
              </div>
            </div>
            <div className="text-xl font-extrabold tabular-nums">Agenda</div>
            <div className="text-[10px] font-medium opacity-85">
              {hasClients ? 'Planning essayages' : 'Requièrent 1 client'}
            </div>
          </div>
        </div>

        {/* Dynamic Alert Banner for Late Orders (only if clients exist) */}
        {hasClients && lateOrders.length > 0 && (
          <div
            onClick={onNavigateToCommandes}
            className="p-3 rounded-[18px] bg-[#191438] text-white flex items-center justify-between cursor-pointer shadow-xs border border-white/10 palette-card-hover active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
                <AlertTriangle size={17} />
              </div>
              <div>
                <div className="text-caption font-bold text-white leading-tight">
                  {lateOrders.length} {lateOrders.length === 1 ? 'commande nécessite une relance' : 'commandes nécessitent une relance'}
                </div>
                <div className="text-[11px] text-white/70 leading-tight mt-0.5">
                  Relancez votre client par WhatsApp ou téléphone dès maintenant.
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/60 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Main White Sheet: Hero Button & Step Navigation */}
      <div className="bg-canvas text-primary rounded-t-[28px] pt-4 px-4 pb-mobile-safe space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-xl min-h-[500px]">
        {/* Step 1 Primary Hero Action Button (Always Accessible) */}
        <div className="space-y-3">
          <button
            onClick={onOpenNewClientModal}
            className="w-full py-4 px-4 rounded-[20px] bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#3155C8] text-white font-extrabold text-sm hover:opacity-95 cursor-pointer shadow-lg shadow-[#7C3AED]/25 active:scale-98 transition-all flex items-center justify-center space-x-2.5 border border-white/20"
          >
            <UserPlus size={20} className="text-white" />
            <span>
              {hasClients
                ? '+ 1. Ajouter un Nouveau Client (avec Mensurations)'
                : '👤 Démarrer : 1. Ajouter mon Premier Client (avec Mensurations)'}
            </span>
          </button>
        </div>

        {/* Workflow Guidance Card when 0 Client */}
        {!hasClients && (
          <div className="p-4 rounded-[20px] bg-[#F3E8FF]/80 border border-[#E9D5FF] space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Info size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-body-strong font-extrabold text-[#5B21B6]">
                  Bienvenue dans l'Atelier Taylaxis V1 !
                </h4>
                <p className="text-caption text-[#6B21A8] leading-relaxed">
                  Pour respecter le fil de travail de l'atelier, <strong>l'étape 1 consiste à ajouter votre premier client</strong>. Cela débloquera immédiatement les étapes suivantes (mensurations, commandes, rendez-vous et relances).
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={onOpenNewClientModal}
                className="w-full py-2.5 rounded-[14px] bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] cursor-pointer shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Ajouter mon 1er client maintenant</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* 4 Workflow Action Buttons (Features 2, 3, 4, 5) */}
        <div className="space-y-2">
          <h3 className="text-micro font-bold text-secondary tracking-wider uppercase px-1">
            Parcours de Confection (Étapes 2 à 5)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Step 2: Mensurations */}
            <button
              onClick={() => handleStepClick('mensurations', () => onNavigateToClients?.())}
              className={`p-3 rounded-[16px] border flex flex-col items-center text-center space-y-1.5 shadow-xs transition-all ${
                hasClients
                  ? 'bg-surface border-subtle hover:border-[#059669]/30 cursor-pointer active:scale-98'
                  : 'bg-surface-alt/60 border-subtle/50 opacity-60 cursor-pointer'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                {hasClients ? <Ruler size={16} /> : <Lock size={15} className="text-secondary" />}
              </div>
              <span className="text-[11px] font-bold text-primary leading-tight">2. Mensurations</span>
            </button>

            {/* Step 3: Commande */}
            <button
              onClick={() => handleStepClick('commande', onOpenNewOrderModal)}
              className={`p-3 rounded-[16px] border flex flex-col items-center text-center space-y-1.5 shadow-xs transition-all ${
                hasClients
                  ? 'bg-surface border-subtle hover:border-[#B45309]/30 cursor-pointer active:scale-98'
                  : 'bg-surface-alt/60 border-subtle/50 opacity-60 cursor-pointer'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#B45309]/10 text-[#B45309] flex items-center justify-center">
                {hasClients ? <Scissors size={16} /> : <Lock size={15} className="text-secondary" />}
              </div>
              <span className="text-[11px] font-bold text-primary leading-tight">3. Commande</span>
            </button>

            {/* Step 4: Rendez-vous */}
            <button
              onClick={() => handleStepClick('rendezvous', onNavigateToAgenda)}
              className={`p-3 rounded-[16px] border flex flex-col items-center text-center space-y-1.5 shadow-xs transition-all ${
                hasClients
                  ? 'bg-surface border-subtle hover:border-[#1D4ED8]/30 cursor-pointer active:scale-98'
                  : 'bg-surface-alt/60 border-subtle/50 opacity-60 cursor-pointer'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] flex items-center justify-center">
                {hasClients ? <CalendarPlus size={16} /> : <Lock size={15} className="text-secondary" />}
              </div>
              <span className="text-[11px] font-bold text-primary leading-tight">4. Rendez-vous</span>
            </button>

            {/* Step 5: Relance */}
            <button
              onClick={() => handleStepClick('relance', onNavigateToCommandes)}
              className={`p-3 rounded-[16px] border flex flex-col items-center text-center space-y-1.5 shadow-xs transition-all ${
                hasClients
                  ? 'bg-surface border-subtle hover:border-[#7C3AED]/30 cursor-pointer active:scale-98'
                  : 'bg-surface-alt/60 border-subtle/50 opacity-60 cursor-pointer'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                {hasClients ? <MessageCircle size={16} /> : <Lock size={15} className="text-secondary" />}
              </div>
              <span className="text-[11px] font-bold text-primary leading-tight">5. Relancer</span>
            </button>
          </div>
        </div>

        {/* Section: 5. Relancer les Clients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h2 font-bold text-primary">5. Relancer les Clients</h3>
              <p className="text-caption text-secondary">Suivi WhatsApp, Appel et SMS</p>
            </div>
            {hasClients && (
              <button
                onClick={onNavigateToCommandes}
                className="text-caption font-semibold text-[#7C3AED] hover:underline cursor-pointer py-1 px-2"
              >
                Toutes les commandes
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {!hasClients || orders.length === 0 ? (
              <div className="p-6 rounded-[24px] bg-surface border border-subtle text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h4 className="text-body-strong font-bold text-primary">Aucun client à relancer</h4>
                  <p className="text-caption text-secondary mt-1">
                    Enregistrez votre premier client pour activer le suivi des mensurations, des commandes et des relances.
                  </p>
                </div>
                <div className="flex justify-center pt-1">
                  <button
                    onClick={onOpenNewClientModal}
                    className="px-5 py-2.5 rounded-full bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] transition-all shadow-xs cursor-pointer inline-flex items-center space-x-2"
                  >
                    <UserPlus size={15} />
                    <span>+ 1. Ajouter un client</span>
                  </button>
                </div>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => {
                const clientPhone = clients.find((c) => c.id === order.clientId || c.name === order.clientName)?.phone || '';
                const primaryAction = OrderEngine.getNextActions(order, clientPhone).primaryAction;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-3.5 rounded-[20px] bg-surface border border-subtle hover:border-[#7C3AED]/40 transition-all cursor-pointer shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {order.clientName[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-body-strong font-bold text-primary truncate">{order.clientName}</h4>
                          <p className="text-caption text-secondary truncate">{order.title}</p>
                        </div>
                      </div>

                      <StatusBadge status={order.status} />
                    </div>

                    {/* Follow-up Contact Actions Bar */}
                    <div className="pt-1.5 border-t border-subtle flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={`tel:${clientPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-[10px] bg-emerald-500/10 text-emerald-600 text-[11px] font-bold flex items-center space-x-1 hover:bg-emerald-500/20 transition-all"
                        >
                          <Phone size={12} />
                          <span>Appeler</span>
                        </a>

                        <a
                          href={`https://wa.me/${clientPhone.replace(/\s+/g, '')}?text=Bonjour%20${encodeURIComponent(order.clientName)},%20votre%20commande%20(${encodeURIComponent(order.title)})%20est%20en%20cours%20dans%20notre%20atelier.`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-[10px] bg-green-500/10 text-green-600 text-[11px] font-bold flex items-center space-x-1 hover:bg-green-500/20 transition-all"
                        >
                          <MessageSquare size={12} />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`sms:${clientPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-[10px] bg-blue-500/10 text-blue-600 text-[11px] font-bold flex items-center space-x-1 hover:bg-blue-500/20 transition-all"
                        >
                          <MessageCircle size={12} />
                          <span>SMS</span>
                        </a>
                      </div>

                      {primaryAction && (
                        <span className="text-[11px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-1 rounded-[8px]">
                          {primaryAction.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal guidance when clicking locked step without clients */}
      {showNeedsClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#120F38] border border-white/20 rounded-[28px] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center mx-auto text-[#A78BFA]">
              <Lock size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Étape 1 requise : Ajoutez un client d'abord !</h3>
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                Pour accéder à la fonction <strong className="text-[#A78BFA] uppercase">{showNeedsClientModal}</strong>, vous devez enregistrer au moins un client dans votre atelier.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowNeedsClientModal(null);
                  onOpenNewClientModal();
                }}
                className="w-full py-3.5 rounded-[16px] bg-gradient-to-r from-[#7C3AED] to-[#3155C8] text-white font-bold text-xs hover:opacity-95 cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <UserPlus size={16} />
                <span>+ 1. Ajouter mon 1er client maintenant</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNeedsClientModal(null)}
                className="w-full py-2 text-xs text-white/60 hover:text-white cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
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
