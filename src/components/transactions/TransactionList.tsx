import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Copy,
  Trash2,
  Edit2,
  Download,
  Plus,
  Tag,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types/finance';
import { TransactionFilters, FilterState } from './TransactionFilters';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportTransactionsToCSV } from '../../utils/exportImport';

interface TransactionListProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    duplicateTransaction,
    batchDeleteTransactions,
    settings,
  } = useFinance();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    categoryId: 'all',
    accountId: 'all',
    dateRange: 'all',
    sortBy: 'date_desc',
  });

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search filter
        if (filters.search.trim()) {
          const s = filters.search.toLowerCase();
          const matchMerchant = tx.merchant.toLowerCase().includes(s);
          const matchDesc = tx.description?.toLowerCase().includes(s);
          const matchTags = tx.tags?.some((t) => t.toLowerCase().includes(s));
          if (!matchMerchant && !matchDesc && !matchTags) return false;
        }

        // Type filter
        if (filters.type !== 'all' && tx.type !== filters.type) return false;

        // Category filter
        if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) return false;

        // Account filter
        if (filters.accountId !== 'all' && tx.accountId !== filters.accountId && tx.toAccountId !== filters.accountId)
          return false;

        // Date range filter
        if (filters.dateRange !== 'all') {
          const now = new Date();
          const txDate = new Date(tx.date + 'T00:00:00');

          if (filters.dateRange === 'this_month') {
            if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear())
              return false;
          } else if (filters.dateRange === 'last_30') {
            const cutoff = new Date();
            cutoff.setDate(now.getDate() - 30);
            if (txDate < cutoff) return false;
          } else if (filters.dateRange === 'last_90') {
            const cutoff = new Date();
            cutoff.setDate(now.getDate() - 90);
            if (txDate < cutoff) return false;
          } else if (filters.dateRange === 'this_year') {
            if (txDate.getFullYear() !== now.getFullYear()) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (filters.sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (filters.sortBy === 'amount_desc') return b.amount - a.amount;
        if (filters.sortBy === 'amount_asc') return a.amount - b.amount;
        if (filters.sortBy === 'merchant_asc') return a.merchant.localeCompare(b.merchant);
        return 0;
      });
  }, [transactions, filters]);

  // Batch toggle
  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      batchDeleteTransactions(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBatchExport = () => {
    const selectedTxs = transactions.filter((t) => selectedIds.includes(t.id));
    exportTransactionsToCSV(selectedTxs, categories, accounts);
  };

  // Summary of filtered
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions, categories, accounts)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filtered stats chip */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl">
          <span>{filteredTransactions.length} records</span>
          <span>•</span>
          <span className="text-emerald-500 font-mono font-semibold">
            +{formatCurrency(filteredSummary.income, settings.currency, settings.privacyMode)}
          </span>
          <span>•</span>
          <span className="text-rose-500 font-mono font-semibold">
            -{formatCurrency(filteredSummary.expense, settings.currency, settings.privacyMode)}
          </span>
        </div>
      </div>

      {/* Filter component */}
      <TransactionFilters
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onResetFilters={() =>
          setFilters({
            search: '',
            type: 'all',
            categoryId: 'all',
            accountId: 'all',
            dateRange: 'all',
            sortBy: 'date_desc',
          })
        }
      />

      {/* Batch Operations Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 text-emerald-100 border border-emerald-500/30 flex items-center justify-between animate-slide-up shadow-xl">
          <span className="text-xs font-semibold">
            {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchExport}
              className="px-3 py-1 text-xs font-semibold bg-emerald-800/60 hover:bg-emerald-700/80 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table / List Container */}
      <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-semibold">No transactions matching your criteria.</p>
            <p className="text-xs mt-1">Try tweaking your search filters or click "Add Transaction".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Transaction</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Account</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const acc = accountMap.get(tx.accountId);
                  const toAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
                  const isSelected = selectedIds.includes(tx.id);
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelect(tx.id)}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Transaction Merchant & Description */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
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
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {tx.merchant}
                            </p>
                            {tx.description && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{tx.description}</p>
                            )}
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tx.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded"
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        {tx.type === 'transfer' ? (
                          <span className="text-slate-400 font-mono text-[11px]">Transfer</span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${cat?.color || '#64748b'}15`,
                              color: cat?.color || '#64748b',
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: cat?.color || '#64748b' }}
                            />
                            {cat?.name || 'Uncategorized'}
                          </span>
                        )}
                      </td>

                      {/* Account */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {tx.type === 'transfer' && toAcc ? (
                          <span className="text-xs">
                            {acc?.name} → {toAcc.name}
                          </span>
                        ) : (
                          <span className="text-xs">{acc?.name || 'Account'}</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {formatDate(tx.date, settings.dateFormat)}
                      </td>

                      {/* Amount */}
                      <td className="p-3.5 text-right font-mono font-bold text-sm">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isExpense
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatCurrency(tx.amount, settings.currency, settings.privacyMode)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 hover:opacity-100">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete transaction "${tx.merchant}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
