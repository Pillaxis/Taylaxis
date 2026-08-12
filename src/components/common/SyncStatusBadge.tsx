import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SyncEngine, type SyncState } from '../../services/syncEngine';

interface SyncStatusBadgeProps {
  userId?: string;
  showText?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ userId, showText = true }) => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);

  useEffect(() => {
    // Update the userId in SyncEngine (init handles dedup internally)
    SyncEngine.init(userId);
    const unsubscribe = SyncEngine.subscribe((state, count) => {
      setSyncState(state);
      setPendingCount(count);
    });
    return unsubscribe;
  }, [userId]);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManualSyncing(true);
    await SyncEngine.sync();
    setTimeout(() => {
      setIsManualSyncing(false);
    }, 600);
  };

  const getBadgeConfig = () => {
    if (isManualSyncing || syncState === 'syncing') {
      return {
        bg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
        icon: <RefreshCw size={13} className="animate-spin text-blue-500" />,
        label: 'Synchronisation...',
      };
    }

    switch (syncState) {
      case 'offline':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400',
          icon: <WifiOff size={13} className="text-amber-500" />,
          label: 'Hors connexion',
        };
      case 'pending_sync':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
          icon: <RefreshCw size={13} className="text-orange-500" />,
          label: pendingCount > 0 ? `${pendingCount} en attente` : 'En attente',
        };
      case 'error':
        return {
          bg: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400',
          icon: <AlertCircle size={13} className="text-red-500" />,
          label: 'Erreur sync',
        };
      case 'synced':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          icon: <CheckCircle2 size={13} className="text-emerald-500" />,
          label: 'Synchronisé',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <button
      onClick={handleManualSync}
      title="Statut de synchronisation - Clic pour tout synchroniser"
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-2xs ${config.bg}`}
    >
      {config.icon}
      {showText && <span>{config.label}</span>}
    </button>
  );
};
