import React, { useState, useRef } from 'react';
import {
  Shirt,
  Ruler,
  Activity,
  Maximize2,
  MoveDown,
  Circle,
  ArrowUp,
  Sliders,
  Scissors,
  Compass,
  History,
  Edit3,
  Check,
  X,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Client, Measurement } from '../types';
import {
  MOCK_MEASUREMENTS_COSTUME,
  MOCK_MEASUREMENTS_CHEMISE,
  MOCK_MEASUREMENTS_PANTALON,
  MOCK_MEASUREMENTS_ROBE,
  MOCK_MEASUREMENTS_BOUBOU,
} from '../data/mockData';

interface MensurationsViewProps {
  client?: Client;
}

export const MensurationsView: React.FC<MensurationsViewProps> = ({ client }) => {
  const [selectedGarment, setSelectedGarment] = useState<'costume' | 'chemise' | 'pantalon' | 'robe' | 'boubou'>('costume');
  const [measureTab, setMeasureTab] = useState<'actuelles' | 'historique'>('actuelles');

  // Horizontal Scroll Reference for Garment Selector
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollGarments = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: 160, behavior: 'smooth' });
      }
    }
  };

  // Garment Measurements State
  const [garmentMeasurements, setGarmentMeasurements] = useState<Record<string, Measurement[]>>({
    costume: MOCK_MEASUREMENTS_COSTUME,
    chemise: MOCK_MEASUREMENTS_CHEMISE,
    pantalon: MOCK_MEASUREMENTS_PANTALON,
    robe: MOCK_MEASUREMENTS_ROBE,
    boubou: MOCK_MEASUREMENTS_BOUBOU,
  });

  const [editingItem, setEditingItem] = useState<Measurement | null>(null);
  const [editValCm, setEditValCm] = useState<number | ''>(0);
  const [deletingItem, setDeletingItem] = useState<Measurement | null>(null);

  const clientName = client?.name || 'Kossi A.';
  const clientPhone = client?.phone || '90 12 34 56';
  const clientAvatar = client?.avatarUrl;
  const clientInitials = client?.initials || 'KA';

  const garments = [
    { id: 'costume', label: 'Costume 3 pièces', icon: '👔' },
    { id: 'chemise', label: 'Chemise homme', icon: '👕' },
    { id: 'pantalon', label: 'Pantalon classique', icon: '👖' },
    { id: 'robe', label: 'Robe de soirée', icon: '👗' },
    { id: 'boubou', label: 'Boubou traditionnel', icon: '🥻' },
  ];

  const currentList = garmentMeasurements[selectedGarment] || MOCK_MEASUREMENTS_COSTUME;

  const getMeasurementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt size={18} className="text-[#7C3AED]" />;
      case 'Ruler': return <Ruler size={18} className="text-[#7C3AED]" />;
      case 'Activity': return <Activity size={18} className="text-[#7C3AED]" />;
      case 'Maximize2': return <Maximize2 size={18} className="text-[#7C3AED]" />;
      case 'MoveDown': return <MoveDown size={18} className="text-[#7C3AED]" />;
      case 'Circle': return <Circle size={18} className="text-[#7C3AED]" />;
      case 'ArrowUpUp': return <ArrowUp size={18} className="text-[#7C3AED]" />;
      case 'Sliders': return <Sliders size={18} className="text-[#7C3AED]" />;
      case 'Scissors': return <Scissors size={18} className="text-[#7C3AED]" />;
      case 'Compass': return <Compass size={18} className="text-[#7C3AED]" />;
      default: return <Ruler size={18} className="text-[#7C3AED]" />;
    }
  };

  const handleSaveMeasurement = () => {
    if (!editingItem) return;
    setGarmentMeasurements((prev) => ({
      ...prev,
      [selectedGarment]: prev[selectedGarment].map((m) =>
        m.id === editingItem.id ? { ...m, valueCm: Number(editValCm) || 0 } : m
      ),
    }));
    setEditingItem(null);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState<number | ''>('');

  const handleDeleteMeasurement = (id: string) => {
    setGarmentMeasurements((prev) => ({
      ...prev,
      [selectedGarment]: prev[selectedGarment].filter((m) => m.id !== id),
    }));
  };

  const handleAddMeasurement = () => {
    if (!newLabel.trim()) return;
    const item: Measurement = {
      id: `m-custom-${Date.now()}`,
      label: newLabel.trim(),
      valueCm: Number(newValue) || 0,
      iconName: 'Ruler',
    };
    setGarmentMeasurements((prev) => ({
      ...prev,
      [selectedGarment]: [...prev[selectedGarment], item],
    }));
    setNewLabel('');
    setShowAddModal(false);
  };

  /* Tabs: Actuelles vs Historique */
  return (
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-5 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner">
      {/* Client Identity Header Card */}
      <div className="bg-surface rounded-[20px] p-4 border border-subtle flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          {clientAvatar ? (
            <img
              src={clientAvatar}
              alt={clientName}
              className="w-13 h-13 rounded-full object-cover border-2 border-[#7C3AED]/30 flex-shrink-0"
            />
          ) : (
            <div className="w-13 h-13 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-bold text-lg flex items-center justify-center flex-shrink-0">
              {clientInitials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-body-strong font-bold text-primary text-base truncate">
              Mesures de {clientName}
            </h2>
            <p className="text-caption text-secondary tabular-nums">{clientPhone}</p>
            <div className="text-[11px] text-[#7C3AED] font-semibold mt-0.5">
              Dernière prise de mesure : 12 Mai 2024
            </div>
          </div>
        </div>
      </div>

      {/* Pro Segmented Garment Selector Pills with Interactive Scroll Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
            Type de vêtement
          </label>
          <button
            type="button"
            onClick={handleScrollGarments}
            className="flex items-center space-x-1 text-[11px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 px-2.5 py-0.5 rounded-full transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Faire défiler les vêtements"
          >
            <span>Faire défiler</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="relative">
          <div ref={scrollContainerRef} className="flex space-x-2 overflow-x-auto no-scrollbar py-1 pr-4">
            {garments.map((g) => {
              const isSelected = selectedGarment === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGarment(g.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-[14px] text-caption font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-md'
                      : 'bg-surface border border-subtle text-secondary hover:text-primary hover:bg-surface-alt'
                  }`}
                >
                  <span className="text-base">{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>
          {/* Subtle right gradient fade overlay indicating scrollability */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-canvas to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Tabs: Actuelles vs Historique */}
      <div className="flex items-center justify-between border-b border-subtle">
        <div className="flex space-x-6">
          <button
            onClick={() => setMeasureTab('actuelles')}
            className={`pb-2.5 text-caption font-semibold transition-colors border-b-2 cursor-pointer ${
              measureTab === 'actuelles'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Mesures actuelles
          </button>
          <button
            onClick={() => setMeasureTab('historique')}
            className={`pb-2.5 text-caption font-semibold transition-colors border-b-2 cursor-pointer ${
              measureTab === 'historique'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Historique des modifications
          </button>
        </div>
      </div>

      {/* Measurements List (Pure White Cards without border lines) */}
      {measureTab === 'actuelles' ? (
        <div className="space-y-2">
          {currentList.map((m) => (
            <div key={m.id} className="p-3.5 rounded-[16px] bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3.5 text-secondary">
                <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                  {getMeasurementIcon(m.iconName)}
                </div>
                <span className="text-body text-primary font-semibold">{m.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-body-strong text-[#7C3AED] tabular-nums font-bold text-base pr-1">
                  {m.valueCm} cm
                </span>
                <button
                  onClick={() => {
                    setEditingItem(m);
                    setEditValCm(m.valueCm);
                  }}
                  className="p-1.5 text-[#7C3AED] bg-[#F3E8FF] hover:bg-[#7C3AED] hover:text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Modifier cette mesure"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setDeletingItem(m)}
                  className="p-1.5 text-[#EF4444] bg-[#FEE2E2] hover:bg-[#EF4444] hover:text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Supprimer cette mesure"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* History Timeline */
        <div className="bg-surface rounded-[20px] p-4 border border-subtle space-y-4 shadow-xs">
          <div className="flex items-start space-x-3 pb-3 border-b border-subtle">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0">
              <Check size={16} />
            </div>
            <div>
              <div className="text-body-strong font-bold text-primary">Prise de mesure complète</div>
              <div className="text-caption text-secondary">12 Mai 2024 • Atelier Nasser</div>
              <p className="text-[12px] text-tertiary mt-1">Tour de poitrine ajusté à 102cm (+2cm)</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <History size={16} />
            </div>
            <div>
              <div className="text-body-strong font-bold text-primary">Mesure initiale</div>
              <div className="text-caption text-secondary">15 Janvier 2024 • Inscription client</div>
              <p className="text-[12px] text-tertiary mt-1">Première fiche de mensurations établie</p>
            </div>
          </div>
        </div>
      )}

      {/* History Action Button */}
      <button
        onClick={() => setMeasureTab(measureTab === 'actuelles' ? 'historique' : 'actuelles')}
        className="w-full py-3.5 bg-surface border border-subtle rounded-[16px] text-body-strong font-bold text-primary hover:bg-surface-alt transition-colors cursor-pointer shadow-xs active:scale-98 flex items-center justify-center space-x-2"
      >
        <History size={18} className="text-[#7C3AED]" />
        <span>{measureTab === 'actuelles' ? "Voir l'historique complet" : "Revenir aux mesures actuelles"}</span>
      </button>

      {/* Floating Action Button (FAB) for adding a new measurement */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 ring-4 ring-[#7C3AED]/25"
        title="Ajouter une mesure"
        aria-label="Ajouter une mesure"
      >
        <Plus size={26} />
      </button>

      {/* Modal: Modifier la mesure */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface text-primary rounded-[24px] border border-subtle w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Ruler size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-primary">
                  Modifier {editingItem.label}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-tertiary hover:text-primary rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-caption text-secondary font-semibold block">
                Nouvelle valeur (en cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="300"
                  autoFocus
                  value={editValCm}
                  onChange={(e) => setEditValCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-4 pr-12 py-3 bg-surface border border-subtle rounded-[16px] text-lg font-bold text-primary focus:outline-none focus:border-[#7C3AED] tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption font-bold text-[#7C3AED]">
                  cm
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 bg-surface-alt text-secondary hover:text-primary rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveMeasurement}
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface text-primary rounded-[24px] border border-subtle w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-primary">
                  Nouvelle mesure
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-tertiary hover:text-primary rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Nom de la mesure
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Tour de poignet, Hauteur taille..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-subtle rounded-[14px] text-body font-semibold text-primary focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-caption text-secondary font-semibold block mb-1">
                  Valeur (en cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    placeholder="ex: 95"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-4 pr-12 py-2.5 bg-surface border border-subtle rounded-[14px] text-lg font-bold text-primary focus:outline-none focus:border-[#7C3AED] tabular-nums"
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-surface-alt text-secondary hover:text-primary rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddMeasurement}
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
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface text-primary rounded-[24px] border border-subtle w-full max-w-sm shadow-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-body-strong font-bold text-primary">
                Supprimer cette mesure ?
              </h3>
              <p className="text-caption text-secondary mt-1">
                Voulez-vous vraiment supprimer la mesure <strong className="text-primary">« {deletingItem.label} »</strong> ({deletingItem.valueCm} cm) ?
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 bg-surface-alt text-secondary hover:text-primary rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteMeasurement(deletingItem.id);
                  setDeletingItem(null);
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
    </div>
  );
};
