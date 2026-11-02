import { Request, Response } from 'express';
import { db } from '../storage/dbAdapter';
import { AIService } from '../services/aiService';
import { 
  Complaint, 
  ComplaintCategory, 
  LocationData, 
  SupportingReport 
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getComplaints = (req: Request, res: Response) => {
  const { status, category, severity, isEmergency, area, citizenId, department, workerId } = req.query;

  const filter: any = {};
  if (status) filter.status = String(status);
  if (category) filter.category = String(category);
  if (severity) filter.severity = String(severity);
  if (isEmergency !== undefined) filter.isEmergency = isEmergency === 'true';
  if (area) filter.area = String(area);
  if (citizenId) filter.citizenId = String(citizenId);
  if (department) filter.department = String(department);
  if (workerId) filter.workerId = String(workerId);

  const complaints = db.getComplaints(filter);
  return res.json({ complaints, total: complaints.length });
};

export const getComplaintById = (req: Request, res: Response) => {
  const { id } = req.params;
  const complaint = db.getComplaintById(id);

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  return res.json({ complaint });
};

export const createComplaint = (req: Request, res: Response) => {
  const {
    description,
    category,
    location,
    photos,
    videos,
    citizenId,
    citizenName,
    citizenPhone,
    originalLanguage
  } = req.body;

  if (!description || !location || !location.lat || !location.lng) {
    return res.status(400).json({ error: 'Description and GPS Location (lat, lng) are required' });
  }

  // 1. Run AI Analysis
  const aiAnalysis = AIService.analyzeComplaint(
    description,
    category as ComplaintCategory,
    location,
    0
  );

  // 2. Check for Duplicate Proximity Cluster
  const duplicateCheck = AIService.findDuplicateCluster(
    aiAnalysis.category,
    location.lat,
    location.lng,
    description
  );

  // If Duplicate Found -> Group into Master Complaint + Add Supporting Report
  if (duplicateCheck.isDuplicate && duplicateCheck.masterComplaint) {
    const master = duplicateCheck.masterComplaint;
    const newSupportReport: SupportingReport = {
      id: `sup-${uuidv4().substring(0, 8)}`,
      complaintId: master.id,
      citizenId: citizenId || 'usr-citizen-1',
      citizenName: citizenName || 'Anonymous Citizen',
      description,
      photos: photos || [],
      createdAt: new Date().toISOString(),
      distanceMeters: duplicateCheck.distanceMeters
    };

    const updatedSupporting = [...master.supportingReports, newSupportReport];
    const newCrowdCount = master.crowdCount + 1;

    // Recalculate priority with new crowd weight
    const updatedPriorityBreakdown = AIService.calculatePriorityBreakdown(
      master.category,
      master.severity,
      master.isEmergency,
      newCrowdCount,
      master.location.area
    );

    const updatedMaster = db.updateComplaint(master.id, {
      supportingReports: updatedSupporting,
      crowdCount: newCrowdCount,
      priorityScore: updatedPriorityBreakdown.total,
      priorityBreakdown: updatedPriorityBreakdown,
      aiAnalysis: {
        ...master.aiAnalysis,
        priorityScore: updatedPriorityBreakdown.total,
        priorityBreakdown: updatedPriorityBreakdown,
        reasoning: `Crowd severity escalation: ${newCrowdCount} citizens verified and reported this issue. Escalated priority score to ${updatedPriorityBreakdown.total}/100.`
      }
    });

    // Send crowd alert notification to authority
    db.addNotification({
      id: `notif-${uuidv4().substring(0, 8)}`,
      targetRole: 'authority',
      title: `👥 Crowd Escalation (${newCrowdCount} Reports): #${master.ticketNumber}`,
      message: `Multiple citizens reported duplicate issue at ${master.location.area}. Priority auto-escalated to ${updatedPriorityBreakdown.total}/100.`,
      type: 'high_priority',
      complaintId: master.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({
      message: 'Duplicate complaint detected and grouped into existing Master Complaint.',
      isDuplicateGrouped: true,
      masterComplaint: updatedMaster,
      supportingReport: newSupportReport
    });
  }

  // 3. New Master Complaint Creation
  const newId = `comp-${uuidv4().substring(0, 8)}`;
  const ticketNumber = `CC-${Math.floor(10000 + Math.random() * 90000)}`;

  // Find nearest recommended field team
  const recommendedTeam = AIService.recommendNearestTeam(
    aiAnalysis.recommendedDepartment,
    location.lat,
    location.lng
  );

  // Compute SLA deadline
  const slaHours = aiAnalysis.isEmergency ? 1 : (aiAnalysis.severity === 'high' ? 12 : 36);
  const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

  const newComplaint: Complaint = {
    id: newId,
    ticketNumber,
    citizenId: citizenId || 'usr-citizen-1',
    citizenName: citizenName || 'Arun Kumar',
    citizenPhone: citizenPhone || '+91 98401 23456',
    description,
    originalLanguage: originalLanguage || 'en',
    category: aiAnalysis.category,
    severity: aiAnalysis.severity,
    isEmergency: aiAnalysis.isEmergency,
    emergencyVerified: false,
    priorityScore: aiAnalysis.priorityScore,
    priorityBreakdown: aiAnalysis.priorityBreakdown,
    location: {
      address: location.address || `${location.area || 'Central Ward'}, Coimbatore`,
      area: location.area || 'Gandhipuram',
      city: 'Coimbatore',
      lat: location.lat || 11.0168,
      lng: location.lng || 76.9558,
      pincode: location.pincode || '641012',
      landmark: location.landmark
    },
    photos: photos && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
    videos: videos || [],
    status: aiAnalysis.isEmergency ? 'verified' : 'submitted',
    department: aiAnalysis.recommendedDepartment,
    assignedWorker: recommendedTeam ? {
      id: recommendedTeam.team.id,
      name: recommendedTeam.team.name,
      teamName: recommendedTeam.team.teamName,
      phone: recommendedTeam.team.phone,
      department: recommendedTeam.team.department,
      distanceKm: recommendedTeam.distanceKm,
      etaMinutes: recommendedTeam.etaMinutes,
      assignedAt: new Date().toISOString()
    } : undefined,
    supportingReports: [],
    crowdCount: 1,
    aiAnalysis,
    slaDeadline,
    isSlaBreached: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addComplaint(newComplaint);

  // Generate Notifications
  if (newComplaint.isEmergency) {
    db.addNotification({
      id: `notif-${uuidv4().substring(0, 8)}`,
      targetRole: 'authority',
      title: `🚨 EMERGENCY ALERT: ${newComplaint.category} Hazard (#${ticketNumber})`,
      message: `${aiAnalysis.emergencyReason || 'Critical life safety hazard'} in ${newComplaint.location.area}. Priority: ${newComplaint.priorityScore}/100. Verification required.`,
      type: 'emergency',
      complaintId: newComplaint.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  db.addNotification({
    id: `notif-${uuidv4().substring(0, 8)}`,
    targetRole: 'citizen',
    targetUserId: newComplaint.citizenId,
    title: `📋 Complaint Registered (#${ticketNumber})`,
    message: `Your complaint has been processed by AI and routed to ${newComplaint.department}. Priority: ${newComplaint.priorityScore}/100.`,
    type: 'status_update',
    complaintId: newComplaint.id,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({
    complaint: newComplaint,
    isDuplicateGrouped: false
  });
};

export const supportComplaint = (req: Request, res: Response) => {
  const { id } = req.params;
  const { citizenId, citizenName, description } = req.body;

  const complaint = db.getComplaintById(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const support: SupportingReport = {
    id: `sup-${uuidv4().substring(0, 8)}`,
    complaintId: complaint.id,
    citizenId: citizenId || 'usr-citizen-1',
    citizenName: citizenName || 'Concerned Citizen',
    description: description || 'I also experience and verify this issue at this location.',
    createdAt: new Date().toISOString(),
    distanceMeters: Math.floor(10 + Math.random() * 50)
  };

  const updatedSupporting = [...complaint.supportingReports, support];
  const newCrowdCount = complaint.crowdCount + 1;

  const updatedPriority = AIService.calculatePriorityBreakdown(
    complaint.category,
    complaint.severity,
    complaint.isEmergency,
    newCrowdCount,
    complaint.location.area
  );

  const updated = db.updateComplaint(complaint.id, {
    supportingReports: updatedSupporting,
    crowdCount: newCrowdCount,
    priorityScore: updatedPriority.total,
    priorityBreakdown: updatedPriority,
    aiAnalysis: {
      ...complaint.aiAnalysis,
      priorityScore: updatedPriority.total,
      priorityBreakdown: updatedPriority,
      reasoning: `Crowd severity: ${newCrowdCount} citizens supported this ticket. Escalated priority to ${updatedPriority.total}/100.`
    }
  });

  return res.json({ complaint: updated, supportingReport: support });
};

export const verifyEmergency = (req: Request, res: Response) => {
  const { id } = req.params;
  const { verified, officerNotes } = req.body;

  const complaint = db.getComplaintById(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const updated = db.updateComplaint(complaint.id, {
    emergencyVerified: verified !== false,
    status: verified !== false ? 'assigned' : 'review_required'
  });

  return res.json({ complaint: updated });
};

export const assignWorker = (req: Request, res: Response) => {
  const { id } = req.params;
  const { workerId, department } = req.body;

  const complaint = db.getComplaintById(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  let worker = workerId ? db.getFieldWorkerById(workerId) : undefined;
  if (!worker && department) {
    const rec = AIService.recommendNearestTeam(department, complaint.location.lat, complaint.location.lng);
    if (rec) worker = rec.team;
  }

  if (!worker) {
    return res.status(400).json({ error: 'No field worker found for this department' });
  }

  const distKm = +(AIService.recommendNearestTeam(worker.department, complaint.location.lat, complaint.location.lng)?.distanceKm || 1.5);
  const etaMins = Math.max(10, Math.round(distKm * 5));

  const assignedWorker = {
    id: worker.id,
    name: worker.name,
    teamName: worker.teamName,
    phone: worker.phone,
    department: worker.department,
    distanceKm: distKm,
    etaMinutes: etaMins,
    assignedAt: new Date().toISOString()
  };

  const updated = db.updateComplaint(complaint.id, {
    assignedWorker,
    status: 'assigned',
    department: worker.department
  });

  return res.json({ complaint: updated });
};

export const updateStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const complaint = db.getComplaintById(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const updated = db.updateComplaint(complaint.id, { status });
  return res.json({ complaint: updated });
};

export const submitResolution = (req: Request, res: Response) => {
  const { id } = req.params;
  const { proofPhoto, notes, resolvedBy } = req.body;

  const complaint = db.getComplaintById(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  // Run AI Resolution Verification
  const verification = AIService.verifyResolution(
    complaint.photos[0],
    proofPhoto,
    complaint.category,
    notes
  );

  const updated = db.updateComplaint(complaint.id, {
    status: 'resolution_submitted',
    resolution: {
      resolvedAt: new Date().toISOString(),
      proofPhoto: proofPhoto || 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=800&auto=format&fit=crop&q=80',
      notes: notes || 'Repairs completed by civic field unit.',
      resolvedBy: resolvedBy || 'Field Response Unit'
    },
    resolutionVerification: verification
  });

  // Notify Admin for Inspection & Sign-off
  db.addNotification({
    id: `notif-${uuidv4().substring(0, 8)}`,
    targetRole: 'admin',
    title: `🔍 Work Completion Proof Submitted: #${complaint.ticketNumber}`,
    message: `Worker (${resolvedBy || 'Field Squad'}) completed repairs and uploaded proof photo for ${complaint.category} in ${complaint.location.area}. AI match: ${Math.round(verification.confidence * 100)}%. Inspection and sign-off required.`,
    type: 'resolution',
    complaintId: complaint.id,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Notify citizen that work is completed and under admin verification
  db.addNotification({
    id: `notif-${uuidv4().substring(0, 8)}`,
    targetRole: 'citizen',
    targetUserId: complaint.citizenId,
    title: `🛠️ Work Completed for #${complaint.ticketNumber}`,
    message: `Field unit completed repairs and submitted resolution proof. Awaiting final Municipal Admin verification.`,
    type: 'status_update',
    complaintId: complaint.id,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return res.json({
    complaint: updated,
    resolutionVerification: verification
  });
};

export const adminReviewResolution = (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, notes, adminName } = req.body; // action: 'approve' | 'reject'

  const complaint = db.getComplaintById(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const reviewer = adminName || 'Chief Commissioner (Municipal Admin)';

  if (action === 'approve') {
    const updated = db.updateComplaint(complaint.id, {
      status: 'resolved',
      adminApproval: {
        approved: true,
        reviewedBy: reviewer,
        reviewedAt: new Date().toISOString(),
        notes: notes || 'Work proof inspected and officially signed off by Municipal Command Authority.'
      }
    });

    // Notify citizen that ticket is closed
    db.addNotification({
      id: `notif-${uuidv4().substring(0, 8)}`,
      targetRole: 'citizen',
      targetUserId: complaint.citizenId,
      title: `✅ Complaint #${complaint.ticketNumber} Officially Resolved & Closed`,
      message: `Municipal Administrator verified the field worker's proof of completion and signed off on ticket #${complaint.ticketNumber}.`,
      type: 'resolution',
      complaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Notify worker that proof is approved
    db.addNotification({
      id: `notif-${uuidv4().substring(0, 8)}`,
      targetRole: 'authority',
      title: `🏆 Work Proof Approved: #${complaint.ticketNumber}`,
      message: `Administrator ${reviewer} approved your completion proof for #${complaint.ticketNumber}. Ticket marked resolved.`,
      type: 'status_update',
      complaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.json({ complaint: updated, message: 'Work proof approved and ticket resolved.' });
  } else {
    // Reject proof -> ticket returns to in_progress for rework
    const updated = db.updateComplaint(complaint.id, {
      status: 'in_progress',
      adminApproval: {
        approved: false,
        reviewedBy: reviewer,
        reviewedAt: new Date().toISOString(),
        reason: notes || 'Work proof incomplete or substandard. Rework ordered.'
      }
    });

    // Notify worker that rework is required
    db.addNotification({
      id: `notif-${uuidv4().substring(0, 8)}`,
      targetRole: 'authority',
      title: `⚠️ Rework Required: #${complaint.ticketNumber}`,
      message: `Admin rejected proof for #${complaint.ticketNumber}. Remarks: ${notes || 'Substandard repair. Please re-visit site and re-upload valid proof.'}`,
      type: 'high_priority',
      complaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.json({ complaint: updated, message: 'Work proof rejected. Rework requested from worker.' });
  }
};
