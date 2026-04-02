/**
 * Tipos Comunes del Dominio
 */

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditFields {
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
}

export type UserRole = 'user' | 'admin';

export type ChallengeStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export type NotificationType = 
  | 'challenge'
  | 'friend_request'
  | 'achievement'
  | 'system'
  | 'trade';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type AsyncResult<T> = Promise<Result<T>>;
