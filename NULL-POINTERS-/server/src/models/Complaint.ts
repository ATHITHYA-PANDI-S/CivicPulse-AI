import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintDocument extends Document {
  ticketNumber: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  description: string;
  originalLanguage?: string;
  translatedDescription?: string;
  category: string;
  severity: string;
  isEmergency: boolean;
  emergencyVerified: boolean;
  priorityScore: number;
  priorityBreakdown: any;
  location: {
    address: string;
    area: string;
    city: string;
    lat: number;
    lng: number;
    pincode?: string;
    landmark?: string;
  };
  photos: string[];
  videos?: string[];
  status: string;
  department: string;
  assignedWorker?: any;
  supportingReports: any[];
  crowdCount: number;
  aiAnalysis: any;
  slaDeadline: string;
  isSlaBreached: boolean;
  resolution?: any;
  resolutionVerification?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaintDocument>({
  ticketNumber: { type: String, required: true, unique: true },
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  citizenPhone: { type: String },
  description: { type: String, required: true },
  originalLanguage: { type: String, default: 'en' },
  translatedDescription: { type: String },
  category: { type: String, required: true },
  severity: { type: String, default: 'medium' },
  isEmergency: { type: Boolean, default: false },
  emergencyVerified: { type: Boolean, default: false },
  priorityScore: { type: Number, default: 50 },
  priorityBreakdown: { type: Schema.Types.Mixed },
  location: {
    address: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, default: 'Coimbatore' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    pincode: { type: String },
    landmark: { type: String }
  },
  photos: [{ type: String }],
  videos: [{ type: String }],
  status: { 
    type: String, 
    default: 'submitted',
    enum: ['submitted', 'verified', 'assigned', 'in_progress', 'resolution_submitted', 'resolved', 'review_required']
  },
  department: { type: String, required: true },
  assignedWorker: { type: Schema.Types.Mixed },
  supportingReports: [Schema.Types.Mixed],
  crowdCount: { type: Number, default: 1 },
  aiAnalysis: { type: Schema.Types.Mixed },
  slaDeadline: { type: String },
  isSlaBreached: { type: Boolean, default: false },
  resolution: { type: Schema.Types.Mixed },
  resolutionVerification: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export const ComplaintModel = mongoose.models.Complaint || mongoose.model<IComplaintDocument>('Complaint', ComplaintSchema);
