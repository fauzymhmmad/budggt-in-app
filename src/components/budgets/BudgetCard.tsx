import React, { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { useFinance } from '../../context/FinanceContext';
import { CategorySpending } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';
import { Transaction } from '../../types/finance';

interface BudgetCardProps {
  item: CategorySpending;
  transactions: Transaction[];
  onEdit: () => void;
  onDelete: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  item,
  transactions,
  onEdit,
  onDelete,
  onEditTransaction,
}) => {
  const { settings } = useFinance();
  const { t } = useTranslation();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const limit = item.budgetLimit || 0;
  const spent = item.spent;
  const remaining = limit - spent;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;

  const isExceeded = percentage >= 100;
  const isWarning = percentage >= 80 && !isExceeded;

  // Estimate projected spend for the month based on current day
  const now = new Date();
  const currentDay = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedSpend = (spent / currentDay) * daysInMonth;
  const projectedDifference = projectedSpend - limit;

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: item.color }}
            >
              {item.categoryName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {item.categoryName}
              </h4>
              <p className="text-xs text-slate-400">
                {t('monthlyLimit')} {formatCurrency(limit, settings.currency, settings.privacyMode)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t('editLimit')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t('removeBudget')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress and Stats */}
        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              {t('spent')} {formatCurrency(spent, settings.currency, settings.privacyMode)}
            </span>
            <span
              className={`font-bold font-mono ${
                isExceeded ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'
              }`}
            >
              {formatPercentage(percentage)}
            </span>
          </div>

          <ProgressBar
            value={percentage}
            status={isExceeded ? 'exceeded' : isWarning ? 'warning' : 'healthy'}
            size="md"
          />

          <div className="flex items-center justify-between text-xs pt-1 text-slate-500 dark:text-slate-400">
            <span>
              {remaining >= 0 ? t('remaining') : t('overBy')}
            </span>
            <span
              className={`font-mono font-bold ${
                remaining < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {formatCurrency(Math.abs(remaining), settings.currency, settings.privacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Burn rate projection & Status Tag */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
          <span>{t('projected')}</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {formatCurrency(projectedSpend, settings.currency, settings.privacyMode)}
          </span>
          {limit > 0 && projectedDifference > 0 && (
            <span className="text-rose-500 font-semibold truncate">
              (+{formatCurrency(projectedDifference, settings.currency, settings.privacyMode)})
            </span>
          )}
        </div>

        <div>
          {isExceeded ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
              <AlertCircle className="w-3 h-3" /> {t('statusExceeded')}
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-3 h-3" /> {t('statusWarning')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle className="w-3 h-3" /> {t('statusHealthy')}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsBreakdownOpen((open) => !open)}
          aria-expanded={isBreakdownOpen}
          className="w-full flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
        >
          <span>{t('budgetBreakdown')} ({transactions.length})</span>
          {isBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isBreakdownOpen && (
          <div className="mt-3 space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-400">{t('noBudgetTransactions')}</p>
            ) : (
              transactions.map((transaction) => (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() => onEditTransaction(transaction)}
                  className="w-full flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={t('editTransaction')}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                      {transaction.merchant}
                    </span>
                    <span className="block text-[11px] text-slate-400">{transaction.date}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs font-semibold text-rose-500">
                    {formatCurrency(transaction.amount, settings.currency, settings.privacyMode)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
