import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Flame, 
  Wrench, 
  ShieldAlert, 
  Users, 
  Clock, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  BarChart3, 
  ArrowRight, 
  Sparkles,
  Send,
  Camera,
  Play,
  Check,
  AlertTriangle,
  RefreshCw,
  Phone
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { LeafletComplaintMap } from '../components/map/LeafletComplaintMap';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { DispatchModal } from '../components/authority/DispatchModal';
import { ResolutionModal } from '../components/authority/ResolutionModal';
import { Complaint } from '../types';

export const AuthorityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { complaints, stats, refreshData, updateStatus, verifyEmergency } = useComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all_active' | 'assigned' | 'in_progress' | 'resolved'>('all_active');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Filter queues
  const activeWorkOrders = complaints.filter(c => c.status !== 'resolved');
  const assignedWorkOrders = complaints.filter(c => c.status === 'assigned');
  const inProgressWorkOrders = complaints.filter(c => c.status === 'in_progress');
  const completedWorkOrders = complaints.filter(c => c.status === 'resolved');

  const currentDisplayList = activeTab === 'all_active'
    ? activeWorkOrders
    : activeTab === 'assigned'
    ? assignedWorkOrders
    : activeTab === 'in_progress'
    ? inProgressWorkOrders
    : completedWorkOrders;

  // Step 1 -> 2: Verify Complaint
  const handleVerifyStep1 = async (comp: Complaint) => {
    await verifyEmergency(comp.id, true, 'Verified by Authoritative Field Unit');
    showToast(`✓ Ticket #${comp.ticketNumber} verified! Ready for squad assignment.`);
    await refreshData();
  };

  // Step 2 -> 3: Dispatch Squad
  const handleOpenDispatchModal = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsDispatchOpen(true);
  };

  // Step 3 -> 4: Start Repair Work
  const handleStartWorkStep3 = async (comp: Complaint) => {
    await updateStatus(comp.id, 'in_progress');
    showToast(`⚡ Ticket #${comp.ticketNumber} marked IN PROGRESS! Team on-site repair active.`);
    await refreshData();
  };

  // Step 4 -> 5: Open AI Resolution Verification Modal
  const handleOpenResolutionModal = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsResolutionOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast feedback banner */}
      {feedbackToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-2xl animate-bounce flex items-center justify-between">
          <span>{feedbackToast}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Top Field Operations Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 backdrop-blur border border-amber-500/40 text-amber-200">
            <Wrench className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Field Worker Execution Desk • Municipal Squad Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Field Squad Repair & Step-by-Step Execution Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Logged in as <strong>{user?.name || 'Officer Sundaram K.'}</strong> ({user?.department || 'Electricity Control Room'}). Follow and click each step below to advance repairs from dispatch to on-site work and AI photo verification.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            to="/authority/map"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" /> Field GPS Map
          </Link>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Work Filter Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setActiveTab('all_active')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
            activeTab === 'all_active'
              ? 'border-civic-600 bg-civic-50/70 dark:bg-civic-950/40 ring-2 ring-civic-500/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-civic-700 dark:text-civic-400">All Active Tasks</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {activeWorkOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">In-progress & assigned</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('assigned')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
            activeTab === 'assigned'
              ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">1. Assigned Squads</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {assignedWorkOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">En route to site</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('in_progress')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
            activeTab === 'in_progress'
              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">2. Physical Repair</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {inProgressWorkOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">Active on-site work</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold">
            <Wrench className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('resolved')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
            activeTab === 'resolved'
              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">3. Verified Closed</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {completedWorkOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">AI Match Passed</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Field Work Task Cards with Interactive Step Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            Field Operations Queue: {activeTab === 'all_active' ? 'All Active Tasks' : activeTab === 'assigned' ? 'Assigned Work Orders' : activeTab === 'in_progress' ? 'In-Progress Repairs' : 'Verified Completed Tasks'} ({currentDisplayList.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click action buttons below to advance through each step
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentDisplayList.map(comp => {
            // Determine active step
            let stepNum = 1;
            let stepText = '1. Intake & Verify';
            if (comp.status === 'verified') { stepNum = 2; stepText = '2. Ready for Dispatch'; }
            else if (comp.status === 'assigned') { stepNum = 3; stepText = '3. Team En Route'; }
            else if (comp.status === 'in_progress') { stepNum = 4; stepText = '4. Active Physical Repair'; }
            else if (comp.status === 'resolved') { stepNum = 5; stepText = '5. AI Verified Closed'; }

            return (
              <div
                key={comp.id}
                className={`p-5 rounded-3xl border transition shadow-sm bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  comp.isEmergency && comp.status !== 'resolved'
                    ? 'border-2 border-red-400 dark:border-red-800 ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Task Details & Step Badge */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      #{comp.ticketNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {comp.category}
                    </span>
                    
                    {/* Live Ongoing Step Indicator Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase flex items-center gap-1 ${
                      comp.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : comp.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      <Clock className="w-3 h-3" />
                      Ongoing: {stepText}
                    </span>

                    {comp.isEmergency && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                        <Flame className="w-3 h-3 mr-0.5 fill-current" />
                        EMERGENCY
                      </span>
                    )}
                    <PriorityScoreBadge score={comp.priorityScore} breakdown={comp.priorityBreakdown} size="sm" />
                  </div>

                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    "{comp.description}"
                  </p>

                  {/* Admin Re-work Order Notice */}
                  {comp.adminApproval && !comp.adminApproval.approved && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span><strong>Admin Re-work Requested:</strong> {comp.adminApproval.reason}</span>
                    </div>
                  )}

                  {/* Proof Submitted Notice */}
                  {comp.status === 'resolution_submitted' && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span><strong>Proof Submitted:</strong> Under review by Chief Municipal Administrator (admin@gmail.com).</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {comp.location.address} ({comp.location.area})
                    </span>
                    {comp.assignedWorker && (
                      <span className="text-amber-700 dark:text-amber-400 font-bold">
                        Assigned Squad: {comp.assignedWorker.teamName} (Lead: {comp.assignedWorker.name})
                      </span>
                    )}
                    {comp.resolutionVerification && (
                      <span className="text-emerald-600 font-bold">
                        ✓ AI Vision Match: {comp.resolutionVerification.confidence}% ({comp.resolutionVerification.status.toUpperCase()})
                      </span>
                    )}
                  </div>
                </div>

                {/* Authoritative Action & Step Advance Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  
                  {/* Step 1 Action: Verify Hazard (if submitted) */}
                  {comp.status === 'submitted' && (
                    <button
                      onClick={() => handleVerifyStep1(comp)}
                      className="px-3.5 py-2.5 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Click: Verify Hazard (Step 1 → 2)
                    </button>
                  )}

                  {/* Step 2 Action: Assign or Change Team / Plan */}
                  {comp.status !== 'resolved' && (
                    <button
                      onClick={() => handleOpenDispatchModal(comp)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-700 transition flex items-center gap-1.5"
                      title="Assign or change squad plan"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {comp.assignedWorker ? 'Change Team / Plan' : 'Click: Assign Squad (Step 2 → 3)'}
                    </button>
                  )}

                  {/* Step 3 Action: Start Work (for assigned tasks) */}
                  {comp.status === 'assigned' && (
                    <button
                      onClick={() => handleStartWorkStep3(comp)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Click: Start Repair (Step 3 → 4)
                    </button>
                  )}

                  {/* Step 4 Action: Upload Photo & AI Verification */}
                  {(comp.status === 'in_progress' || comp.status === 'assigned') && (
                    <button
                      onClick={() => handleOpenResolutionModal(comp)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Submit Work Completion & Proof
                    </button>
                  )}

                  {/* If Proof Submitted, allow re-upload or view */}
                  {comp.status === 'resolution_submitted' && (
                    <button
                      onClick={() => handleOpenResolutionModal(comp)}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Update Submitted Proof
                    </button>
                  )}

                  {/* View Step Details */}
                  <Link
                    to={`/authority/complaints/${comp.id}`}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                  >
                    View Stepper Details →
                  </Link>
                </div>
              </div>
            );
          })}

          {currentDisplayList.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No tasks currently in this queue.
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Modal for Changing Team / Plan */}
      <DispatchModal
        complaint={selectedComplaint}
        isOpen={isDispatchOpen}
        onClose={() => {
          setIsDispatchOpen(false);
          refreshData();
        }}
      />

      {/* Resolution Verification Modal */}
      <ResolutionModal
        complaint={selectedComplaint}
        isOpen={isResolutionOpen}
        onClose={() => {
          setIsResolutionOpen(false);
          refreshData();
        }}
      />

    </div>
  );
};
