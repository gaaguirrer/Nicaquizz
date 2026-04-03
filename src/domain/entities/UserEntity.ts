/**
 * Entidad de Usuario del Dominio
 */

import type { Ingrediente } from '../../shared/constants/ingredients';
import type { Categoria } from '../../shared/constants/categories';
import type { MejoraType, TrabaType } from '../../shared/constants/shop-items';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly photoURL?: string,
    public readonly isAdmin: boolean = false,
    public readonly isPublicProfile: boolean = true,
    public readonly allowOpenChallenges: boolean = false,
    public readonly isOnline: boolean = false,
    public readonly friends: string[] = [],
    public readonly stats: UserStats = new UserStats(),
    public readonly coins: Coins = new Coins(),
    public readonly mejoras: Mejoras = new Mejoras(),
    public readonly trabas: Trabas = new Trabas(),
    public readonly inventory: string[] = [],
    public readonly equipped: Record<string, string> = {},
    public readonly createdAt: string = new Date().toISOString(),
    public readonly lastSeen?: string
  ) {}

  static fromObject(data: Record<string, unknown>): UserEntity {
    return new UserEntity(
      data.id as string,
      data.email as string,
      data.displayName as string,
      data.photoURL as string | undefined,
      data.isAdmin as boolean ?? false,
      data.isPublicProfile as boolean ?? true,
      data.allowOpenChallenges as boolean ?? false,
      data.isOnline as boolean ?? false,
      (data.friends as string[]) ?? [],
      UserStats.fromObject(data.stats as Record<string, unknown>),
      Coins.fromObject(data.coins as Record<string, unknown>),
      Mejoras.fromObject(data.mejoras as Record<string, unknown>),
      Trabas.fromObject(data.trabas as Record<string, unknown>),
      (data.inventory as string[]) ?? [],
      (data.equipped as Record<string, string>) ?? {},
      data.createdAt as string ?? new Date().toISOString(),
      data.lastSeen as string | undefined
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      isAdmin: this.isAdmin,
      isPublicProfile: this.isPublicProfile,
      allowOpenChallenges: this.allowOpenChallenges,
      isOnline: this.isOnline,
      friends: this.friends,
      stats: this.stats.toObject(),
      coins: this.coins.toObject(),
      mejoras: this.mejoras.toObject(),
      trabas: this.trabas.toObject(),
      inventory: this.inventory,
      equipped: this.equipped,
      createdAt: this.createdAt,
      lastSeen: this.lastSeen
    };
  }

  hasNacatamalComplete(): boolean {
    return this.coins.hasNacatamalComplete();
  }

  consumeNacatamal(): UserEntity {
    const newCoins = this.coins.consumeNacatamal();
    return new UserEntity(
      this.id, this.email, this.displayName, this.photoURL,
      this.isAdmin, this.isPublicProfile, this.allowOpenChallenges,
      this.isOnline, this.friends, this.stats, newCoins,
      this.mejoras, this.trabas, this.inventory, this.equipped,
      this.createdAt, this.lastSeen
    );
  }

  addCoins(ingrediente: Ingrediente, amount: number): UserEntity {
    const newCoins = this.coins.add(ingrediente, amount);
    return new UserEntity(
      this.id, this.email, this.displayName, this.photoURL,
      this.isAdmin, this.isPublicProfile, this.allowOpenChallenges,
      this.isOnline, this.friends, this.stats, newCoins,
      this.mejoras, this.trabas, this.inventory, this.equipped,
      this.createdAt, this.lastSeen
    );
  }

  updateStats(newStats: UserStats): UserEntity {
    return new UserEntity(
      this.id, this.email, this.displayName, this.photoURL,
      this.isAdmin, this.isPublicProfile, this.allowOpenChallenges,
      this.isOnline, this.friends, newStats, this.coins,
      this.mejoras, this.trabas, this.inventory, this.equipped,
      this.createdAt, this.lastSeen
    );
  }

  addFriend(friendId: string): UserEntity {
    if (this.friends.includes(friendId)) {
      return this;
    }
    return new UserEntity(
      this.id, this.email, this.displayName, this.photoURL,
      this.isAdmin, this.isPublicProfile, this.allowOpenChallenges,
      this.isOnline, [...this.friends, friendId], this.stats, this.coins,
      this.mejoras, this.trabas, this.inventory, this.equipped,
      this.createdAt, this.lastSeen
    );
  }

  removeFriend(friendId: string): UserEntity {
    return new UserEntity(
      this.id, this.email, this.displayName, this.photoURL,
      this.isAdmin, this.isPublicProfile, this.allowOpenChallenges,
      this.isOnline, this.friends.filter(id => id !== friendId), this.stats,
      this.coins, this.mejoras, this.trabas, this.inventory, this.equipped,
      this.createdAt, this.lastSeen
    );
  }
}

