import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  department?: string;
  zone?: string;
  avatar?: string;
  createdAt: Date;
  comparePassword(entered: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  role: { 
    type: String, 
    required: true, 
    enum: ['citizen', 'authority', 'admin', 'user', 'worker'],
    default: 'citizen'
  },
  phone: { type: String },
  department: { type: String },
  zone: { type: String, default: 'Central Zone, Coimbatore' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (entered: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
