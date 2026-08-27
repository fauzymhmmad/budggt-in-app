import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { calculateCategorySpending } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const CategoryChart: React.FC = () => {
  const { transactions, categories, budgets, settings, setActiveTab } = useFinance();
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const spendingList = useMemo(() => {
    return calculateCategorySpending(transactions, categories, budgets);
  }, [transactions, categories, budgets]);

  const totalSpent = useMemo(() => {
    return spendingList.reduce((acc, item) => acc + item.spent, 0);
  }, [spendingList]);

  // Donut chart math
  const radius = 65;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for segments
  const segments = useMemo(() => {
    let accumulatedAngle = 0;
    return spendingList.map((item) => {
      const fraction = totalSpent > 0 ? item.spent / totalSpent : 0;
      const strokeLength = fraction * circumference;
      const strokeOffset = -accumulatedAngle;
      accumulatedAngle += strokeLength;

      return {
        ...item,
        fraction,
        strokeLength,
        strokeOffset,
      };
    });
  }, [spendingList, totalSpent, circumference]);

  const activeCategory = hoveredIndex !== null ? spendingList[hoveredIndex] : null;

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('categorySpendingTitle')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('currentMonthDistribution')}</p>
        </div>
        <button
          onClick={() => setActiveTab('budgets')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {t('manageLimits')}
        </button>
      </div>

      {spendingList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400 text-xs">
          {t('noExpensesThisMonth')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
          {/* Donut Visual */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 180 180"
              className="w-44 h-44 -rotate-90 transform overflow-visible"
            >
              {/* Background ring */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100 dark:text-slate-800"
              />

              {/* Segments */}
              {segments.map((seg, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <circle
                    key={seg.categoryId}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${seg.strokeLength} ${circumference - seg.strokeLength}`}
                    strokeDashoffset={seg.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Centered Total / Hover Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-[11px] font-medium text-slate-400 truncate max-w-[100px]">
                {activeCategory ? activeCategory.categoryName : t('totalSpent')}
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(
                  activeCategory ? activeCategory.spent : totalSpent,
                  settings.currency,
                  settings.privacyMode
                )}
              </span>
              {activeCategory && (
                <span className="text-[10px] font-semibold text-emerald-500">
                  {formatPercentage(activeCategory.percentageOfTotal)}
                </span>
              )}
            </div>
          </div>

          {/* Category Legend List */}
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {spendingList.slice(0, 6).map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={item.categoryId}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-colors ${
                    isHovered ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.spent, settings.currency, settings.privacyMode)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      {formatPercentage(item.percentageOfTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
