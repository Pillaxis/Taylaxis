import React, { useState } from 'react';
import { Bell, ChevronLeft, Search, X } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  isHome?: boolean;
  userName?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearchIcon?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isHome = false,
  userName,
  showBack = false,
  onBack,
  showSearchIcon = false,
  searchPlaceholder = 'Rechercher...',
  searchValue = '',
  onSearchChange,
  onNotificationClick,
  unreadCount = 3,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-40 bg-[#0C0A27]/95 backdrop-blur-md border-b border-white/5 text-white pt-4 px-4 space-y-3 transition-colors ${isHome ? 'pb-3' : 'pb-3.5 shadow-lg'}`}>
      {/* Top Bar: Title/Logo + Cloche + Loupe 🔍 */}
      <div className="flex items-center justify-between min-h-[36px]">
        <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
          {showBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer active:scale-95 flex-shrink-0"
              aria-label="Retour"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {isHome ? (
            <h1 className="text-2xl font-bold tracking-tight text-white">Taylaxis</h1>
          ) : (
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {title}
              </h1>
              {subtitle && <p className="text-caption text-white/70 mt-0.5 truncate">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Action Icons: 1. Cloche Notification, 2. Loupe de Recherche 🔍 */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">

          {/* 1. Cloche Notification */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-white hover:bg-white/10 rounded-full transition-all cursor-pointer active:scale-95"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0C0A27] shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 2. Loupe de Recherche 🔍 (For non-home pages) */}
          {showSearchIcon && (
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition-all cursor-pointer active:scale-95 ${
                isSearchOpen || searchValue
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Rechercher"
            >
              {isSearchOpen && !searchValue ? <X size={20} /> : <Search size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Sub-header text on Home Page only */}
      {isHome && (
        <div className="pt-0.5">
          <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
            Bonjour, {userName || 'Tailleur'} <span className="text-xl">👋</span>
          </h2>
          <p className="text-caption text-white/70 mt-0.5">Voici l'activité de votre atelier</p>
        </div>
      )}

      {/* Expandable Search Input Bar (Toggled via Loupe 🔍 or when typing) */}
      {showSearchIcon && (isSearchOpen || searchValue) && (
        <div className="relative pt-1 animate-fadeIn">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            autoFocus
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-white/10 border border-white/20 rounded-[14px] text-body text-white placeholder-white/50 focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
