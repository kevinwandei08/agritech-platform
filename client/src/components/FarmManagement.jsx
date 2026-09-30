import React, { useState, useEffect } from 'react';
import { Sprout, Milk, Plus, Calendar, Activity, TrendingUp, CheckCircle, X } from 'lucide-react';
import ProductionTracker from './ProductionTracker';
import YieldAnalytics from './YieldAnalytics';
import API from '../api';

export default function FarmManagement() {
  const [activeSubTab, setActiveSubTab] = useState('crops');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initial records for Coffee, Tea, and Dairy
  const [crops, setCrops] = useState([
    {
      id: 1,
      name: 'Arabica Coffee Block A',
      type: 'Coffee',
      variety: 'SL28 / Ruiru 11',
      plantingDate: '2023-04-15',
      stage: 'Berry Development',
      progressPct: 65,
      acreage: '2.5 Acres',
      expectedHarvest: '2026-11-01',
      healthStatus: 'Good'
    },
    {
      id: 2,
      name: 'Highland Purple Tea',
      type: 'Tea',
      variety: 'TRFK 306',
      plantingDate: '2022-09-10',
      stage: 'Active Plucking',
      progressPct: 90,
      acreage: '4.0 Acres',
      expectedHarvest: 'Bi-weekly',
      healthStatus: 'Optimal'
    }
  ]);

  const [livestock, setLivestock] = useState([
    {
      id: 1,
      tag: 'COW-0104',
      name: 'Bessie',
      breed: 'Friesian / Holstein',
      dob: '2022-01-12',
      stage: 'Lactation Cycle 2',
      dailyYieldLiters: 24.5,
      lactationDay: 110,
      healthStatus: 'Healthy',
      lastVaccinated: '2026-06-15'
    },
    {
      id: 2,
      tag: 'COW-0219',
      name: 'Daisy',
      breed: 'Ayrshire',
      dob: '2023-05-20',
      stage: 'In-Calf (Pregnancy)',
      dailyYieldLiters: 14.0,
      lactationDay: 210,
      healthStatus: 'Monitoring',
      lastVaccinated: '2026-05-10'
    }
  ]);

  // Track the active asset for top analytics graph & CSV export engine
  const [selectedAsset, setSelectedAsset] = useState({
    type: 'crop',
    id: 1,
    name: 'Arabica Coffee Block A'
  });

  // Form State
  const [cropForm, setCropForm] = useState({ name: '', type: 'Coffee', variety: '', plantingDate: '', acreage: '', stage: 'Planting' });
  const [livestockForm, setLivestockForm] = useState({ tag: '', name: '', breed: 'Friesian', dob: '', dailyYieldLiters: '', stage: 'Lactation' });

  // Fetch backend records, fallback to initial state
  useEffect(() => {
    const loadFarmData = async () => {
      setLoading(true);
      try {
        const [cropRes, livestockRes] = await Promise.allSettled([
          API.get('/crops'),
          API.get('/livestock')
        ]);

        if (cropRes.status === 'fulfilled' && cropRes.value.data?.crops) {
          setCrops(cropRes.value.data.crops);
        }
        if (livestockRes.status === 'fulfilled' && livestockRes.value.data?.livestock) {
          setLivestock(livestockRes.value.data.livestock);
        }
      } catch (err) {
        console.log('Using offline data for crops/livestock');
      } finally {
        setLoading(false);
      }
    };

    loadFarmData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveSubTab(tab);
    if (tab === 'crops' && crops.length > 0) {
      setSelectedAsset({ type: 'crop', id: crops[0].id, name: crops[0].name });
    } else if (tab === 'livestock' && livestock.length > 0) {
      setSelectedAsset({ type: 'livestock', id: livestock[0].id, name: livestock[0].name || livestock[0].tag });
    }
  };

  const handleAddCrop = (e) => {
    e.preventDefault();
    const newEntry = {
      ...cropForm,
      id: Date.now(),
      progressPct: 20,
      healthStatus: 'Good',
      expectedHarvest: 'Pending'
    };
    setCrops([newEntry, ...crops]);
    setShowAddModal(false);
    setCropForm({ name: '', type: 'Coffee', variety: '', plantingDate: '', acreage: '', stage: 'Planting' });
  };

  const handleAddLivestock = (e) => {
    e.preventDefault();
    const newEntry = {
      ...livestockForm,
      id: Date.now(),
      dailyYieldLiters: parseFloat(livestockForm.dailyYieldLiters) || 0,
      lactationDay: 1,
      healthStatus: 'Healthy',
      lastVaccinated: new Date().toISOString().split('T')[0]
    };
    setLivestock([newEntry, ...livestock]);
    setShowAddModal(false);
    setLivestockForm({ tag: '', name: '', breed: 'Friesian', dob: '', dailyYieldLiters: '', stage: 'Lactation' });
  };

  return (
    <div className="space-y-6">
      {/* Module Header & Tab Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTabChange('crops')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'crops'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Coffee & Tea Blocks ({crops.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('livestock')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'livestock'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>Dairy Herd ({livestock.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeSubTab === 'crops' ? 'Crop Block' : 'Animal'}</span>
        </button>
      </div>

      {/* Embedded Analytics Chart & CSV Exporter */}
      <YieldAnalytics
        entityType={selectedAsset.type}
        entityId={selectedAsset.id}
        entityName={selectedAsset.name}
      />

      {/* CROPS SUBTAB */}
      {activeSubTab === 'crops' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crops.map((crop) => (
            <div
              key={crop.id}
              onClick={() => setSelectedAsset({ type: 'crop', id: crop.id, name: crop.name })}
              className={`bg-slate-800 rounded-xl p-5 border space-y-4 transition-all shadow-lg flex flex-col justify-between cursor-pointer ${
                selectedAsset.id === crop.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {crop.type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-2">{crop.name}</h3>
                    <p className="text-xs text-slate-400">Variety: <span className="text-slate-200 font-medium">{crop.variety}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Acreage</span>
                    <p className="text-sm font-bold text-slate-200">{crop.acreage}</p>
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" /> Current Stage:
                    </span>
                    <span className="font-bold text-amber-400">{crop.stage}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${crop.progressPct || 50}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="block text-slate-500 text-[10px] uppercase">Planted</span>
                      <span className="font-semibold">{crop.plantingDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="block text-slate-500 text-[10px] uppercase">Est. Harvest</span>
                      <span className="font-semibold">{crop.expectedHarvest}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Production Log Input with isolated props */}
              <div className="mt-2 pt-3 border-t border-slate-700/80">
                <ProductionTracker 
                  entityType="crop" 
                  entityId={crop.id} 
                  entityName={crop.name} 
                  unit="kg" 
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIVESTOCK SUBTAB */}
      {activeSubTab === 'livestock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {livestock.map((cow) => (
            <div
              key={cow.id}
              onClick={() => setSelectedAsset({ type: 'livestock', id: cow.id, name: cow.name || cow.tag })}
              className={`bg-slate-800 rounded-xl p-5 border space-y-4 transition-all shadow-lg flex flex-col justify-between cursor-pointer ${
                selectedAsset.id === cow.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {cow.tag}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-2">{cow.name}</h3>
                    <p className="text-xs text-slate-400">Breed: <span className="text-slate-200 font-medium">{cow.breed}</span></p>
                  </div>
                  <div className="text-right bg-emerald-950/60 border border-emerald-800/80 px-3 py-2 rounded-xl">
                    <span className="block text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Daily Milk</span>
                    <span className="text-xl font-extrabold text-emerald-300">{cow.dailyYieldLiters} L</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Reproductive Stage</span>
                    <span className="font-bold text-indigo-300">{cow.stage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Days in Lactation</span>
                    <span className="font-bold text-slate-200">{cow.lactationDay} Days</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/60">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Health: <strong className="text-slate-200">{cow.healthStatus}</strong>
                  </span>
                  <span>Vaccinated: <strong className="text-slate-300">{cow.lastVaccinated}</strong></span>
                </div>
              </div>

              {/* Embedded Production Log Input with isolated props */}
              <div className="mt-2 pt-3 border-t border-slate-700/80">
                <ProductionTracker 
                  entityType="livestock" 
                  entityId={cow.id} 
                  entityName={cow.name || cow.tag} 
                  unit="Liters" 
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {activeSubTab === 'crops' ? <Sprout className="text-emerald-400" /> : <Milk className="text-indigo-400" />}
              Add New {activeSubTab === 'crops' ? 'Crop Block' : 'Dairy Cattle'}
            </h3>

            {activeSubTab === 'crops' ? (
              <form onSubmit={handleAddCrop} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Block Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lower Tea Section B"
                    value={cropForm.name}
                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Type</label>
                    <select
                      value={cropForm.type}
                      onChange={(e) => setCropForm({ ...cropForm, type: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Coffee">Coffee</option>
                      <option value="Tea">Tea</option>
                      <option value="Maize">Maize</option>
                      <option value="Avocado">Avocado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Variety/Clone</label>
                    <input
                      type="text"
                      placeholder="e.g., SL28 or TRFK 306"
                      value={cropForm.variety}
                      onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Planting Date</label>
                    <input
                      type="date"
                      required
                      value={cropForm.plantingDate}
                      onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Acreage / Area</label>
                    <input
                      type="text"
                      placeholder="e.g., 2.5 Acres"
                      value={cropForm.acreage}
                      onChange={(e) => setCropForm({ ...cropForm, acreage: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2 cursor-pointer"
                >
                  Save Crop Block
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddLivestock} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Ear Tag / ID</label>
                    <input
                      type="text"
                      required
                      placeholder="COW-0301"
                      value={livestockForm.tag}
                      onChange={(e) => setLivestockForm({ ...livestockForm, tag: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Animal Name</label>
                    <input
                      type="text"
                      placeholder="Bella"
                      value={livestockForm.name}
                      onChange={(e) => setLivestockForm({ ...livestockForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Breed</label>
                    <select
                      value={livestockForm.breed}
                      onChange={(e) => setLivestockForm({ ...livestockForm, breed: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Friesian">Friesian</option>
                      <option value="Ayrshire">Ayrshire</option>
                      <option value="Guernsey">Guernsey</option>
                      <option value="Jersey">Jersey</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Yield (Liters)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="18.5"
                      value={livestockForm.dailyYieldLiters}
                      onChange={(e) => setLivestockForm({ ...livestockForm, dailyYieldLiters: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2 cursor-pointer"
                >
                  Save Dairy Animal
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}