import React from 'react';
import type { StatusType } from '../../types';

interface StatusBadgeProps {
  status: StatusType | string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const getStatusDetails = (st: string) => {
    switch (st) {
      /* V1 Manufacturing Status Badges */
      case 'BROUILLON':
        return { label: 'Brouillon', colorClass: 'text-tertiary bg-surface-alt border border-subtle font-semibold' };
      case 'CONFIRMEE':
        return { label: 'Confirmée', colorClass: 'text-[#2563EB] bg-[#DBEAFE] border border-[#BFDBFE] font-semibold' };
      case 'EN_COURS':
      case 'progress':
        return { label: 'En cours', colorClass: 'text-[#B45309] bg-[#FEF3C7] border border-[#FBBF24] font-semibold' };
      case 'PRETE':
      case 'ready':
        return { label: 'Prête', colorClass: 'text-[#1E40AF] bg-[#DBEAFE] border border-[#BFDBFE] font-semibold' };
      case 'A_LIVRER':
      case 'to_deliver':
        return { label: 'À livrer', colorClass: 'text-[#854D0E] bg-[#FEF08A] border border-[#FDE047] font-semibold' };
      case 'LIVREE':
      case 'done':
        return { label: 'Livrée', colorClass: 'text-[#0F766E] bg-[#CCFBF1] border border-[#99F6E4] font-semibold' };
      case 'TERMINEE':
        return { label: 'Terminée', colorClass: 'text-[#059669] bg-[#D1FAE5] border border-[#A7F3D0] font-semibold' };

      /* Commandes Status Badges aligned 100% with Palette Colors */
      case 'late':
        return { label: 'En retard', colorClass: 'text-[#DC2626] bg-[#FEE2E2] border border-[#FCA5A5] font-semibold' };
      case 'upcoming':
        return { label: 'À venir', colorClass: 'text-[#2563EB] bg-[#DBEAFE] border border-[#BFDBFE] font-semibold' };
      
      /* Client Status Badges aligned 100% with Palette Colors */
      case 'actif':
        return { label: 'Actif', colorClass: 'text-[#059669] bg-[#D1FAE5] border border-[#A7F3D0] font-semibold' };
      case 'inactif':
        return { label: 'Inactif', colorClass: 'text-[#DC2626] bg-[#FEE2E2] border border-[#FCA5A5] font-semibold' };
      case 'nouveau':
      case 'prospect':
        return { label: 'Nouveau', colorClass: 'text-[#2563EB] bg-[#DBEAFE] border border-[#BFDBFE] font-semibold' };
      
      case 'RDV':
        return { label: 'RDV', colorClass: 'text-[#7C3AED] bg-[#F3E8FF] border border-[#E9D5FF] font-semibold' };
      case 'Livraison':
        return { label: 'Livraison', colorClass: 'text-[#854D0E] bg-[#FEF08A] border border-[#FDE047] font-semibold' };
      default:
        return { label: st, colorClass: 'text-secondary bg-surface-alt font-medium' };
    }
  };

  const details = getStatusDetails(status);

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[8px] text-[12px] transition-colors ${details.colorClass}`}
    >
      {customLabel || details.label}
    </span>
  );
};
