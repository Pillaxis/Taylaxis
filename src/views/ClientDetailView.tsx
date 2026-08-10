import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  User as UserIcon,
  FileText,
  ChevronRight,
  Ruler,
  CreditCard,
  Edit3,
  Check,
  X,
  Smile,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { Client, Measurement, Order, StatusType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_ORDERS, GARMENT_TYPES, GARMENT_TYPE_PRESETS } from '../data/mockData';
import { OrderService } from '../services/orderService';
import { Truck, DollarSign } from 'lucide-react';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

interface ClientDetailViewProps {
  client: Client;
  initialTab?: 'info' | 'mensurations' | 'commandes' | 'paiements';
  highlightedOrderId?: string | null;
  orders?: Order[];
  onOpenMensurations: () => void;
  onUpdateClient?: (updatedClient: Client) => void;
  onUpdateOrderStatus?: (orderId: string, status: StatusType) => void;
  onPayOrder?: (orderId: string, amount: number) => void;
  onOrderCreated?: (order: Order) => void;
  onRequirePro?: (featureKey: string, customMessage?: string) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  client,
  initialTab = 'info',
  highlightedOrderId = null,
  orders,
  onOpenMensurations,
  onUpdateClient,
  onUpdateOrderStatus,
  onPayOrder,
  onOrderCreated,
  onRequirePro,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'mensurations' | 'commandes' | 'paiements'>(initialTab);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [selectedClientOrder, setSelectedClientOrder] = useState<Order | null>(null);
  const [settingPriceOrderId, setSettingPriceOrderId] = useState<string | null>(null);
  const [inputPriceFCFA, setInputPriceFCFA] = useState<number | ''>('');

  // Edit Information state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editPhone, setEditPhone] = useState(client.phone);
  const [editAddress, setEditAddress] = useState(client.address || '');
  const [editBirthDate, setEditBirthDate] = useState(client.birthDate || '');
  const [editGender, setEditGender] = useState(client.gender || '');
  const [editAgeGroup, setEditAgeGroup] = useState<'adulte' | 'enfant' | undefined>(client.ageGroup);
  const [editAge, setEditAge] = useState<number | ''>(client.age || '');
  const [editNotes, setEditNotes] = useState(client.notes || '');

  // Measurement Editing & Addition State
  const initialMeasurements = client.customMeasurements || [];
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [editingMeasurement, setEditingMeasurement] = useState<{ id: string; label: string; valueCm: number } | null>(null);
  const [newMeasurementValue, setNewMeasurementValue] = useState<number | ''>(0);
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [newMeasurementLabel, setNewMeasurementLabel] = useState('');
  const [newAddMeasurementValue, setNewAddMeasurementValue] = useState<number | ''>('');
  const [deletingMeasurement, setDeletingMeasurement] = useState<Measurement | null>(null);

