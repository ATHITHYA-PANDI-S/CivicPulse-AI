import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { EmergencyQueue } from '../components/authority/EmergencyQueue';
import { DispatchModal } from '../components/authority/DispatchModal';
import { Complaint } from '../types';
import { Flame, ShieldAlert, Radio, AlertOctagon, PhoneCall, CheckCircle } from 'lucide-react';

export const AuthorityEmergencies: React.FC = () => {
  const { complaints } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  const activeEmergencies = complaints.filter(c => c.isEmergency && c.status !== 'resolved');
  const resolvedEmergencies = complaints.filter(c => c.isEmergency && c.status === 'resolved');

  const handleOpenDispatch = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsDispatchOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              High-Stakes Civic Triage Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Emergency Response & Incident Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Human-in-the-loop verification protocol. AI classifies life-safety hazards with 98/100 priority; on-duty officers confirm telemetry before final rapid dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center">
            <span className="text-[10px] uppercase font-bold text-red-600 block">Critical SLA</span>
            <span className="text-lg font-black text-red-700 dark:text-red-300">≤ 20 Mins</span>
          </div>
        </div>
      </div>

      {/* Main Active Emergency Grid */}
      <EmergencyQueue
        emergencies={activeEmergencies}
        onOpenDispatch={handleOpenDispatch}
      />

      {/* Historical Resolved Emergencies Section */}
      {resolvedEmergencies.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recently Neutralized & Verified Emergencies ({resolvedEmergencies.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedEmergencies.map(comp => (
              <div
                key={comp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-5 space-y-2 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">#{comp.ticketNumber} • {comp.category}</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    RESOLVED & AI VERIFIED
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">"{comp.description}"</p>
                <div className="text-slate-400 text-[11px]">📍 {comp.location.address}</div>
                {comp.resolutionVerification && (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium text-[11px]">
                    ✓ {comp.resolutionVerification.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      <DispatchModal
        complaint={selectedComplaint}
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
      />

    </div>
  );
};
