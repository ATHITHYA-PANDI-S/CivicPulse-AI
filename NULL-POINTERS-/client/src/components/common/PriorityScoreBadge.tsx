import React, { useState } from 'react';
import { PriorityBreakdown } from '../../types';
import { Info, HelpCircle } from 'lucide-react';

interface Props {
  score: number;
  breakdown?: PriorityBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const PriorityScoreBadge: React.FC<Props> = ({ 
  score, 
  breakdown, 
  size = 'md',
  showDetails = false 
}) => {
  const [isOpen, setIsOpen] = useState(showDetails);

  // Color gradient according to severity priority
  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  let barColor = 'bg-emerald-500';

  if (score >= 90) {
    bgClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse-subtle';
    barColor = 'bg-red-600';
  } else if (score >= 75) {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    barColor = 'bg-amber-500';
  } else if (score >= 50) {
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    barColor = 'bg-blue-500';
  }

  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2.5 py-1';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center font-semibold rounded-md border transition shadow-sm ${bgClass} ${textSize}`}
        title="Click to view explainable AI priority breakdown"
      >
        <span className="mr-1.5 font-bold">Priority:</span>
        <span className="font-extrabold">{score}</span>
        <span className="text-[10px] opacity-75 font-normal ml-0.5">/100</span>
        <HelpCircle className="w-3 h-3 ml-1.5 opacity-70 hover:opacity-100" />
      </button>

      {/* Explainable AI Score Breakdown Dropdown / Popover */}
      {isOpen && breakdown && (
        <div className="absolute left-0 mt-2 z-40 w-72 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl text-xs space-y-2.5 text-slate-700 dark:text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center font-bold text-slate-900 dark:text-white">
              <Info className="w-3.5 h-3.5 mr-1.5 text-civic-600 dark:text-civic-400" />
              Explainable AI Priority Score
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Severity Weight (max 40)</span>
              <span className="font-semibold text-slate-900 dark:text-white">+{breakdown.severityWeight}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${(breakdown.severityWeight / 40) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-500 dark:text-slate-400">Category Risk (max 25)</span>
              <span className="font-semibold text-slate-900 dark:text-white">+{breakdown.categoryRisk}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(breakdown.categoryRisk / 25) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-500 dark:text-slate-400">Crowd Reports (max 25)</span>
              <span className="font-semibold text-slate-900 dark:text-white">+{breakdown.crowdReports}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(breakdown.crowdReports / 25) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-500 dark:text-slate-400">Location Risk (max 10)</span>
              <span className="font-semibold text-slate-900 dark:text-white">+{breakdown.locationRisk}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(breakdown.locationRisk / 10) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-500 dark:text-slate-400">Complaint Age (max 10)</span>
              <span className="font-semibold text-slate-900 dark:text-white">+{breakdown.complaintAge}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(breakdown.complaintAge / 10) * 100}%` }}></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-bold text-xs">
            <span>Total AI Priority:</span>
            <span className="text-civic-600 dark:text-civic-400 text-sm font-extrabold">{score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};
