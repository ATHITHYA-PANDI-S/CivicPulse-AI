import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Users, 
  Flame, 
  ArrowRight, 
  MapPin, 
  Sparkles,
  Building 
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { DispatchModal } from '../components/authority/DispatchModal';
import { ResolutionModal } from '../components/authority/ResolutionModal';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

export const AuthorityComplaints: React.FC = () => {
  const { complaints, updateStatus } = useComplaints();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);

  const filtered = complaints.filter(c => {
    const matchesSearch = 
      !searchTerm ||
      c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  const handleOpenDispatch = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsDispatchOpen(true);
  };

  const handleOpenResolution = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setIsResolutionOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Municipal Complaints Master Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Intelligent triaging, crowd-severity clusters, and SLA management across all city departments.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span> of {complaints.length} tickets
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticket #, address, citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Electricity">Electricity</option>
              <option value="Roads">Roads</option>
              <option value="Drainage">Drainage</option>
              <option value="Water">Water</option>
              <option value="Garbage">Garbage</option>
              <option value="Streetlights">Streetlights</option>
              <option value="Public Safety">Public Safety</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="verified">AI Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved & Verified</option>
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Severities</option>
              <option value="emergency">🚨 Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Complaints Table / Card List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.map(comp => (
          <div
            key={comp.id}
            className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  #{comp.ticketNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {comp.category}
                </span>
                {comp.isEmergency && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white animate-pulse">
                    <Flame className="w-3 h-3 mr-0.5 fill-current" />
                    EMERGENCY
                  </span>
                )}
                {comp.crowdCount > 1 && (
                  <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    <Users className="w-3 h-3 mr-1" />
                    {comp.crowdCount} Reports Grouped
                  </span>
                )}
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

            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
              "{comp.description}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {comp.location.address} ({comp.location.area})
                </span>
                <span className="flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {comp.department}
                </span>
                {comp.assignedWorker && (
                  <span className="text-emerald-600 font-semibold">
                    Squad: {comp.assignedWorker.teamName} (~{comp.assignedWorker.etaMinutes}m ETA)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {comp.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleOpenDispatch(comp)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] shadow-2xs"
                    >
                      {comp.assignedWorker ? 'Reassign' : 'Dispatch'}
                    </button>
                    <button
                      onClick={() => handleOpenResolution(comp)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] shadow-2xs"
                    >
                      Resolve & Verify
                    </button>
                  </>
                )}
                <Link
                  to={`/authority/complaints/${comp.id}`}
                  className="px-3 py-1.5 rounded-lg bg-civic-600 hover:bg-civic-700 text-white font-bold text-[11px] shadow-2xs flex items-center"
                >
                  Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No complaints found matching this filter criteria.
          </div>
        )}
      </div>

      {/* Modals */}
      <DispatchModal
        complaint={selectedComplaint}
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
      />

      <ResolutionModal
        complaint={selectedComplaint}
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
      />

    </div>
  );
};
