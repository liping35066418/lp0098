import { create } from 'zustand';
import { Level, PlacedProduct, Product, ValidationResult } from '@/types/game';
import { levels } from '@/data/levels';

interface GameState {
  currentLevel: Level;
  placedProducts: PlacedProduct[];
  history: PlacedProduct[][];
  historyIndex: number;
  validationResult: ValidationResult | null;
  isComplete: boolean;
  setCurrentLevel: (level: Level) => void;
  placeProduct: (product: Product, row: number, col: number) => boolean;
  removeProduct: (placedId: string) => void;
  moveProduct: (placedId: string, newRow: number, newCol: number) => boolean;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  validate: () => ValidationResult;
  resetLevel: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const generateId = () => `placed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useGameStore = create<GameState>((set, get) => ({
  currentLevel: levels[0],
  placedProducts: [],
  history: [[]],
  historyIndex: 0,
  validationResult: null,
  isComplete: false,
  canUndo: false,
  canRedo: false,

  setCurrentLevel: (level) => {
    set({
      currentLevel: level,
      placedProducts: [],
      history: [[]],
      historyIndex: 0,
      validationResult: null,
      isComplete: false,
      canUndo: false,
      canRedo: false,
    });
  },

  placeProduct: (product, row, col) => {
    const { placedProducts, currentLevel, history, historyIndex } = get();

    const isOccupied = placedProducts.some(p => p.row === row && p.col === col);
    if (isOccupied) return false;

    if (row < 0 || row >= currentLevel.gridRows || col < 0 || col >= currentLevel.gridCols) {
      return false;
    }

    const newPlaced: PlacedProduct = {
      id: generateId(),
      product,
      row,
      col,
    };

    const newPlacedProducts = [...placedProducts, newPlaced];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPlacedProducts);

    set({
      placedProducts: newPlacedProducts,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      validationResult: null,
      isComplete: false,
      canUndo: true,
      canRedo: false,
    });

    return true;
  },

  removeProduct: (placedId) => {
    const { placedProducts, history, historyIndex } = get();
    const newPlacedProducts = placedProducts.filter(p => p.id !== placedId);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPlacedProducts);

    set({
      placedProducts: newPlacedProducts,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      validationResult: null,
      isComplete: false,
      canUndo: true,
      canRedo: false,
    });
  },

  moveProduct: (placedId, newRow, newCol) => {
    const { placedProducts, currentLevel, history, historyIndex } = get();

    const isOccupied = placedProducts.some(
      p => p.row === newRow && p.col === newCol && p.id !== placedId
    );
    if (isOccupied) return false;

    if (newRow < 0 || newRow >= currentLevel.gridRows || newCol < 0 || newCol >= currentLevel.gridCols) {
      return false;
    }

    const newPlacedProducts = placedProducts.map(p =>
      p.id === placedId ? { ...p, row: newRow, col: newCol } : p
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPlacedProducts);

    set({
      placedProducts: newPlacedProducts,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      validationResult: null,
      isComplete: false,
      canUndo: true,
      canRedo: false,
    });

    return true;
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    set({
      placedProducts: history[newIndex],
      historyIndex: newIndex,
      validationResult: null,
      isComplete: false,
      canUndo: newIndex > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    set({
      placedProducts: history[newIndex],
      historyIndex: newIndex,
      validationResult: null,
      isComplete: false,
      canUndo: true,
      canRedo: newIndex < history.length - 1,
    });
  },

  clearAll: () => {
    const { history, historyIndex, placedProducts } = get();
    if (placedProducts.length === 0) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([]);

    set({
      placedProducts: [],
      history: newHistory,
      historyIndex: newHistory.length - 1,
      validationResult: null,
      isComplete: false,
      canUndo: true,
      canRedo: false,
    });
  },

  validate: () => {
    const { placedProducts, currentLevel } = get();
    const violations: ValidationResult['violations'] = [];

    for (const placed of placedProducts) {
      const { product, row, col, id } = placed;

      for (const rule of currentLevel.rules) {
        if (rule.type === 'bottom-layer') {
          if (product.size === rule.targetSize) {
            const bottomRows = Math.floor(currentLevel.gridRows / 2);
            if (row < bottomRows) {
              violations.push({
                placedId: id,
                productName: product.name,
                row,
                col,
                message: `${product.name} 是大件商品，需要放在底层（第${bottomRows}-${currentLevel.gridRows - 1}行）`,
                ruleType: rule.type,
              });
            }
          }
        }

        if (rule.type === 'top-layer') {
          if (product.category === rule.targetCategory) {
            const topRows = Math.floor(currentLevel.gridRows / 2);
            if (row >= topRows) {
              violations.push({
                placedId: id,
                productName: product.name,
                row,
                col,
                message: `${product.name} 需要放在上层（第0-${topRows - 1}行）`,
                ruleType: rule.type,
              });
            }
          }
        }

        if (rule.type === 'front-position') {
          if (product.isHot) {
            const frontCols = Math.floor(currentLevel.gridCols / 2);
            if (col >= frontCols) {
              violations.push({
                placedId: id,
                productName: product.name,
                row,
                col,
                message: `${product.name} 是热门商品，需要放在靠前位置（第0-${frontCols - 1}列）`,
                ruleType: rule.type,
              });
            }
          }
        }
      }
    }

    const isValid = violations.length === 0 && placedProducts.length >= currentLevel.requiredPlacements;
    const result: ValidationResult = { isValid, violations };

    set({
      validationResult: result,
      isComplete: isValid,
    });

    return result;
  },

  resetLevel: () => {
    set({
      placedProducts: [],
      history: [[]],
      historyIndex: 0,
      validationResult: null,
      isComplete: false,
      canUndo: false,
      canRedo: false,
    });
  },
}));
