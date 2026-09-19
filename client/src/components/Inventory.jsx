import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    item_name: '',
    category: 'fertilizer',
    quantity: '',
    unit: 'kg',
    reorder_level: 5
  });

  const fetchInventory = async () => {
    try {
      const res = await API.get('/inventory');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // --- Form Validation ---
    const trimmedName = formData.item_name.trim();
    const qty = parseFloat(formData.quantity);
    const reorder = parseFloat(formData.reorder_level);

    if (!trimmedName) {
      setErrorMessage('Please enter a valid item name.');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      setErrorMessage('Quantity must be a valid positive number.');
      return;
    }
    if (isNaN(reorder) || reorder < 0) {
      setErrorMessage('Reorder level must be a non-negative number.');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/inventory', {
        ...formData,
        item_name: trimmedName,
        quantity: qty,
        reorder_level: reorder
      });

      setSuccessMessage(`Successfully added "${trimmedName}" to inventory.`);
      setFormData({ item_name: '', category: 'fertilizer', quantity: '', unit: 'kg', reorder_level: 5 });
      fetchInventory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to save item. Please check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        📦 Farm Inputs & Inventory Management
      </h2>

      {/* Validation Feedback Banners */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-red-400 font-bold ml-4">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Form with Input Controls */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Item Name</label>
          <input
            type="text"
            required
            placeholder="e.g. DAP Fertilizer"
            value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
          >
            <option value="fertilizer">Fertilizer</option>
            <option value="seed">Seeds</option>
            <option value="feed">Animal Feed</option>
            <option value="chemical">Chemical/Pesticide</option>
            <option value="tool">Tools/Equipment</option>
          </select>
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
          <input
            type="text"
            required
            placeholder="kg, bags"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition text-sm disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Adding...' : '+ Add Stock'}
        </button>
      </form>

      {/* Stock Cards Grid */}
      {loading ? (
        <p className="text-gray-400">Loading inventory data...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700">
          <p className="text-gray-400">No stock items added yet. Use the form above to populate your inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isLowStock = parseFloat(item.quantity) <= parseFloat(item.reorder_level);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border shadow-sm transition bg-white ${
                  isLowStock ? 'border-amber-400 ring-1 ring-amber-300' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.item_name}</h3>
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                      {item.category}
                    </span>
                  </div>
                  {isLowStock && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                      ⚠️ Low Stock
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-baseline">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
                    <span className="text-sm text-gray-500 ml-1">{item.unit}</span>
                  </div>
                  <span className="text-xs text-gray-400">Reorder at: {item.reorder_level} {item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}