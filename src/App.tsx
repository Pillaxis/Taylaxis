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
import { AuthView } from './views/AuthView';
import { LandingPageView } from './views/LandingPageView';
import { NotificationsModal } from './components/common/NotificationsModal';
import { MOCK_CLIENTS, MOCK_MEASUREMENTS_COSTUME, GARMENT_TYPES, GARMENT_TYPE_PRESETS } from './data/mockData';
import type { Client, Order, StatusType } from './types';
import { OrderEngine } from './services/orderEngine';
import { OrderService } from './services/orderService';
import { userService } from './services/userService';
import { SupabaseService } from './services/supabaseService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { X, Ruler, Plus, Trash2, Shirt, UserPlus } from 'lucide-react';

interface ModalMeasurementItem {
  id: string;
  label: string;
  valueCm: number | '';
  placeholder: string;
}



export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [viewingMensurations, setViewingMensurations] = useState<boolean>(false);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);

  // Auth state with localStorage session persistence
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('taylaxis_active_session_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const handleSetUser = (u: any) => {
    setUser(u);
    if (u) {
      localStorage.setItem('taylaxis_active_session_v1', JSON.stringify(u));
    } else {
      localStorage.removeItem('taylaxis_active_session_v1');
    }
  };

  // Data state with localStorage persistence
  const CLIENTS_KEY = 'taylaxis_clients_v1';

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(CLIENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load clients from localStorage:', e);
    }
    return MOCK_CLIENTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return OrderService.getOrders();
  });

  // Automatically persist clients whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Failed to persist clients:', e);
    }
  }, [clients]);

  // Automatically persist orders whenever they change
  React.useEffect(() => {
    try {
      OrderService.saveOrders(orders);
    } catch (e) {
      console.error('Failed to persist orders:', e);
    }
  }, [orders]);

  // Subscribe to OrderService changes to keep global state in sync
  React.useEffect(() => {
    const unsubscribe = OrderService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });
    return unsubscribe;
  }, []);

  // Track Supabase Auth state
  React.useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            handleSetUser(data.user);
          }
        } catch (e) {
          console.error('Auth check error:', e);
        }
      }
      setLoadingAuth(false);
    }
    checkAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          handleSetUser(session.user);
        }
        setLoadingAuth(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setLoadingAuth(false);
    }
  }, []);

  // Load Full-Stack Supabase Data on startup
  React.useEffect(() => {
    async function loadCloudData() {
      if (SupabaseService.isReady()) {
        const cloudClients = await SupabaseService.fetchClients();
        if (cloudClients.length > 0) {
          setClients(cloudClients);
        }
        const cloudOrders = await SupabaseService.fetchOrders();
        if (cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }
      }
    }
    loadCloudData();

    const unsubRealtime = SupabaseService.subscribeToOrders(() => {
      loadCloudData();
    });

    const unsubOrderService = OrderService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });

    return () => {
      unsubRealtime();
      unsubOrderService();
    };
  }, [user]);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [addMeasurementsInModal, setAddMeasurementsInModal] = useState(true);

  // Garment type and dynamic measurement items state
  const [selectedGarmentType, setSelectedGarmentType] = useState<string>('Costume 3 Pièces');
  const [customGarmentName, setCustomGarmentName] = useState<string>('');
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomValueCm, setNewCustomValueCm] = useState<number | ''>('');

  const [modalMeasurements, setModalMeasurements] = useState<ModalMeasurementItem[]>(() => {
    return GARMENT_TYPE_PRESETS['Costume 3 Pièces'].map((item, idx) => ({
      id: `m-preset-${idx}`,
      label: item.label,
      valueCm: '',
      placeholder: item.placeholder,
    }));
  });

  const handleGarmentTypeChange = (garmentType: string) => {
    setSelectedGarmentType(garmentType);
    const preset = GARMENT_TYPE_PRESETS[garmentType] || GARMENT_TYPE_PRESETS['Autre vêtement (Personnalisé)'];
    setModalMeasurements(
      preset.map((item, idx) => ({
        id: `m-preset-${Date.now()}-${idx}`,
        label: item.label,
        valueCm: '',
        placeholder: item.placeholder,
      }))
    );
  };

  const handleSaveCustomMeasurement = () => {
    if (!newCustomLabel.trim()) return;
    setModalMeasurements((prev) => [
      ...prev,
      {
        id: `m-custom-${Date.now()}`,
        label: newCustomLabel.trim(),
        valueCm: newCustomValueCm === '' ? '' : Number(newCustomValueCm),
        placeholder: 'ex: 50',
      },
    ]);
    setNewCustomLabel('');
    setNewCustomValueCm('');
    setShowAddCustomField(false);
  };

  const handleUpdateMeasurementRow = (id: string, field: 'label' | 'valueCm', val: any) => {
    setModalMeasurements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleDeleteMeasurementRow = (id: string) => {
    setModalMeasurements((prev) => prev.filter((item) => item.id !== id));
  };

  const [newOrderTitle, setNewOrderTitle] = useState('');
  const [newOrderPrice, setNewOrderPrice] = useState('');
  const [newOrderClient, setNewOrderClient] = useState(MOCK_CLIENTS[0]?.name || '');

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
    if (!newClientName.trim() || !newClientPhone.trim()) return;

    const initials = newClientName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const customM = addMeasurementsInModal
      ? modalMeasurements
          .filter((m) => m.valueCm !== '' && Number(m.valueCm) > 0)
          .map((m) => ({
            id: m.id,
            label: m.label,
            valueCm: Number(m.valueCm),
            iconName: 'Ruler',
          }))
      : [];

    const newClientId = `c_${Date.now()}`;
    const shouldCreateOrder = addMeasurementsInModal;

    const newClient: Client = {
      id: newClientId,
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      ordersCount: shouldCreateOrder ? 1 : 0,
      initials,
      status: 'actif',
      isNew: true,
      lastOrderDate: shouldCreateOrder ? "Aujourd'hui" : 'Aucune commande',
      mensurationsCount: customM.length,
      totalSpentFCFA: 0,
      customMeasurements: customM,
      notes: '',
    };

    if (shouldCreateOrder) {
      const effectiveGarmentType =
        selectedGarmentType === 'Autre vêtement (Personnalisé)' && customGarmentName.trim()
          ? customGarmentName.trim()
          : selectedGarmentType;

      const newOrderId = `ord_${Date.now()}`;
      const orderTitle = `Confection - ${effectiveGarmentType}`;

      const initialOrder: Order = {
        id: newOrderId,
        orderNumber: OrderService.generateOrderNumber(),
        clientId: newClientId,
        clientName: newClientName.trim(),
        title: orderTitle,
        priceFCFA: 0,
        paidFCFA: 0,
        balanceFCFA: 0,
        status: 'progress',
        manufacturingStatus: 'EN_COURS',
        paymentStatus: 'NON_PAYEE',
        dueDateStatus: 'BIENTOT',
        priority: 'NORMALE',
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orderDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        paymentHistory: [],
        eventTimeline: [
          {
            id: `evt_${Date.now()}`,
            orderId: newOrderId,
            timestamp: `${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            title: 'Commande initiée à l’enregistrement du client',
            description: `Commande de ${orderTitle} créée avec ${customM.length} mesure(s).`,
            type: 'COMMANDE_CREEE',
            performedBy: 'Atelier Taylaxis',
          },
        ],
        measurementSnapshot: {
          takenAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          measurements: customM,
        },
      };

      OrderService.saveOrder(initialOrder);
      setOrders((prev) => [initialOrder, ...prev]);
    }

    if (SupabaseService.isReady()) {
      SupabaseService.saveClient(newClient);
    }

    setClients((prev) => [newClient, ...prev]);

    setNewClientName('');
    setNewClientPhone('');
    setCustomGarmentName('');
    setSelectedGarmentType('Costume 3 Pièces');
    setModalMeasurements(
      GARMENT_TYPE_PRESETS['Costume 3 Pièces'].map((item, idx) => ({
        id: `m-preset-${idx}`,
        label: item.label,
        valueCm: '',
        placeholder: item.placeholder,
      }))
    );
    setAddMeasurementsInModal(true);
    setShowNewClientModal(false);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderTitle || !newOrderPrice) return;

    const price = parseInt(newOrderPrice, 10) || 0;
    const matchedClient = clients.find((c) => c.name === newOrderClient) || clients[0] || { name: newOrderClient || 'Client atelier', id: `c_${Date.now()}`, customMeasurements: MOCK_MEASUREMENTS_COSTUME };
    const clientMeasurements = matchedClient.customMeasurements || MOCK_MEASUREMENTS_COSTUME;

    OrderService.createOrder(
      {
        clientName: matchedClient.name,
        clientId: matchedClient.id,
        title: newOrderTitle,
        priceFCFA: price,
        paidFCFA: 0,
        orderDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        deliveryDate: 'Dans 7 jours',
      },
      clientMeasurements
    );

    setOrders(OrderService.getOrders());
    setNewOrderTitle('');
    setNewOrderPrice('');
    setShowNewOrderModal(false);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: StatusType) => {
    const mfgStatus = OrderEngine.mapLegacyToManufacturingStatus(newStatus);
    OrderService.updateManufacturingStatus(orderId, mfgStatus);
    setOrders(OrderService.getOrders());
  };

  const handlePayOrder = (orderId: string, amount: number) => {
    OrderService.addPayment(orderId, amount);
    setOrders(OrderService.getOrders());
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
          onOrderCreated={(updatedOrder) => {
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === updatedOrder.id);
              if (exists) {
                return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
              }
              return [updatedOrder, ...prev];
            });
          }}
        />
      );
    }

    switch (activeTab) {
      case 'accueil':
        return (
          <AccueilView
            orders={orders}
            clients={clients}
            onNavigateToClients={() => setActiveTab('clients')}
            onNavigateToCommandes={() => setActiveTab('commandes')}
            onNavigateToAgenda={() => setActiveTab('agenda')}
            onSelectClient={handleSelectClient}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
            onOpenNewOrderModal={() => {
              if (clients.length === 0) {
                setShowNewClientModal(true);
              } else {
                setShowNewOrderModal(true);
              }
            }}
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
            clients={clients}
            onSelectClient={handleSelectClient}
            onOpenNewOrderModal={() => {
              if (clients.length === 0) {
                setShowNewClientModal(true);
              } else {
                setShowNewOrderModal(true);
              }
            }}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onPayOrder={handlePayOrder}
            onOrderUpdated={(updated) => {
              setOrders(OrderService.getOrders());
              // Also sync client measurements if the order has a measurement snapshot
              const clientIdx = clients.findIndex(c => c.id === updated.clientId);
              if (clientIdx >= 0 && updated.measurementSnapshot && updated.measurementSnapshot.measurements.length > 0) {
                const updatedClients = [...clients];
                updatedClients[clientIdx] = {
                  ...updatedClients[clientIdx],
                  customMeasurements: updated.measurementSnapshot.measurements,
                };
                setClients(updatedClients);
              }
            }}
            onClientCreated={(newClient) => {
              setClients((prev) => [newClient, ...prev]);
            }}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            onSelectClient={handleSelectClient}
            clients={clients}
            orders={orders}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
          />
        );
      case 'moi':
        return <MoiView onSignOut={handleSignOut} />;
      default:
        return (
          <AccueilView
            orders={orders}
            clients={clients}
            onNavigateToClients={() => setActiveTab('clients')}
            onNavigateToCommandes={() => setActiveTab('commandes')}
            onNavigateToAgenda={() => setActiveTab('agenda')}
            onSelectClient={handleSelectClient}
            onOpenNewClientModal={() => setShowNewClientModal(true)}
            onOpenNewOrderModal={() => setShowNewOrderModal(true)}
          />
        );
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    handleSetUser(null);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0C0A27] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#7C3AED] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Chargement de votre atelier Taylaxis...</p>
      </div>
    );
  }

  if (showLandingPage) {
    return (
      <LandingPageView
        onGetStarted={() => setShowLandingPage(false)}
        onLogin={() => setShowLandingPage(false)}
      />
    );
  }

  if (!user) {
    return (
      <AuthView
        onAuthSuccess={(u) => handleSetUser(u)}
        onViewLandingPage={() => setShowLandingPage(true)}
      />
    );
  }

  const getHeaderProps = () => {
    const profile = userService.getUserProfile();
    const displayUserName = profile.firstName || (profile.fullName && profile.fullName !== 'Tailleur Taylaxis' ? profile.fullName.split(' ')[0] : '') || user?.user_metadata?.user_name || '';

    if (selectedClientId && selectedClient) {
      return {
        title: viewingMensurations ? `Mensurations` : 'Fiche Client',
        showBack: true,
      };
    }

    switch (activeTab) {
      case 'accueil':
        return { isHome: true, userName: displayUserName };
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
          onViewLandingPage={() => setShowLandingPage(true)}
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

      {/* Modal: Nouveau Client & Mensurations */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-surface rounded-[24px] border border-subtle p-5 w-full max-w-md shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div>
                <h3 className="text-h2 font-bold text-primary">Nouveau Client & Mensurations</h3>
                <p className="text-[11px] text-secondary">Ajoutez le client et notez immédiatement ses mesures</p>
              </div>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-tertiary hover:text-primary p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-caption text-secondary font-medium block mb-1">Nom complet du client</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Koffi Mensah"
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

              {/* Functional Feature 2: Integrated Garment Type & Measurements Form */}
              <div className="pt-2 border-t border-subtle space-y-3">
                <div className="p-3 rounded-[16px] bg-[#F3E8FF]/80 border border-[#E9D5FF] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-caption font-extrabold text-[#5B21B6]">
                      <Ruler size={16} className="text-[#7C3AED]" />
                      <span>Type de Vêtement & Mensurations</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddMeasurementsInModal(!addMeasurementsInModal)}
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        addMeasurementsInModal
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-white text-secondary border border-[#E9D5FF]'
                      }`}
                    >
                      {addMeasurementsInModal ? 'Actives' : 'Masquer'}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-[#6B21A8] leading-tight font-medium">
                    Saisissez les mesures ci-dessous. Les valeurs sont en exemples grises (placeholders) : tapez les vôtres !
                  </p>
                </div>

                {addMeasurementsInModal && (
                  <div className="space-y-3 p-3.5 rounded-[18px] bg-surface-alt border border-subtle animate-fadeIn">
                    {/* Garment Type Selector (High-End Interactive Pills) */}
                    <div>
                      <label className="text-[11px] font-extrabold text-primary flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1">
                          <Shirt size={14} className="text-[#7C3AED]" />
                          <span>Choix du modèle de vêtement</span>
                        </span>
                        <span className="text-[10px] text-[#7C3AED] font-bold bg-[#7C3AED]/10 px-2 py-0.5 rounded-full">
                          {selectedGarmentType}
                        </span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {GARMENT_TYPES.map((gt) => {
                          const isSelected = selectedGarmentType === gt.id;
                          return (
                            <button
                              key={gt.id}
                              type="button"
                              onClick={() => handleGarmentTypeChange(gt.id)}
                              className={`p-2 rounded-[12px] text-center border transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                                isSelected
                                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-[#7C3AED]/20 font-bold'
                                  : 'bg-surface text-secondary border-subtle hover:border-[#7C3AED]/50 hover:bg-surface-alt'
                              }`}
                            >
                              <span className="text-sm">{gt.icon}</span>
                              <span className="text-[10.5px] truncate w-full leading-tight">{gt.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedGarmentType === 'Autre vêtement (Personnalisé)' && (
                      <div className="p-2.5 rounded-[12px] bg-surface border border-[#7C3AED]/30 space-y-1">
                        <label className="text-[11px] font-semibold text-primary block">Préciser le nom du vêtement personnalisé :</label>
                        <input
                          type="text"
                          placeholder="ex: Kente, Agbada spécial, Tenue de gala, etc."
                          value={customGarmentName}
                          onChange={(e) => setCustomGarmentName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface-alt border border-subtle rounded-[10px] text-caption font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    )}

                    {/* Dynamic Measurement Rows */}
                    <div className="space-y-2 pt-2 border-t border-subtle">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-primary">Fiche des mensurations (cm)</span>
                        <button
                          type="button"
                          onClick={() => setShowAddCustomField(!showAddCustomField)}
                          className="px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-[11px] font-bold hover:bg-[#7C3AED]/20 transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <Plus size={13} />
                          <span>{showAddCustomField ? 'Fermer' : 'Ajouter une mesure'}</span>
                        </button>
                      </div>

                      {/* 2-Step Custom Measurement Creator Box */}
                      {showAddCustomField && (
                        <div className="p-3 rounded-[14px] bg-[#7C3AED]/10 border border-[#7C3AED]/30 space-y-2 animate-fadeIn">
                          <div className="text-[11px] font-extrabold text-[#5B21B6] flex items-center gap-1">
                            <Plus size={14} />
                            <span>Nouvelle mesure personnalisée</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-secondary block mb-0.5">1. Nom de la mesure</label>
                              <input
                                type="text"
                                placeholder="ex: Tour de poignet, Profondeur col..."
                                value={newCustomLabel}
                                onChange={(e) => setNewCustomLabel(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-surface border border-subtle rounded-[10px] text-caption font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-secondary block mb-0.5">2. Valeur (en cm)</label>
                              <input
                                type="number"
                                placeholder="ex: 22"
                                value={newCustomValueCm}
                                onChange={(e) => setNewCustomValueCm(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-surface border border-subtle rounded-[10px] text-caption font-bold text-primary focus:outline-none focus:border-[#7C3AED]"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleSaveCustomMeasurement}
                              className="px-4 py-1.5 bg-[#7C3AED] text-white rounded-[10px] text-[11px] font-bold hover:bg-[#6D28D9] cursor-pointer active:scale-95 transition-all shadow-xs inline-flex items-center space-x-1"
                            >
                              <Plus size={13} />
                              <span>Valider la mesure</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {modalMeasurements.map((mItem) => (
                          <div key={mItem.id} className="p-2 rounded-[12px] bg-surface border border-subtle space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <input
                                type="text"
                                value={mItem.label}
                                onChange={(e) => handleUpdateMeasurementRow(mItem.id, 'label', e.target.value)}
                                className="w-full bg-transparent text-[11px] font-semibold text-primary focus:outline-none focus:underline"
                                placeholder="Nom mesure"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteMeasurementRow(mItem.id)}
                                className="text-tertiary hover:text-red-500 p-0.5 cursor-pointer flex-shrink-0"
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <input
                              type="number"
                              value={mItem.valueCm}
                              placeholder={mItem.placeholder}
                              onChange={(e) =>
                                handleUpdateMeasurementRow(
                                  mItem.id,
                                  'valueCm',
                                  e.target.value === '' ? '' : Number(e.target.value)
                                )
                              }
                              className="w-full px-2.5 py-1.5 bg-surface-alt border border-subtle rounded-[8px] text-body-strong font-bold text-primary placeholder:text-tertiary/40 focus:outline-none focus:border-[#7C3AED]"
                            />
                          </div>
                        ))}
                      </div>
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
                  Enregistrer Client & Mesures
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
              {clients.length === 0 ? (
                <div className="p-4 rounded-[18px] bg-[#F3E8FF] border border-[#E9D5FF] space-y-2.5 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] mx-auto flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-[#5B21B6]">Aucun client dans votre atelier</h4>
                    <p className="text-xs text-[#6B21A8]">
                      Pour enregistrer une nouvelle commande, vous devez d'abord créer votre premier client.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewOrderModal(false);
                      setShowNewClientModal(true);
                    }}
                    className="w-full py-2.5 rounded-[12px] bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] cursor-pointer shadow-xs active:scale-95 transition-all inline-flex items-center justify-center space-x-2"
                  >
                    <UserPlus size={15} />
                    <span>+ 1. Enregistrer mon 1er client (Nom & Mensurations)</span>
                  </button>
                </div>
              ) : (
                <div>
                  <label className="text-caption text-secondary font-medium block mb-1">Client</label>
                  <select
                    value={newOrderClient}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__ADD_NEW__') {
                        setShowNewOrderModal(false);
                        setShowNewClientModal(true);
                      } else {
                        setNewOrderClient(val);
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-surface-alt border border-subtle rounded-[14px] text-body text-primary focus:outline-none focus:border-[#7C3AED]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                    <option value="__ADD_NEW__">+ Ajouter un nouveau client...</option>
                  </select>
                </div>
              )}

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
