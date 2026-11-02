import { Request, Response } from 'express';
import { db } from '../storage/dbAdapter';

export const getNotifications = (req: Request, res: Response) => {
  const { role, userId } = req.query;
  const notifications = db.getNotifications(
    role ? String(role) : undefined,
    userId ? String(userId) : undefined
  );
  return res.json({ notifications, unreadCount: notifications.filter(n => !n.isRead).length });
};

export const markAsRead = (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.markNotificationRead(id);
  return res.json({ success });
};

export const markAllAsRead = (req: Request, res: Response) => {
  const { role, userId } = req.body;
  db.markAllNotificationsRead(role, userId);
  return res.json({ success: true });
};
