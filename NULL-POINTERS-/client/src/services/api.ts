import { 
  Complaint, 
  User, 
  DashboardStats, 
  RiskZone, 
  NotificationItem, 
  AIAnalysis, 
  ResolutionVerification,
  Department,
  FieldWorker
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password?: string, role?: string): Promise<{ token: string; user: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async register(data: Partial<User>): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
    return res.json();
  },

  async getDemoUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  // Complaints
  async getComplaints(params?: Record<string, any>): Promise<{ complaints: Complaint[]; total: number }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaintById(id: string): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}`);
    if (!res.ok) throw new Error('Failed to fetch complaint details');
    return res.json();
  },

  async createComplaint(data: any): Promise<{ complaint: Complaint; isDuplicateGrouped: boolean; masterComplaint?: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit complaint');
    return res.json();
  },

  async supportComplaint(id: string, citizenData: { citizenId?: string; citizenName?: string; description?: string }): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citizenData)
    });
    if (!res.ok) throw new Error('Failed to add support');
    return res.json();
  },

  async verifyEmergency(id: string, verified: boolean, notes?: string): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/verify-emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified, officerNotes: notes })
    });
    if (!res.ok) throw new Error('Failed to verify emergency');
    return res.json();
  },

  async assignWorker(id: string, workerId?: string, department?: string): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId, department })
    });
    if (!res.ok) throw new Error('Failed to assign team');
    return res.json();
  },

  async updateStatus(id: string, status: string): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async submitResolution(id: string, data: { proofPhoto?: string; notes?: string; resolvedBy?: string }): Promise<{ complaint: Complaint; resolutionVerification: ResolutionVerification }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit resolution');
    return res.json();
  },

  async adminReviewResolution(id: string, action: 'approve' | 'reject', notes?: string, adminName?: string): Promise<{ complaint: Complaint; message: string }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/admin-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes, adminName })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to process admin review');
    return res.json();
  },

  // AI
  async analyzeText(description: string, category?: string, location?: any): Promise<{ analysis: AIAnalysis }> {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, category, location })
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return res.json();
  },

  async verifyResolutionPhotos(beforePhotoUrl?: string, afterPhotoUrl?: string, category?: string, notes?: string): Promise<{ verification: ResolutionVerification }> {
    const res = await fetch(`${API_BASE}/ai/verify-resolution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beforePhotoUrl, afterPhotoUrl, category, notes })
    });
    if (!res.ok) throw new Error('AI resolution verification failed');
    return res.json();
  },

  // Dashboard & Risk Zones
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getRiskZones(): Promise<{ riskZones: RiskZone[] }> {
    const res = await fetch(`${API_BASE}/risk-zones`);
    if (!res.ok) throw new Error('Failed to fetch risk zones');
    return res.json();
  },

  async getTeams(): Promise<{ departments: Department[]; workers: FieldWorker[] }> {
    const res = await fetch(`${API_BASE}/teams`);
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  },

  // Notifications
  async getNotifications(role?: string, userId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (userId) params.append('userId', userId);
    const res = await fetch(`${API_BASE}/notifications?${params.toString()}`);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(role?: string, userId?: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userId })
    });
  },

  // Reset
  async resetDemoData(): Promise<void> {
    await fetch(`${API_BASE}/system/reset`, { method: 'POST' });
  }
};
