import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, RiskZone } from '../../types';
import { PriorityScoreBadge } from '../common/PriorityScoreBadge';
import { StatusBadge } from '../common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Flame, ShieldAlert, ArrowUpRight } from 'lucide-react';

// Custom SVG Leaflet Icons
const createCustomIcon = (color: string, label: string, isEmergency = false) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: ${isEmergency ? '34px' : '28px'};
        height: ${isEmergency ? '34px' : '28px'};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: ${isEmergency ? '12px' : '10px'};
        ${isEmergency ? 'animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''}
      ">
        ${label}
      </div>
    `,
    iconSize: isEmergency ? [34, 34] : [28, 28],
    iconAnchor: isEmergency ? [17, 17] : [14, 14],
    popupAnchor: [0, -14]
  });
};

interface Props {
  complaints: Complaint[];
  riskZones?: RiskZone[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  showFilters?: boolean;
}

export const LeafletComplaintMap: React.FC<Props> = ({
  complaints,
  riskZones = [],
  height = '500px',
  center = [11.0168, 76.9558],
  zoom = 12,
  showFilters = true
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'emergency' | 'high' | 'risk_zones' | 'resolved'>('all');

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'emergency') return c.isEmergency && c.status !== 'resolved';
    if (filter === 'high') return c.severity === 'high' && c.status !== 'resolved';
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'risk_zones') return false;
    return true;
  });

  const showRiskZones = filter === 'all' || filter === 'risk_zones';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900">
      
      {/* Map Filter Controls Overlay */}
      {showFilters && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-civic-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({complaints.length})
          </button>
          <button
            onClick={() => setFilter('emergency')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              filter === 'emergency'
                ? 'bg-red-600 text-white'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <Flame className="w-3 h-3 fill-current" />
            Emergencies
          </button>
          <button
            onClick={() => setFilter('risk_zones')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'risk_zones'
                ? 'bg-purple-600 text-white'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            Risk Zones ({riskZones.length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Resolved
          </button>
        </div>
      )}

      {/* Leaflet Map Component */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Complaint Markers */}
        {filteredComplaints.map(c => {
          let pinColor = '#3b82f6'; // blue
          let label = 'M';
          if (c.isEmergency) {
            pinColor = '#dc2626'; // red
            label = '🚨';
          } else if (c.severity === 'high') {
            pinColor = '#ea580c'; // orange
            label = 'H';
          } else if (c.status === 'resolved') {
            pinColor = '#10b981'; // green
            label = '✓';
          }

          const customIcon = createCustomIcon(pinColor, label, c.isEmergency && c.status !== 'resolved');

          return (
            <Marker
              key={c.id}
              position={[c.location.lat, c.location.lng]}
              icon={customIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2 space-y-2 max-w-xs text-xs">
                  <div className="flex items-center justify-between gap-2 border-b pb-1.5">
                    <span className="font-extrabold text-slate-900">
                      #{c.ticketNumber}
                    </span>
                    <PriorityScoreBadge score={c.priorityScore} breakdown={c.priorityBreakdown} size="sm" />
                  </div>

                  <div className="font-semibold text-slate-800 line-clamp-2">
                    {c.description}
                  </div>

                  <div className="text-slate-500 text-[11px]">
                    📍 {c.location.address}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={c.status} size="sm" />
                    {c.crowdCount > 1 && (
                      <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        <Users className="w-3 h-3 mr-1" />
                        {c.crowdCount} Reports
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/authority/complaints/${c.id}`)}
                    className="w-full mt-2 bg-civic-600 hover:bg-civic-700 text-white font-bold py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1 shadow transition"
                  >
                    Inspect Complaint <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Predictive Risk Zones with Radius Circles */}
        {showRiskZones &&
          riskZones.map(zone => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMeters || 400}
              pathOptions={{
                color: zone.riskLevel === 'Critical' ? '#9333ea' : '#7c3aed',
                fillColor: zone.riskLevel === 'Critical' ? '#a855f7' : '#c084fc',
                fillOpacity: 0.35,
                weight: 2,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="p-2 space-y-1.5 max-w-xs text-xs">
                  <div className="flex items-center justify-between text-purple-700 font-extrabold border-b pb-1">
                    <span>🔮 PREDICTIVE RISK ZONE</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold uppercase text-[10px]">
                      {zone.riskLevel}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{zone.area}</div>
                  <div className="text-slate-600">{zone.prediction}</div>
                  {zone.weatherCorrelation && (
                    <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                      ⚠️ {zone.weatherCorrelation.warningMessage}
                    </div>
                  )}
                  <div className="pt-1 text-[11px] text-slate-500 font-semibold">
                    💡 Action: {zone.recommendedAction}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>
    </div>
  );
};
