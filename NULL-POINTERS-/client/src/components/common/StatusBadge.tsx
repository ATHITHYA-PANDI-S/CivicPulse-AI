import React from 'react';
import { ComplaintStatus } from '../../types';
import { CheckCircle2, Clock, Wrench, AlertCircle, ShieldAlert, Check } from 'lucide-react';

interface Props {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  let label = 'Submitted';
  let color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let Icon = Clock;

  switch (status) {
    case 'submitted':
      label = 'Submitted';
      color = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      Icon = Clock;
      break;
    case 'verified':
      label = 'AI Verified';
      color = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
      Icon = Check;
      break;
    case 'assigned':
      label = 'Assigned to Team';
      color = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      Icon = AlertCircle;
      break;
    case 'in_progress':
      label = 'In Progress';
      color = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse-subtle';
      Icon = Wrench;
      break;
    case 'resolution_submitted':
      label = 'Proof In Admin Review';
      color = 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 font-bold animate-pulse-subtle';
      Icon = ShieldAlert;
      break;
    case 'resolved':
      label = 'Resolved & Verified';
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      Icon = CheckCircle2;
      break;
    case 'review_required':
      label = 'Review Required';
      color = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      Icon = AlertCircle;
      break;
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border shadow-2xs ${color} ${px}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};
