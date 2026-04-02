/**
 * Entidad de Reto (Challenge) del Dominio
 */

import type { Categoria } from '../../shared/constants/categories';

export type ChallengeStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export class ChallengeEntity {
  constructor(
    public readonly id: string,
    public readonly challengerId: string,
    public readonly challengedId: string,
    public readonly categoryId: Categoria | null,
    public readonly isOpenChallenge: boolean,
    public readonly status: ChallengeStatus,
    public readonly winnerId: string | null = null,
    public readonly challengerScore: number = 0,
    public readonly challengedScore: number = 0,
    public readonly createdAt: string = new Date().toISOString(),
    public readonly startedAt?: string,
    public readonly completedAt?: string
  ) {}

  static fromObject(data: Record<string, unknown>): ChallengeEntity {
    return new ChallengeEntity(
      data.id as string,
      data.challengerId as string,
      data.challengedId as string,
      (data.categoryId as Categoria) || null,
      data.isOpenChallenge as boolean ?? false,
      data.status as ChallengeStatus ?? 'pending',
      (data.winnerId as string) || null,
      (data.challengerScore as number) ?? 0,
      (data.challengedScore as number) ?? 0,
      (data.createdAt as string) ?? new Date().toISOString(),
      data.startedAt as string | undefined,
      data.completedAt as string | undefined
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      challengerId: this.challengerId,
      challengedId: this.challengedId,
      categoryId: this.categoryId,
      isOpenChallenge: this.isOpenChallenge,
      status: this.status,
      winnerId: this.winnerId,
      challengerScore: this.challengerScore,
      challengedScore: this.challengedScore,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt
    };
  }

  accept(): ChallengeEntity {
    if (this.status !== 'pending') {
      throw new Error('Solo se pueden aceptar retos pendientes');
    }

    return new ChallengeEntity(
      this.id,
      this.challengerId,
      this.challengedId,
      this.categoryId,
      this.isOpenChallenge,
      'accepted',
      this.winnerId,
      this.challengerScore,
      this.challengedScore,
      this.createdAt,
      new Date().toISOString(),
      this.completedAt
    );
  }

  reject(): ChallengeEntity {
    if (this.status !== 'pending') {
      throw new Error('Solo se pueden rechazar retos pendientes');
    }

    return new ChallengeEntity(
      this.id,
      this.challengerId,
      this.challengedId,
      this.categoryId,
      this.isOpenChallenge,
      'rejected',
      this.winnerId,
      this.challengerScore,
      this.challengedScore,
      this.createdAt,
      this.startedAt,
      this.completedAt
    );
  }

  complete(winnerId: string | null, challengerScore: number, challengedScore: number): ChallengeEntity {
    if (this.status !== 'accepted') {
      throw new Error('Solo se pueden completar retos aceptados');
    }

    return new ChallengeEntity(
      this.id,
      this.challengerId,
      this.challengedId,
      this.categoryId,
      this.isOpenChallenge,
      'completed',
      winnerId,
      challengerScore,
      challengedScore,
      this.createdAt,
      this.startedAt,
      new Date().toISOString()
    );
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isAccepted(): boolean {
    return this.status === 'accepted';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isRejected(): boolean {
    return this.status === 'rejected';
  }

  isParticipant(userId: string): boolean {
    return this.challengerId === userId || this.challengedId === userId;
  }

  getOpponentId(userId: string): string | null {
    if (userId === this.challengerId) {
      return this.challengedId;
    }
    if (userId === this.challengedId) {
      return this.challengerId;
    }
    return null;
  }
}
