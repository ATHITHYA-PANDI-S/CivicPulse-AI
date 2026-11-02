import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Building, Phone, Mail, MapPin } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          User Profile & Role Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your civic session, department credentials, and system demo state.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-civic-600 text-white font-black text-2xl flex items-center justify-center shadow">
              {user?.name.charAt(0) || 'U'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {user?.department || 'Chennai Citizen Resident'} • {user?.zone || 'Central Zone'}
            </p>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </span>
            <div className="font-bold text-slate-900 dark:text-white">{user?.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Contact Phone
            </span>
            <div className="font-bold text-slate-900 dark:text-white font-mono">{user?.phone || '+91 98401 23456'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Assigned Department
            </span>
            <div className="font-bold text-slate-900 dark:text-white">{user?.department || 'Public Citizen Grievance Portal'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Municipal Zone
            </span>
            <div className="font-bold text-slate-900 dark:text-white">{user?.zone || 'Greater Chennai Corporation'}</div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Account Session</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Currently authenticated as {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
        >
          Sign Out
        </button>
      </div>

    </div>
  );
};
