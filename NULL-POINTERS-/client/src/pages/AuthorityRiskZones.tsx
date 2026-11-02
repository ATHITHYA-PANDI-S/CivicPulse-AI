import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { 
  Sparkles, 
  Layers, 
  CloudRain, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2,
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react';
import { LeafletComplaintMap } from '../components/map/LeafletComplaintMap';

export const AuthorityRiskZones: React.FC = () => {
  const { riskZones, complaints } = useComplaints();
  const [simulatedRainfall, setSimulatedRainfall] = useState(45); // 45mm rainfall forecast

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
            AI Predictive Civic Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Predictive Risk Zones & Weather Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            AI identifies chronic recurring problem zones across metropolitan clusters and correlates with live weather forecasts to trigger proactive maintenance before civic failures occur.
          </p>
        </div>
      </div>

      {/* Proactive Weather + Civic Risk Intelligence Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <CloudRain className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-200 block">
                PROACTIVE CIVIC RISK FUSION RADAR
              </span>
              <h2 className="text-xl font-black text-white">
                ⚠️ POTENTIAL FLOOD & WATERLOGGING RISK DETECTED
              </h2>
            </div>
          </div>

          {/* Simulated Rainfall Slider */}
          <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/20 text-xs flex items-center space-x-3">
            <div>
              <div className="text-[10px] font-bold text-amber-200">Simulated Rain Radar:</div>
              <div className="font-extrabold text-sm">{simulatedRainfall} mm / hr</div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simulatedRainfall}
              onChange={(e) => setSimulatedRainfall(parseInt(e.target.value))}
              className="w-28 accent-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs z-10 relative">
          <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
            <span className="text-amber-200 block font-bold">Vulnerable Zone:</span>
            <span className="font-bold text-white text-sm">Velachery South (Zone A)</span>
          </div>

          <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
            <span className="text-amber-200 block font-bold">Correlation Cause:</span>
            <span className="text-white leading-relaxed">
              17 Drainage Complaints (Last 30 Days) + {simulatedRainfall}mm Heavy Rain Forecast
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
            <span className="text-amber-200 block font-bold">Recommended Proactive Action:</span>
            <span className="text-white leading-relaxed">
              Pre-emptively deploy suction jet pumps to 100ft bypass culverts before storm onset.
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Predictive Problem Zones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            Detected Chronic Problem Zones ({riskZones.length})
          </h3>
          <span className="text-xs text-slate-400">
            Telemetry calculated from 30–60 day historical cluster density
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {riskZones.map(zone => (
            <div
              key={zone.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-900/60 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Zone Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {zone.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                    zone.riskLevel === 'Critical'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {zone.riskLevel} Risk
                  </span>
                </div>

                {/* Area & Problem */}
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {zone.area}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {zone.zone} • {zone.reportCount} reports in {zone.timeWindowDays} days
                  </div>
                </div>

                {/* AI Prediction Text */}
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-purple-800 dark:text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Problem Forecast:
                  </span>
                  <p className="leading-relaxed">{zone.prediction}</p>
                </div>

                {/* Recommended Engineering Action */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Recommended Municipal Action:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">{zone.recommendedAction}</p>
                </div>

              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px]">Radius: {zone.radiusMeters}m</span>
                <span className="text-emerald-600 font-semibold">Trend: {zone.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geospatial Risk Zone Telemetry Map */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Predictive Problem Hotspot GIS Overlay
        </h3>
        <LeafletComplaintMap
          complaints={complaints}
          riskZones={riskZones}
          height="450px"
        />
      </div>

    </div>
  );
};
