import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Star, Navigation, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import API from '../api';
import 'leaflet/dist/leaflet.css';

// Dynamic Leaflet SVG marker factory
const createCustomMarker = (isSelected = false) => {
  const color = isSelected ? '#059669' : '#2563EB'; // Emerald when selected, Blue default
  const scale = isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110';
  
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="transition-transform duration-200 ${scale} flex items-center justify-center">
      <svg width="32" height="42" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });
};

// Map View Controller for fly-to animations
function MapViewController({ selectedAgrovet, agrovets }) {
  const map = useMap();

  useEffect(() => {
    if (selectedAgrovet?.latitude && selectedAgrovet?.longitude) {
      map.flyTo([selectedAgrovet.latitude, selectedAgrovet.longitude], 14, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    } else if (agrovets.length > 0) {
      const validMarkers = agrovets.filter(s => s.latitude && s.longitude);
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map((shop) => [shop.latitude, shop.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [selectedAgrovet, agrovets, map]);

  return null;
}

export default function AgrovetsMap() {
  const [agrovets, setAgrovets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgrovet, setSelectedAgrovet] = useState(null);

  // Default origin coordinates: Watamu (-3.3533, 40.0156)
  const [userLocation, setUserLocation] = useState({ lat: -3.3533, lng: 40.0156 });
  const [searchRadius, setSearchRadius] = useState(50); // km

  const fetchAgrovets = async (lat, lng, radius) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/agrovets?lat=${lat}&lng=${lng}&radius=${radius}`);
      setAgrovets(res.data?.agrovets || []);
    } catch (err) {
      console.error('Failed to load spatial agrovets feed:', err);
      setError('Unable to fetch nearby agrovets. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgrovets(userLocation.lat, userLocation.lng, searchRadius);
  }, [userLocation, searchRadius]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSelectedAgrovet(null);
        },
        () => {
          console.warn('Geolocation denied or unavailable. Falling back to Watamu.');
          setUserLocation({ lat: -3.3533, lng: 40.0156 });
        }
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="text-emerald-600" /> Agrovets GIS Directory
          </h1>
          <p className="text-sm text-gray-500">
            Real-time PostGIS location feed for agro-input suppliers across Kilifi & Malindi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUseMyLocation}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> Recenter Location
          </button>

          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">Radius:</span>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="bg-transparent font-medium text-gray-900 dark:text-white outline-none cursor-pointer"
            >
              <option value={15}>15 km</option>
              <option value={30}>30 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
        {/* Leaflet Spatial Map View */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative z-0">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={11}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewController selectedAgrovet={selectedAgrovet} agrovets={agrovets} />

            {agrovets.map((shop) => (
              <Marker
                key={shop.id}
                position={[shop.latitude, shop.longitude]}
                icon={createCustomMarker(selectedAgrovet?.id === shop.id)}
                eventHandlers={{
                  click: () => setSelectedAgrovet(shop),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[160px]">
                    <h4 className="font-bold text-gray-900 text-sm">{shop.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{shop.address}</p>
                    {shop.rating && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mb-2">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {shop.rating} / 5.0
                      </div>
                    )}
                    {shop.phone && (
                      <a
                        href={`tel:${shop.phone}`}
                        className="inline-flex items-center gap-1 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition"
                      >
                        <Phone className="w-3 h-3" /> Call Supplier
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nearby Stores ({agrovets.length})
            </h2>
            {loading && <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />}
          </div>

          {error ? (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : agrovets.length === 0 && !loading ? (
            <p className="text-xs text-gray-400">No registered agrovets found within range.</p>
          ) : (
            agrovets.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setSelectedAgrovet(shop)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedAgrovet?.id === shop.id
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{shop.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {shop.town || 'Kilifi'} • {shop.address}
                    </p>
                  </div>
                  {shop.distance_km !== undefined && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full shrink-0">
                      {shop.distance_km} km
                    </span>
                  )}
                </div>

                {shop.services && shop.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {shop.services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded capitalize"
                      >
                        {srv.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}