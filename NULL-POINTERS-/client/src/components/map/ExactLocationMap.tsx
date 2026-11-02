import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

const createPin = () => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: #ef4444;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
};

const MapResizer: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

interface ExactLocationMapProps {
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  height?: string;
}

export const ExactLocationMap: React.FC<ExactLocationMapProps> = ({
  lat,
  lng,
  title = 'Hazard Location',
  address,
  height = '200px'
}) => {
  const icon = createPin();

  return (
    <div className="space-y-1.5">
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner relative z-0" style={{ height }}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer lat={lat} lng={lng} />
          <Marker position={[lat, lng]} icon={icon}>
            <Popup>
              <div className="text-xs p-1">
                <strong>{title}</strong>
                {address && <div className="text-slate-500">{address}</div>}
                <div className="font-mono text-[10px]">GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>📍 Pinpoint: <strong>Lat {lat.toFixed(5)}, Lng {lng.toFixed(5)}</strong></span>
        <span className="text-emerald-600 font-bold">✓ Verified Map Coordinates</span>
      </div>
    </div>
  );
};
