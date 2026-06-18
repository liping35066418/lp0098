import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { useGameStore } from '@/store/gameStore';
import { Product, DragItem } from '@/types/game';
import { Package, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'large' | 'medium' | 'small' | 'hot';

export const ProductPanel: React.FC = () => {
  const { currentLevel } = useGameStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.effectAllowed = 'move';
    const item: DragItem = { type: 'product', product };
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const filteredProducts = currentLevel.availableProducts.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'hot') return p.isHot;
    return p.size === filter;
  });

  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: '全部', color: 'bg-gray-500' },
    { key: 'large', label: '大件', color: 'bg-purple-500' },
    { key: 'medium', label: '中件', color: 'bg-blue-500' },
    { key: 'small', label: '小件', color: 'bg-green-500' },
    { key: 'hot', label: '热门', color: 'bg-red-500' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Package className="text-indigo-600" size={24} />
        <h3 className="text-lg font-bold text-gray-800">
          商品库
        </h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>筛选</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-all',
                filter === f.key
                  ? `${f.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDragStart={(e) => handleDragStart(e, product)}
            compact
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          没有符合筛选条件的商品
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p>💡 拖拽商品到右侧货架区域进行陈列</p>
        <p className="mt-1">🔥 带火焰标记的是热门商品</p>
      </div>
    </div>
  );
};
