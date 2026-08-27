import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { calculateMonthlySummary, calculateCompoundInterest } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export const NetWorthProjection: React.FC = () => {
  const { accounts, transactions, settings } = useFinance();
  const summary = calculateMonthlySummary(transactions);

  const currentNetWorth = accounts.reduce((acc, a) => acc + a.balance, 0);
  const defaultMonthlySavings = Math.max(0, summary.netSavings);

  const [monthlyContribution, setMonthlyContribution] = useState<number>(
    defaultMonthlySavings > 0 ? defaultMonthlySavings : 500
  );
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(7); // 7%

  const projection = useMemo(() => {
    return calculateCompoundInterest(
      Math.max(0, currentNetWorth),
      monthlyContribution,
      expectedReturnRate,
      5
    );
  }, [currentNetWorth, monthlyContribution, expectedReturnRate]);

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>5-Year Wealth & Net Worth Projection</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Projected compounding trajectory based on your monthly surplus
          </p>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            <span>Monthly Savings Contribution</span>
            <span className="font-mono text-emerald-500 font-bold">
              {formatCurrency(monthlyContribution, settings.currency, settings.privacyMode)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            <span>Expected Annual ROI</span>
            <span className="font-mono text-cyan-500 font-bold">{expectedReturnRate}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* 5-Year Milestone Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {projection.yearlyBreakdown.map((yearItem) => (
          <div
            key={yearItem.year}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center"
          >
            <span className="text-[11px] font-semibold text-slate-400">Year {yearItem.year}</span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatCurrency(yearItem.balance, settings.currency, settings.privacyMode)}
            </div>
            <div className="text-[10px] text-emerald-500 font-mono mt-0.5">
              +{formatCurrency(yearItem.interestEarned, settings.currency, settings.privacyMode)} int.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
