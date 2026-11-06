import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, Package, CreditCard, ShieldAlert, Ticket } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification
}) => {
  const [filterUnread, setFilterUnread] = useState(false);

  const displayList = filterUnread ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package size={16} className="text-[#00f0ff]" />;
      case 'ticket':
        return <Ticket size={16} className="text-amber-400" />;
      case 'payment':
        return <CreditCard size={16} className="text-emerald-400" />;
      case 'security':
        return <ShieldAlert size={16} className="text-red-400" />;
      case 'alert':
      default:
        return <AlertTriangle size={16} className="text-cyan-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md h-full bg-[#0b1739] border-l border-cyan-500/20 text-white flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-[#070d1e] border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="text-[#00f0ff]" size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Notifications</h3>
                  <p className="text-[11px] text-slate-400">{unreadCount} unread system alerts</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50">
                <X size={18} />
              </button>
            </div>

            {/* Filter and Action Bar */}
            <div className="p-3 bg-[#0a122c] border-b border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setFilterUnread(!filterUnread)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterUnread ? 'bg-[#00f0ff] text-slate-950' : 'bg-slate-900 text-slate-300'
                }`}
              >
                {filterUnread ? 'Unread Only' : 'All Alerts'}
              </button>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[11px] font-bold text-[#00f0ff] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {displayList.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <Bell className="mx-auto mb-2 opacity-30" size={36} />
                  <p className="text-xs font-bold">No notifications</p>
                </div>
              ) : (
                displayList.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) onMarkAsRead(n.id);
                      if (onSelectNotification) onSelectNotification(n);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      !n.read 
                        ? 'bg-[#101e46] border-cyan-500/40 text-white shadow-md' 
                        : 'bg-[#070d1e] border-slate-800/80 text-slate-300 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{n.title}</h4>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
