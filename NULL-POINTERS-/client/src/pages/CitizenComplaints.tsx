import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, Layers, Clock, CheckCircle2, Flame, Bot } from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { ComplaintCard } from '../components/citizen/ComplaintCard';

export const CitizenComplaints: React.FC = () => {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [tab, setTab] = useState<'my' | 'community'>('my');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter complaints
  const myComplaints = complaints.filter(
    c => c.citizenId === user?.id || c.supportingReports.some(s => s.citizenId === user?.id)
  );

  const activeList = tab === 'my' ? myComplaints : complaints;

  const filtered = activeList.filter(c => {
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && c.status !== 'resolved') ||
      (statusFilter === 'resolved' && c.status === 'resolved') ||
      (statusFilter === 'emergency' && c.isEmergency);

    const matchesSearch = 
      !searchTerm ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Grievance Tracking & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time status updates, SLA timelines, and AI resolution verification proofs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/citizen/report"
            className="px-4 py-2.5 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Report Issue
          </Link>
          <Link
            to="/citizen/chatbot"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" /> Voice Bot
          </Link>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tab switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 md:flex-none ${
              tab === 'my'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            My Reports ({myComplaints.length})
          </button>
          <button
            onClick={() => setTab('community')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 md:flex-none ${
              tab === 'community'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Community Reports ({complaints.length})
          </button>
        </div>

        {/* Filter buttons & search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active & In-Progress</option>
            <option value="resolved">Resolved & Verified</option>
            <option value="emergency">Emergency Hazards Only</option>
          </select>
        </div>
      </div>

      {/* Grid of Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(comp => (
          <ComplaintCard key={comp.id} complaint={comp} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            No complaints found matching this criteria.
          </div>
        )}
      </div>

    </div>
  );
};
