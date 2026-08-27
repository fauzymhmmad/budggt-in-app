import React from 'react';
import { MonthOverMonth } from './MonthOverMonth';
import { NetWorthProjection } from './NetWorthProjection';
import { CashflowChart } from '../dashboard/CashflowChart';
import { CategoryChart } from '../dashboard/CategoryChart';
import { useTranslation } from '../../hooks/useTranslation';

export const AnalyticsView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('analyticsHeader')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('analyticsSub')}</p>
      </div>

      {/* Cashflow & Category Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashflowChart />
        <CategoryChart />
      </div>

      {/* Month over month table & bar visualization */}
      <MonthOverMonth />

      {/* 5-year Net worth & wealth projection */}
      <NetWorthProjection />
    </div>
  );
};
