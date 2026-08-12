import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Scissors,
  Truck,
  Users,
  Ruler,
  MoreVertical,
  Phone,
  MessageSquare,
  MessageCircle,
  X,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import type { Client, Order } from '../types';

interface AppointmentItem {
  id: string;
  time: string;
  duration?: string;
  clientName: string;
  clientId?: string;
  phone?: string;
  type: string;
  garment?: string;
  badgeLabel?: string;
  colorCategory: 'purple' | 'orange' | 'red' | 'blue';
  date: string;
  dayNumber: number;
  monthIndex: number;
  notes?: string;
  isOrderDelivery?: boolean;
  orderId?: string;
}

const STORAGE_KEY_APPOINTMENTS = 'taylaxis_agenda_appointments_v1';

const getStoredAppointments = (): AppointmentItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

interface AgendaViewProps {
  onSelectClient?: (clientId: string) => void;
  clients?: Client[];
  orders?: Order[];
  onOpenNewClientModal?: () => void;
  onRequirePro?: (featureKey: string, customMessage?: string) => void;
}

const now = new Date();
const currentRealYear = now.getFullYear();
const currentRealMonth = now.getMonth();
const currentRealDay = now.getDate();

const MONTH_OFFSETS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

const getMonthInfo = (offset: number) => {
  const d = new Date(currentRealYear, currentRealMonth + offset, 1);
  const year = d.getFullYear();
  const month = d.getMonth();
  const name = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const monthNameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const shortMonthName = d.toLocaleDateString('fr-FR', { month: 'short' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  return { year, month, name: monthNameCapitalized, shortMonthName, daysInMonth, firstDayOfWeek, offset };
};

const parseOrderDeliveryDate = (dateStr: string): { year: number; month: number; day: number; dateString: string } | null => {
  if (!dateStr) return null;
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return { year, month, day, dateString: dateStr };
  }
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
    return { year, month, day, dateString: `${year}-${formattedMonth}-${formattedDay}` };
  }
  return null;
};

