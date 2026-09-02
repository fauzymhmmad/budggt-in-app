import React, { useRef, useState } from 'react';
import {
  Upload,
  RotateCcw,
  Trash2,
  Volume2,
  Eye,
  Laptop,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  Globe,
  Shield,
  Languages,
  Plus,
  Pencil,
  Wallet,
  User,
  Cloud,
  CloudOff,
  LogOut,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../../utils/formatters';
import {
  exportToJSON,
  exportTransactionsToCSV,
  parseJSONBackup,
  parseCSVTransactions,
} from '../../utils/exportImport';
import { Language } from '../../locales/translations';
import { Account, AccountType } from '../../types/finance';
import { AccountModal } from './AccountModal';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    transactions,
    categories,
    accounts,
    budgets,
    goals,
    subscriptions,
    resetToSampleData,
    clearAllData,
    restoreFromBackup,
    addTransaction,
    deleteAccount,
    syncStatus,
  } = useFinance();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const handleExportJSON = () => {
    exportToJSON({
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      transactions,
      categories,
      accounts,
      budgets,
      goals,
      subscriptions,
      settings,
    });
    showToast('success', t('backupExported'), t('backupExportedDesc'));
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, categories, accounts);
    showToast('success', t('csvExported'), t('csvExportedDesc'));
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseJSONBackup(file);
      restoreFromBackup(data);
      showToast('success', t('backupRestored'), t('backupRestoredDesc'));
    } catch (err: unknown) {
      showToast('error', t('importFailed'), err instanceof Error ? err.message : t('invalidBackup'));
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsedTxs = await parseCSVTransactions(file);
      if (parsedTxs.length === 0) {
        showToast('warning', t('noRecords'), t('noRecordsDesc'));
        return;
      }
      parsedTxs.forEach((tx) => {
        addTransaction({
          type: tx.type || 'expense',
          amount: tx.amount || 0,
          categoryId: categories.find((c) => c.type === (tx.type || 'expense'))?.id || categories[0].id,
          accountId: accounts[0]?.id || 'acc_checking',
          date: tx.date || new Date().toISOString().split('T')[0],
          merchant: tx.merchant || t('importedTransaction'),
          description: tx.description,
          tags: ['imported-csv'],
        });
      });
      showToast('success', t('csvImported'), t('csvImportedDesc', { count: parsedTxs.length }));
    } catch (err: unknown) {
      showToast('error', t('csvImportFailed'), err instanceof Error ? err.message : t('invalidCsv'));
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const themeOptions = [
    { id: 'light', label: t('themeLight') },
    { id: 'dark', label: t('themeDark') },
    { id: 'oled', label: t('themeOled') },
    { id: 'system', label: t('themeSystem') },
  ];

  const accountTypeLabel = (type: AccountType) => {
    const keys = {
      cash: 'accountTypeCash',
      bank: 'accountTypeBank',
      credit_card: 'accountTypeCreditCard',
      savings: 'accountTypeSavings',
      crypto: 'accountTypeCrypto',
      e_wallet: 'accountTypeEWallet',
    } as const;
    return t(keys[type]);
  };

  const handleDeleteAccount = (account: Account) => {
    if (accounts.length === 1) {
      alert(t('lastAccountCannotDelete'));
      return;
    }

    const isUsed = transactions.some((transaction) => transaction.accountId === account.id || transaction.toAccountId === account.id)
      || subscriptions.some((subscription) => subscription.accountId === account.id);
    if (isUsed) {
      alert(t('accountInUse'));
      return;
    }

    if (window.confirm(t('deleteAccountConfirm', { name: account.name }))) {
      deleteAccount(account.id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('settingsHeader')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('settingsDesc')}</p>
      </div>

      {/* Account & Cloud Sync Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-base shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('signedInAs')}</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.email || 'Authenticated User'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : syncStatus === 'syncing'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}
                >
                  {syncStatus === 'error' || syncStatus === 'conflict' ? (
                    <CloudOff className="w-3 h-3" />
                  ) : (
                    <Cloud className="w-3 h-3" />
                  )}
                  <span>
                    {syncStatus === 'synced'
                      ? 'Supabase Synced'
                      : syncStatus === 'syncing'
                      ? 'Syncing to Supabase...'
                      : syncStatus === 'conflict'
                      ? 'Cloud Conflict'
                      : 'Sync Error'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('signOutButton')}</span>
          </button>
        </div>
      </div>

      {/* 1. General & Localization Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>{t('generalLocalization')}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* App Language Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-emerald-500" />
              {t('appLanguage')}
            </label>
            <div className="flex items-center gap-2">
              {(['en', 'id'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
                    language === lang
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {lang === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('primaryCurrency')}
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('dateFormat')}
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) =>
                updateSettings({
                  dateFormat: e.target.value as 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY',
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-27)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (08/27/2026)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (27/08/2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Accounts & payment methods */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>{t('accountsPaymentMethods')}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">{t('accountsPaymentMethodsDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAccountToEdit(null);
              setIsAccountModalOpen(true);
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('addAccount')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                style={{ backgroundColor: account.color }}
              >
                {account.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{account.name}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {accountTypeLabel(account.type)}{account.accountNumberMasked ? ` • ${account.accountNumberMasked}` : ''}
                </p>
                <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 mt-1">
                  {formatCurrency(account.balance, account.currency, settings.privacyMode)}
                </p>
              </div>
              <div className="flex items-center gap-1 self-start">
                <button
                  type="button"
                  onClick={() => {
                    setAccountToEdit(account);
                    setIsAccountModalOpen(true);
                  }}
                  aria-label={t('editAccount')}
                  title={t('editAccount')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(account)}
                  aria-label={t('delete')}
                  title={t('delete')}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Appearance & Privacy Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-emerald-500" />
          <span>{t('appearancePrivacy')}</span>
        </h4>

        {/* Theme Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            {t('themeMode')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id as 'light' | 'dark' | 'oled' | 'system')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  theme === opt.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Privacy Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t('privacyMode')}</p>
                <p className="text-[11px] text-slate-400">{t('privacyModeDesc')}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.privacyMode}
              onChange={(e) => updateSettings({ privacyMode: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t('hapticSound')}</p>
                <p className="text-[11px] text-slate-400">{t('hapticSoundDesc')}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Data Backup Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>{t('dataBackupRestore')}</span>
        </h4>
        <p className="text-xs text-slate-400">{t('dataStorageNotice')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
          >
            <FileCode className="w-4 h-4 text-cyan-500" />
            <span>{t('exportFullBackup')}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>{t('exportLedgerCsv')}</span>
          </button>

          {/* Import JSON */}
          <div>
            <input type="file" ref={jsonInputRef} accept=".json" onChange={handleImportJSON} className="hidden" />
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>{t('importBackupJson')}</span>
            </button>
          </div>

          {/* Import CSV */}
          <div>
            <input type="file" ref={csvInputRef} accept=".csv" onChange={handleImportCSV} className="hidden" />
            <button
              onClick={() => csvInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>{t('importTransactionsCsv')}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm(t('restoreDemoConfirm'))) {
                resetToSampleData();
                showToast('info', t('demoDataRestored'), t('demoDataRestoredDesc'));
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('restoreDemoRecords')}</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  t('clearDataConfirm')
                )
              ) {
                clearAllData();
                showToast('error', t('allDataCleared'), t('allDataClearedDesc'));
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('clearAllData')}</span>
          </button>
        </div>
      </div>

      {/* 5. GitHub Pages Info Card */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{t('githubPagesReady')}</span>
        </h4>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('githubPagesDesc')}
        </p>
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
      />
    </div>
  );
};
