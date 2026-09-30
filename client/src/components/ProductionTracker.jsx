import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../api';

export default function ProductionTracker({ 
  entityType = 'crop', 
  entityId = 1, 
  entityName = '', 
  unit = 'kg' 
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    quantity: '',
    notes: ''
  });

  // Fetch production logs specifically for this entity (crop/livestock & ID)
  const fetchProductionLogs = async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const res = await API.get('/production', {
        params: { 
          entity_type: entityType, 
          entity_id: entityId 
        }
      });
      const fetchedLogs = res.data.logs || res.data.data || (Array.isArray(res.data) ? res.data : []);
      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Failed to fetch yield data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionLogs();
  }, [entityType, entityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setErrorMessage('Please enter a positive yield quantity.');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        log_date: formData.log_date,
        entity_type: entityType,
        entity_id: entityId,
        quantity: parseFloat(formData.quantity),
        unit: unit,
        notes: formData.notes
      };

      await API.post('/production', payload);
      
      // Reset form quantity and notes
      setFormData(prev => ({
        ...prev,
        quantity: '',
        notes: ''
      }));

      // Refresh log feed
      fetchProductionLogs();
    } catch (err) {
      console.error('Submit Yield Error:', err);
      setErrorMessage('Failed to save yield entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Recharts Yield Visualizer */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Yield History: <span className="text-emerald-400">{entityName}</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Unit: {unit}</span>
        </div>

        {loading ? (
          <p className="text-slate-500 text-xs py-6 text-center">Loading yield records...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-500 text-xs py-6 text-center">No yield records for this asset yet.</p>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={logs}>
                <defs>
                  <linearGradient id={`colorQty_${entityType}_${entityId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} />
                <Area type="monotone" dataKey="quantity" stroke="#10b981" fillOpacity={1} fill={`url(#colorQty_${entityType}_${entityId})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Input Form embedded directly inside card */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex flex-wrap gap-2.5 items-end text-xs">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date</label>
          <input
            type="date"
            required
            value={formData.log_date}
            onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="w-28">
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Output ({unit})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Notes / Remarks</label>
          <input
            type="text"
            placeholder="e.g. Morning milking or Batch A plucking"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition duration-150 disabled:opacity-50 cursor-pointer text-xs"
        >
          {submitting ? 'Saving...' : '+ Log Yield'}
        </button>
      </form>
    </div>
  );
}