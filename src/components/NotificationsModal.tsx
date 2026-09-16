import React from 'react';
import { FloorNotification } from '../types';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface NotificationsModalProps {
  notifications: FloorNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
  onRequestPermission: () => void;
  permissionStatus: NotificationPermission;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onMarkAllRead,
  onClearAll,
  onClose,
  onRequestPermission,
  permissionStatus
}) => {
  const getIcon = (type: FloorNotification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Notifications &amp; Floor Alerts</h2>
              <div className="text-[11px] text-slate-500">
                {notifications.filter(n => !n.read).length} unread alerts
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Web Push Permission Banner */}
        {permissionStatus !== 'granted' && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
            <span>Enable browser push notifications for real-time plant alerts.</span>
            <button
              onClick={onRequestPermission}
              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 transition"
            >
              Enable
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No recent notifications or alerts.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border transition ${
                  n.read
                    ? 'bg-slate-50/60 border-slate-100 text-slate-600'
                    : 'bg-white border-blue-200 shadow-2xs text-slate-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllRead}
            disabled={notifications.length === 0}
            className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
};
