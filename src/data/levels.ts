import { Level } from '@/types/game';
import { products } from './products';

export const levels: Level[] = [
  {
    id: 'level-3858',
    name: '入门关卡 · 3858网格',
    description: '学习基础陈列规则：大件放底层，小件放上层',
    gridRows: 4,
    gridCols: 4,
    rules: [
      {
        type: 'bottom-layer',
        description: '大件摆件必须放置在货架底层（第3-4行）',
        targetSize: 'large',
      },
      {
        type: 'top-layer',
        description: '书签和明信片必须放置在上层（第0-1行）',
        targetCategory: 'bookmark',
      },
      {
        type: 'top-layer',
        description: '明信片必须放置在上层（第0-1行）',
        targetCategory: 'postcard',
      },
    ],
    availableProducts: [
      products[0],
      products[1],
      products[7],
      products[8],
      products[9],
      products[10],
      products[11],
    ],
    requiredPlacements: 4,
  },
  {
    id: 'level-9858',
    name: '进阶关卡 · 9858网格',
    description: '综合运用所有陈列规则，完成完整货架布局',
    gridRows: 5,
    gridCols: 5,
    rules: [
      {
        type: 'bottom-layer',
        description: '大件摆件必须放置在货架底层（第3-4行）',
        targetSize: 'large',
      },
      {
        type: 'top-layer',
        description: '书签和明信片必须放置在上层（第0-1行）',
        targetCategory: 'bookmark',
      },
      {
        type: 'top-layer',
        description: '明信片必须放置在上层（第0-1行）',
        targetCategory: 'postcard',
      },
      {
        type: 'front-position',
        description: '热门商品必须放置在货架靠前位置（第0-1列）',
      },
    ],
    availableProducts: products,
    requiredPlacements: 8,
  },
];

export const getLevelById = (id: string): Level | undefined => {
  return levels.find(l => l.id === id);
};
