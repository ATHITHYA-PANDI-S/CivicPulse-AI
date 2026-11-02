import React, { useState } from 'react';
import { Complaint, FieldWorker } from '../../types';
import { 
  Flame, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Send,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { PriorityScoreBadge } from '../common/PriorityScoreBadge';
import { StatusBadge } from '../common/StatusBadge';
import { useComplaints } from '../../context/ComplaintContext';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  emergencies: Complaint[];
  onOpenDispatch: (complaint: Complaint) => void;
}

export const EmergencyQueue: React.FC<Props> = ({ emergencies, onOpenDispatch }) => {
  const navigate = useNavigate();
  const { verifyEmergency } = useComplaints();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  if (emergencies.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 text-center text-emerald-800 dark:text-emerald-300">
        <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
        <h4 className="font-bold text-sm">No Active Emergency Triage Alerts</h4>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
          All high-voltage hazards, gas leaks, and critical risks are verified or dispatched.
        </p>
      </div>
    );
  }

  const handleVerify = async (e: React.MouseEvent, complaintId: string) => {
    e.stopPropagation();
    try {
      setVerifyingId(complaintId);
      await verifyEmergency(complaintId, true, 'Verified by on-duty watch officer.');
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-red-600 text-white animate-pulse">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              EMERGENCY RESPONSE QUEUE
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-black animate-ping-slow">
                {emergencies.length} ACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Life-safety hazards requiring human verification and rapid field dispatch.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {emergencies.map(comp => (
          <div
            key={comp.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-500/80 dark:border-red-600 shadow-lg p-5 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Top red header accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

            <div>
              {/* Top metadata */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-sm text-red-600 dark:text-red-400 tracking-wider">
                    🚨 #{comp.ticketNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded font-bold text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    {comp.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <PriorityScoreBadge 
                    score={comp.priorityScore} 
                    breakdown={comp.priorityBreakdown}
                    size="sm" 
                  />
                  <StatusBadge status={comp.status} size="sm" />
                </div>
              </div>

              {/* Description & Location */}
              <div className="mt-3.5 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  "{comp.description}"
                </h4>

                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                  <span className="font-semibold">{comp.location.address} ({comp.location.area})</span>
                </div>

                {/* AI Reason callout */}
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 text-xs">
                  <span className="font-bold">AI Signal: </span>
                  {comp.aiAnalysis.emergencyReason || comp.aiAnalysis.reasoning}
                </div>

                {/* Nearest Assigned Team telemetry */}
                {comp.assignedWorker && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Assigned: {comp.assignedWorker.teamName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Lead: {comp.assignedWorker.name} ({comp.assignedWorker.phone})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        {comp.assignedWorker.distanceKm} km away
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ETA: ~{comp.assignedWorker.etaMinutes} mins
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {!comp.emergencyVerified ? (
                  <button
                    onClick={(e) => handleVerify(e, comp.id)}
                    disabled={verifyingId === comp.id}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Verify Hazard
                  </button>
                ) : (
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Officer Verified
                  </span>
                )}

                <button
                  onClick={() => onOpenDispatch(comp)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs shadow transition flex items-center"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {comp.assignedWorker ? 'Reassign Field Team' : 'Dispatch Nearest Team'}
                </button>
              </div>

              <Link
                to={`/authority/complaints/${comp.id}`}
                className="text-xs font-bold text-civic-600 dark:text-civic-400 hover:underline flex items-center"
              >
                Inspect <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