export class UserStats {
  constructor(
    public readonly totalQuestionsAnswered: number = 0,
    public readonly totalCorrect: number = 0,
    public readonly wins: number = 0,
    public readonly losses: number = 0,
    public readonly categoryStats: Record<string, CategoryStats> = {}
  ) {}

  static fromObject(data: Record<string, unknown>): UserStats {
    const categoryStats: Record<string, CategoryStats> = {};
    const rawCategoryStats = data.categoryStats as Record<string, Record<string, number>> | undefined;
    
    if (rawCategoryStats) {
      for (const [key, value] of Object.entries(rawCategoryStats)) {
        categoryStats[key] = CategoryStats.fromObject(value);
      }
    }

    return new UserStats(
      (data.totalQuestionsAnswered as number) ?? 0,
      (data.totalCorrect as number) ?? 0,
      (data.wins as number) ?? 0,
      (data.losses as number) ?? 0,
      categoryStats
    );
  }

  toObject(): Record<string, unknown> {
    const categoryStatsObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.categoryStats)) {
      categoryStatsObj[key] = value.toObject();
    }

    return {
      totalQuestionsAnswered: this.totalQuestionsAnswered,
      totalCorrect: this.totalCorrect,
      wins: this.wins,
      losses: this.losses,
      categoryStats: categoryStatsObj
    };
  }

  getAccuracy(): number {
    if (this.totalQuestionsAnswered === 0) return 0;
    return Math.round((this.totalCorrect / this.totalQuestionsAnswered) * 100);
  }

  incrementAnswer(isCorrect: boolean, categoryId: string): UserStats {
    const newCategoryStats = { ...this.categoryStats };
    
    if (!newCategoryStats[categoryId]) {
      newCategoryStats[categoryId] = new CategoryStats(0, 0);
    }

    newCategoryStats[categoryId] = newCategoryStats[categoryId].increment(isCorrect);

    return new UserStats(
      this.totalQuestionsAnswered + 1,
      this.totalCorrect + (isCorrect ? 1 : 0),
      this.wins,
      this.losses,
      newCategoryStats
    );
  }

  incrementWin(): UserStats {
    return new UserStats(
      this.totalQuestionsAnswered,
      this.totalCorrect,
      this.wins + 1,
      this.losses,
      this.categoryStats
    );
  }

  incrementLoss(): UserStats {
    return new UserStats(
      this.totalQuestionsAnswered,
      this.totalCorrect,
      this.wins,
      this.losses + 1,
      this.categoryStats
    );
  }
}

export class CategoryStats {
  constructor(
    public readonly correct: number = 0,
    public readonly total: number = 0
  ) {}

  static fromObject(data: Record<string, unknown>): CategoryStats {
    return new CategoryStats(
      (data.correct as number) ?? 0,
      (data.total as number) ?? 0
    );
  }

  toObject(): Record<string, unknown> {
    return {
      correct: this.correct,
      total: this.total
    };
  }

  getAccuracy(): number {
    if (this.total === 0) return 0;
    return Math.round((this.correct / this.total) * 100);
  }

  increment(isCorrect: boolean): CategoryStats {
    return new CategoryStats(
      this.correct + (isCorrect ? 1 : 0),
      this.total + 1
    );
  }
}

