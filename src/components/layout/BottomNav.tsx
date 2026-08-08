import React from 'react';
import { Home, Users, ClipboardList, Calendar, User } from 'lucide-react';

export type TabType = 'accueil' | 'clients' | 'commandes' | 'agenda' | 'moi';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ size?: number; className?: string; fill?: string; strokeWidth?: number }> }[] = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'commandes', label: 'Commande', icon: ClipboardList },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'moi', label: 'Moi', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EDE9F6] h-[64px] pb-[env(safe-area-inset-bottom)] px-2 flex items-center justify-around transition-colors max-w-md mx-auto md:max-w-2xl lg:max-w-4xl shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className="flex flex-col items-center justify-center min-w-[56px] h-[52px] py-1 px-2 focus:outline-none cursor-pointer group active:scale-95 transition-transform"
            aria-label={item.label}
          >
            <Icon
              size={22}
              fill={isActive ? '#7C3AED' : 'none'}
              strokeWidth={isActive ? 1.5 : 2}
              className={`transition-all duration-200 ${
                isActive
                  ? 'text-[#7C3AED] scale-110'
                  : 'text-[#928DAA] group-hover:text-[#7C3AED] group-hover:scale-105'
              }`}
            />
            <span
              className={`text-[11px] font-semibold mt-1 leading-tight transition-colors ${
                isActive ? 'text-[#7C3AED]' : 'text-[#928DAA] group-hover:text-[#7C3AED]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
