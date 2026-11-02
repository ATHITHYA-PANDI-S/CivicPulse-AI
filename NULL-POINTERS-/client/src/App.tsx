import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { Login } from './pages/Login';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { CitizenReport } from './pages/CitizenReport';
import { CitizenComplaints } from './pages/CitizenComplaints';
import { CitizenChatbot } from './pages/CitizenChatbot';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthorityComplaints } from './pages/AuthorityComplaints';
import { AuthorityMap } from './pages/AuthorityMap';
import { AuthorityAnalytics } from './pages/AuthorityAnalytics';
import { AuthorityRiskZones } from './pages/AuthorityRiskZones';
import { AuthorityTeams } from './pages/AuthorityTeams';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { Register } from './pages/Register';
import { UserRole } from './types';

// Protected Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactElement; allowedRole?: UserRole }> = ({ 
  children, 
  allowedRole 
}) => {
  const { user, role } = useAuth();

  if (!user) {
    // If not logged in, ALWAYS redirect to Login landing page
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = (role === 'user' ? 'citizen' : role === 'worker' ? 'authority' : role);
  const targetAllowed = (allowedRole === 'user' ? 'citizen' : allowedRole === 'worker' ? 'authority' : allowedRole);

  if (targetAllowed && effectiveRole !== targetAllowed) {
    // Redirect to their own role dashboard if trying to access unauthorized role route
    return <Navigate to={effectiveRole === 'admin' ? '/admin/dashboard' : effectiveRole === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'} replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm font-semibold">
        Initializing CivicPulse AI Portal...
      </div>
    );
  }

  // If NOT logged in, support both Login and Register
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-6">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  // If LOGGED IN, render the full application with Navbar and Protected Dashboard Routes
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Root redirect to specific logged-in dashboard */}
          <Route
            path="/"
            element={
              <Navigate to={role === 'admin' ? '/admin/dashboard' : role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'} replace />
            }
          />
          <Route
            path="/login"
            element={
              <Navigate to={role === 'admin' ? '/admin/dashboard' : role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'} replace />
            }
          />

          {/* 1. CITIZEN ROUTES (Give Complaint) */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/report"
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/complaints"
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/chatbot"
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenChatbot />
              </ProtectedRoute>
            }
          />

          {/* 2. FIELD WORKER ROUTES (Do Field Work) */}
          <Route
            path="/authority/dashboard"
            element={
              <ProtectedRoute allowedRole="authority">
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRole="authority">
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />

          {/* 3. ADMIN ROUTES (Monitor & Dispatch) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Operations Routes */}
          <Route
            path="/authority/complaints"
            element={
              <ProtectedRoute>
                <AuthorityComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/map"
            element={
              <ProtectedRoute>
                <AuthorityMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/analytics"
            element={
              <ProtectedRoute>
                <AuthorityAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/risk-zones"
            element={
              <ProtectedRoute>
                <AuthorityRiskZones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/teams"
            element={
              <ProtectedRoute>
                <AuthorityTeams />
              </ProtectedRoute>
            }
          />

          {/* Common Authenticated Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route
            path="*"
            element={
              <Navigate to={role === 'admin' ? '/admin/dashboard' : role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'} replace />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ComplaintProvider>
          <NotificationProvider>
            <ThemeProvider>
              <AppRoutes />
            </ThemeProvider>
          </NotificationProvider>
        </ComplaintProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
