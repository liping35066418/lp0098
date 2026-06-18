import { ProductPanel } from '@/components/ProductPanel';
import { ShelfGrid } from '@/components/ShelfGrid';
import { ControlPanel } from '@/components/ControlPanel';
import { Store } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <Store className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                文创商店货架陈列解谜
              </h1>
              <p className="text-sm text-gray-500">
                合理摆放文创商品，满足陈列规则即可通关
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <ProductPanel />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <ShelfGrid />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <ControlPanel />
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 bg-white/50 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>🎮 游戏玩法：从左侧商品库拖拽商品到中间货架，满足陈列规则后点击检查按钮</p>
          <p className="mt-1">💡 提示：双击货架上的商品可以移除，拖拽已放置的商品可以调整位置</p>
        </div>
      </footer>
    </div>
  );
}
