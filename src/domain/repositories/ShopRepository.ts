/**
 * Interfaz para el Repositorio de Tienda
 */

import type { ShopItem } from '../../shared/types/game.types';
import type { ItemTipo } from '../../shared/constants/shop-items';

export interface CreateShopItemData {
  name: string;
  description: string;
  type: ItemTipo;
  basePrice: number;
  icon?: string;
  color?: string;
}

export interface ShopRepository {
  getShopItems(): Promise<ShopItem[]>;
  
  getShopItem(itemId: string): Promise<ShopItem | null>;
  
  getActiveShopItems(): Promise<ShopItem[]>;
  
  getTopPurchasedItems(limit?: number): Promise<ShopItem[]>;
  
  createShopItem(data: CreateShopItemData): Promise<string>;
  
  updateShopItem(itemId: string, data: Partial<ShopItem>): Promise<void>;
  
  deleteShopItem(itemId: string): Promise<void>;
  
  incrementPurchaseCount(itemId: string): Promise<void>;
  
  calculateCurrentPrice(basePrice: number, timesPurchased: number): number;
}