  const allOrdersList = orders || MOCK_ORDERS;
  const clientOrders = allOrdersList.filter(
    (o) => o.clientId === client.id || o.clientName === client.name
  );

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Client = {
      ...client,
      name: editName,
      phone: editPhone,
      address: editAddress,
      birthDate: editBirthDate,
      gender: editGender,
      ageGroup: editAgeGroup,
      age: typeof editAge === 'number' ? editAge : undefined,
      notes: editNotes,
    };
    if (onUpdateClient) {
      onUpdateClient(updated);
    }
    setIsEditingInfo(false);
  };

  const totalPaidFCFA = clientOrders.reduce((sum, o) => sum + (o.paidFCFA || 0), 0);
  const totalBalanceFCFA = clientOrders.reduce((sum, o) => sum + (o.balanceFCFA || 0), 0);

  // New Order Modal State for this Client
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newGarmentType, setNewGarmentType] = useState('Costume 3 Pièces');
  const [customGarmentNameModal, setCustomGarmentNameModal] = useState('');
  const [newOrderPriceInput, setNewOrderPriceInput] = useState<number | ''>('');
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Custom Taylaxis Calendar Popover State
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

  const handleCreateNewClientOrder = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Merge into client measurements if new
    const updatedClientMeasurements = [...measurements];
    filledModalMeasurements.forEach((fm) => {
      const existingIdx = updatedClientMeasurements.findIndex((m) => m.label.toLowerCase() === fm.label.toLowerCase());
      if (existingIdx >= 0) {
        updatedClientMeasurements[existingIdx].valueCm = fm.valueCm;
      } else {
        updatedClientMeasurements.push(fm);
      }
    });

    if (filledModalMeasurements.length > 0) {
      setMeasurements(updatedClientMeasurements);
      client.customMeasurements = updatedClientMeasurements;
      if (onUpdateClient) {
        onUpdateClient({ ...client, customMeasurements: updatedClientMeasurements });
      }
    }

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
          description: `Nouvelle commande de ${title} enregistrée depuis la fiche client.`,
          type: 'COMMANDE_CREEE',
          performedBy: 'Atelier Taylaxis',
        },
      ],
      measurementSnapshot: {
        takenAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        measurements: filledModalMeasurements.length > 0 ? filledModalMeasurements : measurements,
      },
    };

    OrderService.saveOrder(createdOrder);
    client.ordersCount = (client.ordersCount || 0) + 1;
    if (onOrderCreated) {
      onOrderCreated(createdOrder);
    }

    // Reset modal state
    setShowNewOrderModal(false);
    setNewOrderPriceInput('');
  };

  const handleSavePrice = (targetOrder: Order, newPrice: number) => {
    if (newPrice <= 0) return;
    const newBalance = newPrice - (targetOrder.paidFCFA || 0);
    let newPaymentStatus = targetOrder.paymentStatus;
    if (targetOrder.paidFCFA >= newPrice) {
      newPaymentStatus = 'PAYEE';
    } else if (targetOrder.paidFCFA > 0) {
      newPaymentStatus = 'PARTIELLEMENT_PAYEE';
    } else {
      newPaymentStatus = 'NON_PAYEE';
    }

    const updatedOrder: Order = {
      ...targetOrder,
      priceFCFA: newPrice,
      balanceFCFA: newBalance,
      paymentStatus: newPaymentStatus,
    };

    OrderService.saveOrder(updatedOrder);
    if (onOrderCreated) {
      onOrderCreated(updatedOrder);
    }
    setSettingPriceOrderId(null);
    setInputPriceFCFA('');
  };

  return (
    <div className="bg-[#0C0A27] min-h-screen text-white">
      {/* Top Dark Header Region: Client Avatar, Name, Phone & Quick Action Buttons */}
      <div className="px-4 pt-2 pb-6 flex flex-col items-center text-center space-y-3 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
        <div className="flex flex-col items-center">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#7C3AED] text-white font-bold text-3xl flex items-center justify-center border-4 border-white/20 shadow-xl">
              {client.initials}
            </div>
          )}
          {/* Dual Status Badges if client is new */}
          <div className="flex items-center justify-center space-x-1.5 mt-2">
            {client.isNew && <StatusBadge status="nouveau" />}
            <StatusBadge status={client.status} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{client.name}</h2>
          <p className="text-sm font-medium text-white/80 tabular-nums mt-0.5">{client.phone}</p>
        </div>

        {/* Action Buttons: Phone, Official WhatsApp, SMS with Exact Logos */}
        <div className="flex items-center justify-center space-x-6 pt-2">
          {/* Appeler (Téléphone) */}
          <a
            href={`tel:${client.phone.replace(/\s+/g, '')}`}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            aria-label="Appeler par Téléphone"
            title="Appeler par Téléphone"
          >
            <div className="w-13 h-13 rounded-full bg-white/10 group-hover:bg-white/20 text-white flex items-center justify-center border border-white/20 shadow-md transition-all">
              <Phone size={22} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-white/90 mt-1.5 group-hover:text-white">
              Appeler
            </span>
          </a>

          {/* WhatsApp (Exact Official Logo SVG) */}
          <button
            onClick={(e) => {
              if (onRequirePro) {
                e.preventDefault();
                onRequirePro('relances', 'La fonctionnalité de relances WhatsApp est disponible avec TAYLAXIS Pro.');
              } else {
                window.open(`https://wa.me/${client.phone.replace(/\s+/g, '')}`, '_blank');
              }
            }}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform bg-transparent border-0"
            aria-label="WhatsApp"
            title="Envoyer un message WhatsApp"
          >
            <div className="w-13 h-13 rounded-full bg-[#25D366] group-hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg transition-all ring-2 ring-[#25D366]/30">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-[#25D366] mt-1.5">
              WhatsApp
            </span>
          </button>

          {/* SMS (Messagerie) */}
          <button
            onClick={(e) => {
              if (onRequirePro) {
                e.preventDefault();
                onRequirePro('relances', 'La fonctionnalité de relances SMS est disponible avec TAYLAXIS Pro.');
              } else {
                window.location.href = `sms:${client.phone.replace(/\s+/g, '')}`;
              }
            }}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform bg-transparent border-0"
            aria-label="SMS Messagerie"
            title="Envoyer un SMS Messagerie"
          >
            <div className="w-13 h-13 rounded-full bg-[#7C3AED] group-hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-lg transition-all ring-2 ring-[#7C3AED]/30">
              <MessageSquare size={22} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[#A78BFA] mt-1.5">
              SMS
            </span>
          </button>
        </div>
      </div>

      {/* White Sheet Container */}
      <div className="bg-white text-[#110E2D] rounded-t-[32px] pt-6 px-4 pb-mobile-safe space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-2xl min-h-[600px]">
        {/* 3 Compact Summary Stat Cards (Palettes) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: Commandes */}
          <div
            onClick={() => setActiveTab('commandes')}
            className="p-2 sm:p-2.5 bg-[#F3E8FF] rounded-[14px] border border-[#E9D5FF] text-center cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0"
          >
            <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums leading-tight">{clientOrders.length}</div>
            <div className="text-[9.5px] sm:text-[10px] font-bold text-[#5B21B6] truncate mt-0.5">Commandes</div>
          </div>

          {/* Card 2: Mensurations */}
          <div
            onClick={() => setActiveTab('mensurations')}
            className="p-2 sm:p-2.5 bg-[#DBEAFE] rounded-[14px] border border-[#BFDBFE] text-center cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0"
          >
            <div className="text-base sm:text-lg font-extrabold text-[#1E3A8A] tabular-nums leading-tight">
              {measurements.length}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-bold text-[#1E40AF] truncate mt-0.5">Mensurations</div>
          </div>

          {/* Card 3: Total Encaissé en vert -> Redirects to Paiements */}
          <div
            onClick={() => setActiveTab('paiements')}
            className="p-2 sm:p-2.5 bg-[#D1FAE5] rounded-[14px] border border-[#A7F3D0] text-center cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0"
          >
            <div className="text-base sm:text-lg font-extrabold text-[#064E3B] tabular-nums leading-tight">
              {totalPaidFCFA.toLocaleString('fr-FR')}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-bold text-[#065F46] truncate mt-0.5">Encaissé (FCFA)</div>
          </div>
        </div>

        {/* Underline Sub-Tabs */}
        <div className="flex border-b border-[#EDE9F6] justify-between overflow-x-auto no-scrollbar">
          {[
            { id: 'info', label: 'Informations' },
            { id: 'commandes', label: 'Commandes' },
            { id: 'mensurations', label: 'Mensurations' },
            { id: 'paiements', label: 'Paiements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 text-caption font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer px-2 ${
                activeTab === tab.id
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-[#605B80] hover:text-[#110E2D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Informations (With Pro Segmented Selectors) */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[20px] p-4 border border-[#EDE9F6] space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE9F6]">
                <h3 className="text-h2 font-bold text-[#110E2D]">Fiche d'identité client</h3>
                {!isEditingInfo ? (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#F3E8FF] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white rounded-[12px] text-caption font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Edit3 size={14} />
                    <span>Modifier</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingInfo(false)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-caption text-[#605B80] hover:text-[#110E2D] cursor-pointer"
                  >
                    <X size={16} />
                    <span>Annuler</span>
                  </button>
                )}
              </div>

              {!isEditingInfo ? (
                /* Read Only Mode */
                <div className="space-y-3.5">
                  <div className="flex items-center space-x-3 text-caption">
                    <UserIcon size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Nom complet</span>
                      <span className="text-[#110E2D] font-semibold">{client.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <Phone size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Téléphone</span>
                      <span className="text-[#110E2D] font-semibold tabular-nums">{client.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <MapPin size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Adresse</span>
                      <span className="text-[#110E2D] font-semibold">
                        {client.address ? (
                          client.address
                        ) : (
                          <span className="text-[#605B80]/70 italic font-normal">Non renseignée</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <Calendar size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Date de naissance</span>
                      <span className="text-[#110E2D] font-semibold">
                        {client.birthDate ? (
                          client.birthDate
                        ) : (
                          <span className="text-[#605B80]/70 italic font-normal">Non renseignée</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Sexe & Catégorie d'âge */}
                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <Smile size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Genre & Tranche d'âge</span>
                      <span className="text-[#110E2D] font-semibold">
                        {client.gender || client.ageGroup || client.age ? (
                          <>
                            {client.gender === 'Femme' ? '👩 Femme' : client.gender === 'Homme' ? '👨 Homme' : ''}
                            {client.ageGroup ? ` • ${client.ageGroup === 'enfant' ? '🧒 Enfant' : '🧑 Adulte'}` : ''}
                            {client.age ? ` (${client.age} ans)` : ''}
                          </>
                        ) : (
                          <span className="text-[#605B80]/70 italic font-normal">Non spécifié</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Reste total à encaisser chez le client */}
                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <CreditCard size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-[#605B80] font-medium">Reste total à encaisser</span>
                      <span className={`font-extrabold tabular-nums px-2.5 py-0.5 rounded-full text-caption ${
                        totalBalanceFCFA > 0
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#D1FAE5] text-[#059669]'
                      }`}>
                        {totalBalanceFCFA > 0 ? `${totalBalanceFCFA.toLocaleString('fr-FR')} FCFA` : '✓ Réglé à 100%'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <FileText size={18} className="text-[#7C3AED] mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[#605B80] font-medium block mb-0.5">Notes de l'atelier</span>
                      <span className="text-[#110E2D] font-medium">
                        {client.notes ? (
                          client.notes
                        ) : (
                          <span className="text-[#605B80]/70 italic font-normal">Aucune note enregistrée</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pro Edit Mode Form with Segmented Pills */
                <form onSubmit={handleSaveInfo} className="space-y-4 pt-1">
                  <div>
                    <label className="text-caption text-[#605B80] font-medium block mb-1">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-caption text-[#605B80] font-medium block mb-1">Numéro de téléphone</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-caption text-[#605B80] font-medium block mb-1">Adresse</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div>
                      <label className="text-caption text-[#605B80] font-medium block mb-1">Date de naissance</label>
                      <input
                        type="text"
                        value={editBirthDate}
                        onChange={(e) => setEditBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>

                  {/* Pro Segmented Pill: Sexe (Genre) */}
                  <div>
                    <label className="text-caption text-[#605B80] font-semibold uppercase tracking-wider block mb-1.5">
                      Sexe (Genre)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditGender('Homme')}
                        className={`py-2.5 px-3 rounded-[14px] text-caption font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                          editGender === 'Homme'
                            ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                            : 'bg-[#F4F2FA] text-[#605B80] border-[#EDE9F6] hover:bg-[#E9E4F5]'
                        }`}
                      >
                        <span className="text-base">👨</span>
                        <span>Homme</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditGender('Femme')}
                        className={`py-2.5 px-3 rounded-[14px] text-caption font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                          editGender === 'Femme'
                            ? 'bg-[#EC4899] text-white border-[#EC4899] shadow-sm'
                            : 'bg-[#F4F2FA] text-[#605B80] border-[#EDE9F6] hover:bg-[#E9E4F5]'
                        }`}
                      >
                        <span className="text-base">👩</span>
                        <span>Femme</span>
                      </button>
                    </div>
                  </div>

                  {/* Pro Segmented Pill: Tranche d'âge & Âge */}
                  <div>
                    <label className="text-caption text-[#605B80] font-semibold uppercase tracking-wider block mb-1.5">
                      Tranche d'âge & Âge
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setEditAgeGroup('adulte')}
                        className={`py-2.5 px-3 rounded-[14px] text-caption font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                          editAgeGroup === 'adulte'
                            ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                            : 'bg-[#F4F2FA] text-[#605B80] border-[#EDE9F6] hover:bg-[#E9E4F5]'
                        }`}
                      >
                        <span className="text-base">🧑</span>
                        <span>Adulte</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditAgeGroup('enfant')}
                        className={`py-2.5 px-3 rounded-[14px] text-caption font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                          editAgeGroup === 'enfant'
                            ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-sm'
                            : 'bg-[#F4F2FA] text-[#605B80] border-[#EDE9F6] hover:bg-[#E9E4F5]'
                        }`}
                      >
                        <span className="text-base">🧒</span>
                        <span>Enfant</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={editAge}
                        onChange={(e) => setEditAge(Number(e.target.value))}
                        className="w-24 px-3.5 py-2 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[12px] text-body font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                      />
                      <span className="text-caption font-medium text-[#605B80]">ans</span>
                    </div>
                  </div>



                  <div>
                    <label className="text-caption text-[#605B80] font-medium block mb-1">Notes de l'atelier</label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#7C3AED] text-white rounded-[16px] text-body-strong font-bold flex items-center justify-center space-x-2 hover:bg-[#6D28D9] transition-all cursor-pointer shadow-md active:scale-98 mt-2"
                  >
                    <Check size={18} />
                    <span>Enregistrer les modifications</span>
                  </button>
                </form>
              )}
            </div>

            {/* Commandes récentes preview */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-h2 font-bold text-[#110E2D]">Commandes récentes</h3>
                <button
                  onClick={() => setActiveTab('commandes')}
                  className="text-caption font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Voir tout
                </button>
              </div>

              <div className="bg-white rounded-[20px] border border-[#EDE9F6] divide-y divide-[#EDE9F6] overflow-hidden shadow-xs">
                {clientOrders.length === 0 ? (
                  <div className="p-4 text-center text-caption text-[#928DAA]">
                    Aucune commande enregistrée.
                  </div>
                ) : (
                  clientOrders.map((order) => (
                    <div key={order.id} className="p-3.5 flex items-center justify-between white-element-hover cursor-pointer">
                      <div>
                        <div className="text-body-strong font-bold text-[#110E2D]">{order.title}</div>
                        <div className="text-caption text-[#605B80] tabular-nums mt-0.5">
                          {order.priceFCFA.toLocaleString('fr-FR')} FCFA • {order.orderDate}
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mensurations Sub-Tab inside Client Profile */}
        {activeTab === 'mensurations' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-[16px] bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-[#5B21B6] font-semibold text-caption">
                <Ruler size={18} className="text-[#7C3AED]" />
                <span>Mensurations actuelles de {client.name}</span>
              </div>
              <button
                onClick={() => setShowAddMeasurementModal(true)}
                className="w-8 h-8 rounded-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
                title="Ajouter une mesure"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="bg-white rounded-[20px] shadow-xs space-y-2">
              {measurements.map((m) => (
                <div key={m.id} className="p-3.5 rounded-[16px] bg-white flex items-center justify-between shadow-xs border border-[#EDE9F6]/60">
                  <div className="flex items-center space-x-3 text-[#605B80]">
                    <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                      <Ruler size={16} />
                    </div>
                    <span className="text-body font-semibold text-[#110E2D]">{m.label}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {m.valueCm && m.valueCm > 0 ? (
                      <span className="text-body-strong text-[#7C3AED] font-bold tabular-nums pr-1">
                        {m.valueCm} cm
                      </span>
                    ) : (
                      <span className="text-caption font-medium text-[#605B80]/40 italic pr-1">
                        ex: -- cm
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setEditingMeasurement(m);
                        setNewMeasurementValue(m.valueCm > 0 ? m.valueCm : '');
                      }}
                      className="p-1.5 text-[#7C3AED] bg-[#F3E8FF] hover:bg-[#7C3AED] hover:text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Modifier cette mesure"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingMeasurement(m)}
                      className="p-1.5 text-[#EF4444] bg-[#FEE2E2] hover:bg-[#EF4444] hover:text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Supprimer cette mesure"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenMensurations}
              className="w-full py-3.5 bg-[#7C3AED] text-white rounded-[16px] text-body-strong font-bold flex items-center justify-center space-x-2 hover:bg-[#6D28D9] transition-all cursor-pointer shadow-md active:scale-98"
            >
              <Ruler size={20} />
              <span>Accéder aux mensurations complètes</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Tab 3: Commandes */}
        {activeTab === 'commandes' && (
          <div className="space-y-3 relative pb-12">
            {/* Top Summary Bar for Commandes */}
            <div className="p-3.5 rounded-[16px] bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-between">
              <div>
                <div className="text-caption font-bold text-[#5B21B6]">Commandes ({clientOrders.length})</div>
                <div className="text-[11px] text-[#605B80]">Gestion des confections</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#605B80] uppercase">Reste total à encaisser</div>
                <div className={`text-caption font-extrabold tabular-nums ${totalBalanceFCFA > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                  {totalBalanceFCFA.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#EDE9F6] divide-y divide-[#EDE9F6] overflow-hidden shadow-xs">
              {clientOrders.map((order) => {
                const isHighlighted =
                  highlightedOrderId &&
                  (highlightedOrderId === order.id || highlightedOrderId === order.orderNumber);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedClientOrder(order)}
                    className={`p-4 space-y-2 cursor-pointer transition-all duration-300 ${
                      isHighlighted
                        ? 'bg-[#F3E8FF] border-2 border-[#7C3AED] shadow-md animate-pulse ring-4 ring-[#7C3AED]/25 relative overflow-hidden'
                        : 'white-element-hover'
                    }`}
                  >
                    {isHighlighted && (
                      <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-[#7C3AED] bg-white px-2.5 py-0.5 rounded-full w-fit shadow-xs mb-1">
                        <Sparkles size={13} className="text-[#7C3AED] animate-spin" />
                        <span>Commande sélectionnée</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-body-strong font-bold text-[#110E2D]">
                          {order.orderNumber} • {order.title}
                        </h4>
                        <p className="text-caption text-[#605B80]">{order.orderDate}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center justify-between text-caption pt-1 border-t border-[#EDE9F6]/50">
                      <span className="text-[#605B80]">
                        Prix : {order.priceFCFA === 0 ? (
                          <strong className="text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full font-bold">À définir</strong>
                        ) : (
                          <strong className="text-[#110E2D] font-semibold tabular-nums">{order.priceFCFA.toLocaleString('fr-FR')} FCFA</strong>
                        )}
                      </span>
                      {order.priceFCFA > 0 && (
                        order.balanceFCFA > 0 ? (
                          <span className="text-[#605B80]">
                            Reste : <strong className="text-[#EF4444] font-semibold tabular-nums">{order.balanceFCFA.toLocaleString('fr-FR')} FCFA</strong>
                          </span>
                        ) : (
                          <span className="text-[#059669] font-bold text-[10px]">✓ 100% Réglé</span>
                        )
                      )}
                    </div>

                    {/* Tailor Workflow Quick Actions Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1.5">
                        {(order.status === 'progress' || order.status === 'late') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateOrderStatus?.(order.id, 'ready');
                            }}
                            className="px-2.5 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-[10px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                          >
                            <Sparkles size={11} />
                            <span>Marquer Prête</span>
                          </button>
                        )}

                        {(order.status === 'ready' || order.status === 'to_deliver') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateOrderStatus?.(order.id, 'done');
                              if (order.balanceFCFA > 0) {
                                setPayingOrder(order);
                                setPayAmount(order.balanceFCFA);
                              }
                            }}
                            className="px-2.5 py-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-[10px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                          >
                            <Truck size={11} />
                            <span>Marquer Livrée</span>
                          </button>
                        )}
                      </div>

                      {order.balanceFCFA > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPayingOrder(order);
                            setPayAmount(order.balanceFCFA);
                          }}
                          className="px-2.5 py-1 bg-[#FEF3C7] border border-[#FBBF24] text-[#78350F] hover:bg-[#FDE68A] rounded-full text-[10px] font-bold shadow-xs active:scale-95 flex items-center space-x-1 cursor-pointer"
                        >
                          <DollarSign size={11} />
                          <span>Encaisser</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Action Button '+' for adding a new order */}
            <div className="fixed inset-x-0 bottom-20 z-40 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pointer-events-none flex justify-end">
              <button
                type="button"
                onClick={() => setShowNewOrderModal(true)}
                className="pointer-events-auto w-14 h-14 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 ring-4 ring-[#7C3AED]/25"
                title="Ajouter une nouvelle commande"
                aria-label="Ajouter une nouvelle commande"
              >
                <Plus size={26} />
              </button>
            </div>
          </div>
        )}

      {/* Modal: Encaisser un acompte / solde sur la fiche client */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[24px] border border-[#EDE9F6] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">
                  Encaisser un règlement
                </h3>
              </div>
              <button
                onClick={() => setPayingOrder(null)}
                className="p-1 text-[#605B80] hover:text-[#110E2D] rounded-full cursor-pointer"
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
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Montant encaissé (FCFA)
                </label>
                <input
                  type="number"
                  placeholder="ex: 15000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-lg font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingOrder(null)}
                className="flex-1 py-2.5 bg-[#F4F2FA] hover:bg-[#E9E4F5] text-[#605B80] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
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

        {/* Tab 4: Paiements & Tarification */}
        {activeTab === 'paiements' && (
          <div className="space-y-4">
            {clientOrders.length === 0 ? (
              <div className="p-6 text-center text-caption text-[#605B80] bg-white rounded-[20px] border border-[#EDE9F6] space-y-2">
                <CreditCard size={28} className="mx-auto text-[#7C3AED]" />
                <p className="font-bold text-[#110E2D]">Aucune commande pour ce client</p>
                <p className="text-xs text-[#605B80]">Créez une commande pour pouvoir définir un prix et encaisser des règlements.</p>
              </div>
            ) : (
              clientOrders.map((order) => {
                const isSettingPrice = settingPriceOrderId === order.id;

                return (
                  <div key={order.id} className="bg-white rounded-[20px] border border-[#EDE9F6] p-4 space-y-3 shadow-xs">
                    {/* Header: Order Info */}
                    <div className="flex items-start justify-between border-b border-[#EDE9F6] pb-2.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-caption font-bold text-[#7C3AED]">{order.orderNumber}</span>
                          <span className="text-body-strong font-bold text-[#110E2D]">{order.title}</span>
                        </div>
                        <p className="text-[11px] text-[#605B80] mt-0.5">Date : {order.orderDate || 'Aujourd’hui'}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Case 1: Order Price is 0 (Unset Price) */}
                    {order.priceFCFA === 0 ? (
                      <div className="p-3 rounded-[14px] bg-[#FFFBEB] border border-[#FDE68A] space-y-2">
                        <div className="flex items-center justify-between text-caption font-extrabold text-[#92400E]">
                          <span>Prix de confection non défini</span>
                          <span className="px-2 py-0.5 bg-[#F59E0B] text-white rounded-full text-[10px]">Action requise</span>
                        </div>
                        <p className="text-[11px] text-[#B45309]">
                          Saisissez le tarif fixé avec le client pour débloquer les encaissements d'acomptes.
                        </p>

                        {isSettingPrice ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (typeof inputPriceFCFA === 'number' && inputPriceFCFA > 0) {
                                handleSavePrice(order, inputPriceFCFA);
                              }
                            }}
                            className="flex items-center space-x-2 pt-1"
                          >
                            <input
                              type="number"
                              placeholder="ex: 35000 FCFA"
                              autoFocus
                              value={inputPriceFCFA}
                              onChange={(e) => setInputPriceFCFA(e.target.value === '' ? '' : Number(e.target.value))}
                              className="flex-1 px-3 py-2 bg-white border border-[#EDE9F6] rounded-[10px] text-body-strong font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-[#7C3AED] text-white rounded-[10px] text-caption font-bold hover:bg-[#6D28D9] cursor-pointer active:scale-95 transition-all flex items-center space-x-1"
                            >
                              <Check size={15} />
                              <span>Enregistrer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSettingPriceOrderId(null);
                                setInputPriceFCFA('');
                              }}
                              className="p-2 text-[#605B80] hover:text-[#110E2D] cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSettingPriceOrderId(order.id);
                              setInputPriceFCFA(order.priceFCFA > 0 ? order.priceFCFA : '');
                            }}
                            className="w-full py-2 bg-[#7C3AED] text-white rounded-[12px] text-caption font-bold hover:bg-[#6D28D9] cursor-pointer transition-all active:scale-95 shadow-xs flex items-center justify-center space-x-1.5"
                          >
                            <DollarSign size={14} />
                            <span>Définir le prix de cette commande</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Case 2: Order Price is Set */
                      <div className="space-y-3">
                        {isSettingPrice ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (typeof inputPriceFCFA === 'number' && inputPriceFCFA > 0) {
                                handleSavePrice(order, inputPriceFCFA);
                              }
                            }}
                            className="p-3 bg-[#F3E8FF] rounded-[14px] border border-[#E9D5FF] flex items-center space-x-2"
                          >
                            <div className="flex-1">
                              <label className="text-[10px] font-extrabold text-[#6D28D9] block mb-0.5 uppercase">
                                Modifier le prix total (FCFA)
                              </label>
                              <input
                                type="number"
                                autoFocus
                                value={inputPriceFCFA}
                                onChange={(e) => setInputPriceFCFA(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-1.5 bg-white border border-[#EDE9F6] rounded-[10px] text-body-strong font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
                              />
                            </div>
                            <button
                              type="submit"
                              className="mt-4 px-3 py-1.5 bg-[#7C3AED] text-white rounded-[10px] text-xs font-bold hover:bg-[#6D28D9] cursor-pointer"
                            >
                              Valider
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSettingPriceOrderId(null);
                                setInputPriceFCFA('');
                              }}
                              className="mt-4 p-1.5 text-[#605B80] hover:text-[#110E2D] cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F4F2FA] rounded-[14px] text-center border border-[#EDE9F6] relative group">
                            <div className="relative">
                              <div className="flex items-center justify-center space-x-1">
                                <span className="text-[10px] text-[#605B80] font-medium">Prix Total</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSettingPriceOrderId(order.id);
                                    setInputPriceFCFA(order.priceFCFA);
                                  }}
                                  className="text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer p-0.5 rounded-full"
                                  title="Modifier le prix"
                                >
                                  <Edit3 size={11} />
                                </button>
                              </div>
                              <div className="text-caption font-extrabold text-[#110E2D] tabular-nums">
                                {order.priceFCFA.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-[#605B80] font-medium">Payé</div>
                              <div className="text-caption font-extrabold text-[#10B981] tabular-nums">
                                {order.paidFCFA.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-[#605B80] font-medium">Reste</div>
                              <div className={`text-caption font-extrabold tabular-nums ${order.balanceFCFA > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                                {order.balanceFCFA.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Actions */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#605B80]">Historique des versements</span>
                          {order.balanceFCFA > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setPayingOrder(order);
                                setPayAmount(order.balanceFCFA);
                              }}
                              className="px-3 py-1 bg-[#10B981] text-white rounded-full text-[11px] font-bold hover:bg-[#059669] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center space-x-1"
                            >
                              <DollarSign size={13} />
                              <span>Encaisser un versement</span>
                            </button>
                          )}
                        </div>

                        {/* Payment Records List */}
                        {order.paymentHistory && order.paymentHistory.length > 0 ? (
                          <div className="space-y-1.5 divide-y divide-[#EDE9F6]/60">
                            {order.paymentHistory.map((rec) => (
                              <div key={rec.id} className="pt-1.5 flex items-center justify-between text-caption">
                                <div className="flex items-center space-x-2">
                                  <div className="w-7 h-7 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={14} />
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-bold text-[#110E2D]">{rec.note || 'Versement'}</div>
                                    <div className="text-[10px] text-[#605B80]">{rec.paymentMethod} • {rec.date}</div>
                                  </div>
                                </div>
                                <div className="text-caption font-extrabold text-[#10B981] tabular-nums">
                                  +{rec.amountFCFA.toLocaleString('fr-FR')} FCFA
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#605B80] italic">Aucun versement reçu pour le moment.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal: Modifier une mesure */}
      {editingMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[24px] border border-[#EDE9F6] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Ruler size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">
                  Modifier {editingMeasurement.label}
                </h3>
              </div>
              <button
                onClick={() => setEditingMeasurement(null)}
                className="p-1 text-[#605B80] hover:text-[#110E2D] rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-caption text-[#605B80] font-semibold block">
                Nouvelle valeur (en cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="300"
                  placeholder="ex: 95"
                  autoFocus
                  value={newMeasurementValue}
                  onChange={(e) => setNewMeasurementValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-4 pr-12 py-3 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[16px] text-lg font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums placeholder:text-[#605B80]/40 placeholder:font-normal placeholder:italic"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption font-bold text-[#7C3AED]">
                  cm
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMeasurement(null)}
                className="flex-1 py-2.5 bg-[#F4F2FA] hover:bg-[#E9E4F5] text-[#605B80] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = measurements.map((m) =>
                    m.id === editingMeasurement.id ? { ...m, valueCm: Number(newMeasurementValue) || 0 } : m
                  );
                  setMeasurements(updated);
                  if (onUpdateClient) {
                    onUpdateClient({
                      ...client,
                      customMeasurements: updated,
                      mensurationsCount: updated.length,
                    });
                  }
                  setEditingMeasurement(null);
                }}
                className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Check size={16} />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajouter une mesure personnalisée */}
      {showAddMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[24px] border border-[#EDE9F6] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">
                  Ajouter une mesure
                </h3>
              </div>
              <button
                onClick={() => setShowAddMeasurementModal(false)}
                className="p-1 text-[#605B80] hover:text-[#110E2D] rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Nom de la mesure
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Tour de poignet, Hauteur taille..."
                  value={newMeasurementLabel}
                  onChange={(e) => setNewMeasurementLabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] placeholder:text-[#605B80]/40 placeholder:font-normal placeholder:italic"
                />
              </div>

              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Valeur (en cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    placeholder="ex: 95"
                    value={newAddMeasurementValue}
                    onChange={(e) => setNewAddMeasurementValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-4 pr-12 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-lg font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums placeholder:text-[#605B80]/40 placeholder:font-normal placeholder:italic"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption font-bold text-[#7C3AED]">
                    cm
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMeasurementModal(false)}
                className="flex-1 py-2.5 bg-[#F4F2FA] hover:bg-[#E9E4F5] text-[#605B80] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newMeasurementLabel.trim()) return;
                  const newM: Measurement = {
                    id: `m-custom-${Date.now()}`,
                    label: newMeasurementLabel.trim(),
                    valueCm: Number(newAddMeasurementValue) || 0,
                    iconName: 'Ruler',
                  };
                  const updated = [...measurements, newM];
                  setMeasurements(updated);
                  if (onUpdateClient) {
                    onUpdateClient({
                      ...client,
                      customMeasurements: updated,
                      mensurationsCount: updated.length,
                    });
                  }
                  setNewMeasurementLabel('');
                  setNewAddMeasurementValue('');
                  setShowAddMeasurementModal(false);
                }}
                className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Check size={16} />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmation de suppression d'une mesure */}
      {deletingMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[24px] border border-[#EDE9F6] w-full max-w-sm shadow-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-body-strong font-bold text-[#110E2D]">
                Supprimer cette mesure ?
              </h3>
              <p className="text-caption text-[#605B80] mt-1">
                Voulez-vous vraiment supprimer la mesure <strong className="text-[#110E2D]">« {deletingMeasurement.label} »</strong> ({deletingMeasurement.valueCm} cm) ?
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMeasurement(null)}
                className="flex-1 py-2.5 bg-[#F4F2FA] hover:bg-[#E9E4F5] text-[#605B80] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = measurements.filter((m) => m.id !== deletingMeasurement.id);
                  setMeasurements(updated);
                  if (onUpdateClient) {
                    onUpdateClient({
                      ...client,
                      customMeasurements: updated,
                      mensurationsCount: updated.length,
                    });
                  }
                  setDeletingMeasurement(null);
                }}
                className="flex-1 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Trash2 size={16} />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedClientOrder && (
        <OrderDetailModal
          order={selectedClientOrder}
          client={client}
          onClose={() => setSelectedClientOrder(null)}
          onOrderUpdated={(updated) => {
            OrderService.saveOrder(updated);
            setSelectedClientOrder(updated);
            if (onOrderCreated) {
              onOrderCreated(updated);
            }
            if (onUpdateOrderStatus) {
              onUpdateOrderStatus(updated.id, updated.status);
            }

            // Synchronize client measurements if new/updated values were saved in the order
            if (updated.measurementSnapshot?.measurements && updated.measurementSnapshot.measurements.length > 0) {
              const updatedClientMeasurements = [...measurements];
              updated.measurementSnapshot.measurements.forEach((m) => {
                if (m.valueCm > 0) {
                  const idx = updatedClientMeasurements.findIndex((cm) => cm.label.toLowerCase() === m.label.toLowerCase());
                  if (idx >= 0) {
                    updatedClientMeasurements[idx] = { ...updatedClientMeasurements[idx], valueCm: m.valueCm };
                  } else {
                    updatedClientMeasurements.push(m);
                  }
                }
              });
              setMeasurements(updatedClientMeasurements);
              if (onUpdateClient) {
                onUpdateClient({
                  ...client,
                  customMeasurements: updatedClientMeasurements,
                  mensurationsCount: updatedClientMeasurements.length,
                  totalSpentFCFA: clientOrders.reduce((sum, o) => sum + (o.id === updated.id ? updated.paidFCFA : o.paidFCFA), 0),
                });
              }
            }
          }}
        />
      )}

      {/* Modal: Ajouter une nouvelle commande pour ce client */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[28px] border border-[#EDE9F6] w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">
                  Nouvelle commande pour {client.name}
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

            <form onSubmit={handleCreateNewClientOrder} className="space-y-4">
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

                        const days = [];
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
    </div>
  );
};
