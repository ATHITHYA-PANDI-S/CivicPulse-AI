import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Department, FieldWorker } from '../types';
import { Users, Phone, MapPin, CheckCircle2, Clock, Wrench, Shield } from 'lucide-react';

export const AuthorityTeams: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<FieldWorker[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    api.getTeams().then(data => {
      setDepartments(data.departments);
      setWorkers(data.workers);
    });
  }, []);

  const filteredWorkers = workers.filter(
    w => selectedDept === 'all' || w.department.toLowerCase().includes(selectedDept.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-civic-600" />
            Field Response Teams & Squad Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time GPS availability, active assignment loads, and dispatch coordination.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="all">All Municipal Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Quick KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {departments.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] text-slate-400 uppercase">{d.code}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Active</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">
              {d.name}
            </h4>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-0.5">
              <div>Squads: <strong>{d.activeWorkers} Units</strong></div>
              <div>Emergency SLA: <strong>{d.slaHoursEmergency} Hour</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Field Worker Squads Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Active Field Units & Flying Squads ({filteredWorkers.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(w => (
            <div
              key={w.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-civic-700 dark:bg-blue-950 dark:text-civic-300">
                    {w.department}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Available
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {w.teamName}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Lead Officer: <strong>{w.name}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="font-mono font-semibold">{w.phone}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>Operating Ward: <strong>{w.area}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Active Loads: <strong>{w.activeAssignments}</strong></span>
                <span className="font-bold text-emerald-600">✓ {w.completedTasks} Tasks Closed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
