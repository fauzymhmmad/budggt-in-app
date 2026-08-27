import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { calculateMonthlySummary } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const MetricCards: React.FC = () => {
  const { transactions, accounts, settings } = useFinance();
  const { t } = useTranslation();
  const summary = calculateMonthlySummary(transactions);

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const isPositiveSavings = summary.netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Net Balance */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('netBalance')}
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white truncate">
            {formatCurrency(totalBalance, settings.currency, settings.privacyMode)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-0.5 text-emerald-500 font-semibold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span>{accounts.length} {t('activeAccounts')}</span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Monthly Income */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('monthlyIncome')}
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
            +{formatCurrency(summary.totalIncome, settings.currency, settings.privacyMode)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{t('currentMonthEarnings')}</span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 3. Monthly Expenses */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('monthlyExpenses')}
          </span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 truncate">
            -{formatCurrency(summary.totalExpense, settings.currency, settings.privacyMode)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{t('dailyAvg')}</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {formatCurrency(summary.dailyAverageExpense, settings.currency, settings.privacyMode)}{t('perDay')}
            </span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 4. Net Savings Rate */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('netSavingsRate')}
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-purple-600 dark:text-purple-400">
              {formatPercentage(summary.savingsRate)}
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                summary.savingsRate >= 20
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : summary.savingsRate >= 0
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {summary.savingsRate >= 20 ? t('optimal') : summary.savingsRate >= 0 ? t('moderate') : t('deficit')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{t('net')}</span>
            <span className={`font-mono font-semibold ${isPositiveSavings ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPositiveSavings ? '+' : ''}
              {formatCurrency(summary.netSavings, settings.currency, settings.privacyMode)}
            </span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
};
