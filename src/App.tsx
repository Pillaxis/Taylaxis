import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { TabType } from './components/layout/BottomNav';
import { AccueilView } from './views/AccueilView';
import { ClientsView } from './views/ClientsView';
import { ClientDetailView } from './views/ClientDetailView';
import { MensurationsView } from './views/MensurationsView';
import { CommandesView } from './views/CommandesView';
import { AgendaView } from './views/AgendaView';
import { MoiView } from './views/MoiView';
import { NotificationsModal } from './components/common/NotificationsModal';
import { MOCK_CLIENTS, MOCK_ORDERS, MOCK_MEASUREMENTS_COSTUME } from './data/mockData';
import type { Client, Order, StatusType } from './types';
import { X, Ruler } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [viewingMensurations, setViewingMensurations] = useState<boolean>(false);

  // Data state
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(4);

  // Form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [addMeasurementsInModal, setAddMeasurementsInModal] = useState(false);
  const [modalPoitrine, setModalPoitrine] = useState<number | ''>(100);
  const [modalTaille, setModalTaille] = useState<number | ''>(85);
  const [modalLongueur, setModalLongueur] = useState<number | ''>(105);
  const [modalCarrure, setModalCarrure] = useState<number | ''>(46);

  const [newOrderTitle, setNewOrderTitle] = useState('');
  const [newOrderPrice, setNewOrderPrice] = useState('');
  const [newOrderClient, setNewOrderClient] = useState(MOCK_CLIENTS[0].name);

  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [initialClientTab, setInitialClientTab] = useState<'info' | 'mensurations' | 'commandes' | 'paiements'>('info');

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleSelectClient = (clientId: string, orderId?: string) => {
    setSelectedClientId(clientId);
    setViewingMensurations(false);
    if (orderId) {
      setHighlightedOrderId(orderId);
      setInitialClientTab('commandes');
    } else {
      setHighlightedOrderId(null);
      setInitialClientTab('info');
    }
  };

  const handleBackFromClient = () => {
    if (viewingMensurations) {
      setViewingMensurations(false);
    } else {
      setSelectedClientId(null);
      setHighlightedOrderId(null);
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) return;

    const initials = newClientName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const customM = addMeasurementsInModal ? [
      { id: 'm-poitrine', label: 'Tour de poitrine', valueCm: Number(modalPoitrine) || 0, iconName: 'Shirt' },
      { id: 'm-taille', label: 'Tour de taille', valueCm: Number(modalTaille) || 0, iconName: 'Ruler' },
      { id: 'm-longueur', label: 'Longueur vêtement', valueCm: Number(modalLongueur) || 0, iconName: 'MoveDown' },
      { id: 'm-carrure', label: 'Carrure épaules', valueCm: Number(modalCarrure) || 0, iconName: 'Maximize2' },
    ] : MOCK_MEASUREMENTS_COSTUME.slice(0, 5);

    const newClient: Client = {
      id: `c_${Date.now()}`,
      name: newClientName,
      phone: newClientPhone,
      ordersCount: 0,
      initials,
      status: 'actif',
      isNew: true,
      lastOrderDate: "Aujourd'hui",
      mensurationsCount: customM.length,
      totalSpentFCFA: 0,
      customMeasurements: customM,
    };

    setClients([newClient, ...clients]);
    setNewClientName('');
    setNewClientPhone('');
    setAddMeasurementsInModal(false);
    setShowNewClientModal(false);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderTitle || !newOrderPrice) return;

    const price = parseInt(newOrderPrice, 10) || 0;
    const matchedClient = clients.find((c) => c.name === newOrderClient) || clients[0];

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `#${Math.floor(100 + Math.random() * 900)}`,
      clientName: matchedClient.name,
      clientId: matchedClient.id,
      title: newOrderTitle,
      priceFCFA: price,
      paidFCFA: 0,
      balanceFCFA: price,
      orderDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryDate: 'Dans 7 jours',
      status: 'progress',
      progressPercent: 10,
    };

    setOrders([newOrder, ...orders]);
    setNewOrderTitle('');
    setNewOrderPrice('');
    setShowNewOrderModal(false);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: StatusType) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          const updated = { ...o, status: newStatus };
          if (newStatus === 'done') {
            updated.progressPercent = 100;
          } else if (newStatus === 'ready') {
            updated.progressPercent = 90;
          }
          return updated;
        }
        return o;
      })
    );
  };

  const handlePayOrder = (orderId: string, amount: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          const newPaid = Math.min(o.priceFCFA, o.paidFCFA + amount);
          const newBalance = Math.max(0, o.priceFCFA - newPaid);
          return {
            ...o,
            paidFCFA: newPaid,
            balanceFCFA: newBalance,
          };
        }
        return o;
      })
    );
  };

  const renderScreen = () => {
    if (selectedClientId && selectedClient) {
      if (viewingMensurations) {
        return <MensurationsView client={selectedClient} />;
      }
      return (
        <ClientDetailView
          client={selectedClient}
          initialTab={initialClientTab}
          highlightedOrderId={highlightedOrderId}
          orders={orders}
          onOpenMensurations={() => setViewingMensurations(true)}
          onUpdateClient={handleUpdateClient}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onPayOrder={handlePayOrder}
        />
      );
    }

    switch (activeTab) {
      case 'accueil':
        return (
          <AccueilView
            orders={orders}
            onNavigateToCommandes={() => setActiveTab('commandes')}
            onNavigateToAgenda={() => setActiveTab('agenda')}
            onSelectClient={handleSelectClient}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
            onOpenNewOrderModal={() => setShowNewOrderModal(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onPayOrder={handlePayOrder}
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={clients}
            onSelectClient={handleSelectClient}
            searchQuery={searchQuery}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
          />
        );
      case 'commandes':
        return (
          <CommandesView
            orders={orders}
            onSelectClient={handleSelectClient}
            onOpenNewOrderModal={() => setShowNewOrderModal(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onPayOrder={handlePayOrder}
          />
        );
      case 'agenda':
        return <AgendaView onSelectClient={handleSelectClient} clients={clients} />;
      case 'moi':
        return <MoiView />;
      default:
        return (
          <AccueilView
            onNavigateToCommandes={() => setActiveTab('commandes')}
            onNavigateToAgenda={() => setActiveTab('agenda')}
            onSelectClient={handleSelectClient}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
            onOpenNewOrderModal={() => setShowNewOrderModal(true)}
          />
        );
    }
  };

  const getHeaderProps = () => {
    if (selectedClientId && selectedClient) {
      return {
        title: viewingMensurations ? `Mensurations` : 'Fiche Client',
        showBack: true,
      };
    }

    switch (activeTab) {
      case 'accueil':
        return { isHome: true };
      case 'clients':
        return {
          title: 'Clients',
          showSearchIcon: true,
          searchPlaceholder: 'Rechercher un client...',
          searchValue: searchQuery,
          onSearchChange: setSearchQuery,
        };
      case 'commandes':
        return {
          title: 'Commandes',
          showSearchIcon: true,
          searchPlaceholder: 'Rechercher une commande...',
          searchValue: searchQuery,
          onSearchChange: setSearchQuery,
        };
      case 'agenda':
        return {
          title: 'Agenda',
          showSearchIcon: true,
          searchPlaceholder: 'Rechercher un rendez-vous...',
          searchValue: searchQuery,
          onSearchChange: setSearchQuery,
        };
      case 'moi':
        return { title: 'Mon Profil' };
    }
  };

  const headerProps = getHeaderProps();

  return (
    <div className="min-h-screen bg-canvas text-primary transition-colors flex flex-col justify-between selection:bg-[#7C3AED]/20">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen flex flex-col bg-canvas shadow-2xl">
        {/* Dark Purple Header */}
        <Header
          {...headerProps}
          onBack={handleBackFromClient}
          onNotificationClick={() => setShowNotificationsModal(true)}
          unreadCount={unreadNotificationsCount}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-y-auto">{renderScreen()}</main>

        {/* Bottom Nav */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedClientId(null);
            setViewingMensurations(false);
            setSearchQuery('');
            setActiveTab(tab);
          }}
        />
      </div>

      {/* Modal: Notifications */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onUpdateUnreadCount={setUnreadNotificationsCount}
        onNavigateToCommandes={() => {
          setSelectedClientId(null);
          setViewingMensurations(false);
          setActiveTab('commandes');
        }}
        onNavigateToAgenda={() => {
          setSelectedClientId(null);
          setViewingMensurations(false);
          setActiveTab('agenda');
        }}
        onSelectClient={handleSelectClient}
      />

      {/* Modal: Nouveau Client */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary">Nouveau Client</h3>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-caption text-secondary font-medium block mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kossi A."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-medium block mb-1">Numéro de téléphone</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 90 12 34 56"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Optional Quick Mensurations Toggle */}
              <div className="pt-2 border-t border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-caption font-bold text-primary">
                    <Ruler size={16} className="text-[#7C3AED]" />
                    <span>Mensurations initiales (Optionnel)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddMeasurementsInModal(!addMeasurementsInModal)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      addMeasurementsInModal
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'bg-surface-alt text-secondary border border-subtle hover:bg-surface'
                    }`}
                  >
                    {addMeasurementsInModal ? 'Saisies' : '+ Ajouter des mesures'}
                  </button>
                </div>

                {addMeasurementsInModal && (
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-[16px] bg-[#F3E8FF]/60 border border-[#E9D5FF] animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-semibold text-[#5B21B6] block mb-1">Poitrine (cm)</label>
                      <input
                        type="number"
                        value={modalPoitrine}
                        onChange={(e) => setModalPoitrine(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9D5FF] rounded-[10px] text-body-strong font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#5B21B6] block mb-1">Taille (cm)</label>
                      <input
                        type="number"
                        value={modalTaille}
                        onChange={(e) => setModalTaille(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9D5FF] rounded-[10px] text-body-strong font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#5B21B6] block mb-1">Longueur (cm)</label>
                      <input
                        type="number"
                        value={modalLongueur}
                        onChange={(e) => setModalLongueur(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9D5FF] rounded-[10px] text-body-strong font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#5B21B6] block mb-1">Carrure (cm)</label>
                      <input
                        type="number"
                        value={modalCarrure}
                        onChange={(e) => setModalCarrure(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9D5FF] rounded-[10px] text-body-strong font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-body font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nouvelle Commande */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-h2 font-bold text-primary">Nouvelle Commande</h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="text-caption text-secondary font-medium block mb-1">Client</label>
                <select
                  value={newOrderClient}
                  onChange={(e) => setNewOrderClient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-caption text-secondary font-medium block mb-1">Intitulé du vêtement</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Costume 3 pièces"
                  value={newOrderTitle}
                  onChange={(e) => setNewOrderTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-medium block mb-1">Prix total (FCFA)</label>
                <input
                  type="number"
                  required
                  placeholder="ex: 45000"
                  value={newOrderPrice}
                  onChange={(e) => setNewOrderPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 py-3 bg-surface-alt border border-subtle rounded-[14px] text-body font-semibold text-primary cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7C3AED] text-white rounded-[14px] text-body font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-sm"
                >
                  Créer la commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
