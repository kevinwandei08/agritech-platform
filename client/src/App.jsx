import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, Bell, CloudSun, LogOut, User as UserIcon, Package } from 'lucide-react';
import API from './api';
import AgrovetsMap from './components/AgrovetsMap';
import AuthModal from './components/AuthModal';
import FarmManagement from './components/FarmManagement';
import AlertsFeed from './components/AlertsFeed';
import Inventory from './components/Inventory';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('weather');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load existing session on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('agritech_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Session load error:', e);
      }
    }
  }, []);

  // Fetch live weather data from backend
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await API.get('/weather/current?lat=-1.2921&lng=36.8219');
        setWeatherData(response.data);
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agritech_token');
    localStorage.removeItem('agritech_user');
    setUser(null);
  };

  // Clean Navigation Tabs Array
  const navTabs = [
    { id: 'weather', label: 'Weather Insights', icon: CloudSun },
    { id: 'agrovets', label: 'Nearby Agrovets Map', icon: MapPin },
    { id: 'farm', label: 'Farm & Assets', icon: Sprout },
    { id: 'alerts', label: 'System Alerts Feed', icon: Bell },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sprout className="w-8 h-8 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-wide text-emerald-400">Agritech Engine</h1>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-slate-700/80 px-3 py-1.5 rounded-full text-slate-200 border border-slate-600 flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                  {user.full_name || user.email} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-lg transition-colors border border-slate-600"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full flex-grow p-4 md:p-6">
        {/* Navigation Tabs */}
        <nav className="flex space-x-2 border-b border-slate-800 mb-6 overflow-x-auto pb-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab 1: Weather Dashboard */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <CloudSun className="text-amber-400" /> Real-time Agronomic Insights
            </h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading Open-Meteo telemetry...</div>
            ) : weatherData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">
                    Current Conditions
                  </h3>
                  <div className="text-4xl font-extrabold text-amber-400">
                    {weatherData.weather.temperature_celsius}°C
                  </div>
                  <div className="text-sm space-y-1 text-slate-300">
                    <p>
                      Wind Speed:{' '}
                      <span className="font-medium text-white">
                        {weatherData.weather.wind_speed_kmh} km/h
                      </span>
                    </p>
                    <p>
                      Precipitation:{' '}
                      <span className="font-medium text-white">
                        {weatherData.weather.precipitation_mm} mm
                      </span>
                    </p>
                    <p>
                      Humidity:{' '}
                      <span className="font-medium text-white">
                        {weatherData.weather.humidity_percent}%
                      </span>
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">
                    Actionable Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {weatherData.agronomic_insights?.map((insight, idx) => (
                      <li
                        key={idx}
                        className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 text-sm text-slate-200 leading-relaxed"
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-slate-400">
                Sign in to sync your location metrics with backend APIs.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Map View */}
        {activeTab === 'agrovets' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="text-emerald-400" /> Spatial Agrovet & Vet Services
            </h2>
            <AgrovetsMap />
          </div>
        )}

        {/* Tab 3: Farm Management */}
        {activeTab === 'farm' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Sprout className="text-emerald-400" /> Agronomic & Livestock Lifecycle Manager
            </h2>
            <FarmManagement />
          </div>
        )}

        {/* Tab 4: Alerts & Notifications Feed */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Bell className="text-emerald-400" /> System Alerts & Cron Feeds
            </h2>
            <AlertsFeed />
          </div>
        )}

        {/* Tab 4: Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Sprout className="text-emerald-400" /> Inventory & Stock Management
            </h2>
            <Inventory />
          </div>
        )}

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}