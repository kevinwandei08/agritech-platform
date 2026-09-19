import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Info, CheckCircle2, RefreshCw, BellOff, Send, Loader2 } from 'lucide-react';
import API from '../api';

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dispatchingId, setDispatchingId] = useState(null);
  const [sentAlertIds, setSentAlertIds] = useState([]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/alerts');
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Failed to load alerts feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAsRead = async (id) => {
    try {
      if (typeof id === 'string' && id.startsWith('wx-')) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
        return;
      }
      await API.patch(`/alerts/${id}/read`);
      setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch('/alerts/read-all');
      setAlerts(alerts.map(a => ({ ...a, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDispatchWhatsApp = async (alert) => {
    setDispatchingId(alert.id);
    try {
      await API.post('/alerts/notify-whatsapp', {
        alertTitle: alert.title,
        alertDescription: alert.description
      });
      setSentAlertIds(prev => [...prev, alert.id]);
    } catch (err) {
      alert('Could not send WhatsApp message. Please check server Twilio setup.');
    } finally {
      setDispatchingId(null);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-rose-950/30 border-rose-800 text-rose-200',
          badge: 'bg-rose-900/60 text-rose-300 border-rose-700',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/30 border-amber-800 text-amber-200',
          badge: 'bg-amber-900/60 text-amber-300 border-amber-700',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        };
      default:
        return {
          bg: 'bg-sky-950/30 border-sky-800 text-sky-200',
          badge: 'bg-sky-900/60 text-sky-300 border-sky-700',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />
        };
    }
  };

  const filteredAlerts = filter === 'unread' ? alerts.filter(a => !a.read) : alerts;
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Automated Risk & Disease Advisories
            {unreadCount > 0 && (
              <span className="text-xs bg-rose-600 text-white font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time agro-climatic predictions, disease vectors, and system updates</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark All Read
            </button>
          )}
          <button
            onClick={fetchAlerts}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Feed
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-3 text-xs font-medium">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${filter === 'all' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          All Notifications ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition ${filter === 'unread' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400">Loading advisories...</p>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/60">
            <BellOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No advisories found.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const isSent = sentAlertIds.includes(alert.id);
            const isSending = dispatchingId === alert.id;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start justify-between gap-4 ${style.bg} ${alert.read ? 'opacity-60' : 'opacity-100'}`}
              >
                <div className="flex items-start gap-3">
                  {style.icon}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${style.badge}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-400">{alert.source}</span>
                      <span className="text-xs text-slate-500">• {alert.timestamp}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">{alert.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleDispatchWhatsApp(alert)}
                    disabled={isSending || isSent}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 border cursor-pointer ${
                      isSent
                        ? 'bg-slate-900 border-emerald-800 text-emerald-400'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSent ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isSending ? 'Dispatching...' : isSent ? 'Sent to WhatsApp' : 'Dispatch WhatsApp'}</span>
                  </button>

                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      title="Mark as read"
                      className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}