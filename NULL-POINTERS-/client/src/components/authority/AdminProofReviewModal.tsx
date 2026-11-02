import React, { useState } from 'react';
import { Complaint } from '../../types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Camera, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Loader2 
} from 'lucide-react';

interface Props {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const AdminProofReviewModal: React.FC<Props> = ({
  complaint,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !complaint) return null;

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setActionType('approve');
      setErrorMsg(null);
      await onApprove(complaint.id, notes.trim() || 'Work completion inspected and officially approved by Municipal Command Authority.');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve proof');
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setErrorMsg('Please specify the reason for rejection so the field squad knows what to fix.');
      return;
    }
    try {
      setIsSubmitting(true);
      setActionType('reject');
      setErrorMsg(null);
      await onReject(complaint.id, notes.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject proof');
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const beforePhoto = complaint.photos && complaint.photos.length > 0 
    ? complaint.photos[0] 
    : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800';
  
  const afterPhoto = complaint.resolution?.proofPhoto || 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Worker Proof Inspection Desk
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                  #{complaint.ticketNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Department: <strong>{complaint.department}</strong> | Area: <strong>{complaint.location.area}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Worker & Repair Metadata Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Field Squad / Worker</span>
            <div className="font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-civic-600" />
              {complaint.resolution?.resolvedBy || complaint.assignedWorker?.name || 'On-site Field Unit'}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Team / Department</span>
            <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
              {complaint.assignedWorker?.teamName || complaint.department}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Completion Timestamp</span>
            <div className="font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {complaint.resolution?.resolvedAt ? new Date(complaint.resolution.resolvedAt).toLocaleString() : 'Just now'}
            </div>
          </div>
        </div>

        {/* Side-by-side Proof Photos: Before vs After */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
              Visual Inspection: Before vs. After Proof Photo
            </span>
            <span className="text-[11px] text-slate-400">
              Inspect on-site repair accuracy before official approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Before Photo */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-600 dark:text-rose-400 uppercase text-[10px] flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  1. Citizen Original Issue
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Report Baseline</span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img 
                  src={beforePhoto} 
                  alt="Original Issue" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                "{complaint.description}"
              </p>
            </div>

            {/* After Photo (Worker Submitted Proof) */}
            <div className="rounded-2xl border-2 border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-emerald-700 dark:text-emerald-300 uppercase text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  2. Worker On-Site Completion Proof
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                  Submitted Proof
                </span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700">
                <img 
                  src={afterPhoto} 
                  alt="Worker Resolution Proof" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-200 font-medium">
                <strong>Worker Notes:</strong> "{complaint.resolution?.notes || 'Repairs completed by civic field squad.'}"
              </p>
            </div>

          </div>
        </div>

        {/* AI Computer Vision Verification Assessment */}
        {complaint.resolutionVerification && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-blue-900 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-blue-950 dark:text-blue-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Computer Vision Verification Assessment
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                  complaint.resolutionVerification.pass
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                }`}>
                  Status: {complaint.resolutionVerification.status}
                </span>
                <span className="font-black text-slate-800 dark:text-slate-200">
                  {Math.round(complaint.resolutionVerification.confidence * 100)}% Confidence Match
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              {complaint.resolutionVerification.reason}
            </p>
          </div>
        )}

        {/* Previous Admin Rejection Notice (if any) */}
        {complaint.adminApproval && !complaint.adminApproval.approved && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <strong>Previous Admin Review ({new Date(complaint.adminApproval.reviewedAt).toLocaleDateString()}):</strong>{' '}
            {complaint.adminApproval.reason}
          </div>
        )}

        {/* Admin Review Action & Remarks */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Administrative Inspection Remarks / Feedback:
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Surface patch inspected and approved in accordance with municipal standards. (Required for rejection with feedback)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Reject / Rework Button */}
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                title="Reject proof and send back to worker with remarks"
              >
                {isSubmitting && actionType === 'reject' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Reject Proof & Order Re-work</span>
              </button>

              {/* Approve & Close Button */}
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-1.5"
                title="Officially approve proof and close ticket"
              >
                {isSubmitting && actionType === 'approve' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Approve Work & Close Ticket</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
