import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../api';

export default function ProductionTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    entity_type: 'Dairy',
    entity_id: '1',
    quantity: '',
    unit: 'Liters',
    notes: ''
  });

  const fetchProductionLogs = async () => {
    try {
      const res = await API.get('/production');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch yield data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setErrorMessage('Please enter a positive yield quantity.');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/production', formData);
      setFormData({
        log_date: new Date().toISOString().split('T')[0],
        entity_type: 'Dairy',
        entity_id: '1',
        quantity: '',
        unit: 'Liters',
        notes: ''
      });
      fetchProductionLogs();
    } catch (err) {
      setErrorMessage('Failed to save log entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        📈 Daily Production Tracker
      </h2>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Recharts Yield Visualizer */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Production Output Over Time</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading yield trends...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">No production records found in database.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={logs}>
                <defs>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="quantity" stroke="#10b981" fillOpacity={1} fill="url(#colorQty)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Input Form matched to Schema */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Log Date</label>
          <input
            type="date"
            required
            value={formData.log_date}
            onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Entity Type</label>
          <select
            value={formData.entity_type}
            onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-900 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Dairy">Dairy</option>
            <option value="Crops">Crops</option>
            <option value="Poultry">Poultry</option>
            <option value="Livestock">Livestock</option>
          </select>
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Entity ID</label>
          <input
            type="number"
            required
            value={formData.entity_id}
            onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-28">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
          <input
            type="text"
            required
            placeholder="Liters, kg"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition text-sm disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Logging...' : '+ Submit Entry'}
        </button>
      </form>
    </div>
  );
}