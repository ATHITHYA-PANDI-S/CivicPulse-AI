import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Users, 
  Flame, 
  ArrowRight, 
  ThumbsUp, 
  Check, 
  Building, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react';
import { Complaint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityScoreBadge } from '../common/PriorityScoreBadge';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  complaint: Complaint;
  compact?: boolean;
}

export const ComplaintCard: React.FC<Props> = ({ complaint, compact = false }) => {
  const { supportComplaint } = useComplaints();
  const { user } = useAuth();
  const [hasSupported, setHasSupported] = useState(
    complaint.supportingReports.some(s => s.citizenId === user?.id)
  );
  const [isSupporting, setIsSupporting] = useState(false);

  const handleSupport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSupported || isSupporting) return;

    try {
      setIsSupporting(true);
      await supportComplaint(complaint.id, {
        citizenId: user?.id,
        citizenName: user?.name,
        description: 'I also experience and verify this issue in this neighborhood.'
      });
      setHasSupported(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupporting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all hover:shadow-md ${
      complaint.isEmergency && complaint.status !== 'resolved'
        ? 'border-red-300 dark:border-red-800 shadow-sm ring-1 ring-red-500/20'
        : 'border-slate-200 dark:border-slate-800'
    } p-4 sm:p-5 flex flex-col justify-between`}>
      
      <div>
        {/* Top bar: Ticket #, Category, Status, Priority */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
              #{complaint.ticketNumber}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {complaint.category}
            </span>
            {complaint.isEmergency && complaint.status !== 'resolved' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                <Flame className="w-3 h-3 mr-0.5 fill-current" />
                EMERGENCY
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <PriorityScoreBadge 
              score={complaint.priorityScore} 
              breakdown={complaint.priorityBreakdown}
              size="sm" 
            />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Description & Media Thumbnail */}
        <div className="mt-3 flex gap-3">
          {complaint.photos && complaint.photos.length > 0 && (
            <img
              src={complaint.photos[0]}
              alt={complaint.category}
              className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
              {complaint.description}
            </p>
            
            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                <span className="truncate max-w-[200px]">{complaint.location.address}</span>
              </span>
              <span className="flex items-center">
                <Building className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                <span className="truncate max-w-[150px]">{complaint.department}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Crowd Severity Multiplier Bar */}
        {complaint.crowdCount > 1 && (
          <div className="mt-3 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-indigo-900 dark:text-indigo-200 font-semibold">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                <strong>{complaint.crowdCount} citizens</strong> reported this issue
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-2xs">
              Crowd Weight: +{complaint.priorityBreakdown?.crowdReports || 18} pts
            </span>
          </div>
        )}

        {/* AI Resolution Verification Badge if Resolved */}
        {complaint.resolutionVerification && (
          <div className="mt-3 p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-900 dark:text-emerald-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[280px]">
                AI Vision Verification: <strong>{complaint.resolutionVerification.status}</strong> ({Math.round(complaint.resolutionVerification.confidence * 100)}% Match)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {/* Support button */}
          {complaint.status !== 'resolved' && (
            <button
              onClick={handleSupport}
              disabled={hasSupported || isSupporting}
              className={`inline-flex items-center px-2.5 py-1 rounded-lg font-medium transition ${
                hasSupported
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              }`}
              title="Add your voice to this community issue to increase its priority"
            >
              {hasSupported ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Supported (+1)
                </>
              ) : (
                <>
                  <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                  +1 I face this issue
                </>
              )}
            </button>
          )}

          <span className="text-slate-400 text-[11px]">
            {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
        </div>

        <Link
          to={user?.role === 'citizen' ? `/citizen/complaints/${complaint.id}` : `/authority/complaints/${complaint.id}`}
          className="inline-flex items-center font-bold text-civic-600 dark:text-civic-400 hover:text-civic-700 group"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
