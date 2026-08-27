import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  MoreHorizontal,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';

interface MobileNavProps {
  onOpenMoreMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMoreMenu }) => {
  const { activeTab, setActiveTab } = useFinance();
  const { t } = useTranslation();

  const items = [
    { id: 'dashboard', label: t('tabDashboard'), icon: LayoutDashboard },
    { id: 'transactions', label: t('tabTransactions'), icon: ArrowLeftRight },
    { id: 'budgets', label: t('tabBudgets'), icon: PieChart },
    { id: 'goals', label: t('tabGoals'), icon: Target },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* More / Additional Tabs Button */}
      <button
        onClick={onOpenMoreMenu}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          ['subscriptions', 'analytics', 'tools', 'settings'].includes(activeTab)
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('moreFeatures')}</span>
      </button>
    </nav>
  );
};
