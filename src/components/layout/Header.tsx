import React from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Plus,
  Search,
  Laptop,
  Languages,
  Cloud,
  CloudOff,
  LogOut,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SUPPORTED_CURRENCIES } from '../../utils/formatters';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  onOpenCommandPalette,
}) => {
  const { activeTab, settings, syncStatus, updateSettings, togglePrivacyMode } = useFinance();
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: t('dashboardTitle'), subtitle: t('dashboardSubtitle') },
    transactions: { title: t('transactionsTitle'), subtitle: t('transactionsSubtitle') },
    budgets: { title: t('budgetsTitle'), subtitle: t('budgetsSubtitle') },
    goals: { title: t('goalsTitle'), subtitle: t('goalsSubtitle') },
    subscriptions: { title: t('subscriptionsTitle'), subtitle: t('subscriptionsSubtitle') },
    analytics: { title: t('analyticsTitle'), subtitle: t('analyticsSubtitle') },
    tools: { title: t('toolsTitle'), subtitle: t('toolsSubtitle') },
    settings: { title: t('settingsTitle'), subtitle: t('settingsSubtitle') },
  };

  const currentInfo = tabTitles[activeTab] || { title: t('appName'), subtitle: t('suiteSubtitle') };

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Title info */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          {currentInfo.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Actions & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search / Command palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          title={t('searchActions')}
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">{t('quickSearch')}</span>
          <kbd className="hidden md:inline font-mono text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

        <div
          className={`hidden lg:flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium ${
            syncStatus === 'error' || syncStatus === 'conflict'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
          }`}
          title={syncStatus === 'synced' ? 'Your data is synced across devices' : `Cloud sync: ${syncStatus}`}
        >
          {syncStatus === 'error' || syncStatus === 'conflict' ? <CloudOff className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
          <span>{syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'conflict' ? 'Updated elsewhere' : 'Sync issue'}</span>
        </div>

        <button
          onClick={() => void signOut()}
          className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors"
          title={`Sign out ${user?.email || ''}`}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Language Switcher Button */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 text-xs font-bold font-mono text-slate-700 dark:text-slate-200 transition-colors"
          title={t('switchLanguage')}
          aria-label={t('switchLanguage')}
        >
          <Languages className="w-3.5 h-3.5 text-emerald-500" />
          <span>{language === 'en' ? 'EN' : 'ID'}</span>
        </button>

        {/* Currency Quick Switcher */}
        <select
          value={settings.currency}
          onChange={(e) => updateSettings({ currency: e.target.value })}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          aria-label={t('selectCurrency')}
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>

        {/* Privacy Mode Toggle */}
        <button
          onClick={togglePrivacyMode}
          className={`p-2 rounded-xl border transition-colors ${
            settings.privacyMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={settings.privacyMode ? t('privacyModeOn') : t('privacyModeOff')}
          aria-label={t('togglePrivacyMode')}
        >
          {settings.privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Audio Sound Toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`p-2 rounded-xl border transition-colors ${
            settings.soundEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-400'
          }`}
          title={settings.soundEnabled ? t('soundEnabled') : t('soundMuted')}
          aria-label={t('toggleSound')}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Mode Toggle (Light / Dark / OLED / System) */}
        <button
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('oled');
            else if (theme === 'oled') setTheme('system');
            else setTheme('light');
          }}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={t('currentTheme', { theme: theme.toUpperCase() })}
          aria-label={t('toggleTheme')}
        >
          {theme === 'system' ? (
            <Laptop className="w-4 h-4 text-cyan-400" />
          ) : resolvedTheme === 'oled' ? (
            <span className="w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px] text-purple-400">
              OLED
            </span>
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Mobile New Transaction Add Button */}
        <button
          onClick={onOpenNewTransaction}
          className="md:hidden flex items-center justify-center p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
          aria-label={t('addTransaction')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
