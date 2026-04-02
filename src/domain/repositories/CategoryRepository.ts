/**
 * Interfaz para el Repositorio de Categorías
 */

import type { Category } from '../../shared/types/game.types';

export interface CreateCategoryData {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  order?: number;
}

export interface CategoryRepository {
  getCategory(categoryId: string): Promise<Category | null>;
  
  getCategories(): Promise<Category[]>;
  
  getActiveCategories(): Promise<Category[]>;
  
  createCategory(data: CreateCategoryData): Promise<string>;
  
  updateCategory(categoryId: string, data: Partial<Category>): Promise<void>;
  
  deleteCategory(categoryId: string): Promise<void>;
  
  reorderCategories(order: string[]): Promise<void>;
}
