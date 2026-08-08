import React, { useState } from 'react';
import { X, Bell, AlertTriangle, Clock, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'late' | 'appointment' | 'payment';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  targetView: 'commandes' | 'agenda' | 'client';
  targetClientId?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUnreadCount?: (count: number) => void;
  onNavigateToCommandes: () => void;
  onNavigateToAgenda: () => void;
  onSelectClient: (clientId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onUpdateUnreadCount,
  onNavigateToCommandes,
  onNavigateToAgenda,
  onSelectClient,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    if (onUpdateUnreadCount) onUpdateUnreadCount(0);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    if (onUpdateUnreadCount) onUpdateUnreadCount(updated.filter((n) => !n.isRead).length);
  };

  const handleItemClick = (notification: NotificationItem) => {
    // 1. Mark notification as read
    const updated = notifications.map((n) =>
      n.id === notification.id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    if (onUpdateUnreadCount) onUpdateUnreadCount(updated.filter((n) => !n.isRead).length);

    // 2. Close Modal
    onClose();

    // 3. Trigger dedicated page navigation
    if (notification.targetView === 'commandes') {
      onNavigateToCommandes();
    } else if (notification.targetView === 'agenda') {
      onNavigateToAgenda();
    } else if (notification.targetView === 'client' && notification.targetClientId) {
      onSelectClient(notification.targetClientId);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'late':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
        );
      case 'appointment':
        return (
          <div className="w-9 h-9 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
        );
      case 'payment':
        return (
          <div className="w-9 h-9 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface rounded-[24px] border border-subtle w-full max-w-md shadow-2xl overflow-hidden space-y-3 p-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-subtle">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-h2 font-bold text-primary">Notifications</h3>
              {unreadCount > 0 ? (
                <p className="text-caption text-[#7C3AED] font-semibold">
                  {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-caption text-tertiary">Toutes les notifications sont lues</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[12px] font-semibold text-[#7C3AED] hover:underline cursor-pointer"
              >
                Tout lire
              </button>
            )}
            <button
              onClick={onClose}
              className="text-tertiary hover:text-primary p-1 rounded-full cursor-pointer"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-caption text-tertiary space-y-1">
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 rounded-[16px] border transition-all flex items-start justify-between space-x-3 cursor-pointer active:scale-98 white-element-hover ${
                  n.isRead
                    ? 'bg-surface-alt/40 border-subtle/50 opacity-75'
                    : 'bg-surface border-[#7C3AED]/25 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getIcon(n.type)}
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-body-strong font-bold text-primary text-sm flex items-center gap-1">
                        <span>{n.title}</span>
                        <ExternalLink size={12} className="text-[#7C3AED] opacity-70" />
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                      )}
                    </div>
                    <p className="text-caption text-secondary text-[13px] leading-snug">
                      {n.description}
                    </p>
                    <span className="text-[11px] text-tertiary block pt-0.5">{n.time}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDismiss(n.id, e)}
                  className="text-tertiary hover:text-[#EF4444] p-1 cursor-pointer transition-colors"
                  aria-label="Supprimer notification"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#7C3AED] text-white rounded-[14px] text-body-strong font-semibold hover:bg-[#6D28D9] cursor-pointer shadow-xs active:scale-98 transition-all"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