export const AgendaView: React.FC<AgendaViewProps> = ({
  onSelectClient,
  clients = [],
  orders = [],
  onOpenNewClientModal,
  onRequirePro,
}) => {
  // Index 3 corresponds to offset 0 (Current real month)
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(3);
  const [selectedDay, setSelectedDay] = useState<number>(currentRealDay);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(getStoredAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  const handleOpenNewAppointment = () => {
    if (clients.length === 0) {
      if (onOpenNewClientModal) {
        alert('Pour planifier un rendez-vous, vous devez d\'abord enregistrer au moins un client.');
        onOpenNewClientModal();
      }
      return;
    }
    if (onRequirePro) {
      onRequirePro('appointments', 'La planification des rendez-vous nécessite le forfait Taylaxis Pro (5 000 FCFA/mois).');
      return;
    }
    setShowNewModal(true);
  };

  const saveAppointments = (newApts: AppointmentItem[]) => {
    setAppointments(newApts);
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(newApts));
  };

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClientName, setNewClientName] = useState('');
  const [newType, setNewType] = useState('Essayage');
  const [newTime, setNewTime] = useState('14:00');
  const [newNotes, setNewNotes] = useState('');

  const orderAppointments = React.useMemo<AppointmentItem[]>(() => {
    if (!orders || orders.length === 0) return [];
    const result: AppointmentItem[] = [];
    orders.forEach((order) => {
      const mfg = order.manufacturingStatus || 'EN_COURS';
      if (mfg === 'LIVREE' || mfg === 'TERMINEE') return;

      const parsed = parseOrderDeliveryDate(order.deliveryDate);
      if (!parsed) return;

      const matchedClient = clients.find((c) => c.id === order.clientId || c.name === order.clientName);

      result.push({
        id: `order_del_${order.id}`,
        time: '17:00',
        duration: '00:30',
        clientName: order.clientName,
        clientId: order.clientId,
        phone: matchedClient?.phone,
        type: 'Livraison Commande',
        garment: order.title || order.garmentType || 'Vêtement',
        badgeLabel: order.dueDateStatus === 'EN_RETARD' ? 'En Retard' : 'Livraison',
        colorCategory: order.dueDateStatus === 'EN_RETARD' ? 'red' : 'orange',
        date: parsed.dateString,
        dayNumber: parsed.day,
        monthIndex: parsed.month,
        notes: `Livraison commande ${order.orderNumber} - ${order.title}`,
        isOrderDelivery: true,
        orderId: order.id,
      });
    });
    return result;
  }, [orders, clients]);

  const allAppointments = React.useMemo(() => {
    return [...appointments, ...orderAppointments];
  }, [appointments, orderAppointments]);

  const currentMonthInfo = getMonthInfo(MONTH_OFFSETS[currentMonthIdx]);
  const daysArray = Array.from({ length: currentMonthInfo.daysInMonth }, (_, i) => i + 1);
  const startOffset = currentMonthInfo.firstDayOfWeek;

  const selectedDayAppointments = allAppointments.filter(
    (apt) => apt.monthIndex === currentMonthInfo.month && apt.dayNumber === selectedDay
  );

  const eventDaysInMonth = Array.from(
    new Set(
      allAppointments
        .filter((apt) => apt.monthIndex === currentMonthInfo.month)
        .map((apt) => apt.dayNumber)
    )
  );

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      const nextIdx = currentMonthIdx - 1;
      setCurrentMonthIdx(nextIdx);
      if (nextIdx === 3) {
        setSelectedDay(currentRealDay);
      } else {
        setSelectedDay(1);
      }
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < MONTH_OFFSETS.length - 1) {
      const nextIdx = currentMonthIdx + 1;
      setCurrentMonthIdx(nextIdx);
      if (nextIdx === 3) {
        setSelectedDay(currentRealDay);
      } else {
        setSelectedDay(1);
      }
    }
  };

  const handleJumpToToday = () => {
    setCurrentMonthIdx(3); // Offset 0 = Current month
    setSelectedDay(currentRealDay);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    let finalClientName = newClientName.trim();
    let finalClientId: string | undefined = undefined;
    let finalPhone: string | undefined = undefined;

    if (selectedClientId) {
      const found = clients.find((c) => c.id === selectedClientId);
      if (found) {
        finalClientName = found.name;
        finalClientId = found.id;
        finalPhone = found.phone;
      }
    } else if (finalClientName) {
      const found = clients.find((c) => c.name.toLowerCase() === finalClientName.toLowerCase());
      if (found) {
        finalClientId = found.id;
        finalPhone = found.phone;
      }
    }

    if (!finalClientName) return;

    let category: 'purple' | 'orange' | 'red' | 'blue' = 'purple';
    if (newType === 'Livraison') category = 'orange';
    if (newType === 'Prise de mesures') category = 'blue';
    if (newType === 'Consultation') category = 'red';

    const formattedDay = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
    const formattedMonth = currentMonthInfo.month + 1 < 10 ? `0${currentMonthInfo.month + 1}` : `${currentMonthInfo.month + 1}`;

    const newApt: AppointmentItem = {
      id: `apt_${Date.now()}`,
      time: newTime || '10:00',
      duration: '00:45',
      clientName: finalClientName,
      clientId: finalClientId,
      phone: finalPhone,
      type: newType,
      badgeLabel: newType === 'Livraison' ? 'Livraison' : 'RDV',
      colorCategory: category,
      date: `${currentMonthInfo.year}-${formattedMonth}-${formattedDay}`,
      dayNumber: selectedDay,
      monthIndex: currentMonthInfo.month,
      notes: newNotes,
    };

    saveAppointments([...appointments, newApt]);
    setShowNewModal(false);
    setNewClientName('');
    setSelectedClientId('');
    setNewNotes('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'purple':
        return <Scissors size={15} className="text-[#7C3AED]" />;
      case 'orange':
      case 'yellow':
        return <Truck size={15} className="text-[#854D0E]" />;
      case 'gold':
        return <Clock size={15} className="text-[#B45309]" />;
      case 'red':
        return <Users size={15} className="text-[#DC2626]" />;
      case 'blue':
        return <Ruler size={15} className="text-[#1E40AF]" />;
      default:
        return <Scissors size={15} className="text-[#7C3AED]" />;
    }
  };

  const getCategoryIconBg = (category: string) => {
    switch (category) {
      case 'purple':
        return 'bg-[#F3E8FF] border border-[#E9D5FF]';
      case 'orange':
      case 'yellow':
        return 'bg-[#FEF08A] border border-[#FDE047]';
      case 'gold':
        return 'bg-[#FEF3C7] border border-[#FBBF24]';
      case 'red':
        return 'bg-[#FEE2E2] border border-[#FCA5A5]';
      case 'blue':
        return 'bg-[#DBEAFE] border border-[#BFDBFE]';
      default:
        return 'bg-[#F3E8FF] border border-[#E9D5FF]';
    }
  };

  return (
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-4 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner relative">
      {/* Compact Calendar Card */}
      <div className="bg-surface rounded-[20px] p-3 sm:p-4 border border-subtle space-y-2.5 shadow-xs">
        {/* Month Navigation & Today Jump Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              disabled={currentMonthIdx === 0}
              className="p-1 text-secondary hover:text-primary hover:bg-surface-alt rounded-full transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Mois précédent"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-body-strong font-bold text-primary tabular-nums">
              {currentMonthInfo.name}
            </h3>
            <button
              onClick={handleNextMonth}
              disabled={currentMonthIdx === MONTH_OFFSETS.length - 1}
              className="p-1 text-secondary hover:text-primary hover:bg-surface-alt rounded-full transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Mois suivant"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={handleJumpToToday}
            className="px-2.5 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-[11px] font-bold hover:bg-[#7C3AED]/20 transition-all cursor-pointer active:scale-95"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-tertiary">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        {/* Dynamic Compact Days Grid */}
        <div className="grid grid-cols-7 text-center text-body font-medium gap-y-1">
          {Array.from({ length: startOffset }).map((_, idx) => (
            <span key={`offset_${idx}`} />
          ))}

          {daysArray.map((day) => {
            const isSelected = day === selectedDay;
            const hasEvent = eventDaysInMonth.includes(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="flex flex-col items-center justify-center py-0.5 cursor-pointer group transition-all"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-xs scale-105'
                      : 'text-primary hover:bg-surface-alt'
                  }`}
                >
                  {day}
                </div>

                {/* Event Indicator Dot */}
                {hasEvent && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 transition-all ${
                      isSelected ? 'bg-white' : 'bg-[#7C3AED]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Événements du X Mai */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-body-strong font-bold text-primary flex items-center gap-1.5">
            <span>Événements du {selectedDay} {currentMonthInfo.name.split(' ')[0]}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold">
              {selectedDayAppointments.length}
            </span>
          </h3>

          <button
            onClick={() => {
              if (clients.length === 0 && onOpenNewClientModal) {
                onOpenNewClientModal();
              } else {
                handleOpenNewAppointment();
              }
            }}
            className="text-[12px] font-bold text-[#7C3AED] hover:underline cursor-pointer flex items-center space-x-0.5"
          >
            <Plus size={14} />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Compact Cards List */}
        <div className="space-y-2">
          {clients.length === 0 ? (
            <div className="py-6 text-center px-4 bg-surface rounded-[20px] border border-subtle space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
                <Users size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-caption font-extrabold text-primary">Planifier un rendez-vous</p>
                <p className="text-[11px] text-secondary">
                  Pour fixer des rendez-vous d'essayage ou de livraison, vous devez d'abord ajouter votre premier client.
                </p>
              </div>
              <button
                onClick={() => onOpenNewClientModal?.()}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-[14px] text-[11px] font-bold hover:bg-[#6D28D9] cursor-pointer active:scale-95 transition-all inline-flex items-center space-x-1.5"
              >
                <Users size={14} />
                <span>+ Ajouter mon premier client</span>
              </button>
            </div>
          ) : selectedDayAppointments.length === 0 ? (
            <div className="py-6 text-center px-4 bg-surface rounded-[20px] border border-subtle space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
                <CalendarIcon size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-caption font-bold text-primary">Aucun rendez-vous ce jour-ci</p>
                <p className="text-[11px] text-secondary">
                  Votre journée du {selectedDay} {currentMonthInfo.name.split(' ')[0]} est libre.
                </p>
              </div>
              <button
                onClick={handleOpenNewAppointment}
                className="px-3.5 py-1.5 bg-[#7C3AED] text-white rounded-[12px] text-[11px] font-bold hover:bg-[#6D28D9] cursor-pointer active:scale-95 transition-all inline-flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Planifier un rendez-vous</span>
              </button>
            </div>
          ) : (
            selectedDayAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt)}
                className="p-2.5 px-3 rounded-[16px] bg-white flex items-center justify-between cursor-pointer white-element-hover active:scale-98 transition-all shadow-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="px-2 py-1 bg-surface-alt rounded-[10px] text-caption font-bold text-primary tabular-nums text-center flex-shrink-0">
                    {apt.time}
                  </div>

                  <div className="min-w-0">
                    <div className="text-caption text-secondary font-medium truncate">
                      {apt.type} • {apt.clientName}
                    </div>
                    <div className="text-body-strong font-bold text-primary truncate">
                      {apt.notes || apt.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <StatusBadge status={apt.badgeLabel || 'RDV'} />
                  <button className="p-1 text-tertiary hover:text-primary rounded-full cursor-pointer">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section: À venir ce mois-ci (Compact) */}
      <div className="space-y-2 pt-1">
        <h3 className="text-body-strong font-bold text-primary px-0.5">À venir ce mois-ci</h3>

        <div className="space-y-2">
          {appointments.length === 0 ? (
            <div className="py-4 text-center px-4 bg-surface rounded-[16px] border border-subtle">
              <p className="text-caption text-secondary font-medium">Aucun événement à venir ce mois-ci.</p>
            </div>
          ) : (
            appointments.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const client = clients?.find((c) => c.name === item.clientName);
                  if (client && onSelectClient) {
                    onSelectClient(client.id);
                  }
                }}
                className="p-2.5 px-3 rounded-[16px] bg-white flex items-center justify-between cursor-pointer white-element-hover active:scale-98 transition-all shadow-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="text-center min-w-[32px] bg-[#7C3AED]/10 px-1.5 py-1 rounded-[10px] flex-shrink-0">
                    <div className="text-caption font-bold text-[#7C3AED] tabular-nums leading-tight">
                      {item.date.split('-')[2] || item.dayNumber}
                    </div>
                    <div className="text-[9px] text-[#7C3AED] font-medium leading-none">{currentMonthInfo.shortMonthName}</div>
                  </div>

                  <div className="text-caption font-bold text-secondary tabular-nums flex-shrink-0">
                    {item.time}
                  </div>

                  <div className="min-w-0">
                    <div className="text-caption text-secondary font-medium truncate">{item.garment || item.type}</div>
                    <div className="text-body-strong font-bold text-primary truncate">{item.clientName}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                  <StatusBadge status={item.badgeLabel || 'RDV'} />
                  <ChevronRight size={16} className="text-tertiary" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Add Appointment Button (+) in bottom right corner */}
      <button
        onClick={() => {
          if (clients.length === 0 && onOpenNewClientModal) {
            onOpenNewClientModal();
          } else {
            setShowNewModal(true);
          }
        }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#7C3AED] text-white shadow-xl hover:bg-[#6D28D9] flex items-center justify-center transition-all transform active:scale-90 cursor-pointer ring-4 ring-[#7C3AED]/20"
        title="Programmer un nouveau rendez-vous"
        aria-label="Programmer un nouveau rendez-vous"
      >
        <Plus size={26} className="stroke-[2.5]" />
      </button>

      {/* MODAL 1: Appointment Details & Actions */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle w-full max-w-md shadow-2xl p-4 space-y-3.5">
            <div className="flex items-start justify-between border-b border-subtle pb-2.5">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getCategoryIconBg(selectedAppointment.colorCategory)}`}>
                  {getCategoryIcon(selectedAppointment.colorCategory)}
                </div>
                <div>
                  <h3 className="text-body-strong font-bold text-primary">{selectedAppointment.type}</h3>
                  <p className="text-caption text-secondary">
                    {selectedAppointment.time} • Durée : {selectedAppointment.duration || '45 min'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-tertiary hover:text-primary p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Client Info Banner */}
            <div className="p-3 bg-surface-alt/60 rounded-[14px] border border-subtle flex items-center justify-between">
              <div>
                <span className="text-[10px] text-tertiary block font-medium">Client concerné</span>
                <span className="text-body-strong font-bold text-primary">{selectedAppointment.clientName}</span>
                {selectedAppointment.phone && (
                  <span className="text-caption text-secondary block">{selectedAppointment.phone}</span>
                )}
              </div>

              {selectedAppointment.clientId && onSelectClient && (
                <button
                  onClick={() => {
                    const cid = selectedAppointment.clientId;
                    setSelectedAppointment(null);
                    if (cid) onSelectClient(cid);
                  }}
                  className="px-3 py-1 bg-[#7C3AED] text-white rounded-[10px] text-caption font-bold cursor-pointer hover:bg-[#6D28D9] transition-all"
                >
                  Voir fiche
                </button>
              )}
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${selectedAppointment.phone || '90000000'}`}
                className="py-2 px-2 bg-emerald-500/10 text-emerald-600 rounded-[12px] font-semibold text-caption flex flex-col items-center justify-center space-y-1 hover:bg-emerald-500/20 transition-all"
              >
                <Phone size={16} />
                <span>Appeler</span>
              </a>
              <a
                href={`https://wa.me/${selectedAppointment.phone?.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2 bg-green-500/10 text-green-600 rounded-[12px] font-semibold text-caption flex flex-col items-center justify-center space-y-1 hover:bg-green-500/20 transition-all"
              >
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </a>
              <a
                href={`sms:${selectedAppointment.phone || '90000000'}`}
                className="py-2 px-2 bg-blue-500/10 text-blue-600 rounded-[12px] font-semibold text-caption flex flex-col items-center justify-center space-y-1 hover:bg-blue-500/20 transition-all"
              >
                <MessageCircle size={16} />
                <span>SMS</span>
              </a>
            </div>

            {/* Action Toggles */}
            <div className="pt-1 space-y-2">
              <button
                onClick={() => {
                  saveAppointments(
                    appointments.map((a) =>
                      a.id === selectedAppointment.id ? { ...a, badgeLabel: 'Terminé' } : a
                    )
                  );
                  setSelectedAppointment(null);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-[12px] text-caption font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 cursor-pointer shadow-xs active:scale-98 transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Marquer comme terminé</span>
              </button>

              <button
                onClick={() => {
                  saveAppointments(appointments.filter((a) => a.id !== selectedAppointment.id));
                  setSelectedAppointment(null);
                }}
                className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-[12px] text-caption font-bold flex items-center justify-center space-x-2 hover:bg-red-500/20 cursor-pointer active:scale-98 transition-all"
              >
                <Trash2 size={16} />
                <span>Supprimer ce rendez-vous</span>
              </button>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full py-2 bg-surface-alt border border-subtle text-secondary rounded-[12px] text-caption font-bold flex items-center justify-center space-x-2 hover:text-primary cursor-pointer active:scale-98 transition-all"
              >
                <Clock size={16} />
                <span>Fermer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create New Appointment */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleCreateAppointment}
            className="bg-surface rounded-[24px] border border-subtle w-full max-w-md shadow-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-subtle pb-2.5">
              <h3 className="text-body-strong font-bold text-primary">Nouveau Rendez-vous</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-tertiary hover:text-primary p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-caption font-semibold text-secondary block mb-1">
                  Client concerné
                </label>
                {clients.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedClientId(val);
                        if (val) {
                          const matched = clients.find((c) => c.id === val);
                          if (matched) setNewClientName(matched.name);
                        } else {
                          setNewClientName('');
                        }
                      }}
                      className="w-full px-3 py-2 bg-surface-alt border border-subtle rounded-[12px] text-body font-medium text-primary focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="">-- Sélectionner un client --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                      <option value="CUSTOM">+ Nom personnalisé (Hors liste)</option>
                    </select>

                    {(!selectedClientId || selectedClientId === 'CUSTOM') && (
                      <input
                        type="text"
                        required
                        placeholder="ex: Kossi A."
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-alt border border-subtle rounded-[12px] text-body font-medium text-primary focus:outline-none focus:border-[#7C3AED]"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="ex: Kossi A."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-alt border border-subtle rounded-[12px] text-body font-medium text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-caption font-semibold text-secondary block mb-1">
                    Type d'événement
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface-alt border border-subtle rounded-[12px] text-caption font-semibold text-primary focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Essayage">Essayage ✂️</option>
                    <option value="Livraison">Livraison 🚚</option>
                    <option value="Prise de mesures">Prise de mesures 📏</option>
                    <option value="Consultation">Consultation 💬</option>
                  </select>
                </div>

                <div>
                  <label className="text-caption font-semibold text-secondary block mb-1">
                    Heure du RDV
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface-alt border border-subtle rounded-[12px] text-caption font-semibold text-primary focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-semibold text-secondary block mb-1">
                  Notes & Détails
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: Premier essayage veste costume..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-alt border border-subtle rounded-[12px] text-body font-medium text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-2 bg-surface-alt border border-subtle text-secondary rounded-[12px] font-semibold text-caption hover:text-primary cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#7C3AED] text-white rounded-[12px] font-semibold text-caption hover:bg-[#6D28D9] cursor-pointer shadow-xs active:scale-98 transition-all"
              >
                Enregistrer le RDV
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
