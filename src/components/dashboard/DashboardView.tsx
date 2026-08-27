import React from 'react';
import { MetricCards } from './MetricCards';
import { SmartAlerts } from './SmartAlerts';
import { CashflowChart } from './CashflowChart';
import { CategoryChart } from './CategoryChart';
import { RecentTransactions } from './RecentTransactions';

interface DashboardViewProps {
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
}) => {
  return (
    <div className="space-y-6">
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
