import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useComplaints } from '../context/ComplaintContext';
import { BarChart3, TrendingUp, ShieldCheck, Clock, CheckCircle2, Building } from 'lucide-react';

const COLORS = ['#2563eb', '#dc2626', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export const AuthorityAnalytics: React.FC = () => {
  const { stats, complaints } = useComplaints();
  const [timeRange, setTimeRange] = useState('7d');

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading analytics engine telemetry...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-civic-600" />
            Civic Intelligence & SLA Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time municipal performance metrics, AI triage precision, and turnaround trends.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {['24h', '7d', '30d', '90d'].map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                timeRange === t
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">AI Vision Pass Rate</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.verificationPassRate}%
          </div>
          <div className="text-[11px] text-slate-400">Validated repair proof accuracy</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Response Time</span>
          <div className="text-2xl font-black text-civic-600 dark:text-civic-400">
            18 Mins
          </div>
          <div className="text-[11px] text-slate-400">Emergency hazard field arrival</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">SLA Breach Rate</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            1.2%
          </div>
          <div className="text-[11px] text-slate-400">Within municipal compliance standard</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Duplicate Crowd Reduction</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            38.4%
          </div>
          <div className="text-[11px] text-slate-400">Duplicate tickets merged automatically</div>
        </div>
      </div>

      {/* Charts Grid Row 1: Category Pie & Weekly Trend Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Pie */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Complaints by Civic Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line/Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Daily Inflow vs Verified Resolutions
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recentTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" textAnchor="middle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="submitted" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Charts Grid Row 2: Severity Distribution Bar & Area Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Severity Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Complaints by Severity Tier
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ea580c" radius={[8, 8, 0, 0]}>
                  {stats.severityDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-sev-${index}`} 
                      fill={entry.name === 'Emergency' ? '#dc2626' : entry.name === 'High' ? '#ea580c' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Area */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Incident Density by Metropolitan Ward
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.areaDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" />
                <YAxis dataKey="area" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Total Complaints" />
                <Bar dataKey="emergencyCount" fill="#ef4444" radius={[0, 8, 8, 0]} name="Emergencies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Department Performance Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Department Turnaround & SLA Compliance Index
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Department Name</th>
                <th className="p-3">Total Tickets</th>
                <th className="p-3">Resolved</th>
                <th className="p-3">In Progress</th>
                <th className="p-3">Avg Response</th>
                <th className="p-3 rounded-r-xl">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.departmentPerformance.map((dept, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {dept.department}
                  </td>
                  <td className="p-3 font-semibold">{dept.total}</td>
                  <td className="p-3 text-emerald-600 font-bold">{dept.resolved}</td>
                  <td className="p-3 text-amber-600 font-bold">{dept.inProgress}</td>
                  <td className="p-3 font-mono">{dept.avgResponseMinutes} mins</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${dept.slaCompliance}%` }}></div>
                      </div>
                      <span className="font-bold text-emerald-600">{dept.slaCompliance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
