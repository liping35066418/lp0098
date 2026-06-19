import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { levels } from '@/data/levels';
import {
  Undo2,
  Redo2,
  Trash2,
  CheckCircle,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  Trophy,
  ChevronDown,
  Footprints,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ControlPanel: React.FC = () => {
  const {
    currentLevel,
    setCurrentLevel,
    undo,
    redo,
    clearAll,
    validate,
    resetLevel,
    nextLevel,
    validationResult,
    isComplete,
    canUndo,
    canRedo,
    placedProducts,
    steps,
    isLastLevel,
  } = useGameStore();

  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const handleValidate = () => {
    const result = validate();
    console.log('Validation result:', result);
  };

  const handleLevelChange = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevel(level);
      setShowLevelSelector(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="relative">
              <button
                onClick={() => setShowLevelSelector(!showLevelSelector)}
                className="flex items-center gap-2 text-lg font-bold text-gray-800 hover:text-indigo-600 transition-colors"
              >
                {currentLevel.name}
                <ChevronDown
                  size={20}
                  className={cn('transition-transform', showLevelSelector && 'rotate-180')}
                />
              </button>
              
              {showLevelSelector && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden min-w-[250px]">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleLevelChange(level.id)}
                      className={cn(
                        'w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0',
                        currentLevel.id === level.id && 'bg-indigo-50 text-indigo-700'
                      )}
                    >
                      <div className="font-semibold">{level.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{currentLevel.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
              {currentLevel.gridRows}×{currentLevel.gridCols} 网格
            </span>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowRules(!showRules)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 mb-2 transition-colors"
          >
            <BookOpen size={16} />
            陈列规则
            <ChevronDown
              size={16}
              className={cn('transition-transform', showRules && 'rotate-180')}
            />
          </button>
          
          {showRules && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 space-y-2">
              {currentLevel.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle
                    size={16}
                    className={cn(
                      'mt-0.5 flex-shrink-0',
                      rule.type === 'bottom-layer' && 'text-purple-500',
                      rule.type === 'top-layer' && 'text-green-500',
                      rule.type === 'front-position' && 'text-red-500'
                    )}
                  />
                  <span className="text-sm text-gray-700">{rule.description}</span>
                </div>
              ))}
              <div className="flex items-start gap-2 pt-2 border-t border-indigo-100">
                <AlertTriangle size={16} className="mt-0.5 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-amber-700">
                  需要放置至少 <strong>{currentLevel.requiredPlacements}</strong> 件商品才能通关
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">操作面板</h4>
          <div className="flex items-center gap-1.5 text-sm">
            <Footprints size={16} className="text-indigo-500" />
            <span className="text-gray-500">步数:</span>
            <span className="font-bold text-indigo-600 text-lg">{steps}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
              canUndo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            )}
          >
            <Undo2 size={20} />
            <span className="text-xs">撤回</span>
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
              canRedo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            )}
          >
            <Redo2 size={20} />
            <span className="text-xs">重做</span>
          </button>
          
          <button
            onClick={clearAll}
            disabled={placedProducts.length === 0}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
              placedProducts.length > 0
                ? 'bg-red-50 hover:bg-red-100 text-red-600'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            )}
          >
            <Trash2 size={20} />
            <span className="text-xs">清空</span>
          </button>
          
          <button
            onClick={resetLevel}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition-all"
          >
            <RotateCcw size={20} />
            <span className="text-xs">重置</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleValidate}
        className={cn(
          'w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2',
          isComplete
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-200 hover:scale-[1.02]'
        )}
      >
        {isComplete ? (
          <>
            <Trophy size={24} />
            🎉 恭喜通关！
          </>
        ) : (
          <>
            <CheckCircle size={24} />
            检查陈列是否合规
          </>
        )}
      </button>

      {isComplete && (
        <button
          onClick={nextLevel}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2',
            isLastLevel
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200 hover:scale-[1.02]'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-200 hover:scale-[1.02]'
          )}
        >
          {isLastLevel ? (
            <>
              <RefreshCw size={24} />
              🏆 已通关全部关卡，再玩一次
            </>
          ) : (
            <>
              <ArrowRight size={24} />
              进入下一关 →
            </>
          )}
        </button>
      )}

      {validationResult && (
        <div
          className={cn(
            'rounded-2xl p-4 sm:p-6 border-2',
            validationResult.isValid
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          )}
        >
          {validationResult.isValid ? (
            <div className="flex items-center gap-3">
              <Trophy className="text-green-500" size={32} />
              <div>
                <h4 className="font-bold text-green-800 text-lg">🎉 完美陈列！</h4>
                <p className="text-green-600 text-sm">
                  {isLastLevel
                    ? '太棒了！你已完成所有关卡！点击上方"再玩一次"可重新挑战。'
                    : '所有商品摆放位置都符合陈列规则，点击上方按钮进入下一关！'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="text-red-500" size={28} />
                <div>
                  <h4 className="font-bold text-red-800 text-lg">⚠️ 发现违规摆放</h4>
                  <p className="text-red-600 text-sm">
                    共 {validationResult.violations.length} 处违规，请调整商品位置
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {validationResult.violations.map((violation, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-red-200 flex items-start gap-2"
                  >
                    <span className="text-red-500 font-bold text-sm">#{index + 1}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {violation.productName}
                        <span className="text-xs text-gray-500 ml-2">
                          (位置: 行{violation.row}, 列{violation.col})
                        </span>
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        {violation.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
