import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Bot, 
  MapPin, 
  BarChart3, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Layers, 
  Flame, 
  Menu, 
  X,
  ShieldCheck,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link 
              to={!user ? '/login' : role === 'citizen' ? '/citizen/dashboard' : role === 'authority' ? '/authority/dashboard' : '/admin/dashboard'} 
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-civic-700 to-civic-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  CivicPulse<span className="text-civic-600 dark:text-civic-400">AI</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 -mt-1 tracking-wider uppercase">
                  {role === 'admin' 
                    ? '🏛️ Admin Monitoring Console' 
                    : role === 'authority' 
                    ? '🛠️ Field Worker Console' 
                    : '👤 Citizen Grievance Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links according to Active Role */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {/* 1. CITIZEN LINKS */}
              {role === 'citizen' && (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/citizen/dashboard')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    Citizen Home
                  </Link>
                  <Link
                    to="/citizen/report"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/citizen/report')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    Give Complaint
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/citizen/complaints')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    My Complaints
                  </Link>
                  <Link
                    to="/citizen/chatbot"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/citizen/chatbot')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <Bot className="w-4 h-4 text-civic-500" />
                    AI Voice Bot
                  </Link>
                </>
              )}

              {/* 2. AUTHORITATIVE LINKS (Field Work) */}
              {role === 'authority' && (
                <>
                  <Link
                    to="/authority/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/authority/dashboard')
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 font-bold'
                        : 'text-amber-700 dark:text-amber-300 hover:bg-amber-50/40'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-amber-600" />
                    Field Work Desk
                  </Link>
                  <Link
                    to="/authority/complaints"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/authority/complaints')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    Work Orders
                  </Link>
                  <Link
                    to="/authority/map"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/authority/map')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Field GPS Map
                  </Link>
                  <Link
                    to="/authority/teams"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/authority/teams')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Squad Units
                  </Link>
                </>
              )}

              {/* 3. ADMIN LINKS (Monitoring & Oversight) */}
              {role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/admin/dashboard')
                        ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200 font-bold'
                        : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Admin Command & Proof Desk
                  </Link>
                  <Link
                    to="/authority/map"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/authority/map')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    City GIS Map
                  </Link>
                  <Link
                    to="/authority/risk-zones"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/authority/risk-zones')
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold'
                        : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50/40'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-purple-500" />
                    Predictive Risks
                  </Link>
                  <Link
                    to="/authority/analytics"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      isActive('/authority/analytics')
                        ? 'bg-civic-50 text-civic-700 dark:bg-civic-950/50 dark:text-civic-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    SLA Analytics
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {user && role === 'citizen' && (
              <Link
                to="/citizen/report"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg bg-civic-600 hover:bg-civic-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Give Complaint
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile Badge & Logout */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    role === 'admin' ? 'bg-purple-600' : role === 'authority' ? 'bg-amber-600' : 'bg-civic-600'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[120px] truncate leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {role === 'admin' ? '🏛️ Admin' : role === 'authority' ? '🛠️ Field Worker' : '👤 Citizen (User)'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition flex items-center gap-1"
                  title="Log out and return to Login"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-xl border border-civic-300 dark:border-civic-700 text-civic-700 dark:text-civic-300 hover:bg-civic-50 dark:hover:bg-civic-950 font-bold text-xs transition"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow-md transition"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation tray */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {role === 'citizen' && (
            <>
              <Link to="/citizen/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Citizen Home</Link>
              <Link to="/citizen/report" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-civic-600 font-bold">Give Complaint</Link>
              <Link to="/citizen/complaints" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">My Complaints</Link>
              <Link to="/citizen/chatbot" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">AI Voice Assistant</Link>
            </>
          )}

          {role === 'authority' && (
            <>
              <Link to="/authority/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-amber-600 font-bold">Field Work Desk</Link>
              <Link to="/authority/complaints" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Work Orders</Link>
              <Link to="/authority/map" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Field GPS Map</Link>
              <Link to="/authority/teams" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Squad Units</Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 font-bold">Monitoring & Dispatch Hub</Link>
              <Link to="/authority/map" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">City GIS Map</Link>
              <Link to="/authority/risk-zones" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Predictive Risks</Link>
              <Link to="/authority/analytics" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">SLA Analytics</Link>
            </>
          )}

          <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
