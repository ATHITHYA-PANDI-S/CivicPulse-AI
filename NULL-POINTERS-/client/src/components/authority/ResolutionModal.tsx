import React, { useState } from 'react';
import { Complaint, ResolutionVerification } from '../../types';
import { useComplaints } from '../../context/ComplaintContext';
import { CameraPhotoUploader } from '../common/CameraPhotoUploader';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Image as ImageIcon 
} from 'lucide-react';

interface Props {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResolutionModal: React.FC<Props> = ({ complaint, isOpen, onClose }) => {
  const { submitResolution } = useComplaints();
  
  const [proofPhoto, setProofPhoto] = useState(
    'https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=800&auto=format&fit=crop&q=80'
  );
  const [notes, setNotes] = useState('Repairs completed. Surface resurfaced and cleared of obstructions.');
  const [resolvedBy, setResolvedBy] = useState('Road Rapid Repair Unit 01 (Lead: K. Velu)');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ResolutionVerification | null>(null);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const res = await submitResolution(complaint.id, {
        proofPhoto,
        notes,
        resolvedBy
      });
      setVerificationResult(res.verification);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinish = () => {
    setVerificationResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Submit Resolution & AI Verification
              </h3>
              <p className="text-xs text-slate-500">
                Ticket #{complaint.ticketNumber} — {complaint.category} ({complaint.location.area})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Passed Screen */}
        {verificationResult ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-black text-emerald-900 dark:text-emerald-200 text-base">
                WORK PROOF SUBMITTED & AI VERIFIED ({verificationResult.status})
              </h4>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                AI Vision Match: {Math.round(verificationResult.confidence * 100)}% — Routed to Municipal Admin for final inspection
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-left">
                {verificationResult.reason}
              </p>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Original Issue Photo</span>
                <img
                  src={complaint.photos[0]}
                  alt="Before"
                  className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-emerald-600 uppercase text-[10px]">Resolved Proof Photo</span>
                <img
                  src={proofPhoto}
                  alt="After"
                  className="w-full h-32 object-cover rounded-xl border border-emerald-300 dark:border-emerald-700"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs text-center font-medium">
              🏛️ <strong>Awaiting Admin Review:</strong> Chief Municipal Administrator (admin@gmail.com) will inspect this repair proof and grant the final municipal resolution sign-off.
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
              >
                Done: Submit to Municipal Admin
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Before Photo Preview */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Original Complaint Photo
              </label>
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {complaint.photos[0] ? (
                  <img
                    src={complaint.photos[0]}
                    alt="Original issue"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-900 dark:text-white">Before Photo Loaded</div>
                  <p className="text-[11px]">AI Vision will compare repair proof against this baseline image.</p>
                </div>
              </div>
            </div>

            {/* Resolution Photo: Live Camera Snapshot or Device File */}
            <CameraPhotoUploader
              photos={proofPhoto ? [proofPhoto] : []}
              onChange={(arr) => setProofPhoto(arr[0] || '')}
              maxPhotos={1}
              label="After-Repair Proof Photograph (On-Site Camera or Upload)"
              categoryHint={complaint.category}
              required
            />

            {/* Field Worker / Team notes */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Resolved By (Field Team / Officer)
              </label>
              <input
                type="text"
                value={resolvedBy}
                onChange={(e) => setResolvedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Completion Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Describe specific engineering repairs completed..."
                required
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center shadow"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Running AI Vision Verification...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Verify & Mark Resolved
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
