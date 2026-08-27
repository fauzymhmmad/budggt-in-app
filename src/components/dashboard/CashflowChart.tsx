import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { calculateCashflowTrends } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export const CashflowChart: React.FC = () => {
  const { transactions, settings } = useFinance();
  const { t, language } = useTranslation();
  const [timeframe, setTimeframe] = useState<7 | 14 | 30>(14);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    displayDate: string;
    income: number;
    expense: number;
    net: number;
  } | null>(null);

  const trends = useMemo(() => {
    return calculateCashflowTrends(transactions, timeframe);
  }, [transactions, timeframe]);

  const maxVal = useMemo(() => {
    const max = Math.max(
      ...trends.map((t) => Math.max(t.income, t.expense)),
      100
    );
    return Math.ceil(max * 1.15);
  }, [trends]);

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 30;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = useMemo(() => {
    const count = trends.length;
    const stepX = chartWidth / Math.max(1, count - 1);

    return trends.map((item, idx) => {
      const x = paddingX + idx * stepX;
      const yIncome = paddingY + chartHeight - (item.income / maxVal) * chartHeight;
      const yExpense = paddingY + chartHeight - (item.expense / maxVal) * chartHeight;

      return {
        ...item,
        x,
        yIncome,
        yExpense,
      };
    });
  }, [trends, chartWidth, chartHeight, paddingX, paddingY, maxVal]);

  const incomePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yIncome}`, '');
  }, [points]);

  const expensePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yExpense}`, '');
  }, [points]);

  const incomeArea = useMemo(() => {
    if (points.length === 0) return '';
    const bottom = paddingY + chartHeight;
    return `${incomePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }, [incomePath, points, paddingY, chartHeight]);

  const expenseArea = useMemo(() => {
    if (points.length === 0) return '';
    const bottom = paddingY + chartHeight;
    return `${expensePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }, [expensePath, points, paddingY, chartHeight]);

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('cashflowTitle')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('cashflowSubtitle')}</p>
        </div>

        {/* Timeframe pill buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days as 7 | 14 | 30)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === days
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {days}{language === 'id' ? 'H' : 'D'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Hover Info */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{t('income')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{t('expense')}</span>
          </div>
        </div>

        {hoveredPoint ? (
          <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{hoveredPoint.displayDate}:</span>
            <span className="text-emerald-500 font-semibold">+{formatCurrency(hoveredPoint.income, settings.currency, settings.privacyMode)}</span>
            <span className="text-rose-500 font-semibold">-{formatCurrency(hoveredPoint.expense, settings.currency, settings.privacyMode)}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] hidden sm:inline">{t('hoverForDetails')}</span>
        )}
      </div>

      {/* Chart SVG */}
      <div className="relative w-full aspect-[600/220] overflow-visible">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + chartHeight * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {Math.round(maxVal * ratio)}
                </text>
              </g>
            );
          })}

          {/* Area Gradients */}
          <path d={incomeArea} fill="url(#incomeGrad)" />
          <path d={expenseArea} fill="url(#expenseGrad)" />

          {/* Stroke Lines */}
          <path
            d={incomePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={expensePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Dots */}
          {points.map((p, i) => (
            <g
              key={p.date}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
            >
              {/* Invisible large hover target */}
              <circle cx={p.x} cy={chartHeight / 2} r="12" fill="transparent" />

              {/* Income Dot */}
              {p.income > 0 && (
                <circle
                  cx={p.x}
                  cy={p.yIncome}
                  r={hoveredPoint?.date === p.date ? '5' : '3.5'}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              )}

              {/* Expense Dot */}
              {p.expense > 0 && (
                <circle
                  cx={p.x}
                  cy={p.yExpense}
                  r={hoveredPoint?.date === p.date ? '5' : '3.5'}
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              )}

              {/* X-axis labels */}
              {(i % (timeframe === 30 ? 5 : timeframe === 14 ? 2 : 1) === 0 || i === points.length - 1) && (
                <text
                  x={p.x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {p.displayDate.split(' ')[1] || p.displayDate}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
