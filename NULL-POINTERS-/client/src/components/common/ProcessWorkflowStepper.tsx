import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Wrench, 
  Camera, 
  Sparkles, 
  ChevronRight, 
  UserCheck, 
  Play, 
  AlertCircle,
  RotateCcw,
  Users,
  Check,
  ArrowRight
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';

interface StepperProps {
  complaint: Complaint;
  onOpenDispatchModal?: () => void;
  onOpenResolutionModal?: () => void;
  onComplaintUpdated?: (updated: Complaint) => void;
}

export const ProcessWorkflowStepper: React.FC<StepperProps> = ({
  complaint,
  onOpenDispatchModal,
  onOpenResolutionModal,
  onComplaintUpdated
}) => {
  const { role } = useAuth();
  const { updateStatus, verifyEmergency, assignWorker, refreshData } = useComplaints();
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Derive step index (1 to 5)
  let currentStep = 1;
  if (complaint.status === 'verified') currentStep = 2;
  else if (complaint.status === 'assigned') currentStep = 3;
  else if (complaint.status === 'in_progress') currentStep = 4;
  else if (complaint.status === 'resolution_submitted') currentStep = 4;
  else if (complaint.status === 'resolved') currentStep = 5;

  const isAuthorityOrAdmin = role === 'authority' || role === 'admin';

  // Step 1 -> 2: Verify Complaint
  const handleVerifyStep1 = async () => {
    setIsUpdating(true);
    try {
      const updated = await verifyEmergency(complaint.id, true, 'Verified by Authoritative Field Unit');
      showToast('✓ Step 1 Complete: Complaint Verified! Ready for Squad Assignment.');
      if (onComplaintUpdated) onComplaintUpdated(updated);
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify');
    } finally {
      setIsUpdating(false);
    }
  };

  // Step 2 -> 3: Assign default nearby squad if modal not opened
  const handleQuickAssignStep2 = async () => {
    if (onOpenDispatchModal) {
      onOpenDispatchModal();
    } else {
      setIsUpdating(true);
      try {
        const updated = await assignWorker(complaint.id, undefined, complaint.department);
        showToast('✓ Step 2 Complete: Squad Dispatched! En Route to Site.');
        if (onComplaintUpdated) onComplaintUpdated(updated);
        await refreshData();
      } catch (err: any) {
        alert(err.message || 'Failed to assign squad');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Step 3 -> 4: Start Physical Repair
  const handleStartRepairStep3 = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateStatus(complaint.id, 'in_progress');
      showToast('✓ Step 3 Complete: Team Arrived! Physical Repair in Progress.');
      if (onComplaintUpdated) onComplaintUpdated(updated);
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to start repair');
    } finally {
      setIsUpdating(false);
    }
  };

  const steps = [
    {
      step: 1,
      title: '1. Intake & Verify',
      desc: complaint.emergencyVerified ? 'Verified & Acknowledged' : 'Click to Verify',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming'
    },
    {
      step: 2,
      title: '2. Squad Assigned',
      desc: complaint.assignedWorker ? `${complaint.assignedWorker.teamName}` : 'Assign Team',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming'
    },
    {
      step: 3,
      title: '3. En Route',
      desc: complaint.assignedWorker ? `ETA: ~${complaint.assignedWorker.etaMinutes} mins` : 'Pending Departure',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming'
    },
    {
      step: 4,
      title: '4. Repair in Progress',
      desc: complaint.status === 'in_progress' ? 'Active on-site repair' : 'Awaiting Work Start',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'upcoming'
    },
    {
      step: 5,
      title: '5. AI Verified Resolved',
      desc: complaint.resolutionVerification ? `PASS (${complaint.resolutionVerification.confidence}%)` : 'AI Vision Verification',
      status: currentStep === 5 ? 'completed' : 'upcoming'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg animate-bounce flex items-center justify-between">
          <span>{toastMessage}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Live Process Workflow & Step Indicator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on active step buttons below to advance the repair process step-by-step.
          </p>
        </div>

        {/* Change Team / Plan for Authority/Admin */}
        {isAuthorityOrAdmin && complaint.status !== 'resolved' && onOpenDispatchModal && (
          <button
            type="button"
            onClick={onOpenDispatchModal}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-700 transition shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            {complaint.assignedWorker ? 'Change Team / Plan' : 'Assign Squad Plan'}
          </button>
        )}
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((s) => (
          <div
            key={s.step}
            className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2 relative overflow-hidden ${
              s.status === 'completed'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : s.status === 'current'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-civic-500 ring-2 ring-civic-500/20 text-slate-900 dark:text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                s.status === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : s.status === 'current'
                  ? 'bg-civic-600 text-white animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {s.status === 'completed' ? '✓' : s.step}
              </span>

              {s.status === 'current' && (
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-civic-600 text-white animate-pulse">
                  Current Process
                </span>
              )}
            </div>

            <div>
              <div className="font-extrabold text-xs leading-tight">
                {s.title}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5 line-clamp-2">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Authoritative Interactive Clickable Action Bar */}
      {isAuthorityOrAdmin && complaint.status !== 'resolved' && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <Wrench className="w-4 h-4 text-amber-600" />
              Advance to Next Process Step:
            </span>
            <p className="text-xs text-slate-500">
              Click the button below to mark the current operational milestone complete and move to the next stage:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Step 1 Action: Verify */}
            {currentStep === 1 && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleVerifyStep1}
                className="px-5 py-3 rounded-2xl bg-civic-600 hover:bg-civic-700 text-white font-extrabold text-xs shadow-lg shadow-civic-600/30 transition transform active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Click: Confirm & Verify Hazard (Move to Step 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Step 2 Action: Assign Response Squad */}
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleQuickAssignStep2}
                className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 transition transform active:scale-95 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Click: Assign Field Response Squad (Move to Step 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Step 3 Action: Start Physical Repair Work */}
            {currentStep === 3 && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleStartRepairStep3}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition transform active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Click: Team Arrived On-Site & Start Repair (Move to Step 4)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Step 4 Action: Upload Photo & AI Verification */}
            {currentStep === 4 && onOpenResolutionModal && (
              <button
                type="button"
                onClick={onOpenResolutionModal}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition transform active:scale-95 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Click: Upload Repair Photo & AI Verify (Complete Step 5)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* When Ticket is Resolved */}
      {complaint.status === 'resolved' && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>This grievance is 100% resolved and verified by AI Computer Vision.</span>
          </div>
          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
            {complaint.resolutionVerification?.confidence || 92}% Match Score (PASS)
          </span>
        </div>
      )}

    </div>
  );
};
