/**
 * Entidad de Categoría del Dominio
 */

export class CategoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly icon?: string,
    public readonly color?: string,
    public readonly order: number = 0,
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  static fromObject(data: Record<string, unknown>): CategoryEntity {
    return new CategoryEntity(
      data.id as string,
      data.name as string,
      data.description as string,
      data.icon as string | undefined,
      data.color as string | undefined,
      (data.order as number) || 0,
      (data.createdAt as string) || new Date().toISOString()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      color: this.color,
      order: this.order,
      createdAt: this.createdAt
    };
  }

  update(name: string, description: string): CategoryEntity {
    return new CategoryEntity(
      this.id,
      name,
      description,
      this.icon,
      this.color,
      this.order,
      this.createdAt
    );
  }

  updateOrder(order: number): CategoryEntity {
    return new CategoryEntity(
      this.id,
      this.name,
      this.description,
      this.icon,
      this.color,
      order,
      this.createdAt
    );
  }
}
