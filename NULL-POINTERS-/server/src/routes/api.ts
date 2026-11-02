import { Router } from 'express';
import { login, register, getProfile, getDemoUsers } from '../controllers/authController';
import { 
  getComplaints, 
  getComplaintById, 
  createComplaint, 
  supportComplaint, 
  verifyEmergency, 
  assignWorker, 
  updateStatus, 
  submitResolution,
  adminReviewResolution
} from '../controllers/complaintController';
import { analyzeText, verifyResolutionPhotos, predictZoneRisk } from '../controllers/aiController';
import { getDashboardStats } from '../controllers/dashboardController';
import { getRiskZones, getDepartmentsAndWorkers, resetDatabase } from '../controllers/riskZoneController';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();

// Auth routes
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/profile', getProfile);
router.get('/auth/demo-users', getDemoUsers);

// Complaints routes
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.post('/complaints', createComplaint);
router.post('/complaints/:id/support', supportComplaint);
router.post('/complaints/:id/verify-emergency', verifyEmergency);
router.post('/complaints/:id/assign', assignWorker);
router.patch('/complaints/:id/status', updateStatus);
router.post('/complaints/:id/resolve', submitResolution);
router.post('/complaints/:id/admin-review', adminReviewResolution);

// AI & Prediction routes
router.post('/ai/analyze', analyzeText);
router.post('/ai/verify-resolution', verifyResolutionPhotos);
router.post('/ai/predict-risk', predictZoneRisk);

// Analytics & Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/risk-zones', getRiskZones);
router.get('/teams', getDepartmentsAndWorkers);
router.post('/system/reset', resetDatabase);

// Notifications routes
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);
router.post('/notifications/read-all', markAllAsRead);

export default router;
