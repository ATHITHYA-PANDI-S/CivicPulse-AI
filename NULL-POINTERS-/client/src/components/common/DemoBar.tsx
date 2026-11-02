import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Layers,
  Check,
  Loader2
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';

export const DemoBar: React.FC = () => {
  const navigate = useNavigate();
  const { createComplaint, resetDemoData, complaints } = useComplaints();
  const { switchUser, availableDemoUsers } = useAuth();
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Demo 1: Emergency Live Wire
  const triggerEmergencyDemo = async () => {
    try {
      setRunningAction('emergency');
      // Switch to Citizen if not
      const citizen = availableDemoUsers.find(u => u.role === 'citizen') || availableDemoUsers[0];
      if (citizen) switchUser(citizen);

      // Submit emergency complaint
      await createComplaint({
        description: 'Live electrical wire snapped from pole and sparking dangerously near school gate on 3rd Avenue.',
        category: 'Electricity',
        location: {
          address: '3rd Avenue, Near DAV School, Anna Nagar',
          area: 'Anna Nagar',
          lat: 13.0855,
          lng: 80.2110
        },
        photos: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop&q=80']
      });

      showToast('🚨 Emergency Created: Priority 98/100, Bypassed Normal Queue!');
      navigate('/authority/dashboard');
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunningAction(null);
    }
  };

  // Demo 2: Duplicate Pothole Crowd Escalation
  const triggerDuplicateDemo = async () => {
    try {
      setRunningAction('duplicate');
      const citizen = availableDemoUsers.find(u => u.role === 'citizen') || availableDemoUsers[0];
      if (citizen) switchUser(citizen);

      // Coordinates within 50m of Anna Nagar Pothole master complaint (13.0845, 80.2105)
      const res = await createComplaint({
        description: 'Dangerous crater pothole right in the middle of 2nd Avenue causing severe traffic slow down.',
        category: 'Roads',
        location: {
          address: '2nd Avenue, Near Metro Gate, Anna Nagar',
          area: 'Anna Nagar',
          lat: 13.0846,
          lng: 80.2106
        },
        photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80']
      });

      if (res.isDuplicateGrouped) {
        showToast('👥 Duplicate Grouped: Crowd Count Escalated & Priority Increased!');
      } else {
        showToast('Complaint Registered and Clustered!');
      }
      navigate('/authority/complaints');
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunningAction(null);
    }
  };

  // Demo 3: Predictive Civic Risk
  const triggerPredictiveDemo = () => {
    showToast('🔮 Predictive Intelligence: 17 Drainage Reports + Rainfall Forecast');
    navigate('/authority/risk-zones');
  };

  // Demo 4: AI Resolution Verification
  const triggerResolutionDemo = () => {
    // Jump to resolved complaint with photo comparison
    const resolvedComp = complaints.find(c => c.status === 'resolved') || complaints[0];
    showToast('📸 AI Resolution Verification: Before vs After (92% Pass Confidence)');
    if (resolvedComp) {
      navigate(`/authority/complaints/${resolvedComp.id}`);
    } else {
      navigate('/authority/complaints');
    }
  };

  const handleReset = async () => {
    try {
      setRunningAction('reset');
      await resetDemoData();
      showToast('🔄 Demo Data Reset to Factory Initial State');
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-3 sm:px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Badge */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
              JUDGES DEMO MODE
            </span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              1-Click Instant Scenario Triggers:
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={triggerEmergencyDemo}
              disabled={runningAction !== null}
              className="inline-flex items-center px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] transition shadow-sm disabled:opacity-50"
              title="Creates a live wire emergency, bypasses queue, priority 98"
            >
              {runningAction === 'emergency' ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Zap className="w-3 h-3 mr-1 text-amber-200 fill-current" />
              )}
              Demo: ⚡ Emergency Hazard
            </button>

            <button
              onClick={triggerDuplicateDemo}
              disabled={runningAction !== null}
              className="inline-flex items-center px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition shadow-sm disabled:opacity-50"
              title="Simulates crowd duplicate reporting grouping into 1 master ticket"
            >
              {runningAction === 'duplicate' ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Users className="w-3 h-3 mr-1" />
              )}
              Demo: 👥 Duplicate Crowd
            </button>

            <button
              onClick={triggerPredictiveDemo}
              className="inline-flex items-center px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition shadow-sm"
              title="Inspect Velachery recurring flood risk zone with weather fusion"
            >
              <Layers className="w-3 h-3 mr-1" />
              Demo: 🔮 Predictive Risk
            </button>

            <button
              onClick={triggerResolutionDemo}
              className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition shadow-sm"
              title="Inspect Before vs After AI Photo Verification with 92% PASS"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Demo: 📸 AI Verification
            </button>

            <button
              onClick={handleReset}
              disabled={runningAction !== null}
              className="inline-flex items-center px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition border border-slate-700"
              title="Reset all demo data"
            >
              <RotateCcw className={`w-3 h-3 mr-1 ${runningAction === 'reset' ? 'animate-spin' : ''}`} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-slate-700 flex items-center space-x-3 text-sm animate-bounce">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <span>{successToast}</span>
        </div>
      )}
    </>
  );
};
