import React from 'react';
import {
  ChevronRight,
  Palette,
  Check,
  Bell,
  Building,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { TextScale } from '../types';

export const ApparenceView: React.FC = () => {
  const { textScale, setTextScale, brandColor, setBrandColor } = useTheme();

  const colors = [
    { name: 'Violet Signature', hex: '#7C3AED' },
    { name: 'Bleu Taylaxis', hex: '#2563EB' },
    { name: 'Vert Émeraude', hex: '#10B981' },
    { name: 'Orange Chaud', hex: '#D97B1F' },
    { name: 'Rouge Rubis', hex: '#EF4444' },
  ];

  return (
    <div className="-mt-3 pt-6 px-4 pb-mobile-safe bg-canvas rounded-t-[32px] space-y-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-inner">
      {/* Profile Card */}
      <div className="bg-surface rounded-[20px] p-4 border border-subtle flex items-center space-x-4 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-bold text-xl flex items-center justify-center flex-shrink-0">
          N
        </div>
        <div className="flex-1">
          <h2 className="text-body-strong font-bold text-primary text-base">Nasser</h2>
          <p className="text-caption text-secondary">Maître Tailleur • Atelier Principal</p>
          <div className="inline-flex items-center space-x-1 mt-1 text-[11px] font-semibold text-[#10B981] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
            <ShieldCheck size={12} />
            <span>Compte vérifié</span>
          </div>
        </div>
      </div>

      {/* Section: Informations de l'atelier */}
      <div className="space-y-3">
        <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
          Atelier
        </label>
        <div className="bg-surface rounded-[20px] border border-subtle divide-y divide-subtle overflow-hidden shadow-xs">
          <div className="p-4 flex items-center justify-between hover:bg-surface-alt/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Building size={20} className="text-[#7C3AED]" />
              <div>
                <div className="text-body font-semibold text-primary">Nom de l'atelier</div>
                <div className="text-caption text-tertiary">Atelier Nasser Haute Couture</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </div>
        </div>
      </div>

      {/* Section: Couleur d'accentuation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-caption text-secondary font-semibold uppercase tracking-wider">
            Couleur d'accentuation
          </label>
          <span className="text-caption text-[#7C3AED] font-mono font-semibold">{brandColor}</span>
        </div>

        <div className="bg-surface rounded-[20px] p-4 border border-subtle space-y-3 shadow-xs">
          <div className="flex items-center space-x-3 overflow-x-auto pb-1 no-scrollbar">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setBrandColor(c.hex)}
                className="relative w-9 h-9 rounded-full transition-transform active:scale-90 flex-shrink-0 cursor-pointer shadow-xs"
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={`Couleur ${c.name}`}
              >
                {brandColor.toLowerCase() === c.hex.toLowerCase() && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}

            <label
              className="relative w-9 h-9 rounded-full border border-subtle bg-surface-alt flex items-center justify-center cursor-pointer hover:border-[#7C3AED] transition-colors flex-shrink-0"
              title="Choisir une couleur sur mesure"
            >
              <Palette size={16} className="text-secondary" />
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Section: Préférences d'affichage */}
      <div className="space-y-3">
        <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
          Affichage & Langue
        </label>

        <div className="bg-surface rounded-[20px] p-4 border border-subtle space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-body font-semibold text-primary">Taille du texte</span>
            <div className="flex space-x-1 bg-surface-alt p-1 rounded-[12px] border border-subtle">
              {(['small', 'medium', 'large'] as TextScale[]).map((scale) => {
                const labels = { small: 'Petit', medium: 'Moyen', large: 'Grand' };
                const isSelected = textScale === scale;
                return (
                  <button
                    key={scale}
                    onClick={() => setTextScale(scale)}
                    className={`px-3 py-1 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {labels[scale]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-subtle flex items-center justify-between cursor-pointer">
            <span className="text-body font-semibold text-primary">Langue</span>
            <span className="text-caption text-[#7C3AED] font-medium">Français (FR)</span>
          </div>
        </div>
      </div>

      {/* Section: Notifications */}
      <div className="space-y-3">
        <label className="text-caption text-secondary font-semibold uppercase tracking-wider block">
          Notifications
        </label>
        <div className="bg-surface rounded-[20px] border border-subtle divide-y divide-subtle overflow-hidden shadow-xs">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-[#7C3AED]" />
              <span className="text-body font-semibold text-primary">Rappels de livraison</span>
            </div>
            <div className="w-11 h-6 bg-[#7C3AED] rounded-full p-0.5 flex items-center justify-end cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* App Version Info */}
      <div className="pt-4 text-center text-caption text-tertiary space-y-1">
        <div className="flex items-center justify-center space-x-1 text-secondary font-semibold">
          <Info size={16} className="text-[#7C3AED]" />
          <span>Taylaxis v1.0.0</span>
        </div>
        <p>Le carnet numérique du tailleur moderne</p>
      </div>
    </div>
  );
};
