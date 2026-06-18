import React from 'react';
import { Product } from '@/types/game';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onClick?: () => void;
  compact?: boolean;
  showInfo?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isDragging = false,
  onDragStart,
  onClick,
  compact = false,
  showInfo = true,
}) => {
  const sizeLabel = {
    large: '大件',
    medium: '中件',
    small: '小件',
  };

  const categoryLabel = {
    decoration: '摆件',
    bookmark: '书签',
    postcard: '明信片',
    accessory: '配饰',
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'relative cursor-grab active:cursor-grabbing rounded-xl border-2 p-3 transition-all duration-200',
        'hover:shadow-lg hover:scale-105',
        product.color,
        isDragging && 'opacity-50 scale-95',
        compact ? 'p-2 min-w-[80px]' : 'min-w-[100px]'
      )}
    >
      {product.isHot && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10">
          <Flame size={12} />
        </div>
      )}
      
      <div className="text-center">
        <div className={cn('mb-1', compact ? 'text-2xl' : 'text-3xl')}>
          {product.icon}
        </div>
        {showInfo && (
          <>
            <div className={cn('font-semibold text-gray-800', compact ? 'text-xs' : 'text-sm')}>
              {product.name}
            </div>
            <div className="flex gap-1 justify-center mt-1">
              <span className={cn(
                'px-1.5 py-0.5 rounded text-white',
                product.size === 'large' ? 'bg-purple-500' :
                product.size === 'medium' ? 'bg-blue-500' : 'bg-green-500'
              )}>
                {sizeLabel[product.size]}
              </span>
              {!compact && (
                <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                  {categoryLabel[product.category]}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface PlacedProductCardProps {
  placedProduct: {
    id: string;
    product: Product;
    row: number;
    col: number;
  };
  isViolation?: boolean;
  violationMessage?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onRemove?: () => void;
}

export const PlacedProductCard: React.FC<PlacedProductCardProps> = ({
  placedProduct,
  isViolation = false,
  violationMessage,
  onDragStart,
  onRemove,
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={(e) => {
        if (e.detail === 2 && onRemove) {
          onRemove();
        }
      }}
      className={cn(
        'relative cursor-grab active:cursor-grabbing w-full h-full rounded-lg border-2 p-1',
        'transition-all duration-200 flex items-center justify-center',
        placedProduct.product.color,
        isViolation && 'ring-2 ring-red-500 ring-offset-1 animate-pulse',
        'hover:shadow-md'
      )}
      title={violationMessage || placedProduct.product.name}
    >
      {placedProduct.product.isHot && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 z-10">
          <Flame size={10} />
        </div>
      )}
      
      <div className="text-2xl sm:text-3xl">
        {placedProduct.product.icon}
      </div>
      
      {isViolation && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          !
        </div>
      )}
    </div>
  );
};
