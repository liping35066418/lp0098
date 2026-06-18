import React, { useState, useCallback } from 'react';
import { PlacedProductCard } from './ProductCard';
import { useGameStore } from '@/store/gameStore';
import { Product, DragItem } from '@/types/game';
import { cn } from '@/lib/utils';

interface ShelfGridProps {
  onDrop?: (product: Product, row: number, col: number) => void;
}

export const ShelfGrid: React.FC<ShelfGridProps> = ({ onDrop }) => {
  const {
    currentLevel,
    placedProducts,
    validationResult,
    placeProduct,
    removeProduct,
    moveProduct,
  } = useGameStore();

  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const getViolationForCell = useCallback(
    (row: number, col: number) => {
      if (!validationResult) return null;
      const placed = placedProducts.find(p => p.row === row && p.col === col);
      if (!placed) return null;
      return validationResult.violations.find(v => v.placedId === placed.id);
    },
    [validationResult, placedProducts]
  );

  const isCellOccupied = useCallback(
    (row: number, col: number) => {
      return placedProducts.some(p => p.row === row && p.col === col);
    },
    [placedProducts]
  );

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const occupied = isCellOccupied(row, col);
    
    if (draggedItem?.type === 'placed') {
      const placedProduct = placedProducts.find(p => p.id === draggedItem.placedId);
      if (placedProduct && placedProduct.row === row && placedProduct.col === col) {
        setDragOverCell(null);
        return;
      }
    }
    
    if (!occupied || (draggedItem?.type === 'placed')) {
      setDragOverCell({ row, col });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDragOverCell(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as DragItem;
      
      if (data.type === 'product') {
        const success = placeProduct(data.product, row, col);
        if (success && onDrop) {
          onDrop(data.product, row, col);
        }
      } else if (data.type === 'placed') {
        const placed = placedProducts.find(p => p.id === data.placedId);
        if (placed) {
          if (placed.row === row && placed.col === col) {
            return;
          }
          const occupied = placedProducts.some(
            p => p.row === row && p.col === col && p.id !== data.placedId
          );
          if (!occupied) {
            moveProduct(data.placedId, row, col);
          }
        }
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverCell(null);
  };

  const getRowLabel = (row: number) => {
    const totalRows = currentLevel.gridRows;
    const bottomRows = Math.floor(totalRows / 2);
    
    if (row >= bottomRows) {
      return '底层';
    }
    return '上层';
  };

  const getColLabel = (col: number) => {
    const totalCols = currentLevel.gridCols;
    const frontCols = Math.floor(totalCols / 2);
    
    if (col < frontCols) {
      return '靠前';
    }
    return '靠后';
  };

  const renderCell = (row: number, col: number) => {
    const placed = placedProducts.find(p => p.row === row && p.col === col);
    const violation = getViolationForCell(row, col);
    const isDragOver = dragOverCell?.row === row && dragOverCell?.col === col;
    const rowLabel = getRowLabel(row);
    const colLabel = getColLabel(col);

    return (
      <div
        key={`${row}-${col}`}
        onDragOver={(e) => handleDragOver(e, row, col)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, row, col)}
        className={cn(
          'relative aspect-square border-2 border-dashed rounded-lg transition-all duration-200',
          'flex items-center justify-center',
          isDragOver && !isCellOccupied(row, col)
            ? 'border-green-500 bg-green-50 scale-105'
            : isDragOver && draggedItem?.type === 'placed'
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400',
          violation && !isDragOver && 'bg-red-50'
        )}
        title={`${rowLabel} · ${colLabel} (行${row}, 列${col})`}
      >
        {placed ? (
          <PlacedProductCard
            placedProduct={placed}
            isViolation={!!violation}
            violationMessage={violation?.message}
            onDragStart={(e) => handleDragStart(e, { type: 'placed', placedId: placed.id })}
            onRemove={() => removeProduct(placed.id)}
          />
        ) : (
          <div className="text-xs text-gray-400 font-mono">
            {row},{col}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-6 shadow-xl border border-amber-200">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-amber-800">
          🛒 货架陈列区
        </h3>
        <div className="text-sm text-gray-600">
          已放置: <span className="font-bold text-amber-600">{placedProducts.length}</span>
          <span className="mx-2">/</span>
          需要: <span className="font-bold text-green-600">{currentLevel.requiredPlacements}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-3 text-xs text-gray-500 pl-8 sm:pl-12">
        {Array.from({ length: currentLevel.gridCols }).map((_, col) => (
          <div key={col} className="flex-1 text-center font-medium">
            列{col}
            <div className="text-[10px] text-gray-400">
              {getColLabel(col)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col justify-around pr-2 sm:pr-3 text-xs text-gray-500">
          {Array.from({ length: currentLevel.gridRows }).map((_, row) => (
            <div key={row} className="text-right font-medium">
              行{row}
              <div className="text-[10px] text-gray-400">
                {getRowLabel(row)}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex-1 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${currentLevel.gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${currentLevel.gridRows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: currentLevel.gridRows }).map((_, row) =>
            Array.from({ length: currentLevel.gridCols }).map((_, col) => renderCell(row, col))
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-500"></span>
          <span>大件 → 底层</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span>
          <span>小件 → 上层</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500"></span>
          <span>热门 → 靠前</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">💡</span>
          <span>双击商品可移除</span>
        </div>
      </div>
    </div>
  );
};
