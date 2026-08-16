import React, { useState, useEffect, useRef } from 'react';
import { NotificationItem, Item } from '../types';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  addNotification,
} from '../utils/storage';
import { Bell, Sparkles, Shield, Check, Trash2, CheckCircle2, MessageSquare, Zap, ExternalLink } from 'lucide-react';

interface NotificationsDropdownProps {
  onSelectItemById?: (itemId: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  onSelectItemById,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reloadNotifications = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    reloadNotifications();
    const interval = setInterval(reloadNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSimulateAlert = () => {
    const demoAlerts = [
      {
        title: '⚡ 96% AI Smart Match Alert!',
        message: 'A Black Casio Scientific Calculator FX-991EX was just logged at Central Library Table 14.',
        type: 'match' as const,
        matchScore: 96,
        linkItemId: 'item-demo-01',
      },
      {
        title: '🛡️ Custody Logged: Security Desk #1',
        message: 'Wildcraft Backpack #FND-CAMPUS-2026-01890 transferred into Student Affairs Lost Box.',
        type: 'system' as const,
        linkItemId: 'item-demo-03',
      },
      {
        title: '💬 Secure Message Received',
        message: 'Campus Security: "Your item is ready for verified pickup with student ID."',
        type: 'chat' as const,
        linkItemId: 'item-demo-01',
      },
    ];

    const pick = demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
    addNotification({
      userId: 'current',
      ...pick,
    });
    reloadNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 transition-all shadow-xs"
        title="Notifications & Smart Alerts"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-2 border-orange-200 rounded-3xl shadow-2xl z-50 overflow-hidden text-slate-800 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-orange-500 text-white rounded-lg">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-black text-slate-900">Live Alerts & Matches</h4>
                <p className="text-[10px] text-slate-500">
                  {unreadCount} unread system notifications
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAllNotificationsRead();
                    reloadNotifications();
                  }}
                  className="text-[11px] font-bold text-orange-700 hover:underline px-2 py-1"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Simulate Alert Action Button */}
          <div className="px-3 py-2 bg-orange-100/60 border-b border-orange-200 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-900 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              <span>Real-Time Engine</span>
            </span>
            <button
              onClick={handleSimulateAlert}
              className="text-[10px] font-black bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1 rounded-lg transition-all shadow-2xs"
            >
              + Trigger Match Alert
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-orange-50 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-600">All caught up!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No notifications at this time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    reloadNotifications();
                    if (n.linkItemId && onSelectItemById) {
                      onSelectItemById(n.linkItemId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start space-x-3 ${
                    n.isRead
                      ? 'bg-white hover:bg-slate-50 opacity-80'
                      : 'bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200/80 shadow-2xs'
                  }`}
                >
                  <span
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      n.type === 'match'
                        ? 'bg-amber-100 text-amber-800'
                        : n.type === 'chat'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {n.type === 'match' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : n.type === 'chat' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-900 truncate pr-1">
                        {n.title}
                      </h5>
                      <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    {n.matchScore && (
                      <div className="mt-1 flex items-center space-x-1.5">
                        <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-sm">
                          {n.matchScore}% Match Score
                        </span>
                        <span className="text-[10px] text-orange-600 font-bold flex items-center space-x-0.5">
                          <span>Inspect</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-orange-100 flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={() => {
                  clearAllNotifications();
                  reloadNotifications();
                }}
                className="text-[11px] text-rose-600 hover:underline flex items-center space-x-1 font-bold"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear all</span>
              </button>
              <span className="text-[10px] text-slate-400">Real-time alerts active</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
