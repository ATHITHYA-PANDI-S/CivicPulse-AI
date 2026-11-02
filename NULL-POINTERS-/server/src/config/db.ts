import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citizen_ai_portal';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Quick failover if local mongo daemon is inactive
    });

    isConnected = true;
    console.log(`🍃 [MERN Stack] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.log(`ℹ️ [MERN Stack] MongoDB not running locally (${err.message || 'connection timeout'}).`);
    console.log(`🚀 [MERN Stack] Running in resilient hybrid mode: Embedded database active with zero-latency seed data.`);
    return false;
  }
};

export const getDbStatus = () => ({
  isMongoConnected: isConnected,
  databaseType: isConnected ? 'MongoDB (Mongoose)' : 'Resilient Dual-Mode JSON Store',
  uri: process.env.MONGODB_URI ? 'Configured via .env' : 'mongodb://127.0.0.1:27017/citizen_ai_portal'
});
