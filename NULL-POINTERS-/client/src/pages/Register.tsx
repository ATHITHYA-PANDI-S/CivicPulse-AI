import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserPlus, Shield, Wrench, User, Lock, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState<'citizen' | 'authority'>('citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    zone: 'Gandhipuram, Central Zone, Coimbatore',
    department: 'Electricity Control Room (TNEB-CR Coimbatore)',
    workerBadge: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password && formData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const registeredUser = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password || 'password123',
        role: role,
        phone: formData.phone.trim(),
        zone: formData.zone,
        department: role === 'authority' ? formData.department : undefined
      });

      setSuccessMsg(`Welcome, ${registeredUser.name}! Your account is ready.`);

      setTimeout(() => {
        if (registeredUser.role === 'citizen') {
          navigate('/citizen/dashboard');
        } else {
          navigate('/authority/dashboard');
        }
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-civic-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-civic-500/20">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Register New Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the Coimbatore Municipal Grievance & Response Portal as a <strong>Citizen (User)</strong> or <strong>Field Worker (Worker)</strong>.
          </p>
        </div>

        {/* Municipal Admin Notice */}
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-start gap-2.5">
          <Shield className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
          <div>
            <span className="font-bold">Municipal Admin Notice:</span> Only one administrator is authorized for this municipal jurisdiction with official credentials (<code className="font-mono font-bold text-purple-700 dark:text-purple-300">admin@gmail.com</code>). Public self-registration is strictly provisioned for <strong>Citizens</strong> and <strong>Field Workers</strong> only.
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('citizen')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition ${
              role === 'citizen'
                ? 'bg-white dark:bg-slate-900 text-civic-700 dark:text-civic-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-civic-600" />
            👤 Citizen (User)
          </button>

          <button
            type="button"
            onClick={() => setRole('authority')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition ${
              role === 'authority'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-600" />
            🛠️ Field Worker (Worker)
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder={role === 'citizen' ? 'e.g. Arun Kumar' : 'e.g. Officer Sundaram K.'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder={role === 'citizen' ? 'arun.resident@gmail.com' : 'sundaram.worker@civicpulse.org'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 4 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98401 23456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Zone / Ward
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
                >
                  <option value="Gandhipuram, Central Zone, Coimbatore">Gandhipuram (Central Zone)</option>
                  <option value="RS Puram, West Zone, Coimbatore">RS Puram (West Zone)</option>
                  <option value="Peelamedu, East Zone, Coimbatore">Peelamedu (East Zone)</option>
                  <option value="Singanallur, South Zone, Coimbatore">Singanallur (South Zone)</option>
                  <option value="Saravanampatti, North Zone, Coimbatore">Saravanampatti (North Zone)</option>
                  <option value="Ukkadam, Central-South, Coimbatore">Ukkadam</option>
                  <option value="Town Hall, Heritage Core, Coimbatore">Town Hall</option>
                </select>
              </div>
            </div>
          </div>

          {/* Worker Specific Department field */}
          {role === 'authority' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-civic-500 focus:outline-hidden"
              >
                <option value="Electricity Control Room (TNEB-CR Coimbatore)">⚡ Electricity Control Room (TNEB)</option>
                <option value="Highways & Roads Dept">🛣️ Highways & Roads Dept (PWD)</option>
                <option value="CCMC Water Supply & Drainage">🚰 Water Supply & Drainage (CCMC)</option>
                <option value="Sanitation & Solid Waste Management">🗑️ Sanitation & Solid Waste</option>
                <option value="Street Lighting & Electrical Works">💡 Street Lighting Division</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-civic-600 to-indigo-600 hover:from-civic-700 hover:to-indigo-700 text-white font-extrabold shadow-lg shadow-civic-600/25 transition flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <span>Registering Account...</span>
            ) : (
              <span>Complete Registration & Sign In</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-civic-600 dark:text-civic-400 font-bold hover:underline">
            Sign In to your account
          </Link>
        </div>
      </div>
    </div>
  );
};
