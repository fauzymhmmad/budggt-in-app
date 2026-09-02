import React, { useState, useMemo } from 'react';
import { Plus, PieChart, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { calculateCategorySpending, filterTransactionsByDateRange, getCurrentMonthDateRange } from '../../utils/calculations';
import { BudgetCard } from './BudgetCard';
import { BudgetModal } from './BudgetModal';
import { Category, Transaction } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface BudgetSummaryProps {
  onEditTransaction: (transaction: Transaction) => void;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ onEditTransaction }) => {
  const { transactions, categories, budgets, deleteBudget, settings } = useFinance();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const budgetPeriod = useMemo(
    () => getCurrentMonthDateRange(settings.startOfMonthDay),
    [settings.startOfMonthDay],
  );

  const spendingList = useMemo(() => {
    return calculateCategorySpending(
      transactions,
      categories,
      budgets,
      budgetPeriod.startDate,
      budgetPeriod.endDate,
      true,
    );
  }, [transactions, categories, budgets, budgetPeriod]);

  const budgetTransactionsByCategory = useMemo(() => {
    const transactionsByCategory = new Map<string, Transaction[]>();
    filterTransactionsByDateRange(transactions, budgetPeriod.startDate, budgetPeriod.endDate)
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const categoryTransactions = transactionsByCategory.get(transaction.categoryId) || [];
        categoryTransactions.push(transaction);
        transactionsByCategory.set(transaction.categoryId, categoryTransactions);
      });

    transactionsByCategory.forEach((categoryTransactions) => {
      categoryTransactions.sort((a, b) => b.date.localeCompare(a.date));
    });
    return transactionsByCategory;
  }, [transactions, budgetPeriod]);

  const budgetedList = spendingList.filter((item) => (item.budgetLimit || 0) > 0);
  const unbudgetedCategories = categories.filter(
    (c) => c.type === 'expense' && !budgets.some((b) => b.categoryId === c.id)
  );

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpentInBudgets = budgetedList.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudgeted - totalSpentInBudgets;
  const overallUtilization = totalBudgeted > 0 ? (totalSpentInBudgets / totalBudgeted) * 100 : 0;

  const handleOpenSetBudget = (category?: Category) => {
    setCategoryToEdit(category || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('monthlyBudgets')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('budgetsDescription')}</p>
        </div>
        <button
          onClick={() => handleOpenSetBudget()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('setCategoryBudget')}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('totalMonthlyCap')}
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalBudgeted, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {budgets.length} {t('acrossConfiguredCategories')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('totalSpentSoFar')}
          </span>
          <div className="text-xl font-bold font-mono text-rose-500 mt-1">
            {formatCurrency(totalSpentInBudgets, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{t('utilization')}</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {formatPercentage(overallUtilization)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('totalPoolRemaining')}
          </span>
          <div className={`text-xl font-bold font-mono mt-1 ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(totalRemaining, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {totalRemaining >= 0 ? t('safeToSpendRemainder') : t('budgetDeficit')}
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {budgetedList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-8">
          <PieChart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('noBudgetsCreated')}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">{t('noBudgetsDesc')}</p>
          <button
            onClick={() => handleOpenSetBudget()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
          >
            {t('createFirstBudget')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetedList.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            return (
              <BudgetCard
                key={item.categoryId}
                item={item}
                transactions={budgetTransactionsByCategory.get(item.categoryId) || []}
                onEdit={() => handleOpenSetBudget(cat)}
                onEditTransaction={onEditTransaction}
                onDelete={() => {
                  if (window.confirm(`${t('removeBudgetConfirm')} ${item.categoryName}?`)) {
                    deleteBudget(item.categoryId);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {/* Unbudgeted Categories */}
      {unbudgetedCategories.length > 0 && (
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('unbudgetedCategories')} ({unbudgetedCategories.length})
            </h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">{t('unbudgetedDesc')}</p>
          <div className="flex flex-wrap gap-2">
            {unbudgetedCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleOpenSetBudget(c)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all active:scale-95 group"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
                <Plus className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToBudget={categoryToEdit}
      />
    </div>
  );
};
