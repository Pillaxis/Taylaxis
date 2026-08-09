import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  ChevronRight,
  Inbox,
  Sparkles,
  Plus,
} from 'lucide-react';
import type { Client } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface ClientsViewProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
  searchQuery?: string;
  onOpenNewClientModal?: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onSelectClient,
  searchQuery = '',
  onOpenNewClientModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'tous' | 'nouveaux' | 'actifs' | 'inactifs'>('tous');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeFilter === 'nouveaux') return Boolean(c.isNew);
    if (activeFilter === 'actifs') return c.status === 'actif';
    if (activeFilter === 'inactifs') return c.status === 'inactif';
    return true;
  });

  const newCount = clients.filter((c) => c.isNew).length;
  const activeCount = clients.filter((c) => c.status === 'actif').length;
  const inactiveCount = clients.filter((c) => c.status === 'inactif').length;

  return (
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner">
      {/* 4 Sleek Horizontal Rectangular Palettes Grid (Exact same layout as Commandes page) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Palette 1: Total clients (Purple Accent) */}
        <div
          onClick={() => setActiveFilter('tous')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeFilter === 'tous'
              ? 'bg-[#F3E8FF] border-[#7C3AED] shadow-sm ring-2 ring-[#7C3AED]/20'
              : 'bg-[#F3E8FF]/60 border-[#E9D5FF] hover:bg-[#F3E8FF]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <Users size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#5B21B6] leading-tight truncate">Total clients</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#6B21A8] leading-none mt-0.5 truncate">Tous vos clients</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#4C1D95] tabular-nums ml-1 flex-shrink-0">{clients.length}</div>
        </div>

        {/* Palette 2: Nouveau client (BLEU) */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'nouveaux' ? 'tous' : 'nouveaux')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeFilter === 'nouveaux'
              ? 'bg-[#DBEAFE] border-[#2563EB] shadow-sm ring-2 ring-[#2563EB]/20'
              : 'bg-[#DBEAFE]/60 border-[#BFDBFE] hover:bg-[#DBEAFE]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <UserPlus size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#1E40AF] leading-tight truncate">Nouveaux</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#1D4ED8] leading-none mt-0.5 truncate">Ce mois-ci</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#1E3A8A] tabular-nums ml-1 flex-shrink-0">{newCount}</div>
        </div>

        {/* Palette 3: Client actif (VERT) */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'actifs' ? 'tous' : 'actifs')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeFilter === 'actifs'
              ? 'bg-[#D1FAE5] border-[#10B981] shadow-sm ring-2 ring-[#10B981]/20'
              : 'bg-[#D1FAE5]/60 border-[#A7F3D0] hover:bg-[#D1FAE5]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#10B981]/15 text-[#059669] flex items-center justify-center flex-shrink-0">
              <UserCheck size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#065F46] leading-tight truncate">Actifs</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#047857] leading-none mt-0.5 truncate">Avec commande</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#064E3B] tabular-nums ml-1 flex-shrink-0">{activeCount}</div>
        </div>

        {/* Palette 4: Client inactif (ROUGE) */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'inactifs' ? 'tous' : 'inactifs')}
          className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center justify-between cursor-pointer palette-card-hover active:scale-95 transition-all min-w-0 ${
            activeFilter === 'inactifs'
              ? 'bg-[#FEE2E2] border-[#EF4444] shadow-sm ring-2 ring-[#EF4444]/20'
              : 'bg-[#FEE2E2]/60 border-[#FCA5A5] hover:bg-[#FEE2E2]'
          }`}
        >
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EF4444]/15 text-[#DC2626] flex items-center justify-center flex-shrink-0">
              <UserX size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#991B1B] leading-tight truncate">Inactifs</div>
              <div className="text-[8.5px] sm:text-[9px] text-[#B91C1C] leading-none mt-0.5 truncate">Sans commande</div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#7F1D1D] tabular-nums ml-1 flex-shrink-0">{inactiveCount}</div>
        </div>
      </div>



      {/* Active Filter Title Banners (Without Afficher tous button) */}
      {activeFilter === 'nouveaux' && (
        <div className="p-3 rounded-[14px] bg-[#DBEAFE] border border-[#BFDBFE] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-caption text-[#1E40AF] font-semibold">
            <Sparkles size={16} />
            <span>Filtre actif : Nouveaux clients ce mois ({filteredClients.length})</span>
          </div>
        </div>
      )}

      {activeFilter === 'actifs' && (
        <div className="p-3 rounded-[14px] bg-[#D1FAE5] border border-[#A7F3D0] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-caption text-[#065F46] font-semibold">
            <UserCheck size={16} />
            <span>Filtre actif : Clients actifs avec commande ({filteredClients.length})</span>
          </div>
        </div>
      )}

      {activeFilter === 'inactifs' && (
        <div className="p-3 rounded-[14px] bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-caption text-[#991B1B] font-semibold">
            <UserX size={16} />
            <span>Filtre actif : Clients inactifs ({filteredClients.length})</span>
          </div>
        </div>
      )}

      {/* Clients List (Standalone Fluid Cards without dividing lines) */}
      <div className="space-y-2.5">
        {filteredClients.length === 0 ? (
          <div className="py-10 px-4 text-center text-caption text-tertiary space-y-2 bg-surface rounded-[24px] border border-subtle shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] mx-auto flex items-center justify-center">
              <Users size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-body-strong font-extrabold text-primary">Aucun client enregistré</h4>
              <p className="text-xs text-secondary max-w-xs mx-auto">
                Cliquez sur le bouton <strong>+ (en bas à droite)</strong> pour ajouter votre premier client et noter ses mensurations.
              </p>
            </div>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className="p-3.5 rounded-[20px] bg-white shadow-xs flex items-center justify-between cursor-pointer white-element-hover active:scale-98 transition-all min-h-[60px]"
            >
              {/* Left Section: Clean Avatar + Name + Discreet 'Dernière commande : [date/time]' */}
              <div className="flex items-center space-x-3.5">
                {client.avatarUrl ? (
                  <img
                    src={client.avatarUrl}
                    alt={client.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {client.initials}
                  </div>
                )}

                <div className="space-y-0.5">
                  <h3 className="text-body-strong font-bold text-primary">{client.name}</h3>

                  {/* Discreet subtext: Dernière commande : [date/time] */}
                  <div className="text-[11px] text-tertiary">
                    Dernière commande : <span className="font-medium text-secondary">{client.lastActivity || client.lastOrderDate || '12 Mai 2024'}</span>
                  </div>
                </div>
              </div>

              {/* Right Section: Status Badges (Dual if new: Nouveau + Actif) + Chevron */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center space-x-1.5">
                  {client.isNew && <StatusBadge status="nouveau" />}
                  <StatusBadge status={client.status} />
                </div>
                <ChevronRight size={18} className="text-tertiary" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer end note */}
      <div className="pt-4 text-center text-caption text-tertiary space-y-1">
        <p>Vous avez atteint la fin</p>
        <div className="flex justify-center text-[#7C3AED]">
          <Inbox size={20} />
        </div>
      </div>

      {/* Pure Circular Floating Action Button (FAB) (+) aligned inside app container */}
      {onOpenNewClientModal && (
        <div className="fixed inset-x-0 bottom-20 z-40 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pointer-events-none flex justify-end">
          <button
            onClick={onOpenNewClientModal}
            className="pointer-events-auto w-13 h-13 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-full shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-white/20 group ring-4 ring-[#7C3AED]/15"
            aria-label="Ajouter un client"
            title="Nouveau Client"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      )}
    </div>
  );
};
