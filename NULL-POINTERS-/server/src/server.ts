import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/api';
import { connectDB, getDbStatus } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check with MERN stack status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CivicPulse AI Emergency & Citizen Complaint Portal (MERN Stack)',
    stack: 'MongoDB + Express + React + Node.js',
    database: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// In production / cloud environments, serve the compiled Vite client
const possibleClientPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'NULL-POINTERS-/client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, 'client/dist')
];
const clientDistPath = possibleClientPaths.find(p => fs.existsSync(p)) || possibleClientPaths[0];

if (fs.existsSync(clientDistPath)) {
  console.log(`📦 [Production] Serving static client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
} else {
  console.log(`⚠️ [Production] Client dist not found at any path. Checked:`, possibleClientPaths);
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export { app };
export default app;

// Initialize database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 [MERN Stack] CivicPulse AI Backend listening on http://localhost:${PORT}`);
    console.log(`📡 [MERN Stack] REST API available at http://localhost:${PORT}/api`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
