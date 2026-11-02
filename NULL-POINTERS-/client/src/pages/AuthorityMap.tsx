import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { LeafletComplaintMap } from '../components/map/LeafletComplaintMap';
import { MapPin, Flame, Users, Layers, Filter, Sparkles } from 'lucide-react';

export const AuthorityMap: React.FC = () => {
  const { complaints, riskZones } = useComplaints();
  const [selectedArea, setSelectedArea] = useState('all');

  const filtered = complaints.filter(
    c => selectedArea === 'all' || c.location.area.toLowerCase().includes(selectedArea.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-civic-600" />
            GIS Command & Telemetry Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time geospatial visualization of civic hazards, crowd-severity clusters, and predictive risk zones.
          </p>
        </div>

        {/* Area dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Filter Ward:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="all">Entire Coimbatore Corporation</option>
            <option value="Gandhipuram">Gandhipuram (Central Zone)</option>
            <option value="RS Puram">RS Puram (West Zone)</option>
            <option value="Peelamedu">Peelamedu (East Zone)</option>
            <option value="Saibaba Colony">Saibaba Colony (North Zone)</option>
            <option value="Saravanampatti">Saravanampatti (IT Corridor)</option>
            <option value="Ukkadam">Ukkadam (South Zone)</option>
            <option value="Singanallur">Singanallur (East Zone)</option>
            <option value="Eachanari">Eachanari / Sundarapuram</option>
          </select>
        </div>
      </div>

      {/* Map Legend */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-300"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">🚨 Life-Safety Emergency</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">High Priority Ticket</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Medium/Low Ticket</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Resolved & AI Verified</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500 ring-2 ring-purple-300"></span>
            <span className="font-semibold text-purple-700 dark:text-purple-300">🔮 Predictive Risk Zone</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Total Mapped Points: {filtered.length + riskZones.length}
        </div>
      </div>

      {/* Fullscreen Map Container */}
      <LeafletComplaintMap
        complaints={filtered}
        riskZones={riskZones}
        height="640px"
        zoom={12}
      />

    </div>
  );
};
