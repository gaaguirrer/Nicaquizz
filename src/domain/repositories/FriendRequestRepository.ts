/**
 * Interfaz para el Repositorio de Solicitudes de Amistad
 */

import type { FriendRequest, User } from '../../shared/types/game.types';

export interface CreateFriendRequestData {
  senderId: string;
  receiverId: string;
}

export interface FriendRequestRepository {
  getFriendRequests(uid: string, status?: string): Promise<FriendRequest[]>;
  
  getReceivedRequests(uid: string): Promise<(FriendRequest & { sender: User })[]>;
  
  getSentRequests(uid: string): Promise<(FriendRequest & { receiver: User })[]>;
  
  createFriendRequest(data: CreateFriendRequestData): Promise<string>;
  
  acceptFriendRequest(requestId: string, userId: string, friendId: string): Promise<void>;
  
  rejectFriendRequest(requestId: string): Promise<void>;
  
  cancelFriendRequest(requestId: string): Promise<void>;
  
  deleteFriendRequest(requestId: string): Promise<void>;
  
  hasPendingRequest(senderId: string, receiverId: string): Promise<boolean>;
}
