import React from 'react';
import { MetricCards } from './MetricCards';
import { SmartAlerts } from './SmartAlerts';
import { CashflowChart } from './CashflowChart';
import { CategoryChart } from './CategoryChart';
import { RecentTransactions } from './RecentTransactions';
import { MonthSelector } from '../ui/MonthSelector';
import { Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface DashboardViewProps {
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Period Selector & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <MonthSelector />
        <button
          onClick={onOpenNewTransaction}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTransaction')}</span>
        </button>
      </div>

      {/* 1. Top Summary Metric Cards */}
      <MetricCards />

      {/* 2. Smart Alerts & Notices */}
      <SmartAlerts />

      {/* 3. Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashflowChart />
        <CategoryChart />
      </div>

      {/* 4. Recent Transactions Feed */}
      <RecentTransactions onOpenNewTransaction={onOpenNewTransaction} />
    </div>
  );
};
