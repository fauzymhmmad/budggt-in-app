import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  CalendarCheck,
  BarChart3,
  Calculator,
  Settings,
  PlusCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency } from '../../utils/formatters';
import { Account } from '../../types/finance';

interface SidebarProps {
  onOpenNewTransaction: () => void;
  onOpenCommandPalette: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewTransaction,
  onOpenCommandPalette,
}) => {
  const { activeTab, setActiveTab, accounts, settings, togglePrivacyMode } = useFinance();
  const { t } = useTranslation();

  const totalBalance = accounts.reduce((sum: number, a: Account) => sum + a.balance, 0);

  const navItems = [
    { id: 'dashboard', label: t('tabDashboard'), icon: LayoutDashboard, shortcut: '1' },
    { id: 'transactions', label: t('tabTransactions'), icon: ArrowLeftRight, shortcut: '2' },
    { id: 'budgets', label: t('tabBudgets'), icon: PieChart, shortcut: '3' },
    { id: 'goals', label: t('tabGoals'), icon: Target, shortcut: '4' },
    { id: 'subscriptions', label: t('tabSubscriptions'), icon: CalendarCheck, shortcut: '5' },
    { id: 'analytics', label: t('tabAnalytics'), icon: BarChart3, shortcut: '6' },
    { id: 'tools', label: t('tabTools'), icon: Calculator, shortcut: '7' },
    { id: 'settings', label: t('tabSettings'), icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-300 dark:to-cyan-300 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
            <p className="text-[11px] font-medium text-slate-400">{t('suiteSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Net Worth Quick Card */}
      <div className="px-4 pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">{t('netBalance')}</span>
            <button
              onClick={togglePrivacyMode}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={settings.privacyMode ? 'Reveal Balances' : 'Hide Balances (Privacy Mode)'}
            >
              {settings.privacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(totalBalance, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{accounts.length} {t('activeAccounts')}</span>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={onOpenNewTransaction}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('newTransaction')}</span>
          <kbd className="ml-auto text-[10px] bg-emerald-700/60 text-emerald-100 px-1.5 py-0.5 rounded font-mono">
            N
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity font-mono px-1 rounded bg-slate-200 dark:bg-slate-800">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Command Palette trigger footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <kbd className="font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-600">
              ⌘K
            </kbd>
            <span>{t('commandBar')}</span>
          </span>
          <span className="text-[11px] text-slate-400">{t('quickSearch')}</span>
        </button>
      </div>
    </aside>
  );
};
