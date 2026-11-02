export type UserRole = 'citizen' | 'authority' | 'admin' | 'user' | 'worker';

export type ComplaintCategory = 
  | 'Roads' 
  | 'Electricity' 
  | 'Water' 
  | 'Drainage' 
  | 'Garbage' 
  | 'Streetlights' 
  | 'Sanitation' 
  | 'Public Safety' 
  | 'Other';

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'emergency';

export type ComplaintStatus = 
  | 'submitted' 
  | 'verified' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolution_submitted' 
  | 'resolved' 
  | 'review_required';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  phone?: string;
  department?: string;
  zone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface LocationData {
  address: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  pincode?: string;
  landmark?: string;
}

export interface PriorityBreakdown {
  severityWeight: number;    // e.g. 40 max
  categoryRisk: number;       // e.g. 25 max
  crowdReports: number;       // e.g. 15 max
  locationRisk: number;       // e.g. 10 max
  complaintAge: number;       // e.g. 10 max
  total: number;              // 0 - 100
}

export interface AIAnalysis {
  category: ComplaintCategory;
  confidence: number;         // 0 - 1
  severity: ComplaintSeverity;
  isEmergency: boolean;
  emergencyReason?: string;
  urgencyKeywords: string[];
  sentiment: 'frustrated' | 'urgent' | 'neutral' | 'calm';
  reasoning: string;
  recommendedDepartment: string;
  predictedResponseHours: number;
  predictedResponseLabel: string;
  priorityScore: number;
  priorityBreakdown: PriorityBreakdown;
  isSpam: boolean;
  spamConfidence?: number;
  spamReason?: string;
}

export interface SupportingReport {
  id: string;
  complaintId: string;
  citizenId: string;
  citizenName: string;
  description: string;
  photos?: string[];
  createdAt: string;
  distanceMeters?: number;
}

export interface ResolutionVerification {
  pass: boolean;
  status: 'PASS' | 'REVIEW REQUIRED';
  confidence: number;         // e.g. 0.91 (91%)
  reason: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  verifiedAt: string;
  workerNotes?: string;
}

export interface AdminApproval {
  approved: boolean;
  reviewedBy: string;
  reviewedAt: string;
  notes?: string;
  reason?: string;
}

export interface AssignedWorker {
  id: string;
  name: string;
  teamName: string;
  phone: string;
  department: string;
  distanceKm: number;
  etaMinutes: number;
  assignedAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;       // e.g. "CC-10482"
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  description: string;
  originalLanguage?: 'en' | 'ta' | 'hi';
  translatedDescription?: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  isEmergency: boolean;
  emergencyVerified: boolean;
  priorityScore: number;
  priorityBreakdown: PriorityBreakdown;
  location: LocationData;
  photos: string[];
  videos?: string[];
  status: ComplaintStatus;
  department: string;
  assignedWorker?: AssignedWorker;
  supportingReports: SupportingReport[];
  crowdCount: number;
  aiAnalysis: AIAnalysis;
  slaDeadline: string;
  isSlaBreached: boolean;
  createdAt: string;
  updatedAt: string;
  resolution?: {
    resolvedAt: string;
    proofPhoto: string;
    notes: string;
    resolvedBy: string;
  };
  resolutionVerification?: ResolutionVerification;
  adminApproval?: AdminApproval;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  slaHoursNormal: number;
  slaHoursEmergency: number;
  activeWorkers: number;
  headOfficer: string;
}

export interface FieldWorker {
  id: string;
  name: string;
  teamName: string;
  department: string;
  phone: string;
  lat: number;
  lng: number;
  area: string;
  isAvailable: boolean;
  activeAssignments: number;
  completedTasks: number;
}

export interface RiskZone {
  id: string;
  area: string;
  zone: string;
  category: ComplaintCategory;
  reportCount: number;
  timeWindowDays: number;
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  prediction: string;
  recommendedAction: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  weatherCorrelation?: {
    weatherCondition: string;
    rainProbability: string;
    hazardType: string;
    warningMessage: string;
  };
  lastUpdated: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'emergency' | 'high_priority' | 'status_update' | 'sla_breach' | 'prediction' | 'resolution';
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalComplaints: number;
  activeComplaints: number;
  resolvedComplaints: number;
  emergencyComplaints: number;
  slaBreachedComplaints: number;
  avgResponseHours: number;
  avgResolutionDays: number;
  activeCitizens: number;
  verificationPassRate: number;
  categoryDistribution: { name: string; count: number; percentage: number }[];
  severityDistribution: { name: string; count: number }[];
  recentTrend: { date: string; submitted: number; resolved: number }[];
  areaDistribution: { area: string; count: number; emergencyCount: number }[];
  departmentPerformance: { 
    department: string; 
    total: number; 
    resolved: number; 
    inProgress: number; 
    avgResponseMinutes: number; 
    slaCompliance: number 
  }[];
}
