import { Request, Response } from 'express';
import { AIService } from '../services/aiService';

export const analyzeText = (req: Request, res: Response) => {
  const { description, category, location, supportingCount } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description text is required for AI analysis' });
  }

  const analysis = AIService.analyzeComplaint(
    description,
    category,
    location,
    supportingCount || 0
  );

  return res.json({ analysis });
};

export const verifyResolutionPhotos = (req: Request, res: Response) => {
  const { beforePhotoUrl, afterPhotoUrl, category, notes } = req.body;

  const verification = AIService.verifyResolution(
    beforePhotoUrl,
    afterPhotoUrl,
    category,
    notes
  );

  return res.json({ verification });
};

export const predictZoneRisk = (req: Request, res: Response) => {
  const { area, category, reportCount, rainfallMm } = req.body;

  const isRainRisk = (rainfallMm || 0) > 30 && (category === 'Drainage' || category === 'Roads');
  const riskLevel = isRainRisk ? 'Critical' : (reportCount > 10 ? 'High' : 'Medium');

  return res.json({
    prediction: {
      area: area || 'Metropolitan Zone',
      category: category || 'Drainage',
      riskLevel,
      probability: isRainRisk ? 0.92 : 0.74,
      forecast: isRainRisk
        ? 'Urgent: Confluence of storm drainage congestion and high rainfall forecast creates imminent surface flooding hazard.'
        : 'Moderate recurring failure trend identified in civic asset telemetry.',
      recommendedAction: isRainRisk
        ? 'Deploy heavy suction pumps and clear primary canal discharge outfalls.'
        : 'Conduct preventive physical audit within 48 hours.'
    }
  });
};
