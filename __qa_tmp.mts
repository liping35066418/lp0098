import { useGameStore } from '@/store/gameStore';
import { levels } from '@/data/levels';
import { products } from '@/data/products';
const P = (id: string) => products.find(x => x.id === id)!;
const s = () => useGameStore.getState();

s().setCurrentLevel(levels[0]);
console.log('--- 场景: 摆1件 -> 清空 -> 撤回 ---');
s().placeProduct(P('deco-vase'), 2, 0);
console.log('上架后  steps=%d 货架件数=%d', s().steps, s().placedProducts.length);
s().clearAll();
console.log('清空后  steps=%d 货架件数=%d canUndo=%s', s().steps, s().placedProducts.length, s().canUndo);
s().undo();
console.log('撤回后  steps=%d 货架件数=%d', s().steps, s().placedProducts.length);
console.log(s().steps < 0 ? '>>> BUG: 步数为负且与货架件数不一致' : '一致');

console.log('--- 场景: 摆2件 -> 清空 -> 撤回 ---');
s().setCurrentLevel(levels[0]);
s().placeProduct(P('deco-vase'), 2, 0);
s().placeProduct(P('bookmark-classic'), 0, 0);
s().clearAll();
s().undo();
console.log('撤回后  steps=%d 货架件数=%d', s().steps, s().placedProducts.length);
