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
  steps: number;
  isLastLevel: boolean;
  setCurrentLevel: (level: Level) => void;
  placeProduct: (product: Product, row: number, col: number) => boolean;
  removeProduct: (placedId: string) => void;
  moveProduct: (placedId: string, newRow: number, newCol: number) => boolean;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  validate: () => ValidationResult;
  resetLevel: () => void;
  nextLevel: () => void;
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
  steps: 0,
  isLastLevel: levels[0].id === levels[levels.length - 1].id,
  canUndo: false,
  canRedo: false,

  setCurrentLevel: (level) => {
    const levelIndex = levels.findIndex(l => l.id === level.id);
    set({
      currentLevel: level,
      placedProducts: [],
      history: [[]],
      historyIndex: 0,
      validationResult: null,
      isComplete: false,
      steps: 0,
      isLastLevel: levelIndex === levels.length - 1,
      canUndo: false,
      canRedo: false,
    });
  },

  placeProduct: (product, row, col) => {
    const { placedProducts, currentLevel, history, historyIndex } = get();

    const isOccupied = placedProducts.some(p => p.row === row && p.col === col);
    if (isOccupied) return false;

    const isDuplicate = placedProducts.some(p => p.product.id === product.id);
    if (isDuplicate) return false;

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
      steps: get().steps + 1,
      canUndo: true,
      canRedo: false,
    });

    return true;
  },

  removeProduct: (placedId) => {
    const { placedProducts, history, historyIndex, steps } = get();
    const newPlacedProducts = placedProducts.filter(p => p.id !== placedId);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPlacedProducts);

    set({
      placedProducts: newPlacedProducts,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      validationResult: null,
      isComplete: false,
      steps: steps + 1,
      canUndo: true,
      canRedo: false,
    });
  },

  moveProduct: (placedId, newRow, newCol) => {
    const { placedProducts, currentLevel, history, historyIndex, steps } = get();

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
      steps: steps + 1,
      canUndo: true,
      canRedo: false,
    });

    return true;
  },

  undo: () => {
    const { history, historyIndex, steps } = get();
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    set({
      placedProducts: history[newIndex],
      historyIndex: newIndex,
      validationResult: null,
      isComplete: false,
      steps: steps - 1,
      canUndo: newIndex > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { history, historyIndex, steps } = get();
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    set({
      placedProducts: history[newIndex],
      historyIndex: newIndex,
      validationResult: null,
      isComplete: false,
      steps: steps + 1,
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
      steps: 0,
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
                message: `${product.name} 是大件商品，需要放在底层（行${bottomRows}到行${currentLevel.gridRows - 1}）`,
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
                message: `${product.name} 需要放在上层（行0到行${topRows - 1}）`,
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
                message: `${product.name} 是热门商品，需要放在靠前位置（列0到列${frontCols - 1}）`,
                ruleType: rule.type,
              });
            }
          }
        }
      }
    }

    const allRulesSatisfied = currentLevel.rules.every(rule => {
      return placedProducts.some(placed => {
        const { product, row, col } = placed;
        if (rule.type === 'bottom-layer') {
          const bottomRows = Math.floor(currentLevel.gridRows / 2);
          return product.size === rule.targetSize && row >= bottomRows;
        }
        if (rule.type === 'top-layer') {
          const topRows = Math.floor(currentLevel.gridRows / 2);
          return product.category === rule.targetCategory && row < topRows;
        }
        if (rule.type === 'front-position') {
          const frontCols = Math.floor(currentLevel.gridCols / 2);
          return product.isHot && col < frontCols;
        }
        return false;
      });
    });

    const isValid = violations.length === 0 && placedProducts.length >= currentLevel.requiredPlacements && allRulesSatisfied;
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
      steps: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  nextLevel: () => {
    const { currentLevel } = get();
    const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex < levels.length - 1) {
      const next = levels[currentIndex + 1];
      const nextIndex = currentIndex + 1;
      set({
        currentLevel: next,
        placedProducts: [],
        history: [[]],
        historyIndex: 0,
        validationResult: null,
        isComplete: false,
        steps: 0,
        isLastLevel: nextIndex === levels.length - 1,
        canUndo: false,
        canRedo: false,
      });
    } else {
      set({
        placedProducts: [],
        history: [[]],
        historyIndex: 0,
        validationResult: null,
        isComplete: false,
        steps: 0,
        canUndo: false,
        canRedo: false,
      });
    }
  },
}));
