/**
 * Entidad de Item de Tienda del Dominio
 */

export type ShopItemType = 'mejora' | 'traba';

export class ShopItemEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly type: ShopItemType,
    public readonly basePrice: number,
    public readonly timesPurchased: number = 0,
    public readonly totalRevenue: number = 0,
    public readonly icon?: string,
    public readonly color?: string,
    public readonly active: boolean = true,
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  static fromObject(data: Record<string, unknown>): ShopItemEntity {
    return new ShopItemEntity(
      data.id as string,
      data.name as string,
      data.description as string,
      (data.type as ShopItemType) || 'mejora',
      (data.basePrice as number) || 0,
      (data.timesPurchased as number) || 0,
      (data.totalRevenue as number) || 0,
      data.icon as string | undefined,
      data.color as string | undefined,
      (data.active as boolean) ?? true,
      (data.createdAt as string) || new Date().toISOString()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      basePrice: this.basePrice,
      timesPurchased: this.timesPurchased,
      totalRevenue: this.totalRevenue,
      icon: this.icon,
      color: this.color,
      active: this.active,
      createdAt: this.createdAt
    };
  }

  get currentPrice(): number {
    return this.calculateCurrentPrice();
  }

  private calculateCurrentPrice(): number {
    const demandMultiplier = 1 + (this.timesPurchased * 0.1);
    const minPrice = this.basePrice * 0.75;
    return Math.max(minPrice, Math.round(this.basePrice * demandMultiplier));
  }

  incrementPurchase(): ShopItemEntity {
    return new ShopItemEntity(
      this.id,
      this.name,
      this.description,
      this.type,
      this.basePrice,
      this.timesPurchased + 1,
      this.totalRevenue + this.currentPrice,
      this.icon,
      this.color,
      this.active,
      this.createdAt
    );
  }

  deactivate(): ShopItemEntity {
    return new ShopItemEntity(
      this.id,
      this.name,
      this.description,
      this.type,
      this.basePrice,
      this.timesPurchased,
      this.totalRevenue,
      this.icon,
      this.color,
      false,
      this.createdAt
    );
  }

  activate(): ShopItemEntity {
    return new ShopItemEntity(
      this.id,
      this.name,
      this.description,
      this.type,
      this.basePrice,
      this.timesPurchased,
      this.totalRevenue,
      this.icon,
      this.color,
      true,
      this.createdAt
    );
  }

  isActive(): boolean {
    return this.active;
  }
}
