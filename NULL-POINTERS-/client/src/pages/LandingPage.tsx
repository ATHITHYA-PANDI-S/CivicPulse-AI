import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  Bot, 
  Users, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Activity, 
  Zap, 
  MapPin, 
  Search,
  Radio
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { LeafletComplaintMap } from '../components/map/LeafletComplaintMap';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, complaints, riskZones } = useComplaints();

  return (
    <div className="space-y-16 py-6 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
        
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-civic-700 dark:text-civic-300 text-xs font-bold tracking-wide shadow-2xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-civic-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-civic-600"></span>
          </span>
          Next-Gen AI Emergency & Civic Governance Platform
        </div>

        {/* Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none max-w-4xl mx-auto">
          Report. Respond. <span className="text-civic-600 dark:text-civic-400">Resolve.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          An AI-powered citizen complaint platform that helps municipal authorities identify life-safety emergencies, prioritize problems, merge duplicate crowd reports, and verify resolution proof with AI vision.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/citizen/report"
            className="px-6 py-3 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-civic-200" />
            Report an Issue
          </Link>

          <Link
            to="/citizen/chatbot"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-md transition flex items-center gap-2"
          >
            <Bot className="w-5 h-5" />
            Multilingual Voice Bot
          </Link>

          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-extrabold text-sm sm:text-base shadow-md transition flex items-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Portal Sign In
          </Link>
        </div>
      </section>

      {/* 2. REAL-TIME PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {stats?.resolvedComplaints || 482}+
              </div>
              <div className="text-xs text-slate-500 font-medium">Complaints Resolved</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {stats?.emergencyComplaints || 3} Active
              </div>
              <div className="text-xs text-slate-500 font-medium">Emergency Hazards</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-civic-600 dark:bg-blue-950/50 dark:text-civic-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {stats?.activeCitizens || '1,284'}
              </div>
              <div className="text-xs text-slate-500 font-medium">Active Citizens</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                18 Mins
              </div>
              <div className="text-xs text-slate-500 font-medium">Avg Emergency Response</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE GIS TELEMETRY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Municipal Telemetry & GIS Heatmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive map pins representing active complaints, life-safety emergencies, and predictive recurring risk zones.
            </p>
          </div>
          <Link
            to="/authority/map"
            className="inline-flex items-center text-xs font-bold text-civic-600 dark:text-civic-400 hover:underline"
          >
            Open Fullscreen GIS Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <LeafletComplaintMap complaints={complaints} riskZones={riskZones} height="420px" />
      </section>

      {/* 4. SIX CORE AI DIFFERENTIATORS (FEATURE CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Engineered for Municipal High-Stakes Response
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Beyond ordinary ticket forms. An intelligent civic operating system driven by 6 core AI capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Emergency Detection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detects live wires, gas leaks, sparking transformers, and open manholes in real-time. Immediately elevates priority to 98/100 and bypasses normal queues.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multilingual Voice Reporting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Citizens speak or type naturally in Tamil, Hindi, or English. The NLP engine translates, extracts intent, and maps to the right civic department automatically.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-civic-600 dark:text-civic-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Smart Duplicate & Crowd Severity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Groups 25 citizen reports for the same pothole into 1 Master Ticket + 24 Supporting Reports. Increases priority dynamically based on crowd volume.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Predictive Civic Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Identifies chronic failure zones (e.g. 17 drainage reports in Velachery) and fuses with weather radar to predict flood risks before downpours happen.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Resolution Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Computer vision compares before vs after repair photographs to confirm actual defect repair, providing PASS (92%) confidence and civic accountability.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Explainable Priority & SLA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No black-box scores. Shows exact mathematical breakdown: Severity (+40) + Category (+25) + Crowd (+18) + Location (+9) + Age (+6) = 98/100.
            </p>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS (5 STEP CIVIC PIPELINE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How CivicPulse AI Operates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A transparent, closed-loop pipeline from initial citizen voice report to verified field resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-civic-600 text-white font-extrabold flex items-center justify-center mx-auto text-xs">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Citizen Reports</h4>
            <p className="text-[11px] text-slate-500">
              Submit via multi-step form, photo, GPS pin, or Tamil/Hindi voice assistant.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-civic-600 text-white font-extrabold flex items-center justify-center mx-auto text-xs">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">AI Analyzes</h4>
            <p className="text-[11px] text-slate-500">
              NLP extracts category, severity, emergency triggers, and checks duplicate proximity.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-civic-600 text-white font-extrabold flex items-center justify-center mx-auto text-xs">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Smart Prioritization</h4>
            <p className="text-[11px] text-slate-500">
              Calculates explainable priority score (0-100) and routes to nearest response team.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-civic-600 text-white font-extrabold flex items-center justify-center mx-auto text-xs">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Authority Responds</h4>
            <p className="text-[11px] text-slate-500">
              Officer verifies hazard, dispatches field squad, and monitors SLA deadline.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto text-xs">
              5
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">AI Verifies Resolution</h4>
            <p className="text-[11px] text-slate-500">
              Computer vision compares before/after photos and notifies citizen of verified fix.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
