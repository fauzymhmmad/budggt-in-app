import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';

interface RecentTransactionsProps {
  onOpenNewTransaction: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onOpenNewTransaction,
}) => {
  const { transactions, categories, accounts, settings, setActiveTab } = useFinance();
  const { t, language } = useTranslation();

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const recentTxs = transactions.slice(0, 7);

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('recentTransactions')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('recentTransactionsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('add')}</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-0.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recentTxs.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          {t('noTransactionsYet')}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentTxs.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const acc = accountMap.get(tx.accountId);
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {isIncome && <ArrowDownRight className="w-4 h-4" />}
                    {isExpense && <ArrowUpRight className="w-4 h-4" />}
                    {!isIncome && !isExpense && <ArrowLeftRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tx.merchant || t('unnamedTransaction')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="truncate">{cat?.name || t('general')}</span>
                      <span>•</span>
                      <span className="truncate">{acc?.name || t('mainAccount')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-mono font-bold ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatCurrency(tx.amount, settings.currency, settings.privacyMode)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formatRelativeDate(tx.date, language === 'id' ? 'id-ID' : 'en-US')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
