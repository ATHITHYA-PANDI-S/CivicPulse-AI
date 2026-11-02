import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Users, 
  Flame, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldAlert, 
  Send, 
  Wrench, 
  Sparkles, 
  Camera, 
  Phone,
  AlertTriangle,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint } from '../types';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';
import { DispatchModal } from '../components/authority/DispatchModal';
import { ResolutionModal } from '../components/authority/ResolutionModal';
import { ProcessWorkflowStepper } from '../components/common/ProcessWorkflowStepper';
import { ExactLocationMap } from '../components/map/ExactLocationMap';

const PIPELINE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'verified', label: 'AI Verified' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolution_submitted', label: 'Verification' },
  { key: 'resolved', label: 'Resolved' }
];

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { verifyEmergency, supportComplaint } = useComplaints();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isSupporting, setIsSupporting] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      api.getComplaintById(id)
        .then(data => setComplaint(data.complaint))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading complaint telemetry...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Complaint Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-civic-600 font-bold hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentStepIndex = PIPELINE_STEPS.findIndex(s => s.key === complaint.status);

  const handleSupport = async () => {
    try {
      setIsSupporting(true);
      const updated = await supportComplaint(complaint.id, {
        citizenId: user?.id,
        citizenName: user?.name,
        description: 'Citizen verified in person'
      });
      setComplaint(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupporting(false);
    }
  };

  const handleVerifyEmergency = async () => {
    try {
      const updated = await verifyEmergency(complaint.id, true, 'Verified by on-duty officer');
      setComplaint(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to List
        </button>

        {/* Authority Action Shortcuts */}
        {role !== 'citizen' && (
          <div className="flex items-center space-x-2">
            {complaint.isEmergency && !complaint.emergencyVerified && (
              <button
                onClick={handleVerifyEmergency}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Verify Emergency Hazard
              </button>
            )}

            {complaint.status !== 'resolved' && (
              <button
                onClick={() => setIsDispatchOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow transition flex items-center"
              >
                <Send className="w-4 h-4 mr-1.5" />
                {complaint.assignedWorker ? 'Reassign Team' : 'Dispatch Field Team'}
              </button>
            )}

            {complaint.status !== 'resolved' && (
              <button
                onClick={() => setIsResolutionOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Submit Resolution & Verify
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Ticket Card Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl bg-white dark:bg-slate-900 space-y-6 ${
        complaint.isEmergency && complaint.status !== 'resolved'
          ? 'border-red-400 dark:border-red-800 ring-2 ring-red-500/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}>
        
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-slate-900 dark:text-white tracking-wide">
                Complaint #{complaint.ticketNumber}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {complaint.category}
              </span>
              {complaint.isEmergency && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white animate-pulse">
                  <Flame className="w-3.5 h-3.5 mr-1 fill-current" />
                  EMERGENCY
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              Registered on {new Date(complaint.createdAt).toLocaleString()} by {complaint.citizenName}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <PriorityScoreBadge 
              score={complaint.priorityScore} 
              breakdown={complaint.priorityBreakdown}
              size="lg" 
            />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Interactive Step-by-Step Process Workflow Stepper */}
        <ProcessWorkflowStepper
          complaint={complaint}
          onOpenDispatchModal={() => setIsDispatchOpen(true)}
          onOpenResolutionModal={() => setIsResolutionOpen(true)}
        />

        {/* Description & Photo Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Grievance Description
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                "{complaint.description}"
              </p>
            </div>

            {/* AI Diagnostics Card */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-civic-600" />
                <span>AI Diagnostics & Automated Triage</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {complaint.aiAnalysis.reasoning}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {complaint.aiAnalysis.urgencyKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Location details & Embedded Map */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 dark:text-white flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-red-500" />
                  Exact Hazard Map Location
                </div>
                <span className="text-[10px] font-bold text-civic-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  {complaint.location.area}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-semibold">{complaint.location.address}</p>

              {/* Mini Map */}
              <ExactLocationMap
                lat={complaint.location.lat}
                lng={complaint.location.lng}
                title={complaint.category}
                address={complaint.location.address}
                height="180px"
              />
            </div>
          </div>

          {/* Photo Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Citizen Photo Evidence
            </h3>
            {complaint.photos && complaint.photos.length > 0 ? (
              <img
                src={complaint.photos[0]}
                alt="Complaint evidence"
                className="w-full h-56 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-full h-56 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                No photo provided
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Field Worker Assignment & SLA telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Assigned Field Unit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Wrench className="w-5 h-5 text-civic-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Assigned Field Response Unit
            </h3>
          </div>

          {complaint.assignedWorker ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {complaint.assignedWorker.teamName}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  DISPATCHED
                </span>
              </div>
              <div className="text-slate-500">
                Team Lead: <strong>{complaint.assignedWorker.name}</strong>
              </div>
              <div className="text-slate-500 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1" />
                {complaint.assignedWorker.phone}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
                <span>Distance: {complaint.assignedWorker.distanceKm} km</span>
                <span className="text-civic-600 font-bold">Estimated Arrival: ~{complaint.assignedWorker.etaMinutes} mins</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 space-y-2">
              <p>No field worker dispatched yet.</p>
              {role !== 'citizen' && (
                <button
                  onClick={() => setIsDispatchOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-civic-600 text-white font-bold text-xs"
                >
                  Dispatch Nearest Squad
                </button>
              )}
            </div>
          )}
        </div>

        {/* SLA & Department Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              SLA Compliance & Escalation
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Responsible Department:</span>
              <span className="font-bold text-slate-900 dark:text-white">{complaint.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AI Response Forecast:</span>
              <span className="font-bold text-emerald-600">{complaint.aiAnalysis.predictedResponseLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SLA Deadline:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {new Date(complaint.slaDeadline).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
              ✓ Resolution on track within municipal turnaround guidelines.
            </div>
          </div>
        </div>

      </div>

      {/* AI RESOLUTION VERIFICATION PROOF (If Resolved) */}
      {complaint.resolutionVerification && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  AI Resolution Verification Proof
                </h3>
                <p className="text-xs text-slate-500">
                  Computer vision validation comparing original damage vs post-repair site photo.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                STATUS: {complaint.resolutionVerification.status} ({Math.round(complaint.resolutionVerification.confidence * 100)}% Match)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase">Original Defect (Before)</span>
              <img
                src={complaint.resolutionVerification.beforePhotoUrl || complaint.photos[0]}
                alt="Before"
                className="w-full h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-600 uppercase">Field Repair Proof (After)</span>
              <img
                src={complaint.resolutionVerification.afterPhotoUrl || complaint.resolution?.proofPhoto}
                alt="After"
                className="w-full h-48 object-cover rounded-2xl border border-emerald-400 dark:border-emerald-700"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block">AI Vision Reasoning:</span>
            <p>{complaint.resolutionVerification.reason}</p>
            {complaint.resolution?.notes && (
              <p className="pt-1 text-slate-500 font-medium">Field Officer Note: {complaint.resolution.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Supporting Duplicate Reports Cluster (Crowd Severity) */}
      {complaint.supportingReports && complaint.supportingReports.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Crowd Verification Reports ({complaint.supportingReports.length} Additional Citizens)
              </h3>
            </div>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
              Crowd Weight: +{complaint.priorityBreakdown?.crowdReports || 18} pts
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {complaint.supportingReports.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{s.citizenName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Proximity ~{s.distanceMeters || 25}m
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">"{s.description}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <DispatchModal
        complaint={complaint}
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
      />

      <ResolutionModal
        complaint={complaint}
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
      />

    </div>
  );
};
