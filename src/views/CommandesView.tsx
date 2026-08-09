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
  X,
  Check,
  Trash2,
  Calendar,
  UserPlus,
  Search,
  User as UserIcon,
} from 'lucide-react';
import type { Order, Client, StatusType, ManufacturingStatus, Measurement } from '../types';
import { OrderEngine } from '../services/orderEngine';
import type { ContextualAction } from '../services/orderEngine';
import { OrderService } from '../services/orderService';
import { SupabaseService } from '../services/supabaseService';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { GARMENT_TYPES, GARMENT_TYPE_PRESETS } from '../data/mockData';

interface CommandesViewProps {
  orders?: Order[];
  clients?: Client[];
  onSelectClient: (clientId: string, orderId?: string) => void;
  onOpenNewOrderModal?: () => void;
  onOpenNewClientModal?: () => void;
  onUpdateOrderStatus?: (orderId: string, status: StatusType) => void;
  onPayOrder?: (orderId: string, amount: number) => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
  onClientCreated?: (newClient: Client) => void;
}

export const CommandesView: React.FC<CommandesViewProps> = ({
  orders: propOrders,
  clients = [],
  onSelectClient,
  onOpenNewClientModal,
  onOrderUpdated,
  onClientCreated,
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

  // ──── Rich New Order Modal State ────
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  
  // Inline Client Creation State
  const [showInlineNewClientForm, setShowInlineNewClientForm] = useState(false);
  const [inlineClientName, setInlineClientName] = useState('');
  const [inlineClientPhone, setInlineClientPhone] = useState('');

  const [newGarmentType, setNewGarmentType] = useState('Costume 3 Pièces');
  const [customGarmentNameModal, setCustomGarmentNameModal] = useState('');
  const [newOrderPriceInput, setNewOrderPriceInput] = useState<number | ''>('');
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Calendar popover state
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getMonth());
  const [calendarViewYear, setCalendarViewYear] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getFullYear());

  // In-modal measurements state
  const [modalOrderMeasurements, setModalOrderMeasurements] = useState<{ id: string; label: string; valueCm: number | ''; placeholder: string }[]>(() => {
    const preset = GARMENT_TYPE_PRESETS['Costume 3 Pièces'] || [];
    return preset.map((p, idx) => ({ id: `m-modal-${idx}`, label: p.label, valueCm: '', placeholder: p.placeholder }));
  });

  // Custom Measurement Addition inside Modal
  const [showAddCustomModalMeasurement, setShowAddCustomModalMeasurement] = useState(false);
  const [newModalCustomLabel, setNewModalCustomLabel] = useState('');
  const [newModalCustomValCm, setNewModalCustomValCm] = useState<number | ''>('');

  const filteredClientsForSelector = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const handleInlineCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineClientName.trim() || !inlineClientPhone.trim()) return;

    const initials = inlineClientName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const newClientId = `c_${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: inlineClientName.trim(),
      phone: inlineClientPhone.trim(),
      ordersCount: 0,
      initials,
      status: 'actif',
      isNew: true,
      lastOrderDate: "Aujourd'hui",
      mensurationsCount: 0,
      totalSpentFCFA: 0,
      customMeasurements: [],
      notes: '',
    };

    if (SupabaseService.isReady()) {
      SupabaseService.saveClient(newClient);
    }

    if (onClientCreated) {
      onClientCreated(newClient);
    }

    setSelectedClientId(newClientId);
    setShowInlineNewClientForm(false);
    setInlineClientName('');
    setInlineClientPhone('');
  };

  const handleAddCustomModalMeasurementRow = () => {
    if (!newModalCustomLabel.trim()) return;
    setModalOrderMeasurements((prev) => [
      ...prev,
      {
        id: `m-custom-modal-${Date.now()}`,
        label: newModalCustomLabel.trim(),
        valueCm: newModalCustomValCm === '' ? '' : Number(newModalCustomValCm),
        placeholder: 'ex: 45',
      },
    ]);
    setNewModalCustomLabel('');
    setNewModalCustomValCm('');
    setShowAddCustomModalMeasurement(false);
  };

  const handleSelectGarmentType = (garmentId: string) => {
    setNewGarmentType(garmentId);
    const preset = GARMENT_TYPE_PRESETS[garmentId] || GARMENT_TYPE_PRESETS['Costume 3 Pièces'] || [];
    setModalOrderMeasurements(
      preset.map((p, idx) => ({ id: `m-modal-${idx}`, label: p.label, valueCm: '', placeholder: p.placeholder }))
    );
  };

  const handleOpenNewOrderModal = () => {
    setClientSearchQuery('');
    setNewGarmentType('Costume 3 Pièces');
    setCustomGarmentNameModal('');
    setNewOrderPriceInput('');
    setNewOrderDeliveryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setShowCustomDatePicker(false);
    setShowAddCustomModalMeasurement(false);
    const preset = GARMENT_TYPE_PRESETS['Costume 3 Pièces'] || [];
    setModalOrderMeasurements(preset.map((p, idx) => ({ id: `m-modal-${idx}`, label: p.label, valueCm: '', placeholder: p.placeholder })));

    if (clients.length === 0) {
      setShowInlineNewClientForm(true);
    } else {
      setSelectedClientId(clients[0].id);
    }
    setShowNewOrderModal(true);
  };

  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;

    const effectiveGarment =
      newGarmentType === 'Autre vêtement (Personnalisé)' && customGarmentNameModal.trim()
        ? customGarmentNameModal.trim()
        : newGarmentType;
    const title = `Confection - ${effectiveGarment}`;
    const price = typeof newOrderPriceInput === 'number' ? newOrderPriceInput : 0;
    const newOrderId = `ord_${Date.now()}`;

    // Process entered measurements from modal
    const filledModalMeasurements: Measurement[] = modalOrderMeasurements
      .filter((m) => m.valueCm !== '' && Number(m.valueCm) > 0)
      .map((m, idx) => ({
        id: `ms_${Date.now()}_${idx}`,
        label: m.label,
        valueCm: Number(m.valueCm),
        iconName: 'Ruler',
      }));

    const createdOrder: Order = {
      id: newOrderId,
      orderNumber: OrderService.generateOrderNumber(),
      clientId: client.id,
      clientName: client.name,
      title,
      priceFCFA: price,
      paidFCFA: 0,
      balanceFCFA: price,
      status: 'progress',
      manufacturingStatus: 'EN_COURS',
      paymentStatus: price > 0 ? 'NON_PAYEE' : 'NON_PAYEE',
      dueDateStatus: 'BIENTOT',
      priority: 'NORMALE',
      deliveryDate: newOrderDeliveryDate,
      orderDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      paymentHistory: [],
      eventTimeline: [
        {
          id: `evt_${Date.now()}`,
          orderId: newOrderId,
          timestamp: `${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          title: 'Commande créée',
          description: `Nouvelle commande de ${title} enregistrée depuis la page Commandes.`,
          type: 'COMMANDE_CREEE',
          performedBy: 'Atelier Taylaxis',
        },
      ],
      measurementSnapshot: {
        takenAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        measurements: filledModalMeasurements.length > 0 ? filledModalMeasurements : (client.customMeasurements || []),
      },
    };

    OrderService.saveOrder(createdOrder);
    setOrders(OrderService.getOrders());
    if (onOrderUpdated) onOrderUpdated(createdOrder);

    // Reset modal state
    setShowNewOrderModal(false);
    setNewOrderPriceInput('');
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
        {clients.length === 0 ? (
          <div className="p-8 rounded-[24px] bg-surface border border-subtle text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
              <UserPlus size={24} />
            </div>
            <div>
              <h4 className="text-body-strong font-extrabold text-primary">Créer une commande</h4>
              <p className="text-caption text-secondary mt-1 max-w-sm mx-auto">
                Pour créer une commande dans l'atelier, vous devez d'abord ajouter votre premier client.
              </p>
            </div>
            <button
              onClick={onOpenNewClientModal}
              className="px-5 py-2.5 rounded-full bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] transition-all shadow-xs cursor-pointer inline-flex items-center space-x-2"
            >
              <UserPlus size={15} />
              <span>+ Ajouter mon premier client</span>
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 rounded-[24px] bg-surface border border-subtle text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <div>
              <h4 className="text-body-strong font-bold text-primary">Aucune commande enregistrée</h4>
              <p className="text-caption text-secondary mt-1">Créez votre première commande pour suivre la confection et les livraisons d'atelier.</p>
            </div>
            <button
              onClick={handleOpenNewOrderModal}
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
                    {order.priceFCFA === 0 ? (
                      <span className="text-[11px] text-[#B45309] font-bold block bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                        Prix : À définir
                      </span>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Floating Add Order Button (+) in bottom right corner */}
      <button
        onClick={handleOpenNewOrderModal}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#7C3AED] text-white shadow-xl hover:bg-[#6D28D9] flex items-center justify-center transition-all transform active:scale-90 cursor-pointer ring-4 ring-[#7C3AED]/20"
        title="Créer une nouvelle commande"
        aria-label="Créer une nouvelle commande"
      >
        <Plus size={26} className="stroke-[2.5]" />
      </button>

      {/* Full Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          client={clients.find((c) => c.id === selectedOrder.clientId)}
          onClose={() => setSelectedOrder(null)}
          onSelectClient={onSelectClient}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            setOrders(OrderService.getOrders());
            if (onOrderUpdated) onOrderUpdated(updated);
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          Rich New Order Modal — Identical to ClientDetailView
          ══════════════════════════════════════════════════════════════ */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[28px] border border-[#EDE9F6] w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">
                  Nouvelle commande
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="p-1 text-[#605B80] hover:text-[#110E2D] rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-4">
              {/* Client Selector (Custom Search & Scrollable Cards List) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-caption text-[#605B80] font-semibold flex items-center space-x-1.5">
                    <UserIcon size={14} className="text-[#7C3AED]" />
                    <span>Client destinataire</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowInlineNewClientForm(true)}
                    className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center space-x-1 cursor-pointer bg-[#F3E8FF] px-2.5 py-1 rounded-full border border-[#E9D5FF] transition-all hover:bg-[#E9D5FF] active:scale-95"
                  >
                    <UserPlus size={13} />
                    <span>+ Nouveau client</span>
                  </button>
                </div>

                {/* Search input for clients */}
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#605B80]/60" />
                  <input
                    type="text"
                    placeholder="Rechercher un client (nom, téléphone)..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-xs font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                  />
                  {clientSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setClientSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#605B80] hover:text-[#110E2D] p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Scrollable list of client cards */}
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-[#EDE9F6] rounded-[18px] p-2 bg-[#FAF9FE]">
                  {filteredClientsForSelector.length === 0 ? (
                    <div className="py-4 text-center space-y-2">
                      <p className="text-xs text-[#605B80] font-medium">
                        {clients.length === 0
                          ? 'Aucun client enregistré'
                          : `Aucun client trouvé pour "${clientSearchQuery}"`}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineClientName(clientSearchQuery);
                          setShowInlineNewClientForm(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#7C3AED] text-white rounded-full text-xs font-bold shadow-xs hover:bg-[#6D28D9] cursor-pointer inline-flex items-center space-x-1 transition-all active:scale-95"
                      >
                        <UserPlus size={13} />
                        <span>Créer "{clientSearchQuery || 'un client'}"</span>
                      </button>
                    </div>
                  ) : (
                    filteredClientsForSelector.map((c) => {
                      const isSelected = selectedClientId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedClientId(c.id)}
                          className={`p-2.5 rounded-[14px] border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#F3E8FF] border-[#7C3AED] shadow-2xs ring-2 ring-[#7C3AED]/20'
                              : 'bg-white border-[#EDE9F6] hover:bg-[#F4F2FA]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? 'bg-[#7C3AED] text-white shadow-xs' : 'bg-[#7C3AED]/10 text-[#7C3AED]'
                              }`}
                            >
                              {c.initials || c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#110E2D] truncate">{c.name}</div>
                              <div className="text-[11px] text-[#605B80] font-medium truncate">{c.phone}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                              <Check size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Garment Type Grid Selector */}
              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-2">
                  Sélectionner le type de vêtement
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {GARMENT_TYPES.map((gt) => {
                    const isSel = newGarmentType === gt.id;
                    return (
                      <button
                        key={gt.id}
                        type="button"
                        onClick={() => handleSelectGarmentType(gt.id)}
                        className={`p-2.5 rounded-[16px] text-xs font-extrabold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md scale-102 ring-2 ring-[#7C3AED]/30'
                            : 'bg-[#F4F2FA] text-[#605B80] border-[#EDE9F6] hover:bg-[#E9E4F5]'
                        }`}
                      >
                        <span className="text-xl">{gt.icon}</span>
                        <span className="truncate max-w-full text-[11px]">{gt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {newGarmentType === 'Autre vêtement (Personnalisé)' && (
                <div>
                  <label className="text-caption text-[#605B80] font-semibold block mb-1">
                    Nom du vêtement personnalisé
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Kimono, Tenue de gala..."
                    value={customGarmentNameModal}
                    onChange={(e) => setCustomGarmentNameModal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              )}

              {/* In-Modal Measurements Section */}
              <div className="bg-[#FAF9FE] p-3.5 rounded-[20px] border border-[#EDE9F6] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-caption font-bold text-[#4C1D95] flex items-center space-x-1.5">
                    <span>📐 Mensurations pour cette confection (cm)</span>
                  </span>
                  <span className="text-[11px] text-[#605B80] italic">Personnalisables</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {modalOrderMeasurements.map((m, idx) => (
                    <div key={m.id} className="bg-white p-2.5 rounded-[14px] border border-[#EDE9F6] shadow-2xs relative group">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-[#605B80] truncate max-w-[80%]">
                          {m.label}
                        </label>
                        <button
                          type="button"
                          onClick={() => setModalOrderMeasurements((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-[#EF4444] opacity-40 hover:opacity-100 p-0.5 rounded-full hover:bg-[#FEE2E2] transition-all cursor-pointer"
                          title="Supprimer cette mesure"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <input
                          type="number"
                          placeholder={m.placeholder}
                          value={m.valueCm}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setModalOrderMeasurements((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, valueCm: val } : item))
                            );
                          }}
                          className="w-full text-xs font-bold text-[#7C3AED] bg-[#F4F2FA] px-2 py-1 rounded-[8px] border border-[#EDE9F6] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                        />
                        <span className="text-[10px] font-bold text-[#605B80]/60">cm</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Option to Add Custom Measurement */}
                {!showAddCustomModalMeasurement ? (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModalMeasurement(true)}
                    className="w-full py-2 bg-white hover:bg-[#F3E8FF] border border-dashed border-[#7C3AED]/40 text-[#7C3AED] rounded-[14px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs mt-1"
                  >
                    <Plus size={14} />
                    <span>Ajouter une mesure personnalisée</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white rounded-[16px] border border-[#7C3AED]/30 shadow-xs space-y-2.5 mt-2 animate-fadeIn">
                    <div className="text-xs font-bold text-[#4C1D95] flex items-center justify-between">
                      <span>Nouvelle mesure sur mesure</span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomModalMeasurement(false)}
                        className="text-[#605B80] hover:text-[#110E2D]"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-[#605B80] block mb-0.5">
                          Nom de la mesure
                        </label>
                        <input
                          type="text"
                          placeholder="ex: Tour de mollet..."
                          value={newModalCustomLabel}
                          onChange={(e) => setNewModalCustomLabel(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[10px] text-xs font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#605B80] block mb-0.5">
                          Valeur (cm)
                        </label>
                        <input
                          type="number"
                          placeholder="ex: 42"
                          value={newModalCustomValCm}
                          onChange={(e) => setNewModalCustomValCm(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[10px] text-xs font-bold text-[#7C3AED] focus:outline-none tabular-nums"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCustomModalMeasurement(false)}
                        className="px-3 py-1 text-xs text-[#605B80] hover:bg-[#F4F2FA] rounded-full font-bold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomModalMeasurementRow}
                        className="px-3.5 py-1 text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Valider la mesure</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price FCFA */}
              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Prix convenu (FCFA) - Optionnel
                </label>
                <input
                  type="number"
                  placeholder="Laisser vide si à définir plus tard"
                  value={newOrderPriceInput}
                  onChange={(e) => setNewOrderPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                />
              </div>

              {/* Pro Taylaxis Custom Calendar / Delivery Date Picker */}
              <div className="space-y-2">
                <label className="text-caption text-[#605B80] font-semibold block">
                  Date de livraison prévue
                </label>

                {/* Pro Taylaxis Selected Date Banner Card */}
                <div className="p-3 bg-[#F3E8FF] rounded-[18px] border border-[#E9D5FF] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-[#6D28D9] uppercase tracking-wider">
                        Date sélectionnée
                      </div>
                      <div className="text-body-strong font-extrabold text-[#4C1D95] capitalize">
                        {new Date(newOrderDeliveryDate).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                    className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-caption font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <Calendar size={13} />
                    <span>{showCustomDatePicker ? 'Fermer' : 'Changer'}</span>
                  </button>
                </div>

                {/* Custom Taylaxis Interactive Calendar Popover Grid */}
                {showCustomDatePicker && (
                  <div className="bg-[#FAF9FE] p-3 rounded-[20px] border border-[#EDE9F6] space-y-3 animate-fadeIn shadow-xs">
                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (calendarViewMonth === 0) {
                            setCalendarViewMonth(11);
                            setCalendarViewYear(calendarViewYear - 1);
                          } else {
                            setCalendarViewMonth(calendarViewMonth - 1);
                          }
                        }}
                        className="px-2 py-1 text-xs font-bold text-[#7C3AED] hover:bg-[#F3E8FF] rounded-full transition-all cursor-pointer"
                      >
                        &larr; Préc.
                      </button>
                      <span className="text-body-strong font-extrabold text-[#4C1D95] capitalize">
                        {new Date(calendarViewYear, calendarViewMonth, 1).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (calendarViewMonth === 11) {
                            setCalendarViewMonth(0);
                            setCalendarViewYear(calendarViewYear + 1);
                          } else {
                            setCalendarViewMonth(calendarViewMonth + 1);
                          }
                        }}
                        className="px-2 py-1 text-xs font-bold text-[#7C3AED] hover:bg-[#F3E8FF] rounded-full transition-all cursor-pointer"
                      >
                        Suiv. &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center gap-1 text-[11px] font-extrabold text-[#605B80]">
                      <div>Lun</div>
                      <div>Mar</div>
                      <div>Mer</div>
                      <div>Jeu</div>
                      <div>Ven</div>
                      <div>Sam</div>
                      <div>Dim</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {(() => {
                        const firstDay = new Date(calendarViewYear, calendarViewMonth, 1);
                        const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();
                        let startDay = firstDay.getDay() - 1;
                        if (startDay === -1) startDay = 6;

                        const days: (number | null)[] = [];
                        for (let i = 0; i < startDay; i++) {
                          days.push(null);
                        }
                        for (let d = 1; d <= daysInMonth; d++) {
                          days.push(d);
                        }

                        const currentSelObj = new Date(newOrderDeliveryDate);
                        const isSelMonth = currentSelObj.getFullYear() === calendarViewYear && currentSelObj.getMonth() === calendarViewMonth;
                        const selDay = isSelMonth ? currentSelObj.getDate() : null;

                        return days.map((d, idx) => {
                          if (d === null) return <div key={`emp-${idx}`} className="h-8" />;
                          const isSelected = d === selDay;
                          const formattedStr = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                          return (
                            <button
                              key={`d-${d}`}
                              type="button"
                              onClick={() => {
                                setNewOrderDeliveryDate(formattedStr);
                                setShowCustomDatePicker(false);
                              }}
                              className={`h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#7C3AED] text-white shadow-md font-extrabold scale-110'
                                  : 'bg-white text-[#110E2D] hover:bg-[#F3E8FF] hover:text-[#7C3AED] border border-[#EDE9F6]'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Quick Date Pills Shortcuts */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setNewOrderDeliveryDate(d);
                      setShowCustomDatePicker(false);
                    }}
                    className="px-2.5 py-1 bg-[#F3E8FF] border border-[#E9D5FF] text-[#7C3AED] rounded-full text-[11px] font-bold hover:bg-[#7C3AED] hover:text-white transition-all cursor-pointer"
                  >
                    ⚡ 7 jours (Recommandé)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setNewOrderDeliveryDate(d);
                      setShowCustomDatePicker(false);
                    }}
                    className="px-2.5 py-1 bg-[#F4F2FA] border border-[#EDE9F6] text-[#605B80] rounded-full text-[11px] font-bold hover:bg-[#E9E4F5] transition-all cursor-pointer"
                  >
                    14 jours
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setNewOrderDeliveryDate(d);
                      setShowCustomDatePicker(false);
                    }}
                    className="px-2.5 py-1 bg-[#F4F2FA] border border-[#EDE9F6] text-[#605B80] rounded-full text-[11px] font-bold hover:bg-[#E9E4F5] transition-all cursor-pointer"
                  >
                    30 jours
                  </button>
                </div>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 py-3 bg-[#F4F2FA] hover:bg-[#E9E4F5] text-[#605B80] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  <Check size={16} />
                  <span>Créer la commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Sub-Modal / Form overlay for creating a new client directly inside the order flow */}
      {showInlineNewClientForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[24px] border border-[#EDE9F6] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">Nouveau Client</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineNewClientForm(false)}
                className="p-1 text-[#605B80] hover:text-[#110E2D] rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInlineCreateClient} className="space-y-3.5">
              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Nom complet du client <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Koffi Mensah"
                  value={inlineClientName}
                  onChange={(e) => setInlineClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Numéro de téléphone <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: 90 12 34 56"
                  value={inlineClientPhone}
                  onChange={(e) => setInlineClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInlineNewClientForm(false)}
                  className="flex-1 py-2.5 bg-[#F4F2FA] hover:bg-[#E9E4F5] text-[#605B80] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1"
                >
                  <Check size={16} />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
