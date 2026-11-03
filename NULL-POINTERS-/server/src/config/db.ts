import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading from multiple potential env paths (ByteXL root, parent dir, current dir)
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  '/home/workspace/my-project/.env'
];

envPaths.forEach(p => {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
});

let isConnected = false;
let activeURI = '';

export const connectDB = async (): Promise<boolean> => {
  const candidates: string[] = [];

  const envURI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (envURI) candidates.push(envURI);

  // Common local/container endpoints (including ByteXL's workspace database)
  candidates.push('mongodb://127.0.0.1:27017/db_4583t7ec5');
  candidates.push('mongodb://localhost:27017/db_4583t7ec5');
  candidates.push('mongodb://127.0.0.1:27017/citizen_ai_portal');
  candidates.push('mongodb://localhost:27017/citizen_ai_portal');
  candidates.push('mongodb://mongodb:27017/citizen_ai_portal');

  mongoose.set('strictQuery', false);

  for (const uri of candidates) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 1500,
      });

      isConnected = true;
      activeURI = uri;
      console.log(`🍃 [MERN Stack] MongoDB Connected successfully: ${conn.connection.host} (${conn.connection.name})`);
      return true;
    } catch (e) {
      // try next candidate
    }
  }

  isConnected = false;
  console.log(`ℹ️ [MERN Stack] Local MongoDB service inactive.`);
  console.log(`🚀 [MERN Stack] Running in resilient hybrid mode: Embedded database active with zero-latency seed data.`);
  return false;
};

export const getDbStatus = () => ({
  isMongoConnected: isConnected,
  databaseType: isConnected ? 'MongoDB (Mongoose)' : 'Resilient Dual-Mode JSON Store',
  uri: activeURI || (process.env.MONGODB_URI ? 'Configured via .env' : 'mongodb://127.0.0.1:27017/citizen_ai_portal')
});
