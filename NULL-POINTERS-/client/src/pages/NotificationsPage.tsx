import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter 
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filterType, setFilterType] = useState('all');

  const filtered = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'emergency') return n.type === 'emergency';
    if (filterType === 'unread') return !n.isRead;
    return n.type === filterType;
  });

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.complaintId) {
      if (role === 'citizen') {
        navigate(`/citizen/complaints/${n.complaintId}`);
      } else {
        navigate(`/authority/complaints/${n.complaintId}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-civic-600" />
            Civic Alert & Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time municipal dispatches, emergency alerts, crowd escalations, and resolution confirmations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-2xs transition"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 text-civic-600" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            filterType === 'all'
              ? 'bg-civic-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Alerts ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('unread')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            filterType === 'unread'
              ? 'bg-civic-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilterType('emergency')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 ${
            filterType === 'emergency'
              ? 'bg-red-600 text-white shadow-2xs'
              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
          }`}
        >
          <Flame className="w-3 h-3 fill-current" />
          Emergencies Only
        </button>

        <button
          onClick={() => setFilterType('prediction')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            filterType === 'prediction'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50'
          }`}
        >
          Predictive Risks
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map(n => {
          let badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
          let Icon = Bell;

          if (n.type === 'emergency') {
            badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse';
            Icon = Flame;
          } else if (n.type === 'resolution') {
            badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
            Icon = CheckCircle2;
          } else if (n.type === 'prediction') {
            badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
            Icon = Sparkles;
          }

          return (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 rounded-3xl border transition cursor-pointer flex items-start space-x-4 shadow-sm ${
                n.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-blue-50/70 dark:bg-slate-800/80 border-blue-200 dark:border-slate-700 text-slate-900 dark:text-white ring-1 ring-civic-500/20'
              }`}
            >
              <div className={`p-2.5 rounded-2xl ${badgeColor} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {n.message}
                </p>

                {n.complaintId && (
                  <div className="pt-2 flex items-center text-civic-600 dark:text-civic-400 font-bold text-[11px]">
                    Inspect Complaint Details <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No notifications in this view.
          </div>
        )}
      </div>

    </div>
  );
};
