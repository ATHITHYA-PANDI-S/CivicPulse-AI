import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, Check, Crosshair } from 'lucide-react';

// Custom Map Marker Pin
const createLocationPin = () => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
      ">
        <div style="
          width: 38px;
          height: 38px;
          background: #ef4444;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 14px rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38]
  });
};

// Popular Coimbatore Landmarks for instant search
const POPULAR_COIMBATORE_SPOTS = [
  { name: 'Cross Cut Road, Gandhipuram', lat: 11.0182, lng: 76.9644, area: 'Gandhipuram' },
  { name: 'DB Road, RS Puram', lat: 11.0094, lng: 76.9465, area: 'RS Puram' },
  { name: '100 Feet Road, Gandhipuram', lat: 11.0205, lng: 76.9632, area: 'Gandhipuram' },
  { name: 'Avinashi Road, Near CIT / Peelamedu', lat: 11.0285, lng: 77.0135, area: 'Peelamedu' },
  { name: 'Tidel Park / IT Corridor, Saravanampatti', lat: 11.0815, lng: 76.9955, area: 'Saravanampatti' },
  { name: 'Brookefields Mall, Sukrawarpettai', lat: 11.0076, lng: 76.9582, area: 'Town Hall' },
  { name: 'Trichy Road / Singanallur Bus Stand', lat: 11.0022, lng: 77.0264, area: 'Singanallur' },
  { name: 'Ukkadam Bus Stand & Periyakulam Lake', lat: 10.9912, lng: 76.9610, area: 'Ukkadam' },
  { name: 'Race Course Road Promenade', lat: 11.0042, lng: 76.9748, area: 'Race Course' },
  { name: 'Saibaba Temple / NSR Road, Saibaba Colony', lat: 11.0272, lng: 76.9442, area: 'Saibaba Colony' },
  { name: 'Marudhamalai Main Road, Vadavalli', lat: 11.0245, lng: 76.9022, area: 'Vadavalli' },
  { name: 'Thudiyalur Junction, Mettupalayam Road', lat: 11.0782, lng: 76.9431, area: 'Thudiyalur' },
  { name: 'Ramanathapuram 80 Feet Road', lat: 10.9992, lng: 76.9862, area: 'Ramanathapuram' },
  { name: 'Coimbatore Railway Junction', lat: 10.9982, lng: 76.9682, area: 'Town Hall' },
  { name: 'Coimbatore International Airport (CJB)', lat: 11.0305, lng: 77.0435, area: 'Kalapatti' }
];

interface LocationPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number, approxAddress?: string) => void;
  height?: string;
}

// Click to drop / move pin
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Auto-recenter and resize map
const MapController: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  lat,
  lng,
  onLocationSelect,
  height = '340px'
}) => {
  const customIcon = useMemo(() => createLocationPin(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof POPULAR_COIMBATORE_SPOTS>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const filtered = POPULAR_COIMBATORE_SPOTS.filter(s => 
      s.name.toLowerCase().includes(q.toLowerCase()) || 
      s.area.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(filtered);
    setIsSearching(true);
  };

  const handleSelectSpot = (spot: typeof POPULAR_COIMBATORE_SPOTS[0]) => {
    onLocationSelect(spot.lat, spot.lng, `${spot.name}, Coimbatore`);
    setSearchQuery(spot.name);
    setIsSearching(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationSelect(
            pos.coords.latitude, 
            pos.coords.longitude, 
            `Live GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}), Coimbatore`
          );
        },
        () => {
          // Fallback to Gandhipuram central
          onLocationSelect(11.0168, 76.9558, 'Gandhipuram Central, Coimbatore');
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Search Bar + GPS Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search Coimbatore landmark / street (e.g. Cross Cut Road, DB Road, Tidel Park)..."
            className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-civic-500 shadow-2xs"
          />

          {/* Autocomplete Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 max-h-48 overflow-y-auto py-1 text-xs">
              {searchResults.map((spot, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSpot(spot)}
                  className="px-3.5 py-2 hover:bg-civic-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{spot.name}</span>
                  <span className="text-[10px] text-civic-600 dark:text-civic-400 font-bold">{spot.area}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shrink-0"
        >
          <Navigation className="w-3.5 h-3.5 mr-1.5" />
          Use My Live GPS
        </button>
      </div>

      {/* Map Interactive Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-lg" style={{ height }}>
        
        {/* Floating Instruction Banner */}
        <div className="absolute top-3 left-3 right-3 z-[400] pointer-events-none flex justify-center">
          <div className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            Click anywhere on the map or drag the pin to set exact spot
          </div>
        </div>

        <MapContainer
          center={[lat || 11.0168, lng || 76.9558]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController lat={lat || 11.0168} lng={lng || 76.9558} />
          <MapClickHandler onLocationSelect={onLocationSelect} />
          <Marker
            position={[lat || 11.0168, lng || 76.9558]}
            icon={customIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onLocationSelect(position.lat, position.lng);
              }
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong>Exact Hazard Location</strong>
                <div>Lat: {lat.toFixed(5)}</div>
                <div>Lng: {lng.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Accurate GPS telemetry status footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Exact GPS Coordinates:
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>

        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> High Precision Pin Set
        </span>
      </div>

    </div>
  );
};
