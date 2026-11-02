import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';

export const EmergencyBanner: React.FC = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaints();

  const activeEmergencies = complaints.filter(
    c => c.isEmergency && c.status !== 'resolved' && !c.emergencyVerified
  );

  if (activeEmergencies.length === 0) return null;

  const latest = activeEmergencies[0];

  return (
    <div className="bg-red-600 text-white px-4 py-2.5 shadow-md relative overflow-hidden animate-pulse-subtle">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
          </span>
          <ShieldAlert className="w-5 h-5 text-amber-300 fill-current shrink-0" />
          <span className="font-bold tracking-wide">🚨 UNVERIFIED EMERGENCY DETECTED:</span>
          <span className="font-medium truncate max-w-md">
            #{latest.ticketNumber} — {latest.description} ({latest.location.area})
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="bg-red-700/80 px-2 py-0.5 rounded text-xs font-semibold text-amber-200">
            Priority: {latest.priorityScore}/100
          </span>
          <button
            onClick={() => navigate(`/authority/complaints/${latest.id}`)}
            className="inline-flex items-center px-3 py-1 rounded bg-white text-red-700 font-bold hover:bg-red-50 text-xs transition shadow"
          >
            Review & Dispatch
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
