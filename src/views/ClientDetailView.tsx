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
import { MOCK_ORDERS, MOCK_MEASUREMENTS_COSTUME } from '../data/mockData';
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
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'mensurations' | 'commandes' | 'paiements'>(initialTab);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [selectedClientOrder, setSelectedClientOrder] = useState<Order | null>(null);

  // Edit Information state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editPhone, setEditPhone] = useState(client.phone);
  const [editAddress, setEditAddress] = useState(client.address || 'Lomé, Adidogomé');
  const [editBirthDate, setEditBirthDate] = useState(client.birthDate || '12 Mars 1990');
  const [editGender, setEditGender] = useState(client.gender || 'Homme');
  const [editAgeGroup, setEditAgeGroup] = useState<'adulte' | 'enfant'>(client.ageGroup || 'adulte');
  const [editAge, setEditAge] = useState<number>(client.age || 34);
  const [editNotes, setEditNotes] = useState(
    client.notes || 'Client fidèle, préfère les coupes ajustées et tissus hollandais.'
  );

  // Measurement Editing & Addition State
  const initialMeasurements = client.customMeasurements && client.customMeasurements.length > 0
    ? client.customMeasurements
    : MOCK_MEASUREMENTS_COSTUME.slice(0, 5);
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
      age: editAge,
      notes: editNotes,
    };
    if (onUpdateClient) {
      onUpdateClient(updated);
    }
    setIsEditingInfo(false);
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
          <a
            href={`https://wa.me/${client.phone.replace(/\s+/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
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
          </a>

          {/* SMS (Messagerie) */}
          <a
            href={`sms:${client.phone.replace(/\s+/g, '')}`}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            aria-label="SMS Messagerie"
            title="Envoyer un SMS Messagerie"
          >
            <div className="w-13 h-13 rounded-full bg-[#7C3AED] group-hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-lg transition-all ring-2 ring-[#7C3AED]/30">
              <MessageSquare size={22} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[#A78BFA] mt-1.5">
              SMS
            </span>
          </a>
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
            <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums leading-tight">{client.ordersCount}</div>
            <div className="text-[9.5px] sm:text-[10px] font-bold text-[#5B21B6] truncate mt-0.5">Commandes</div>
          </div>

          {/* Card 2: Mensurations */}
          <div
            onClick={() => setActiveTab('mensurations')}
            className="p-2 sm:p-2.5 bg-[#DBEAFE] rounded-[14px] border border-[#BFDBFE] text-center cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0"
          >
            <div className="text-base sm:text-lg font-extrabold text-[#1E3A8A] tabular-nums leading-tight">{client.mensurationsCount || 5}</div>
            <div className="text-[9.5px] sm:text-[10px] font-bold text-[#1E40AF] truncate mt-0.5">Mensurations</div>
          </div>

          {/* Card 3: Total dépensé -> Redirects to Paiements */}
          <div
            onClick={() => setActiveTab('paiements')}
            className="p-2 sm:p-2.5 bg-[#D1FAE5] rounded-[14px] border border-[#A7F3D0] text-center cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0"
          >
            <div className="text-base sm:text-lg font-extrabold text-[#064E3B] tabular-nums leading-tight">
              {(client.totalSpentFCFA || 320000).toLocaleString('fr-FR')}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-bold text-[#065F46] truncate mt-0.5">Total (FCFA)</div>
          </div>
        </div>

        {/* Underline Sub-Tabs (Commandes comes before Mensurations) */}
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
                      <span className="text-[#110E2D] font-semibold">{client.address || 'Lomé, Adidogomé'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <Calendar size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Date de naissance</span>
                      <span className="text-[#110E2D] font-semibold">{client.birthDate || '12 Mars 1990'}</span>
                    </div>
                  </div>

                  {/* Sexe & Catégorie d'âge */}
                  <div className="flex items-center space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <Smile size={18} className="text-[#7C3AED]" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-[#605B80] font-medium">Genre & Tranche d'âge</span>
                      <span className="text-[#110E2D] font-semibold">
                        {editGender === 'Femme' ? '👩 Femme' : '👨 Homme'} •{' '}
                        {editAgeGroup === 'enfant' ? `🧒 Enfant (${editAge} ans)` : `🧑 Adulte (${editAge} ans)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-caption pt-2 border-t border-[#EDE9F6]/60">
                    <FileText size={18} className="text-[#7C3AED] mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[#605B80] font-medium block mb-0.5">Notes de l'atelier</span>
                      <span className="text-[#110E2D] font-medium">
                        {client.notes || 'Client fidèle, préfère les coupes ajustées et tissus hollandais.'}
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
                    <span className="text-body-strong text-[#7C3AED] font-bold tabular-nums pr-1">
                      {m.valueCm} cm
                    </span>
                    <button
                      onClick={() => {
                        setEditingMeasurement(m);
                        setNewMeasurementValue(m.valueCm);
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
          <div className="space-y-3">
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
                        Prix : <strong className="text-[#110E2D] font-semibold tabular-nums">{order.priceFCFA.toLocaleString('fr-FR')} FCFA</strong>
                      </span>
                      {order.balanceFCFA > 0 ? (
                        <span className="text-[#605B80]">
                          Reste : <strong className="text-[#EF4444] font-semibold tabular-nums">{order.balanceFCFA.toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      ) : (
                        <span className="text-[#059669] font-bold text-[10px]">✓ 100% Réglé</span>
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

        {/* Tab 4: Paiements */}
        {activeTab === 'paiements' && (
          <div className="space-y-3">
            <div className="bg-white rounded-[20px] border border-[#EDE9F6] divide-y divide-[#EDE9F6] overflow-hidden shadow-xs">
              <div className="p-4 flex items-center justify-between white-element-hover">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="text-body-strong font-bold text-[#110E2D]">Acompte Costume</div>
                    <div className="text-caption text-[#605B80]">Espèces • 18 Mai 2024</div>
                  </div>
                </div>
                <div className="text-body-strong font-bold text-[#10B981] tabular-nums">
                  +20 000 FCFA
                </div>
              </div>

              <div className="p-4 flex items-center justify-between white-element-hover">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="text-body-strong font-bold text-[#110E2D]">Acompte Chemise</div>
                    <div className="text-caption text-[#605B80]">Mobile Money • 10 Mai 2024</div>
                  </div>
                </div>
                <div className="text-body-strong font-bold text-[#10B981] tabular-nums">
                  +10 000 FCFA
                </div>
              </div>
            </div>
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
                  autoFocus
                  value={newMeasurementValue}
                  onChange={(e) => setNewMeasurementValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-4 pr-12 py-3 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[16px] text-lg font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
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
                  setMeasurements(
                    measurements.map((m) =>
                      m.id === editingMeasurement.id ? { ...m, valueCm: Number(newMeasurementValue) || 0 } : m
                    )
                  );
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
                  className="w-full px-4 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
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
                    className="w-full pl-4 pr-12 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-lg font-bold text-[#110E2D] focus:outline-none focus:border-[#7C3AED] tabular-nums"
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
                  setMeasurements([...measurements, newM]);
                  setNewMeasurementLabel('');
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
                  setMeasurements(measurements.filter((m) => m.id !== deletingMeasurement.id));
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
            setSelectedClientOrder(updated);
          }}
        />
      )}
    </div>
  );
};
