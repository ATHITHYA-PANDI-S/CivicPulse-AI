import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage/dbAdapter';
import { User, UserRole } from '../types';
import { UserModel } from '../models/User';
import { getDbStatus } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'civicpulse_secret_jwt_key_2026';

// Helper to normalize roles
export const normalizeRole = (role?: string): UserRole => {
  if (!role) return 'citizen';
  const r = role.toLowerCase();
  if (r === 'user' || r === 'citizen') return 'citizen';
  if (r === 'worker' || r === 'authority') return 'authority';
  if (r === 'admin') return 'admin';
  return 'citizen';
};

// In-memory or pre-hashed password dictionary for demo users
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@gmail.com': 'admin@123',
  'admin@civicpulse.org': 'admin@123',
  'worker@civicpulse.org': 'worker123',
  'authority@civicpulse.org': 'worker123',
  'citizen@civicpulse.org': 'citizen123',
  'user@civicpulse.org': 'user123',
  'arun.coimbatore@gmail.com': 'password123'
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.getUserByEmail(cleanEmail);

    // If alias like user@civicpulse.org or worker@civicpulse.org doesn't exist, create/find counterpart
    if (!user) {
      if (cleanEmail === 'worker@civicpulse.org') {
        user = db.getUserByEmail('authority@civicpulse.org');
      } else if (cleanEmail === 'user@civicpulse.org') {
        user = db.getUserByEmail('citizen@civicpulse.org');
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address. Please register.' });
    }

    // Role check if provided
    if (role) {
      const requestedRole = normalizeRole(role);
      const userNormalizedRole = normalizeRole(user.role);
      if (requestedRole !== userNormalizedRole) {
        return res.status(400).json({ 
          error: `Role mismatch: This account is registered as '${user.role}'. Please select the matching role tab.` 
        });
      }
    }

    // Password verification (if password provided)
    if (password) {
      const expectedDemoPass = DEMO_PASSWORDS[cleanEmail] || 'password123';
      let isValidPass = false;

      if (user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          isValidPass = await bcrypt.compare(password, user.password);
        } else {
          isValidPass = user.password === password;
        }
      } else {
        // Fallback for pre-seeded demo accounts
        isValidPass = password === expectedDemoPass || password === 'password123' || password === 'admin123' || password === 'worker123';
      }

      if (!isValidPass) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }
    }

    // Generate real JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user,
      message: 'Login successful',
      dbStatus: getDbStatus()
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login service failed', details: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, department, zone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const normalizedRole = normalizeRole(role);
    if (normalizedRole === 'admin' || role === 'admin') {
      return res.status(403).json({ 
        error: 'Admin registration is restricted. Only one administrator is authorized for this municipal jurisdiction. Please login with official credentials.' 
      });
    }

    // Hash password if supplied
    let hashedPassword: string | undefined = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser: User = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      email: cleanEmail,
      role: normalizedRole,
      password: hashedPassword || password,
      phone: phone?.trim(),
      department: normalizedRole === 'authority' 
        ? (department || 'General Civic Redressal Dept') 
        : undefined,
      zone: zone || 'Central Zone, Coimbatore',
      avatar: normalizedRole === 'authority'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    // Store in storage adapter
    db.addUser(newUser);

    // If MongoDB is connected, also mirror in Mongo UserModel
    try {
      if (getDbStatus().isMongoConnected) {
        await UserModel.create({
          name: newUser.name,
          email: newUser.email,
          password: hashedPassword || 'password123',
          role: newUser.role,
          phone: newUser.phone,
          department: newUser.department,
          zone: newUser.zone,
          avatar: newUser.avatar
        });
      }
    } catch (mErr) {
      console.warn('MongoDB sync notice:', mErr);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return sanitized user (without password)
    const { password: _, ...sanitizedUser } = newUser;

    return res.status(201).json({
      token,
      user: sanitizedUser,
      message: 'Registration successful! Welcome to CivicPulse AI.',
      dbStatus: getDbStatus()
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

export const getProfile = (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    const defaultUser = db.getUsers()[0];
    const { password, ...sanitized } = defaultUser;
    return res.json({ user: sanitized });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password, ...sanitized } = user;
  return res.json({ user: sanitized });
};

export const getDemoUsers = (req: Request, res: Response) => {
  // Returns demo users for instant 1-click test login
  const users = db.getUsers().map(u => {
    const { password, ...sanitized } = u;
    return sanitized;
  });

  return res.json({ 
    users,
    credentialsGuide: [
      { role: 'admin', email: 'admin@gmail.com', password: 'admin@123', name: 'Chief Commissioner Priya R.' },
      { role: 'worker', email: 'authority@civicpulse.org', password: 'worker123', name: 'Officer Sundaram K. (Field Lead)' },
      { role: 'user', email: 'citizen@civicpulse.org', password: 'citizen123', name: 'Arun Kumar (Citizen)' }
    ]
  });
};
