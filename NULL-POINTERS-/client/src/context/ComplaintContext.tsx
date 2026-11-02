import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Complaint, DashboardStats, RiskZone } from '../types';
import { api } from '../services/api';

interface ComplaintContextType {
  complaints: Complaint[];
  stats: DashboardStats | null;
  riskZones: RiskZone[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createComplaint: (data: any) => Promise<{ complaint: Complaint; isDuplicateGrouped: boolean; masterComplaint?: Complaint }>;
  supportComplaint: (id: string, citizenData: any) => Promise<Complaint>;
  verifyEmergency: (id: string, verified: boolean, notes?: string) => Promise<Complaint>;
  assignWorker: (id: string, workerId?: string, department?: string) => Promise<Complaint>;
  updateStatus: (id: string, status: string) => Promise<Complaint>;
  submitResolution: (id: string, data: any) => Promise<{ complaint: Complaint; verification: any }>;
  adminReviewResolution: (id: string, action: 'approve' | 'reject', notes?: string, adminName?: string) => Promise<Complaint>;
  resetDemoData: () => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [compRes, statsRes, riskRes] = await Promise.all([
        api.getComplaints(),
        api.getDashboardStats(),
        api.getRiskZones()
      ]);
      setComplaints(compRes.complaints);
      setStats(statsRes);
      setRiskZones(riskRes.riskZones);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load portal data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createComplaint = async (data: any) => {
    const res = await api.createComplaint(data);
    await refreshData();
    return res;
  };

  const supportComplaint = async (id: string, citizenData: any) => {
    const res = await api.supportComplaint(id, citizenData);
    await refreshData();
    return res.complaint;
  };

  const verifyEmergency = async (id: string, verified: boolean, notes?: string) => {
    const res = await api.verifyEmergency(id, verified, notes);
    await refreshData();
    return res.complaint;
  };

  const assignWorker = async (id: string, workerId?: string, department?: string) => {
    const res = await api.assignWorker(id, workerId, department);
    await refreshData();
    return res.complaint;
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await api.updateStatus(id, status);
    await refreshData();
    return res.complaint;
  };

  const submitResolution = async (id: string, data: any) => {
    const res = await api.submitResolution(id, data);
    await refreshData();
    return { complaint: res.complaint, verification: res.resolutionVerification };
  };

  const adminReviewResolution = async (id: string, action: 'approve' | 'reject', notes?: string, adminName?: string) => {
    const res = await api.adminReviewResolution(id, action, notes, adminName);
    await refreshData();
    return res.complaint;
  };

  const resetDemoData = async () => {
    await api.resetDemoData();
    await refreshData();
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        stats,
        riskZones,
        isLoading,
        error,
        refreshData,
        createComplaint,
        supportComplaint,
        verifyEmergency,
        assignWorker,
        updateStatus,
        submitResolution,
        adminReviewResolution,
        resetDemoData
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used within a ComplaintProvider');
  return context;
};
