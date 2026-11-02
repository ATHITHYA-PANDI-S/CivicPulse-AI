import { Request, Response } from 'express';
import { db } from '../storage/dbAdapter';

export const getRiskZones = (req: Request, res: Response) => {
  const zones = db.getRiskZones();
  return res.json({ riskZones: zones });
};

export const getDepartmentsAndWorkers = (req: Request, res: Response) => {
  const departments = db.getDepartments();
  const workers = db.getFieldWorkers();
  return res.json({ departments, workers });
};

export const resetDatabase = (req: Request, res: Response) => {
  db.resetData();
  return res.json({ message: 'Database reset to default seed demo state successfully' });
};
