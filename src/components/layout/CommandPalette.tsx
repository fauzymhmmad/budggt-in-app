import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Eye,
  EyeOff,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  CalendarCheck,
  BarChart3,
  Calculator,
  Settings,
  Download,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { exportTransactionsToCSV } from '../../utils/exportImport';
import { useTranslation } from '../../hooks/useTranslation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTransaction: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewTransaction,
}) => {
  const [query, setQuery] = useState('');
  const {
    setActiveTab,
    togglePrivacyMode,
    settings,
    updateSettings,
    transactions,
    categories,
    accounts,
    resetToSampleData,
  } = useFinance();
  const { toggleTheme } = useTheme();
  const { t } = useTranslation();

  const commands = useMemo(() => {
    return [
      {
        id: 'new_tx',
        title: t('commandNewTransaction'),
        category: t('commandQuickActions'),
        icon: PlusCircle,
        action: () => {
          onClose();
          onOpenNewTransaction();
        },
      },
      {
        id: 'tab_dashboard',
        title: t('commandDashboard'),
        category: t('commandNavigation'),
        icon: LayoutDashboard,
        action: () => {
          setActiveTab('dashboard');
          onClose();
        },
      },
      {
        id: 'tab_transactions',
        title: t('commandTransactions'),
        category: t('commandNavigation'),
        icon: ArrowLeftRight,
        action: () => {
          setActiveTab('transactions');
          onClose();
        },
      },
      {
        id: 'tab_budgets',
        title: t('commandBudgets'),
        category: t('commandNavigation'),
        icon: PieChart,
        action: () => {
          setActiveTab('budgets');
          onClose();
        },
      },
      {
        id: 'tab_goals',
        title: t('commandGoals'),
        category: t('commandNavigation'),
        icon: Target,
        action: () => {
          setActiveTab('goals');
          onClose();
        },
      },
      {
        id: 'tab_subscriptions',
        title: t('commandSubscriptions'),
        category: t('commandNavigation'),
        icon: CalendarCheck,
        action: () => {
          setActiveTab('subscriptions');
          onClose();
        },
      },
      {
        id: 'tab_analytics',
        title: t('commandAnalytics'),
        category: t('commandNavigation'),
        icon: BarChart3,
        action: () => {
          setActiveTab('analytics');
          onClose();
        },
      },
      {
        id: 'tab_tools',
        title: t('commandCalculators'),
        category: t('commandNavigation'),
        icon: Calculator,
        action: () => {
          setActiveTab('tools');
          onClose();
        },
      },
      {
        id: 'tab_settings',
        title: t('commandSettings'),
        category: t('commandNavigation'),
        icon: Settings,
        action: () => {
          setActiveTab('settings');
          onClose();
        },
      },
      {
        id: 'toggle_privacy',
        title: settings.privacyMode ? t('commandPrivacyOff') : t('commandPrivacyOn'),
        category: t('commandPreferences'),
        icon: settings.privacyMode ? Eye : EyeOff,
        action: () => {
          togglePrivacyMode();
          onClose();
        },
      },
      {
        id: 'toggle_theme',
        title: t('commandCycleTheme'),
        category: t('commandPreferences'),
        icon: settings.theme === 'light' ? Moon : Sun,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'toggle_sound',
        title: settings.soundEnabled ? t('commandMuteSound') : t('commandEnableSound'),
        category: t('commandPreferences'),
        icon: Volume2,
        action: () => {
          updateSettings({ soundEnabled: !settings.soundEnabled });
          onClose();
        },
      },
      {
        id: 'export_csv',
        title: t('commandExportCsv'),
        category: t('commandDataManagement'),
        icon: Download,
        action: () => {
          exportTransactionsToCSV(transactions, categories, accounts);
          onClose();
        },
      },
      {
        id: 'reset_data',
        title: t('commandRestoreDemo'),
        category: t('commandDataManagement'),
        icon: RotateCcw,
        action: () => {
          if (window.confirm(t('resetDemoConfirm'))) {
            resetToSampleData();
          }
          onClose();
        },
      },
    ];
  }, [
    onClose,
    onOpenNewTransaction,
    setActiveTab,
    settings,
    togglePrivacyMode,
    toggleTheme,
    updateSettings,
    transactions,
    categories,
    accounts,
    resetToSampleData,
    t,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette dialog */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden z-10 animate-scale-in"
        role="dialog"
      >
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('commandPlaceholder')}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            autoFocus
          />
          <kbd className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              {t('noMatchingCommands')}
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cmd.title}</p>
                    <p className="text-[11px] text-slate-400">{cmd.category}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
