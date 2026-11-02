import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

export const DEFAULT_DEMO_USERS: User[] = [
  {
    id: 'usr-user-demo',
    name: 'Arun Kumar (Citizen Resident)',
    email: 'user@civicpulse.org',
    role: 'citizen',
    zone: 'Gandhipuram, Central Zone, Coimbatore',
    phone: '+91 98401 23456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-worker-demo',
    name: 'Officer Sundaram K. (Field Worker Lead)',
    email: 'worker@civicpulse.org',
    role: 'authority',
    department: 'Electricity Control Room (TNEB-CR Coimbatore)',
    zone: 'Coimbatore Central Field Unit',
    phone: '+91 98402 34567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin-1',
    name: 'Chief Commissioner Priya R.',
    email: 'admin@civicpulse.org',
    role: 'admin',
    department: 'Coimbatore City Municipal Corporation (CCMC)',
    zone: 'Coimbatore Corporation Command Center',
    phone: '+91 98400 11223',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password?: string, role?: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<User>;
  loginAs: (name: string, role: UserRole, department?: string, zone?: string, email?: string) => void;
  switchUser: (user: User) => void;
  logout: () => void;
  availableDemoUsers: User[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('civic_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [availableDemoUsers] = useState<User[]>(DEFAULT_DEMO_USERS);
  const [isLoading, setIsLoading] = useState(false);

  // Real backend API login
  const login = async (email: string, password?: string, role?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password, role);
      if (res.token) {
        sessionStorage.setItem('civic_auth_token', res.token);
      }
      setUser(res.user);
      sessionStorage.setItem('civic_active_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  // Real backend API registration
  const register = async (userData: Partial<User>): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(userData);
      if (res.token) {
        sessionStorage.setItem('civic_auth_token', res.token);
      }
      setUser(res.user);
      sessionStorage.setItem('civic_active_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAs = (name: string, role: UserRole, department?: string, zone?: string, email?: string) => {
    const normRole = (role === 'user' ? 'citizen' : role === 'worker' ? 'authority' : role) as UserRole;
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: name.trim() || (normRole === 'citizen' ? 'Arun Kumar' : normRole === 'authority' ? 'Officer Sundaram K.' : 'Chief Commissioner Priya R.'),
      email: email || (normRole === 'citizen' ? 'user@civicpulse.org' : normRole === 'authority' ? 'worker@civicpulse.org' : 'admin@civicpulse.org'),
      role: normRole,
      department: normRole === 'authority' 
        ? (department || 'Electricity Control Room (TNEB-CR Coimbatore)') 
        : normRole === 'admin' 
        ? (department || 'Coimbatore City Municipal Corporation') 
        : undefined,
      zone: zone || (normRole === 'citizen' ? 'Gandhipuram, Coimbatore' : 'Coimbatore Central Zone'),
      avatar: normRole === 'admin'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : normRole === 'authority'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setUser(newUser);
    sessionStorage.setItem('civic_active_user', JSON.stringify(newUser));
  };

  const switchUser = (selectedUser: User) => {
    setUser(selectedUser);
    sessionStorage.setItem('civic_active_user', JSON.stringify(selectedUser));
  };

  const logout = () => {
    sessionStorage.removeItem('civic_active_user');
    sessionStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_active_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role === 'user' ? 'citizen' : user?.role === 'worker' ? 'authority' : (user?.role || 'citizen')) as UserRole,
        login,
        register,
        loginAs,
        switchUser,
        logout,
        availableDemoUsers,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
