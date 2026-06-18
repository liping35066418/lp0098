export type ProductSize = 'large' | 'medium' | 'small';

export type ProductCategory = 'decoration' | 'bookmark' | 'postcard' | 'accessory';

export interface Product {
  id: string;
  name: string;
  icon: string;
  size: ProductSize;
  category: ProductCategory;
  isHot: boolean;
  color: string;
}

export interface PlacedProduct {
  product: Product;
  row: number;
  col: number;
  id: string;
}

export interface LevelRule {
  type: 'bottom-layer' | 'top-layer' | 'front-position';
  description: string;
  targetSize?: ProductSize;
  targetCategory?: ProductCategory;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  gridRows: number;
  gridCols: number;
  rules: LevelRule[];
  availableProducts: Product[];
  requiredPlacements: number;
}

export interface ValidationResult {
  isValid: boolean;
  violations: Violation[];
}

export interface Violation {
  placedId: string;
  productName: string;
  row: number;
  col: number;
  message: string;
  ruleType: string;
}

export type DragItem = {
  type: 'product';
  product: Product;
} | {
  type: 'placed';
  placedId: string;
};
