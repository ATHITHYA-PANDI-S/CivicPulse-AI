import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Flame, 
  BarChart3, 
  Layers, 
  MapPin, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  Send,
  Wrench,
  Camera,
  Check,
  ChevronRight,
  Filter,
  Search,
  CheckSquare,
  FileSearch,
  Eye
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { LeafletComplaintMap } from '../components/map/LeafletComplaintMap';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { DispatchModal } from '../components/authority/DispatchModal';
import { ResolutionModal } from '../components/authority/ResolutionModal';
import { AdminProofReviewModal } from '../components/authority/AdminProofReviewModal';
import { Complaint } from '../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    complaints, 
    stats, 
    riskZones, 
    refreshData, 
    verifyEmergency, 
    updateStatus,
    adminReviewResolution 
  } = useComplaints();

  // Active Stage Filter for Step-by-Step Handling
  const [activeStage, setActiveStage] = useState<'all' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5'>('all');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isProofReviewOpen, setIsProofReviewOpen] = useState(false);

  // Group complaints by Step-by-Step Stage
  const stage1Unverified = complaints.filter(c => c.status === 'submitted' || (c.isEmergency && !c.emergencyVerified));
  const stage2Unassigned = complaints.filter(c => (c.status === 'verified' || c.status === 'submitted') && !c.assignedWorker);
  const stage3InProgress = complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress');
  const stage4ProofInspection = complaints.filter(c => 
    c.status === 'resolution_submitted' || 
    c.status === 'review_required' ||
    (c.resolution && c.status !== 'resolved')
  );
  const stage5Resolved = complaints.filter(c => c.status === 'resolved');

  // Filtered complaints based on activeStage, search, and department
  const filteredComplaints = complaints.filter(c => {
    // 1. Stage filter
    if (activeStage === 'stage1' && !(c.status === 'submitted' || (c.isEmergency && !c.emergencyVerified))) return false;
    if (activeStage === 'stage2' && !((c.status === 'verified' || c.status === 'submitted') && !c.assignedWorker)) return false;
    if (activeStage === 'stage3' && !(c.status === 'assigned' || c.status === 'in_progress')) return false;
    if (activeStage === 'stage4' && !(c.status === 'resolution_submitted' || c.status === 'review_required' || (c.resolution && c.status !== 'resolved'))) return false;
    if (activeStage === 'stage5' && c.status !== 'resolved') return false;

    // 2. Department filter
    if (deptFilter !== 'all' && c.department !== deptFilter) return false;

    // 3. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTicket = c.ticketNumber.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchArea = c.location.area.toLowerCase().includes(q);
      const matchCategory = c.category.toLowerCase().includes(q);
      if (!matchTicket && !matchDesc && !matchArea && !matchCategory) return false;
    }

    return true;
  });

  const handleVerifyStep1 = async (comp: Complaint) => {
    await verifyEmergency(comp.id, true, `Verified by Admin ${user?.name || 'Administrator'}`);
  };

  const handleDispatchStep2 = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsDispatchOpen(true);
  };

  const handleStartWorkStep3 = async (comp: Complaint) => {
    await updateStatus(comp.id, 'in_progress');
  };

  const handleOpenProofReview = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsProofReviewOpen(true);
  };

  const handleAdminApproveProof = async (id: string, notes?: string) => {
    await adminReviewResolution(id, 'approve', notes, user?.name);
    await refreshData();
  };

  const handleAdminRejectProof = async (id: string, reason: string) => {
    await adminReviewResolution(id, 'reject', reason, user?.name);
    await refreshData();
  };

  // Distinct departments
  const departments = Array.from(new Set(complaints.map(c => c.department).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur border border-white/20 text-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Official Municipal Command & Operations Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Municipal Administrator Command Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Logged in as <strong>{user?.name || 'Chief Commissioner'}</strong> (<code>{user?.email || 'admin@gmail.com'}</code>). Oversee all municipal activity, triage emergency hazards, assign field squads, and inspect completed worker repair proofs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => refreshData()}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 backdrop-blur-xs border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
          </button>
          <Link
            to="/authority/analytics"
            className="px-4 py-2.5 rounded-2xl bg-white text-purple-950 font-extrabold text-xs shadow-md hover:bg-slate-50 transition"
          >
            SLA Analytics
          </Link>
          <Link
            to="/authority/map"
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" /> GIS Map
          </Link>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        
        <div 
          onClick={() => setActiveStage('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            activeStage === 'all'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Grievances</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {complaints.length}
          </div>
        </div>

        <div 
          onClick={() => setActiveStage('stage1')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            activeStage === 'stage1'
              ? 'bg-red-100 dark:bg-red-950/60 border-red-400 dark:border-red-800 ring-2 ring-red-500/20'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-red-600 dark:text-red-400">Active Emergencies</span>
            <Flame className="w-3.5 h-3.5 text-red-600 fill-current animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-700 dark:text-red-300 mt-1">
            {complaints.filter(c => c.isEmergency && c.status !== 'resolved').length}
          </div>
        </div>

        <div 
          onClick={() => setActiveStage('stage3')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            activeStage === 'stage3'
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-800 ring-2 ring-amber-500/20'
              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">In-Progress Repairs</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stage3InProgress.length}
          </div>
        </div>

        {/* WORKER PROOF INSPECTION COUNTER */}
        <div 
          onClick={() => setActiveStage('stage4')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            activeStage === 'stage4'
              ? 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-800 ring-2 ring-indigo-500/20'
              : stage4ProofInspection.length > 0
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 animate-pulse'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-indigo-700 dark:text-indigo-400">Proof Inspection</span>
            {stage4ProofInspection.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-600 text-white">
                ACTION NEEDED
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            {stage4ProofInspection.length}
          </div>
        </div>

        <div 
          onClick={() => setActiveStage('stage5')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            activeStage === 'stage5'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Admin Approved Closed</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stage5Resolved.length}
          </div>
        </div>

      </div>

      {/* CALLOUT: PROOFS AWAITING ADMIN REVIEW */}
      {stage4ProofInspection.length > 0 && activeStage !== 'stage4' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                ⚠️ {stage4ProofInspection.length} Field Worker Repair Proof(s) Awaiting Admin Inspection
              </div>
              <p className="text-xs text-indigo-200">
                Workers completed their work orders and uploaded proof photos. Inspect before vs after photos and sign off.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveStage('stage4')}
            className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <span>Inspect Worker Proofs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5-STEP PIPELINE TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Municipal Grievance Workflow Desk
            </h2>
            <p className="text-xs text-slate-500">
              Select any stage below to inspect, assign, monitor, or sign off on repairs:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          
          <button
            onClick={() => setActiveStage('all')}
            className={`p-2.5 rounded-xl transition text-center ${
              activeStage === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <div>All Grievances</div>
            <div className="text-[10px] text-slate-400 mt-0.5">({complaints.length})</div>
          </button>

          <button
            onClick={() => setActiveStage('stage1')}
            className={`p-2.5 rounded-xl transition text-center ${
              activeStage === 'stage1'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <div>1. Review Triage</div>
            <div className="text-[10px] opacity-80 mt-0.5">({stage1Unverified.length} Pending)</div>
          </button>

          <button
            onClick={() => setActiveStage('stage2')}
            className={`p-2.5 rounded-xl transition text-center ${
              activeStage === 'stage2'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <div>2. Squad Dispatch</div>
            <div className="text-[10px] opacity-80 mt-0.5">({stage2Unassigned.length} Ready)</div>
          </button>

          <button
            onClick={() => setActiveStage('stage3')}
            className={`p-2.5 rounded-xl transition text-center ${
              activeStage === 'stage3'
                ? 'bg-civic-600 text-white shadow-sm'
                : 'text-civic-700 dark:text-civic-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <div>3. In Progress</div>
            <div className="text-[10px] opacity-80 mt-0.5">({stage3InProgress.length} Active)</div>
          </button>

          <button
            onClick={() => setActiveStage('stage4')}
            className={`p-2.5 rounded-xl transition text-center relative ${
              activeStage === 'stage4'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <div>4. Proof Review</div>
            <div className="text-[10px] opacity-80 mt-0.5">({stage4ProofInspection.length} For Admin)</div>
            {stage4ProofInspection.length > 0 && activeStage !== 'stage4' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveStage('stage5')}
            className={`p-2.5 rounded-xl transition text-center ${
              activeStage === 'stage5'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <div>5. Resolved</div>
            <div className="text-[10px] opacity-80 mt-0.5">({stage5Resolved.length} Closed)</div>
          </button>

        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket #, area, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-hidden"
          >
            <option value="all">All Departments ({complaints.length})</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* STAGE 4 SPECIAL HIGHLIGHT: WORKER PROOF INSPECTION DESK */}
      {activeStage === 'stage4' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Worker Completion & Proof Verification Desk
                </h3>
                <p className="text-xs text-slate-500">
                  Carefully examine worker repair photos, notes, and AI computer vision match score before granting official municipal sign-off.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white">
              {stage4ProofInspection.length} Pending Inspection
            </span>
          </div>
        </div>
      )}

      {/* COMPLAINT CARDS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Complaints in Active View ({filteredComplaints.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click any ticket to take administrative actions or sign off
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredComplaints.map(comp => (
            <div
              key={comp.id}
              className={`p-5 rounded-3xl border transition shadow-sm bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                comp.status === 'resolution_submitted'
                  ? 'border-2 border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : comp.isEmergency && comp.status !== 'resolved'
                  ? 'border-2 border-red-400 dark:border-red-800 ring-2 ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    #{comp.ticketNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {comp.category}
                  </span>
                  {comp.isEmergency && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                      <Flame className="w-3 h-3 mr-0.5 fill-current" />
                      EMERGENCY
                    </span>
                  )}
                  {comp.status === 'resolution_submitted' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white animate-pulse">
                      <Camera className="w-3 h-3 mr-1" />
                      PROOF SUBMITTED FOR REVIEW
                    </span>
                  )}
                  <PriorityScoreBadge score={comp.priorityScore} breakdown={comp.priorityBreakdown} size="sm" />
                  <StatusBadge status={comp.status} size="sm" />
                </div>

                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  "{comp.description}"
                </p>

                {/* Proof Submitted Preview Banner if available */}
                {comp.resolution && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span><strong>Worker Resolution Log:</strong> "{comp.resolution.notes}"</span>
                    </div>
                    {comp.resolutionVerification && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        AI Confidence: {Math.round(comp.resolutionVerification.confidence * 100)}%
                      </span>
                    )}
                  </div>
                )}

                {/* Admin Approval Stamp if resolved */}
                {comp.adminApproval && comp.adminApproval.approved && (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Admin Verified & Closed</strong> by {comp.adminApproval.reviewedBy} on {new Date(comp.adminApproval.reviewedAt).toLocaleDateString()}: "{comp.adminApproval.notes}"
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {comp.location.address} ({comp.location.area})
                  </span>
                  <span>Citizen: <strong>{comp.citizenName}</strong></span>
                  <span>Dept: <strong>{comp.department}</strong></span>
                  {comp.assignedWorker && (
                    <span className="text-emerald-600 font-semibold">
                      Squad: {comp.assignedWorker.teamName} (~{comp.assignedWorker.etaMinutes}m ETA)
                    </span>
                  )}
                </div>
              </div>

              {/* Right Step-by-Step Action Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                
                {/* Step 1: Emergency Verify Button */}
                {comp.isEmergency && !comp.emergencyVerified && (
                  <button
                    onClick={() => handleVerifyStep1(comp)}
                    className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center gap-1"
                    title="Confirm hazard validity"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Verify Hazard
                  </button>
                )}

                {/* Step 2: Dispatch Squad */}
                {comp.status !== 'resolved' && !comp.assignedWorker && (
                  <button
                    onClick={() => handleDispatchStep2(comp)}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition flex items-center gap-1"
                    title="Dispatch field response unit"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Squad
                  </button>
                )}

                {/* Step 3: Squad Repairs In Progress */}
                {comp.status === 'assigned' && (
                  <button
                    onClick={() => handleStartWorkStep3(comp)}
                    className="px-3 py-2 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow transition flex items-center gap-1"
                    title="Squad begins on-site repair"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Start Repairs
                  </button>
                )}

                {/* Step 4: WORKER PROOF INSPECTION & SIGN-OFF BUTTON */}
                {(comp.status === 'resolution_submitted' || comp.status === 'review_required' || comp.resolution) && comp.status !== 'resolved' && (
                  <button
                    onClick={() => handleOpenProofReview(comp)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 animate-bounce-subtle"
                    title="Inspect before/after photos and grant admin approval"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    Inspect Proof & Sign-Off
                  </button>
                )}

                {/* View Details */}
                <Link
                  to={`/authority/complaints/${comp.id}`}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                >
                  Full Details →
                </Link>
              </div>
            </div>
          ))}

          {filteredComplaints.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 dark:text-slate-300">No complaints in this stage.</div>
              <p className="text-slate-500">All tasks in this category are fully handled.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DispatchModal
        complaint={selectedComplaint}
        isOpen={isDispatchOpen}
        onClose={() => {
          setIsDispatchOpen(false);
          refreshData();
        }}
      />

      <ResolutionModal
        complaint={selectedComplaint}
        isOpen={isResolutionOpen}
        onClose={() => {
          setIsResolutionOpen(false);
          refreshData();
        }}
      />

      {/* ADMIN WORKER PROOF INSPECTION MODAL */}
      <AdminProofReviewModal
        complaint={selectedComplaint}
        isOpen={isProofReviewOpen}
        onClose={() => {
          setIsProofReviewOpen(false);
          refreshData();
        }}
        onApprove={handleAdminApproveProof}
        onReject={handleAdminRejectProof}
      />

    </div>
  );
};
