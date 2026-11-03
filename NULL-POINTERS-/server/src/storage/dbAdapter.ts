import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { 
  User, 
  Complaint, 
  Department, 
  FieldWorker, 
  RiskZone, 
  NotificationItem 
} from '../types';
import { initialData } from '../utils/seedData';
import { UserModel } from '../models/User';
import { ComplaintModel } from '../models/Complaint';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Schema {
  users: User[];
  complaints: Complaint[];
  departments: Department[];
  fieldWorkers: FieldWorker[];
  riskZones: RiskZone[];
  notifications: NotificationItem[];
}

class DatabaseAdapter {
  private data: Schema;

  constructor() {
    this.data = {
      users: [],
      complaints: [],
      departments: [],
      fieldWorkers: [],
      riskZones: [],
      notifications: []
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure required demo users are present
        initialData.users.forEach(u => {
          if (!this.data.users.some(existing => existing.email.toLowerCase() === u.email.toLowerCase())) {
            this.data.users.push(u);
          }
        });
        this.save();
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.warn('DB initialization fallback to memory store:', err);
      this.seedInitialData();
    }
  }

  public seedInitialData() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.data.complaints = [];
    this.save();
    console.log('🌱 Seeded database with clean initial state (0 complaints).');
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    if (mongoose.connection.readyState === 1) {
      UserModel.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        user,
        { upsert: true, new: true }
      ).catch((err: any) => console.warn('⚠️ [MongoDB Sync] User persist error:', err.message));
    }
    return user;
  }

  // Complaints
  getComplaints(filter?: {
    status?: string;
    category?: string;
    severity?: string;
    isEmergency?: boolean;
    area?: string;
    citizenId?: string;
    department?: string;
    workerId?: string;
  }): Complaint[] {
    let list = [...this.data.complaints];

    if (!filter) return list.sort((a, b) => b.priorityScore - a.priorityScore);

    if (filter.citizenId) {
      list = list.filter(c => c.citizenId === filter.citizenId || c.supportingReports.some(s => s.citizenId === filter.citizenId));
    }
    if (filter.status && filter.status !== 'all') {
      list = list.filter(c => c.status === filter.status);
    }
    if (filter.category && filter.category !== 'all') {
      list = list.filter(c => c.category === filter.category);
    }
    if (filter.severity && filter.severity !== 'all') {
      list = list.filter(c => c.severity === filter.severity);
    }
    if (filter.isEmergency !== undefined) {
      list = list.filter(c => c.isEmergency === filter.isEmergency);
    }
    if (filter.area && filter.area !== 'all') {
      list = list.filter(c => c.location.area.toLowerCase().includes(filter.area!.toLowerCase()));
    }
    if (filter.department && filter.department !== 'all') {
      list = list.filter(c => c.department.toLowerCase().includes(filter.department!.toLowerCase()));
    }
    if (filter.workerId && filter.workerId !== 'all') {
      list = list.filter(c => c.assignedWorker?.id === filter.workerId);
    }

    return list.sort((a, b) => {
      // Emergencies first, then highest priority score
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return b.priorityScore - a.priorityScore;
    });
  }

  getComplaintById(id: string): Complaint | undefined {
    return this.data.complaints.find(c => c.id === id || c.ticketNumber === id);
  }

  addComplaint(complaint: Complaint): Complaint {
    this.data.complaints.unshift(complaint);
    this.save();
    if (mongoose.connection.readyState === 1) {
      ComplaintModel.create(complaint)
        .catch((err: any) => console.warn('⚠️ [MongoDB Sync] Complaint persist error:', err.message));
    }
    return complaint;
  }

  updateComplaint(id: string, updates: Partial<Complaint>): Complaint | undefined {
    const idx = this.data.complaints.findIndex(c => c.id === id || c.ticketNumber === id);
    if (idx === -1) return undefined;
    this.data.complaints[idx] = {
      ...this.data.complaints[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    if (mongoose.connection.readyState === 1) {
      ComplaintModel.findOneAndUpdate(
        { $or: [{ ticketNumber: id }, { _id: (mongoose.isValidObjectId(id) ? id : undefined) }] },
        updates,
        { new: true }
      ).catch((err: any) => console.warn('⚠️ [MongoDB Sync] Complaint update error:', err.message));
    }
    return this.data.complaints[idx];
  }

  deleteComplaint(id: string): boolean {
    const initialLen = this.data.complaints.length;
    this.data.complaints = this.data.complaints.filter(c => c.id !== id && c.ticketNumber !== id);
    const deleted = this.data.complaints.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Departments
  getDepartments(): Department[] {
    return this.data.departments;
  }

  // Field Workers
  getFieldWorkers(department?: string): FieldWorker[] {
    if (!department || department === 'all') return this.data.fieldWorkers;
    return this.data.fieldWorkers.filter(w => w.department.toLowerCase() === department.toLowerCase());
  }

  getFieldWorkerById(id: string): FieldWorker | undefined {
    return this.data.fieldWorkers.find(w => w.id === id);
  }

  updateFieldWorker(id: string, updates: Partial<FieldWorker>): FieldWorker | undefined {
    const idx = this.data.fieldWorkers.findIndex(w => w.id === id);
    if (idx === -1) return undefined;
    this.data.fieldWorkers[idx] = { ...this.data.fieldWorkers[idx], ...updates };
    this.save();
    return this.data.fieldWorkers[idx];
  }

  // Risk Zones
  getRiskZones(): RiskZone[] {
    return this.data.riskZones;
  }

  addRiskZone(zone: RiskZone): RiskZone {
    this.data.riskZones.push(zone);
    this.save();
    return zone;
  }

  updateRiskZone(id: string, updates: Partial<RiskZone>): RiskZone | undefined {
    const idx = this.data.riskZones.findIndex(z => z.id === id);
    if (idx === -1) return undefined;
    this.data.riskZones[idx] = { ...this.data.riskZones[idx], ...updates, lastUpdated: new Date().toISOString() };
    this.save();
    return this.data.riskZones[idx];
  }

  // Notifications
  getNotifications(role?: string, userId?: string): NotificationItem[] {
    let list = [...this.data.notifications];
    if (role) {
      list = list.filter(n => n.targetRole === 'all' || n.targetRole === role || (userId && n.targetUserId === userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notification: NotificationItem): NotificationItem {
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(role?: string, userId?: string): void {
    this.data.notifications.forEach(n => {
      if (!role || n.targetRole === 'all' || n.targetRole === role || (userId && n.targetUserId === userId)) {
        n.isRead = true;
      }
    });
    this.save();
  }

  // Reset helper for hackathon demo
  resetData(): void {
    this.seedInitialData();
  }

  // Dual-Mode Sync with MongoDB Collections
  async syncWithMongo(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) return;
      console.log('🔄 [MongoDB Sync] Synchronizing Mongoose collections with memory store...');
      
      // 1. Sync complaints from MongoDB if they exist
      const mongoComplaints = await ComplaintModel.find().lean();
      if (mongoComplaints.length > 0) {
        this.data.complaints = mongoComplaints as any;
        this.save();
        console.log(`🍃 [MongoDB Sync] Loaded ${mongoComplaints.length} complaints from MongoDB.`);
      } else if (this.data.complaints.length > 0) {
        // Seed MongoDB collection with current complaints
        await ComplaintModel.insertMany(this.data.complaints);
        console.log(`🍃 [MongoDB Sync] Seeded ${this.data.complaints.length} complaints to MongoDB.`);
      }

      // 2. Sync users from MongoDB
      const mongoUsers = await UserModel.find().lean();
      if (mongoUsers.length > 0) {
        mongoUsers.forEach((u: any) => {
          if (!this.data.users.some(existing => existing.email.toLowerCase() === u.email.toLowerCase())) {
            this.data.users.push(u);
          }
        });
        this.save();
        console.log(`🍃 [MongoDB Sync] Loaded ${mongoUsers.length} users from MongoDB.`);
      } else {
        // Seed initial users into MongoDB collection
        await UserModel.insertMany(this.data.users);
        console.log(`🍃 [MongoDB Sync] Seeded ${this.data.users.length} users to MongoDB.`);
      }
    } catch (err: any) {
      console.warn('⚠️ [MongoDB Sync] Initialization sync error:', err.message);
    }
  }
}

export const db = new DatabaseAdapter();
