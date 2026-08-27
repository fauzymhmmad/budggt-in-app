import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TransactionType } from '../../types/finance';

export interface FilterState {
  search: string;
  type: TransactionType | 'all';
  categoryId: string;
  accountId: string;
  dateRange: 'all' | 'this_month' | 'last_30' | 'last_90' | 'this_year';
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'merchant_asc';
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const { categories, accounts } = useFinance();
  const { t } = useTranslation();

  const isFiltered =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.accountId !== 'all' ||
    filters.dateRange !== 'all';

  const typeOptions = [
    { id: 'all', label: t('allTypes') },
    { id: 'expense', label: t('expense') },
    { id: 'income', label: t('income') },
    { id: 'transfer', label: t('transfer') },
  ];

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
      {/* Top row: Search and Type Pills */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Type pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto overflow-x-auto">
          {typeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange({ type: opt.id as FilterState['type'] })}
              className={`flex-1 md:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.type === opt.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Category filter */}
        <select
          value={filters.categoryId}
          onChange={(e) => onFilterChange({ categoryId: e.target.value })}
          className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
        >
          <option value="all">{t('allCategories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Account filter */}
        <select
          value={filters.accountId}
          onChange={(e) => onFilterChange({ accountId: e.target.value })}
          className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
        >
          <option value="all">{t('allAccounts')}</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Date Range filter */}
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange({ dateRange: e.target.value as FilterState['dateRange'] })}
          className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
        >
          <option value="all">{t('allTime')}</option>
          <option value="this_month">{t('thisMonth')}</option>
          <option value="last_30">{t('last30Days')}</option>
          <option value="last_90">{t('last90Days')}</option>
          <option value="this_year">{t('thisYear')}</option>
        </select>

        {/* Sort By */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="date_desc">{t('sortNewest')}</option>
            <option value="date_asc">{t('sortOldest')}</option>
            <option value="amount_desc">{t('sortAmountDesc')}</option>
            <option value="amount_asc">{t('sortAmountAsc')}</option>
            <option value="merchant_asc">{t('sortMerchant')}</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {isFiltered && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-500" /> {t('activeFiltersApplied')}
          </span>
          <button
            onClick={onResetFilters}
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
};
