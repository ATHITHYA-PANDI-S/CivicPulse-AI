import React from 'react';
import { AIAnalysis } from '../../types';
import { 
  Sparkles, 
  ShieldAlert, 
  Building, 
  Clock, 
  Flame, 
  CheckCircle2, 
  HelpCircle,
  AlertTriangle 
} from 'lucide-react';
import { PriorityScoreBadge } from '../common/PriorityScoreBadge';

interface Props {
  analysis: AIAnalysis;
  isLoading?: boolean;
}

export const AIPreviewCard: React.FC<Props> = ({ analysis, isLoading = false }) => {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
      analysis.isEmergency
        ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 shadow-md ring-2 ring-red-500/20'
        : 'bg-civic-50/70 dark:bg-slate-900/90 border-civic-200 dark:border-slate-800 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${
            analysis.isEmergency 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-civic-600 text-white'
          }`}>
            {analysis.isEmergency ? <Flame className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              {analysis.isEmergency ? '🚨 EMERGENCY DETECTED' : 'AI Civic Intelligence Analysis'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Confidence: {Math.round(analysis.confidence * 100)}% • Real-time NLP Triage
            </span>
          </div>
        </div>

        <PriorityScoreBadge 
          score={analysis.priorityScore} 
          breakdown={analysis.priorityBreakdown}
          size="md" 
        />
      </div>

      {/* Emergency Alert Callout */}
      {analysis.isEmergency && (
        <div className="mt-3 p-3 rounded-xl bg-red-100 dark:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-semibold flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">CRITICAL LIFE-SAFETY HAZARD IDENTIFIED</div>
            <p className="font-normal mt-0.5">{analysis.emergencyReason || analysis.reasoning}</p>
          </div>
        </div>
      )}

      {/* Grid of AI Detections */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
        
        {/* Category */}
        <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Detected Category</span>
          <div className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
            {analysis.category}
          </div>
        </div>

        {/* Severity */}
        <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Severity Tier</span>
          <div className={`font-bold mt-0.5 text-sm uppercase ${
            analysis.severity === 'emergency' 
              ? 'text-red-600 dark:text-red-400' 
              : analysis.severity === 'high' 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {analysis.severity}
          </div>
        </div>

        {/* Recommended Dept */}
        <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Dept</span>
          <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={analysis.recommendedDepartment}>
            {analysis.recommendedDepartment}
          </div>
        </div>

        {/* Estimated Response */}
        <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Estimated SLA</span>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate" title={analysis.predictedResponseLabel}>
            {analysis.predictedResponseLabel}
          </div>
        </div>
      </div>

      {/* AI Reasoning Text */}
      <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
        <span className="font-bold text-slate-900 dark:text-slate-100">AI Reasoning: </span>
        {analysis.reasoning}
      </div>
    </div>
  );
};
