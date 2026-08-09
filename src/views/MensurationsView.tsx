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


interface MensurationsViewProps {
  client?: Client;
}

export const MensurationsView: React.FC<MensurationsViewProps> = ({ client }) => {
  const [selectedGarment, setSelectedGarment] = useState<string>('costume');
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

  // Preset measurements for each garment type (valueCm default 0 = example -- cm)
  const INITIAL_GARMENT_PRESETS: Record<string, Measurement[]> = {
    costume: [
      { id: 'mc1', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mc2', label: 'Carrure épaules', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mc3', label: 'Longueur veste', valueCm: 0, iconName: 'MoveDown' },
      { id: 'mc4', label: 'Longueur manche', valueCm: 0, iconName: 'Sliders' },
      { id: 'mc5', label: 'Tour de taille pantalon', valueCm: 0, iconName: 'Ruler' },
      { id: 'mc6', label: 'Longueur pantalon', valueCm: 0, iconName: 'MoveDown' },
    ],
    costume2p: [
      { id: 'mc2p1', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mc2p2', label: 'Carrure épaules', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mc2p3', label: 'Longueur veste', valueCm: 0, iconName: 'MoveDown' },
      { id: 'mc2p4', label: 'Longueur manche', valueCm: 0, iconName: 'Sliders' },
      { id: 'mc2p5', label: 'Tour de taille pantalon', valueCm: 0, iconName: 'Ruler' },
      { id: 'mc2p6', label: 'Longueur pantalon', valueCm: 0, iconName: 'MoveDown' },
    ],
    chemise: [
      { id: 'mch1', label: 'Tour de col', valueCm: 0, iconName: 'Circle' },
      { id: 'mch2', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mch3', label: 'Carrure épaules', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mch4', label: 'Longueur chemise', valueCm: 0, iconName: 'MoveDown' },
      { id: 'mch5', label: 'Longueur manche longue', valueCm: 0, iconName: 'Sliders' },
    ],
    chemise_mc: [
      { id: 'mchmc1', label: 'Tour de col', valueCm: 0, iconName: 'Circle' },
      { id: 'mchmc2', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mchmc3', label: 'Carrure épaules', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mchmc4', label: 'Longueur chemise', valueCm: 0, iconName: 'MoveDown' },
      { id: 'mchmc5', label: 'Longueur manche courte', valueCm: 0, iconName: 'Sliders' },
    ],
    pantalon: [
      { id: 'mp1', label: 'Tour de taille', valueCm: 0, iconName: 'Ruler' },
      { id: 'mp2', label: 'Tour de hanches', valueCm: 0, iconName: 'Activity' },
      { id: 'mp3', label: 'Tour de cuisse', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mp4', label: 'Longueur entrejambe', valueCm: 0, iconName: 'Sliders' },
      { id: 'mp5', label: 'Longueur pantalon', valueCm: 0, iconName: 'MoveDown' },
    ],
    boubou: [
      { id: 'mb1', label: 'Longueur totale boubou', valueCm: 0, iconName: 'ArrowUpUp' },
      { id: 'mb2', label: 'Envergure (manche à manche)', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mb3', label: 'Ouverture de cou', valueCm: 0, iconName: 'Circle' },
      { id: 'mb4', label: 'Longueur pantalon intérieur', valueCm: 0, iconName: 'Sliders' },
    ],
    traditionnel: [
      { id: 'mtrad1', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mtrad2', label: 'Carrure épaules', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mtrad3', label: 'Longueur tunique', valueCm: 0, iconName: 'MoveDown' },
      { id: 'mtrad4', label: 'Longueur pantalon', valueCm: 0, iconName: 'Sliders' },
    ],
    veste: [
      { id: 'mv1', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mv2', label: 'Carrure épaules', valueCm: 0, iconName: 'Maximize2' },
      { id: 'mv3', label: 'Longueur veste', valueCm: 0, iconName: 'MoveDown' },
      { id: 'mv4', label: 'Longueur manche', valueCm: 0, iconName: 'Sliders' },
    ],
    robe: [
      { id: 'mr1', label: 'Tour de poitrine', valueCm: 0, iconName: 'Shirt' },
      { id: 'mr2', label: 'Tour de taille', valueCm: 0, iconName: 'Ruler' },
      { id: 'mr3', label: 'Tour de hanches', valueCm: 0, iconName: 'Activity' },
      { id: 'mr4', label: 'Longueur totale robe', valueCm: 0, iconName: 'ArrowUpUp' },
    ],
    custom: client?.customMeasurements || [],
  };

  const storageClientId = client?.id || 'global';
  const GARMENT_MEAS_KEY = `taylaxis_garment_meas_v1_${storageClientId}`;
  const CUSTOM_GARMENTS_KEY = `taylaxis_custom_garments_v1_${storageClientId}`;

  // Garment Measurements State initialized with presets + localStorage + client custom measurements
  const [garmentMeasurements, setGarmentMeasurements] = useState<Record<string, Measurement[]>>(() => {
    try {
      const saved = localStorage.getItem(GARMENT_MEAS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load garment measurements:', e);
    }

    const base = { ...INITIAL_GARMENT_PRESETS };
    if (client?.customMeasurements && client.customMeasurements.length > 0) {
      // Map entered client measurements onto costume preset
      client.customMeasurements.forEach((cm) => {
        Object.keys(base).forEach((key) => {
          const matchIdx = base[key].findIndex((m) => m.label.toLowerCase() === cm.label.toLowerCase());
          if (matchIdx >= 0) {
            base[key][matchIdx].valueCm = cm.valueCm;
          }
        });
      });
    }
    return base;
  });

  const [editingItem, setEditingItem] = useState<Measurement | null>(null);
  const [editValCm, setEditValCm] = useState<number | ''>(0);
  const [deletingItem, setDeletingItem] = useState<Measurement | null>(null);

  // Custom Garments created by tailor
  const [customGarments, setCustomGarments] = useState<{ id: string; label: string; icon: string }[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_GARMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load custom garments:', e);
    }
    return [];
  });
  const [showAddGarmentModal, setShowAddGarmentModal] = useState(false);
  const [newGarmentLabelInput, setNewGarmentLabelInput] = useState('');

  // Persist measurements and custom garments automatically
  React.useEffect(() => {
    try {
      localStorage.setItem(GARMENT_MEAS_KEY, JSON.stringify(garmentMeasurements));
    } catch (e) {
      console.error('Failed to save garment measurements:', e);
    }
  }, [garmentMeasurements, GARMENT_MEAS_KEY]);

  React.useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_GARMENTS_KEY, JSON.stringify(customGarments));
    } catch (e) {
      console.error('Failed to save custom garments:', e);
    }
  }, [customGarments, CUSTOM_GARMENTS_KEY]);

  const handleAddCustomGarmentType = () => {
    if (!newGarmentLabelInput.trim()) return;
    const gId = `g_custom_${Date.now()}`;
    const newG = { id: gId, label: newGarmentLabelInput.trim(), icon: '✨' };
    setCustomGarments((prev) => [...prev, newG]);
    setGarmentMeasurements((prev) => ({ ...prev, [gId]: [] }));
    setSelectedGarment(gId);
    setNewGarmentLabelInput('');
    setShowAddGarmentModal(false);
  };

  const clientName = client?.name || 'Kossi A.';
  const clientPhone = client?.phone || '90 12 34 56';
  const clientAvatar = client?.avatarUrl;
  const clientInitials = client?.initials || 'KA';

  const defaultGarments = [
    { id: 'costume', label: 'Costume 3 pièces', icon: '👔' },
    { id: 'costume2p', label: 'Costume 2 pièces', icon: '🤵' },
    { id: 'chemise', label: 'Chemise manche longue', icon: '👕' },
    { id: 'chemise_mc', label: 'Chemise manche courte', icon: '🎽' },
    { id: 'pantalon', label: 'Pantalon classique', icon: '👖' },
    { id: 'boubou', label: 'Boubou / Agbada', icon: '🥻' },
    { id: 'traditionnel', label: 'Habits traditionnels', icon: '✨' },
    { id: 'veste', label: 'Veste / Blazer', icon: '🧥' },
    { id: 'robe', label: 'Robe / Ensemble dame', icon: '👗' },
    { id: 'custom', label: 'Sur mesure (Personnalisé)', icon: '📏' },
  ];

  const allGarmentsList = [...defaultGarments, ...customGarments];
  const selectedGarmentLabel = allGarmentsList.find((g) => g.id === selectedGarment)?.label || 'Costume';
  const currentList = garmentMeasurements[selectedGarment] || [];

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
      [selectedGarment]: (prev[selectedGarment] || []).map((m) =>
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
      [selectedGarment]: (prev[selectedGarment] || []).filter((m) => m.id !== id),
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
      [selectedGarment]: [...(prev[selectedGarment] || []), item],
    }));
    setNewLabel('');
    setNewValue('');
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
            {allGarmentsList.map((g) => {
              const isSelected = selectedGarment === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGarment(g.id)}
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

            {/* Button to add a new garment type */}
            <button
              type="button"
              onClick={() => setShowAddGarmentModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-[14px] text-caption font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF] hover:bg-[#7C3AED] hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs"
            >
              <Plus size={15} />
              <span>Autre vêtement</span>
            </button>
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
          {currentList.length === 0 ? (
            <div className="p-6 bg-white rounded-[20px] border border-[#EDE9F6] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center mx-auto">
                <Ruler size={24} />
              </div>
              <div className="text-body-strong font-bold text-[#110E2D]">
                Aucune mesure enregistrée pour {selectedGarmentLabel}
              </div>
              <p className="text-caption text-[#605B80] max-w-xs mx-auto">
                Ce modèle sur mesure n'a pas encore de mesures. Cliquez ci-dessous pour ajouter vos propres mesurations.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md inline-flex items-center space-x-2 active:scale-95"
              >
                <Plus size={16} />
                <span>Ajouter une mesure</span>
              </button>
            </div>
          ) : (
            currentList.map((m) => (
            <div key={m.id} className="p-3.5 rounded-[16px] bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3.5 text-secondary">
                <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                  {getMeasurementIcon(m.iconName)}
                </div>
                <span className="text-body text-primary font-semibold">{m.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {m.valueCm && m.valueCm > 0 ? (
                  <span className="text-body-strong text-[#7C3AED] tabular-nums font-bold text-base pr-1">
                    {m.valueCm} cm
                  </span>
                ) : (
                  <span className="text-caption font-medium text-[#605B80]/40 italic pr-1">
                    ex: -- cm
                  </span>
                )}
                <button
                  onClick={() => {
                    setEditingItem(m);
                    setEditValCm(m.valueCm);
                  }}
                  className="p-1.5 text-[#7C3AED] bg-[#F3E8FF] hover:bg-[#7C3AED] hover:text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Noter la mesure"
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
          )))}
        </div>
      ) : (
        /* History Timeline for Client & Garment */
        <div className="bg-surface rounded-[20px] p-4 border border-subtle space-y-4 shadow-xs">
          <div className="flex items-start space-x-3 pb-3 border-b border-subtle">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0">
              <Check size={16} />
            </div>
            <div>
              <div className="text-body-strong font-bold text-primary">Prise de mesure - {selectedGarmentLabel}</div>
              <div className="text-caption text-secondary">Aujourd'hui • Fiche client de {clientName}</div>
              <p className="text-[12px] text-tertiary mt-1">
                Mensurations enregistrées pour le modèle <strong>{selectedGarmentLabel}</strong> de {clientName} ({clientPhone}).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <History size={16} />
            </div>
            <div>
              <div className="text-body-strong font-bold text-primary">Fiche initiale {clientName}</div>
              <div className="text-caption text-secondary">Création du profil atelier</div>
              <p className="text-[12px] text-tertiary mt-1">Première fiche de mensurations créée pour ce client.</p>
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
      <div className="fixed inset-x-0 bottom-20 z-40 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pointer-events-none flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 ring-4 ring-[#7C3AED]/25"
          title="Ajouter une mesure"
          aria-label="Ajouter une mesure"
        >
          <Plus size={26} />
        </button>
      </div>

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

      {/* Modal: Ajouter un nouveau type de vêtement sur mesure */}
      {showAddGarmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-[#110E2D] rounded-[24px] border border-[#EDE9F6] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE9F6] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="text-body-strong font-bold text-[#110E2D]">
                  Nouveau type de vêtement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGarmentModal(false)}
                className="p-1 text-[#605B80] hover:text-[#110E2D] rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-caption text-[#605B80] font-semibold block mb-1">
                  Nom du modèle / vêtement
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kimono, Tenue de gala, Kamisol..."
                  value={newGarmentLabelInput}
                  onChange={(e) => setNewGarmentLabelInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F2FA] border border-[#EDE9F6] rounded-[14px] text-body font-semibold text-[#110E2D] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGarmentModal(false)}
                className="flex-1 py-2.5 bg-[#F4F2FA] text-[#605B80] hover:bg-[#E9E4F5] rounded-[14px] text-caption font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddCustomGarmentType}
                className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[14px] text-caption font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Check size={16} />
                <span>Créer le modèle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
