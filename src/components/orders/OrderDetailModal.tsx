import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  DollarSign,
  Ruler,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  Scissors,
  ClipboardCheck,
  Plus,
  ShieldAlert,
  Check,
  Edit3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { Order, Client, ManufacturingStatus, OrderPaymentRecord, Measurement } from '../../types';
import { OrderEngine } from '../../services/orderEngine';
import type { ContextualAction } from '../../services/orderEngine';
import { OrderService } from '../../services/orderService';
import { GARMENT_TYPE_PRESETS } from '../../data/mockData';

interface EditMeasurementItem {
  id: string;
  label: string;
  valueCm: number | '';
  placeholder: string;
}

interface OrderDetailModalProps {
  order: Order;
  client?: Client;
  onClose: () => void;
  onSelectClient?: (clientId: string) => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order: initialOrder,
  client,
  onClose,
  onSelectClient,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [activeTab, setActiveTab] = useState<'details' | 'paiements' | 'timeline' | 'mensurations'>('details');
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<OrderPaymentRecord['paymentMethod']>('ESPECES');
  const [payNote, setPayNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [modalPriceInput, setModalPriceInput] = useState<number | ''>('');

  // Order Editing State
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrderTitle, setEditOrderTitle] = useState(order.title);
  const [editOrderPrice, setEditOrderPrice] = useState<number | ''>(order.priceFCFA || '');
  const [editOrderDeliveryDate, setEditOrderDeliveryDate] = useState(order.deliveryDate || '');
  const [editOrderMfgStatus, setEditOrderMfgStatus] = useState<ManufacturingStatus>(
    order.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(order.status)
  );

  const [editOrderMeasurements, setEditOrderMeasurements] = useState<EditMeasurementItem[]>(() => {
    const existing = order.measurementSnapshot?.measurements || [];
    if (existing.length > 0) {
      return existing.map((m, idx) => ({
        id: m.id || `m-edit-${idx}`,
        label: m.label,
        valueCm: m.valueCm > 0 ? m.valueCm : '',
        placeholder: 'ex: 95',
      }));
    }
    const preset = GARMENT_TYPE_PRESETS['Costume 3 Pièces'] || [];
    return preset.map((p, idx) => ({
      id: `m-edit-${idx}`,
      label: p.label,
      valueCm: '',
      placeholder: p.placeholder,
    }));
  });

