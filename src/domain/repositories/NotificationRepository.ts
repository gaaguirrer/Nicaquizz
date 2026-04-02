/**
 * Interfaz para el Repositorio de Notificaciones
 */

import type { Notification } from '../../shared/types/game.types';

export interface CreateNotificationData {
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  data?: Record<string, unknown>;
}

export interface NotificationRepository {
  getNotifications(uid: string, limit?: number): Promise<Notification[]>;
  
  getUnreadNotifications(uid: string): Promise<Notification[]>;
  
  createNotification(data: CreateNotificationData): Promise<string>;
  
  markAsRead(notificationId: string): Promise<void>;
  
  markAllAsRead(uid: string): Promise<number>;
  
  deleteNotification(notificationId: string): Promise<void>;
  
  deleteUserNotifications(uid: string): Promise<void>;
}
