import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Bot, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Bell, 
  Search, 
  Filter, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ComplaintCard } from '../components/citizen/ComplaintCard';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints, stats } = useComplaints();
  const { notifications, unreadCount } = useNotifications();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // User's own or community complaints
  const myComplaints = complaints.filter(
    c => c.citizenId === user?.id || c.supportingReports.some(s => s.citizenId === user?.id)
  );

  const activeComplaints = complaints.filter(c => c.status !== 'resolved');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  const emergencyComplaints = complaints.filter(c => c.isEmergency && c.status !== 'resolved');

  const filteredList = complaints.filter(c => {
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Unverified Emergency Warning Banner */}
      <EmergencyBanner />

      {/* Top Welcome Banner & CTA */}
      <div className="bg-gradient-to-r from-civic-700 via-civic-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur border border-white/20 text-civic-200">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
            AI-Powered Civic Assistant Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Report local civic issues, track real-time resolution pipelines, or speak directly in Tamil, Hindi, or English using our AI voice assistant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/citizen/report"
            className="px-5 py-3 rounded-2xl bg-white text-civic-700 font-extrabold text-sm shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-civic-600" />
            Report New Issue
          </Link>
          <Link
            to="/citizen/chatbot"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg transition flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Voice Chatbot
          </Link>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-civic-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-civic-600 dark:bg-blue-950/50 dark:text-civic-400 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {complaints.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Complaints</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeComplaints.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active / In Progress</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {resolvedComplaints.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Resolved & Verified</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {emergencyComplaints.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Emergency Hazards</div>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Complaints Feed (Left) & Notifications (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Complaints List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, address, issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Electricity', 'Roads', 'Drainage', 'Water', 'Garbage'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-civic-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Live Community Complaints Feed ({filteredList.length})
              </h3>
              <span className="text-xs text-slate-400">
                Click "+1 I face this issue" to add crowd weight
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredList.map(comp => (
                <ComplaintCard key={comp.id} complaint={comp} />
              ))}
              {filteredList.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-3xl">📋</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    No Complaints Registered Yet
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    The grievance board is completely clean. Click below to submit the first civic issue in your ward.
                  </p>
                  <Link
                    to="/citizen/report"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow-md transition"
                  >
                    + Report a Grievance
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Notifications & Quick Assistance (1 col) */}
        <div className="space-y-6">
          
          {/* Notifications Panel */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-civic-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Live Civic Alerts
                </h3>
              </div>
              <Link to="/notifications" className="text-xs font-semibold text-civic-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                    n.isRead
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-transparent text-slate-500'
                      : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900 text-slate-900 dark:text-slate-100 font-medium'
                  }`}
                >
                  <div className="font-bold text-xs">{n.title}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Voice Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white space-y-3 shadow-md border border-indigo-800/60">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-sm">Multilingual Voice Bot</span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Don't want to type? Speak naturally in தமிழ் or हिन्दी to file electrical emergencies, water pipe bursts, or road hazards instantly.
            </p>
            <Link
              to="/citizen/chatbot"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow transition"
            >
              Start Voice Assistant <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