  const [showAddEditCustomMeasurement, setShowAddEditCustomMeasurement] = useState(false);
  const [newEditCustomLabel, setNewEditCustomLabel] = useState('');
  const [newEditCustomValue, setNewEditCustomValue] = useState<number | ''>('');

  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());

  const garmentsList = [
    { id: 'costume', label: 'Costume 3 Pièces', icon: '👔' },
    { id: 'costume2p', label: 'Costume 2 Pièces', icon: '🤵' },
    { id: 'chemise', label: 'Chemise Manche Longue', icon: '👕' },
    { id: 'chemise_mc', label: 'Chemise Manche Courte', icon: '🎽' },
    { id: 'pantalon', label: 'Pantalon classique', icon: '👖' },
    { id: 'boubou', label: 'Boubou / Agbada', icon: '🥻' },
    { id: 'traditionnel', label: 'Habits traditionnels', icon: '✨' },
    { id: 'veste', label: 'Veste / Blazer', icon: '🧥' },
    { id: 'robe', label: 'Robe / Ensemble Dame', icon: '👗' },
    { id: 'custom', label: 'Autre vêtement (Personnalisé)', icon: '📏' },
  ];

  const handleSelectGarmentTypeInEdit = (garmentLabel: string) => {
    setEditOrderTitle(`Confection - ${garmentLabel}`);
    const preset = GARMENT_TYPE_PRESETS[garmentLabel] || [];
    setEditOrderMeasurements(
      preset.map((p, idx) => ({
        id: `m-edit-${idx}`,
        label: p.label,
        valueCm: '',
        placeholder: p.placeholder,
      }))
    );
  };

  const handleAddEditCustomMeasurementRow = () => {
    if (!newEditCustomLabel.trim()) return;
    setEditOrderMeasurements((prev) => [
      ...prev,
      {
        id: `m-edit-custom-${Date.now()}`,
        label: newEditCustomLabel.trim(),
        valueCm: newEditCustomValue === '' ? '' : Number(newEditCustomValue),
        placeholder: 'ex: 45',
      },
    ]);
    setNewEditCustomLabel('');
    setNewEditCustomValue('');
    setShowAddEditCustomMeasurement(false);
  };

  const handleSaveEditedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrice = typeof editOrderPrice === 'number' ? editOrderPrice : 0;
    const newBalance = newPrice - (order.paidFCFA || 0);

    let newPaymentStatus = order.paymentStatus;
    if (order.paidFCFA >= newPrice && newPrice > 0) {
      newPaymentStatus = 'PAYEE';
    } else if (order.paidFCFA > 0) {
      newPaymentStatus = 'PARTIELLEMENT_PAYEE';
    } else {
      newPaymentStatus = 'NON_PAYEE';
    }

    const dueDateStatus = OrderEngine.calculateDueDateStatus(editOrderDeliveryDate, editOrderMfgStatus);
    const priority = OrderEngine.calculatePriority(order, editOrderMfgStatus, newPaymentStatus, dueDateStatus);
    const legacyStatus = OrderEngine.mapManufacturingStatusToLegacy(editOrderMfgStatus, dueDateStatus === 'EN_RETARD');

    const filledSnapshotMeasurements: Measurement[] = editOrderMeasurements
      .filter((m) => m.label.trim() !== '')
      .map((m, idx) => ({
        id: m.id || `ms_${Date.now()}_${idx}`,
        label: m.label,
        valueCm: typeof m.valueCm === 'number' ? m.valueCm : 0,
        iconName: 'Ruler',
      }));

    const updatedOrder: Order = {
      ...order,
      title: editOrderTitle.trim() || order.title,
      priceFCFA: newPrice,
      balanceFCFA: newBalance,
      manufacturingStatus: editOrderMfgStatus,
      paymentStatus: newPaymentStatus,
      dueDateStatus,
      priority,
      status: legacyStatus,
      deliveryDate: editOrderDeliveryDate || order.deliveryDate,
      measurementSnapshot: {
        takenAt: order.measurementSnapshot?.takenAt || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        measurements: filledSnapshotMeasurements,
      },
      eventTimeline: [
        {
          id: `evt_edit_${Date.now()}`,
          orderId: order.id,
          timestamp: `${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          title: 'Commande modifiée',
          description: `Mise à jour (${editOrderTitle}) - Statut: ${editOrderMfgStatus}, Prix: ${newPrice.toLocaleString('fr-FR')} FCFA.`,
          type: 'STATUT_CHANGE',
          performedBy: 'Atelier Taylaxis',
        },
        ...(order.eventTimeline || []),
      ],
    };

    OrderService.saveOrder(updatedOrder);
    setOrder(updatedOrder);
    if (onOrderUpdated) onOrderUpdated(updatedOrder);
    setIsEditingOrder(false);
  };

  const mfgStatus = order.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(order.status);
  const paymentStatus = order.paymentStatus || OrderEngine.calculatePaymentStatus(order.priceFCFA, order.paidFCFA);
  const dueDateStatus = order.dueDateStatus || OrderEngine.calculateDueDateStatus(order.deliveryDate, mfgStatus);
  const priority = order.priority || OrderEngine.calculatePriority(order, mfgStatus, paymentStatus, dueDateStatus);

  const nextActions = OrderEngine.getNextActions(order, client?.phone);

  const handleExecuteAction = (actionKey: ContextualAction['actionKey']) => {
    setErrorMessage(null);
    switch (actionKey) {
      case 'CONFIRMER_COMMANDE':
        updateStatus('CONFIRMEE');
        break;
      case 'DEMARRER_CONFECTION':
        updateStatus('EN_COURS');
        break;
      case 'MARQUER_PRETE':
        updateStatus('PRETE');
        break;
      case 'MARQUER_A_LIVRER':
        updateStatus('A_LIVRER');
        break;
      case 'MARQUER_LIVREE':
        updateStatus('LIVREE');
        break;
      case 'TERMINER_COMMANDE':
        updateStatus('TERMINEE');
        break;
      case 'ENCAISSER_SOLDE':
        setPayAmount(order.balanceFCFA > 0 ? order.balanceFCFA : '');
        setShowPayModal(true);
        break;
      case 'PREVENIR_CLIENT':
      case 'WHATSAPP_CLIENT':
        if (client?.phone) {
          const msg = `Bonjour ${client.name}, votre commande "${order.title}" (${order.orderNumber}) est prête à l'atelier Taylaxis ! ${
            order.balanceFCFA > 0 ? `Solde restant : ${order.balanceFCFA.toLocaleString('fr-FR')} FCFA.` : ''
          }`;
          window.open(`https://wa.me/${client.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
        }
        break;
      case 'APPELER_CLIENT':
        if (client?.phone) {
          window.location.href = `tel:${client.phone.replace(/\s+/g, '')}`;
        }
        break;
      case 'VOIR_CLIENT':
        if (onSelectClient) {
          onSelectClient(order.clientId);
          onClose();
        }
        break;
      case 'VOIR_MENSURATIONS':
        setActiveTab('mensurations');
        break;
      case 'ANNULER_COMMANDE':
        if (window.confirm('Voulez-vous vraiment annuler cette commande ?')) {
          updateStatus('TERMINEE');
        }
        break;
    }
  };

  const updateStatus = (nextStatus: ManufacturingStatus) => {
    const res = OrderService.updateManufacturingStatus(order.id, nextStatus);
    if (!res.success) {
      setErrorMessage(res.error || 'Impossible de changer le statut');
    } else if (res.order) {
      setOrder(res.order);
      if (onOrderUpdated) onOrderUpdated(res.order);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    const res = OrderService.addPayment(order.id, Number(payAmount), payMethod, payNote);
    if (!res.success) {
      setErrorMessage(res.error || 'Erreur lors du paiement');
    } else if (res.order) {
      setOrder(res.order);
      setShowPayModal(false);
      setPayAmount('');
      setPayNote('');
      if (onOrderUpdated) onOrderUpdated(res.order);
    }
  };

  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'ClipboardCheck':
        return <ClipboardCheck size={18} />;
      case 'Scissors':
        return <Scissors size={18} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={18} />;
      case 'MessageSquare':
        return <MessageSquare size={18} />;
      case 'Truck':
        return <Truck size={18} />;
      case 'DollarSign':
        return <DollarSign size={18} />;
      case 'PackageCheck':
        return <PackageCheck size={18} />;
      case 'AlertCircle':
        return <AlertCircle size={18} />;
      case 'Phone':
        return <Phone size={18} />;
      case 'Ruler':
        return <Ruler size={18} />;
      case 'User':
        return <User size={18} />;
      default:
        return <Check size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-surface rounded-[28px] border border-subtle w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-subtle bg-surface-alt/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-black text-micro sm:text-caption tabular-nums flex-shrink-0">
              {order.orderNumber}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-body-strong sm:text-h2 font-bold text-primary truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs">{order.title}</h3>
              <p className="text-micro sm:text-caption text-secondary font-medium truncate">Client : {order.clientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditOrderTitle(order.title);
                setEditOrderPrice(order.priceFCFA || '');
                setEditOrderDeliveryDate(order.deliveryDate || '');
                setEditOrderMfgStatus(order.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(order.status));
                setIsEditingOrder(!isEditingOrder);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-caption font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0 ${
                isEditingOrder
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : 'bg-[#F3E8FF] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white border border-[#E9D5FF]'
              }`}
            >
              <Edit3 size={14} className="flex-shrink-0" />
              <span>{isEditingOrder ? 'Fermer' : 'Modifier'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-tertiary hover:text-primary hover:bg-surface-alt rounded-full transition-colors cursor-pointer flex-shrink-0"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* If editing order is active, show the full Edit Form */}
        {isEditingOrder ? (
          <form onSubmit={handleSaveEditedOrder} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 animate-fadeIn bg-surface">
            <div className="p-3.5 rounded-[18px] bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#5B21B6] font-bold text-caption">
                <Edit3 size={18} className="text-[#7C3AED]" />
                <span>Modification de la commande {order.orderNumber}</span>
              </div>
            </div>

            {/* Garment Selector Pills & Custom Title */}
            <div className="space-y-2">
              <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
                Type de vêtement / Modèle
              </label>
              <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                {garmentsList.map((g) => {
                  const isSelected = editOrderTitle.toLowerCase().includes(g.label.toLowerCase());
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGarmentTypeInEdit(g.label)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-[12px] text-caption font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                        isSelected
                          ? 'bg-[#7C3AED] text-white shadow-sm'
                          : 'bg-surface-alt border border-subtle text-secondary hover:text-primary hover:bg-surface-alt'
                      }`}
                    >
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                required
                value={editOrderTitle}
                onChange={(e) => setEditOrderTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body-strong font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Manufacturing Status Selector */}
            <div className="space-y-2">
              <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
                Statut de confection
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'BROUILLON', label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
                  { id: 'CONFIRMEE', label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
                  { id: 'EN_COURS', label: 'En cours', color: 'bg-amber-100 text-amber-700' },
                  { id: 'PRETE', label: 'Prête', color: 'bg-purple-100 text-purple-700' },
                  { id: 'A_LIVRER', label: 'À livrer', color: 'bg-indigo-100 text-indigo-700' },
                  { id: 'LIVREE', label: 'Livrée / Terminée', color: 'bg-emerald-100 text-emerald-700' },
                ].map((st) => {
                  const isSel = editOrderMfgStatus === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditOrderMfgStatus(st.id as ManufacturingStatus)}
                      className={`py-2 px-3 rounded-[12px] text-caption font-bold transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                          : `${st.color} border-transparent hover:opacity-80`
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confection Price FCFA */}
            <div className="space-y-2">
              <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
                Prix de confection (FCFA)
              </label>
              <input
                type="number"
                placeholder="ex: 35000"
                value={editOrderPrice}
                onChange={(e) => setEditOrderPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-lg font-bold text-primary focus:outline-none focus:border-[#7C3AED] tabular-nums"
              />
            </div>

            {/* Delivery Date with Taylaxis Custom Calendar */}
            <div className="space-y-2 relative">
              <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
                Date de livraison prévue
              </label>
              <div className="p-3 bg-surface-alt border border-subtle rounded-[16px] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Calendar size={18} className="text-[#7C3AED]" />
                  <span className="text-body-strong font-bold text-primary">
                    {editOrderDeliveryDate
                      ? new Date(editOrderDeliveryDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Sélectionner une date'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                  className="px-3 py-1 bg-[#7C3AED] text-white rounded-full text-caption font-bold hover:bg-[#6D28D9] cursor-pointer"
                >
                  Changer
                </button>
              </div>

              {showCustomDatePicker && (
                <div className="p-4 bg-surface border border-subtle rounded-[20px] shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-subtle pb-2">
                    <button
                      type="button"
                      onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                      className="p-1 text-secondary hover:text-primary rounded-full"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="text-caption font-bold text-primary capitalize">
                      {calendarViewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                      className="p-1 text-secondary hover:text-primary rounded-full"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-micro font-bold text-secondary">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-caption font-bold">
                    {(() => {
                      const year = calendarViewDate.getFullYear();
                      const month = calendarViewDate.getMonth();
                      const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
                      const daysInMonth = new Date(year, month + 1, 0).getDate();

                      const days = [];
                      for (let i = 0; i < firstDayIndex; i++) {
                        days.push(<div key={`blank-${i}`} />);
                      }
                      for (let d = 1; d <= daysInMonth; d++) {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isSelected = editOrderDeliveryDate === dateStr;
                        days.push(
                          <button
                            key={`day-${d}`}
                            type="button"
                            onClick={() => {
                              setEditOrderDeliveryDate(dateStr);
                              setShowCustomDatePicker(false);
                            }}
                            className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-caption font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#7C3AED] text-white shadow-xs'
                                : 'hover:bg-surface-alt text-primary'
                            }`}
                          >
                            {d}
                          </button>
                        );
                      }
                      return days;
                    })()}
                  </div>

                  <div className="flex items-center justify-between border-t border-subtle pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setEditOrderDeliveryDate(d);
                        setShowCustomDatePicker(false);
                      }}
                      className="px-2.5 py-1 bg-surface-alt text-secondary rounded-full text-micro font-bold hover:bg-subtle cursor-pointer"
                    >
                      +7 jours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setEditOrderDeliveryDate(d);
                        setShowCustomDatePicker(false);
                      }}
                      className="px-2.5 py-1 bg-surface-alt text-secondary rounded-full text-micro font-bold hover:bg-subtle cursor-pointer"
                    >
                      +14 jours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setEditOrderDeliveryDate(d);
                        setShowCustomDatePicker(false);
                      }}
                      className="px-2.5 py-1 bg-surface-alt text-secondary rounded-full text-micro font-bold hover:bg-subtle cursor-pointer"
                    >
                      +30 jours
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section Mensurations de la commande */}
            <div className="space-y-3 pt-2 border-t border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-body-strong font-bold text-primary flex items-center space-x-1.5">
                    <Ruler size={18} className="text-[#7C3AED]" />
                    <span>Mensurations de cette commande</span>
                  </h4>
                  <p className="text-caption text-secondary">
                    Saisissez ou modifiez les mesures à appliquer pour la confection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEditCustomMeasurement(true)}
                  className="px-2.5 py-1 rounded-[10px] bg-[#F3E8FF] text-[#7C3AED] text-micro font-bold hover:bg-[#7C3AED] hover:text-white transition-colors cursor-pointer flex items-center space-x-1 flex-shrink-0"
                >
                  <Plus size={14} />
                  <span>Ajouter mesure</span>
                </button>
              </div>

              {/* Input fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {editOrderMeasurements.map((m, idx) => (
                  <div key={m.id || idx} className="p-2.5 rounded-[14px] bg-surface-alt border border-subtle flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setEditOrderMeasurements((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-tertiary hover:text-red-500 p-1 rounded-full transition-colors flex-shrink-0"
                        title="Supprimer cette mesure"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span className="text-caption font-semibold text-primary truncate">{m.label}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <input
                        type="number"
                        step="0.5"
                        placeholder={m.placeholder || 'ex: --'}
                        value={m.valueCm}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setEditOrderMeasurements((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, valueCm: val } : item))
                          );
                        }}
                        className="w-20 px-2 py-1 bg-surface border border-subtle rounded-[10px] text-caption font-bold text-primary focus:outline-none focus:border-[#7C3AED] text-right tabular-nums placeholder:text-[#605B80]/40 placeholder:font-normal placeholder:italic"
                      />
                      <span className="text-micro font-bold text-secondary">cm</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Popup Mockup pour ajouter une mesure personnalisée */}
              {showAddEditCustomMeasurement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-sm shadow-2xl space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-subtle pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-bold">
                          <Ruler size={18} />
                        </div>
                        <div>
                          <h3 className="text-body-strong font-bold text-primary">Nouvelle mesure</h3>
                          <p className="text-micro text-secondary">Ajouter une mesure sur mesure</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddEditCustomMeasurement(false)}
                        className="p-1.5 text-tertiary hover:text-primary rounded-full hover:bg-surface-alt cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-caption text-secondary font-semibold block mb-1">
                          Nom de la mesure <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Longueur manche, Carrure..."
                          value={newEditCustomLabel}
                          onChange={(e) => setNewEditCustomLabel(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div>
                        <label className="text-caption text-secondary font-semibold block mb-1">
                          Valeur en centimètres (cm)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            placeholder="ex: 65"
                            value={newEditCustomValue}
                            onChange={(e) => setNewEditCustomValue(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 pr-10 bg-surface-alt border border-subtle rounded-[14px] text-body font-bold text-primary focus:outline-none focus:border-[#7C3AED] tabular-nums placeholder:text-[#605B80]/40 placeholder:font-normal placeholder:italic"
                          />
                          <span className="absolute right-3.5 top-2.5 text-caption font-bold text-secondary">cm</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2 border-t border-subtle">
                      <button
                        type="button"
                        onClick={() => setShowAddEditCustomMeasurement(false)}
                        className="flex-1 py-2.5 bg-surface-alt text-secondary rounded-[12px] text-caption font-bold hover:text-primary cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleAddEditCustomMeasurementRow}
                        className="flex-1 py-2.5 bg-[#7C3AED] text-white rounded-[12px] text-caption font-bold hover:bg-[#6D28D9] shadow-sm cursor-pointer active:scale-95 flex items-center justify-center space-x-1"
                      >
                        <Check size={16} />
                        <span>Enregistrer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-3 border-t border-subtle">
              <button
                type="button"
                onClick={() => setIsEditingOrder(false)}
                className="flex-1 py-3 bg-surface-alt text-secondary hover:text-primary rounded-[14px] text-body font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-body font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Check size={18} />
                <span>Enregistrer la commande</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Multi-Dimensional Status Bar */}
            <div className="p-4 bg-surface border-b border-subtle space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Manufacturing Status */}
            <span className="px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 text-micro font-extrabold flex items-center gap-1">
              <Scissors size={12} />
              {mfgStatus}
            </span>

            {/* Payment Status */}
            <span
              className={`px-3 py-1 rounded-full text-micro font-extrabold flex items-center gap-1 border ${
                paymentStatus === 'PAYEE'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                  : paymentStatus === 'PARTIELLEMENT_PAYEE'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                  : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
              }`}
            >
              <DollarSign size={12} />
              {paymentStatus === 'PAYEE' ? 'PAYÉE' : paymentStatus === 'PARTIELLEMENT_PAYEE' ? 'ACOMPTE PAYÉ' : 'NON PAYÉE'}
            </span>

            {/* Due Date Status */}
            {dueDateStatus === 'EN_RETARD' ? (
              <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-600 border border-red-500/30 text-micro font-extrabold flex items-center gap-1 animate-pulse dark:text-red-400">
                <AlertCircle size={12} />
                EN RETARD
              </span>
            ) : dueDateStatus === 'AUJOURD_HUI' ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 text-micro font-extrabold flex items-center gap-1 dark:text-amber-400">
                <Clock size={12} />
                LIVRAISON AUJOURD'HUI
              </span>
            ) : null}

            {/* Priority Badge */}
            {priority === 'CRITIQUE' && (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-micro font-black shadow-xs flex items-center gap-1">
                <ShieldAlert size={12} />
                URGENT
              </span>
            )}
          </div>

          {/* Validation Error Toast */}
          {errorMessage && (
            <div className="p-3 rounded-[14px] bg-red-500/10 border border-red-500/20 text-red-600 text-caption font-semibold flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Button */}
          {nextActions.primaryAction && (
            <button
              onClick={() => handleExecuteAction(nextActions.primaryAction!.actionKey)}
              className={`w-full py-3.5 px-4 rounded-[16px] text-body-strong font-bold text-white shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.98] ${
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
              {renderActionIcon(nextActions.primaryAction.iconName)}
              <span>{nextActions.primaryAction.label}</span>
            </button>
          )}
        </div>

        {/* Secondary Contextual Actions Bar */}
        <div className="px-4 py-2.5 bg-surface-alt/50 border-b border-subtle flex items-center gap-2 overflow-x-auto no-scrollbar">
          {nextActions.secondaryActions.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleExecuteAction(sec.actionKey)}
              className="px-3 py-1.5 rounded-[12px] bg-surface border border-subtle text-caption font-semibold text-primary hover:border-[#7C3AED] hover:text-[#7C3AED] flex items-center space-x-1.5 flex-shrink-0 transition-colors cursor-pointer"
            >
              {renderActionIcon(sec.iconName)}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-subtle bg-surface px-4 pt-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 text-caption font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('paiements')}
            className={`pb-2.5 px-3 text-caption font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'paiements'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Paiements ({order.paymentHistory?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-3 text-caption font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Historique ({order.eventTimeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('mensurations')}
            className={`pb-2.5 px-3 text-caption font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mensurations'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Mesures utilisées
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-[16px] bg-surface-alt border border-subtle space-y-1">
                  <span className="text-micro font-bold text-secondary uppercase">Date commande</span>
                  <p className="text-body-strong font-bold text-primary">{order.orderDate}</p>
                </div>
                <div className="p-3.5 rounded-[16px] bg-surface-alt border border-subtle space-y-1">
                  <span className="text-micro font-bold text-secondary uppercase">Date livraison</span>
                  <p className="text-body-strong font-bold text-primary">{order.deliveryDate}</p>
                </div>
              </div>

              {/* Financial Progress */}
              <div className="p-4 rounded-[20px] bg-surface-alt border border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body font-bold text-primary">Règlement financier</span>
                  <span className="text-caption font-bold text-[#7C3AED]">
                    {order.priceFCFA > 0 ? `${Math.round(((order.paidFCFA || 0) / order.priceFCFA) * 100)}% Payé` : 'Prix à définir'}
                  </span>
                </div>
                {order.priceFCFA > 0 ? (
                  <>
                    <div className="w-full h-2.5 bg-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, ((order.paidFCFA || 0) / order.priceFCFA) * 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div>
                        <span className="text-micro text-secondary block">Total</span>
                        <span className="text-caption font-extrabold text-primary tabular-nums">
                          {order.priceFCFA.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                      <div>
                        <span className="text-micro text-secondary block">Payé</span>
                        <span className="text-caption font-extrabold text-emerald-600 tabular-nums">
                          {order.paidFCFA.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                      <div>
                        <span className="text-micro text-secondary block">Reste</span>
                        <span className="text-caption font-extrabold text-red-500 tabular-nums">
                          {order.balanceFCFA.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded-[14px] bg-[#FFFBEB] border border-[#FDE68A] text-center space-y-2">
                    <p className="text-caption font-bold text-[#92400E]">Le prix de cette commande n'est pas encore fixé.</p>
                    <button
                      onClick={() => setActiveTab('paiements')}
                      className="px-3.5 py-1.5 bg-[#7C3AED] text-white rounded-[12px] text-caption font-bold hover:bg-[#6D28D9] cursor-pointer"
                    >
                      Fixer le prix dans l'onglet Paiements
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAIEMENTS */}
          {activeTab === 'paiements' && (
            <div className="space-y-4 animate-fadeIn">
              {order.priceFCFA === 0 ? (
                <div className="p-4 rounded-[18px] bg-[#FFFBEB] border border-[#FDE68A] space-y-3">
                  <div>
                    <h4 className="text-body-strong font-bold text-[#92400E]">Fixer le prix de la commande</h4>
                    <p className="text-caption text-[#B45309] mt-0.5">Saisissez le montant en FCFA convenu avec le client.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="ex: 25000"
                      value={modalPriceInput}
                      onChange={(e) => setModalPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex-1 px-3.5 py-2 bg-white border border-[#EDE9F6] rounded-[12px] text-body-strong font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof modalPriceInput === 'number' && modalPriceInput > 0) {
                          const updatedOrder: Order = {
                            ...order,
                            priceFCFA: modalPriceInput,
                            balanceFCFA: modalPriceInput - order.paidFCFA,
                            paymentStatus: 'NON_PAYEE',
                          };
                          OrderService.saveOrder(updatedOrder);
                          setOrder(updatedOrder);
                          if (onOrderUpdated) onOrderUpdated(updatedOrder);
                          setModalPriceInput('');
                        }
                      }}
                      className="px-4 py-2 bg-[#7C3AED] text-white rounded-[12px] text-caption font-bold hover:bg-[#6D28D9] cursor-pointer shadow-xs active:scale-95"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h4 className="text-body-strong font-bold text-primary">Historique des versements</h4>
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="px-3 py-1.5 rounded-[12px] bg-[#7C3AED] text-white text-caption font-bold hover:bg-[#6D28D9] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Encaisser</span>
                  </button>
                </div>
              )}

              {order.paymentHistory && order.paymentHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {order.paymentHistory.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-[16px] bg-surface-alt border border-subtle flex items-center justify-between"
                    >
                      <div>
                        <div className="text-body font-bold text-primary flex items-center space-x-2">
                          <span>+{p.amountFCFA.toLocaleString('fr-FR')} FCFA</span>
                          <span className="text-micro px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold">
                            {p.paymentMethod}
                          </span>
                        </div>
                        <p className="text-caption text-secondary mt-0.5">{p.date}</p>
                        {p.note && <p className="text-caption text-tertiary italic">{p.note}</p>}
                      </div>
                      <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-tertiary text-caption">
                  Aucun versement enregistré pour l'instant.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMELINE (HISTORIQUE) */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-body-strong font-bold text-primary">Journal des événements atelier</h4>

              {order.eventTimeline && order.eventTimeline.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-subtle">
                  {order.eventTimeline.map((evt) => (
                    <div key={evt.id} className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-body font-bold text-primary">{evt.title}</span>
                          <span className="text-micro text-tertiary">{evt.timestamp}</span>
                        </div>
                        <p className="text-caption text-secondary mt-1">{evt.description}</p>
                        {evt.performedBy && (
                          <span className="text-micro text-tertiary block mt-0.5">Par : {evt.performedBy}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-tertiary text-caption">Aucun historique disponible.</div>
              )}
            </div>
          )}

          {/* TAB 4: MENSURATIONS UTILISÉES */}
          {activeTab === 'mensurations' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-[14px] bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-caption font-semibold flex items-center space-x-2">
                <Ruler size={16} />
                <span>
                  Mesures figées lors de la commande ({order.measurementSnapshot?.takenAt || order.orderDate})
                </span>
              </div>

              {order.measurementSnapshot?.measurements && order.measurementSnapshot.measurements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {order.measurementSnapshot.measurements.map((m) => (
                    <div key={m.id} className="p-3 rounded-[14px] bg-surface-alt border border-subtle">
                      <span className="text-micro text-secondary block truncate">{m.label}</span>
                      <span className="text-body-strong font-extrabold text-primary tabular-nums">
                        {m.valueCm} cm
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-tertiary text-caption">
                  Aucune mesure spécifique associée à cette commande.
                </div>
              )}
            </div>
          )}
        </div>
        </>
      )}
      </div>

      {/* Inline Modal: Encaisser un Paiement */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-h2 font-bold text-primary">Encaisser un versement</h3>
              <button onClick={() => setShowPayModal(false)} className="text-tertiary p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5">
              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Montant (FCFA)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={order.balanceFCFA || 9999999}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  placeholder="Ex: 25000"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Mode de règlement</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money (T-Money / Flooz)</option>
                  <option value="VIREMENT">Virement bancaire</option>
                  <option value="CARTE">Carte bancaire</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">Note (Optionnel)</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  placeholder="Ex: Deuxième acompte essayage"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-body font-semibold hover:bg-[#6D28D9]"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