export class Coins {
  constructor(
    public readonly masa: number = 0,
    public readonly cerdo: number = 0,
    public readonly arroz: number = 0,
    public readonly papa: number = 0,
    public readonly chile: number = 0,
    public readonly achiote: number = 0,
    public readonly nacatamal: number = 0
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.masa < 0 || this.cerdo < 0 || this.arroz < 0 ||
        this.papa < 0 || this.chile < 0 || this.achiote < 0 || this.nacatamal < 0) {
      throw new Error('Las monedas no pueden ser negativas');
    }
  }

  static fromObject(data: Record<string, unknown>): Coins {
    return new Coins(
      (data.masa as number) ?? 0,
      (data.cerdo as number) ?? 0,
      (data.arroz as number) ?? 0,
      (data.papa as number) ?? 0,
      (data.chile as number) ?? 0,
      (data.achiote as number) ?? 0,
      (data.nacatamal as number) ?? 0
    );
  }

  toObject(): Record<string, unknown> {
    return {
      masa: this.masa,
      cerdo: this.cerdo,
      arroz: this.arroz,
      papa: this.papa,
      chile: this.chile,
      achiote: this.achiote,
      nacatamal: this.nacatamal
    };
  }

  add(ingrediente: string, amount: number): Coins {
    return new Coins(
      ingrediente === 'masa' ? this.masa + amount : this.masa,
      ingrediente === 'cerdo' ? this.cerdo + amount : this.cerdo,
      ingrediente === 'arroz' ? this.arroz + amount : this.arroz,
      ingrediente === 'papa' ? this.papa + amount : this.papa,
      ingrediente === 'chile' ? this.chile + amount : this.chile,
      ingrediente === 'achiote' ? this.achiote + amount : this.achiote,
      ingrediente === 'nacatamal' ? this.nacatamal + amount : this.nacatamal
    );
  }

  hasNacatamalComplete(): boolean {
    return this.masa >= 1 && this.cerdo >= 1 && this.arroz >= 1 &&
           this.papa >= 1 && this.chile >= 1;
  }

  consumeNacatamal(): Coins {
    if (!this.hasNacatamalComplete()) {
      throw new Error('No tiene un nacatamal completo');
    }

    return new Coins(
      this.masa - 1,
      this.cerdo - 1,
      this.arroz - 1,
      this.papa - 1,
      this.chile - 1,
      this.achiote,
      this.nacatamal
    );
  }

  autoConvertToNacatamal(): Coins {
    if (!this.hasNacatamalComplete()) {
      return this;
    }

    return new Coins(
      this.masa - 1,
      this.cerdo - 1,
      this.arroz - 1,
      this.papa - 1,
      this.chile - 1,
      this.achiote,
      this.nacatamal + 1
    );
  }

  has(ingrediente: string, amount: number): boolean {
    const value = this[ingrediente as keyof Coins] as number | undefined;
    return value !== undefined && value >= amount;
  }
}

export class Mejoras {
  constructor(
    public readonly pase: number = 0,
    public readonly reloj_arena: number = 0,
    public readonly comodin: number = 0
  ) {}

  static fromObject(data: Record<string, unknown>): Mejoras {
    return new Mejoras(
      (data.pase as number) ?? 0,
      (data.reloj_arena as number) ?? 0,
      (data.comodin as number) ?? 0
    );
  }

  toObject(): Record<string, unknown> {
    return {
      pase: this.pase,
      reloj_arena: this.reloj_arena,
      comodin: this.comodin
    };
  }

  add(tipo: string, amount: number): Mejoras {
    return new Mejoras(
      tipo === 'pase' ? this.pase + amount : this.pase,
      tipo === 'reloj_arena' ? this.reloj_arena + amount : this.reloj_arena,
      tipo === 'comodin' ? this.comodin + amount : this.comodin
    );
  }

  use(tipo: string): Mejoras {
    if (this[tipo as keyof Mejoras] as number <= 0) {
      throw new Error(`No tiene ${tipo} disponibles`);
    }

    return new Mejoras(
      tipo === 'pase' ? this.pase - 1 : this.pase,
      tipo === 'reloj_arena' ? this.reloj_arena - 1 : this.reloj_arena,
      tipo === 'comodin' ? this.comodin - 1 : this.comodin
    );
  }

  has(tipo: string): boolean {
    return (this[tipo as keyof Mejoras] as number) > 0;
  }
}

export class Trabas {
  constructor(
    public readonly reloj_rapido: number = 0,
    public readonly pregunta_dificil: number = 0,
    public readonly sin_pistas: number = 0,
    public readonly controles_invertidos: number = 0
  ) {}

  static fromObject(data: Record<string, unknown>): Trabas {
    return new Trabas(
      (data.reloj_rapido as number) ?? 0,
      (data.pregunta_dificil as number) ?? 0,
      (data.sin_pistas as number) ?? 0,
      (data.controles_invertidos as number) ?? 0
    );
  }

  toObject(): Record<string, unknown> {
    return {
      reloj_rapido: this.reloj_rapido,
      pregunta_dificil: this.pregunta_dificil,
      sin_pistas: this.sin_pistas,
      controles_invertidos: this.controles_invertidos
    };
  }

  use(tipo: string): Trabas {
    if (this[tipo as keyof Trabas] as number <= 0) {
      throw new Error(`No tiene ${tipo} disponibles`);
    }

    return new Trabas(
      tipo === 'reloj_rapido' ? this.reloj_rapido - 1 : this.reloj_rapido,
      tipo === 'pregunta_dificil' ? this.pregunta_dificil - 1 : this.pregunta_dificil,
      tipo === 'sin_pistas' ? this.sin_pistas - 1 : this.sin_pistas,
      tipo === 'controles_invertidos' ? this.controles_invertidos - 1 : this.controles_invertidos
    );
  }

  has(tipo: string): boolean {
    return (this[tipo as keyof Trabas] as number) > 0;
  }
}
