import React, { useRef } from 'react';
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
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { SUPPORTED_CURRENCIES } from '../../utils/formatters';
import {
  exportToJSON,
  exportTransactionsToCSV,
  parseJSONBackup,
  parseCSVTransactions,
} from '../../utils/exportImport';

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
  } = useFinance();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

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
    showToast('success', 'Backup Exported', 'Full JSON financial backup saved.');
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, categories, accounts);
    showToast('success', 'CSV Exported', 'Transactions spreadsheet downloaded.');
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseJSONBackup(file);
      restoreFromBackup(data);
      showToast('success', 'Backup Restored', 'All financial data has been successfully imported.');
    } catch (err: unknown) {
      showToast('error', 'Import Failed', err instanceof Error ? err.message : 'Invalid backup file format.');
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
        showToast('warning', 'No Records', 'No valid transaction records found in CSV.');
        return;
      }

      parsedTxs.forEach((tx) => {
        addTransaction({
          type: tx.type || 'expense',
          amount: tx.amount || 0,
          categoryId: categories.find((c) => c.type === (tx.type || 'expense'))?.id || categories[0].id,
          accountId: accounts[0]?.id || 'acc_checking',
          date: tx.date || new Date().toISOString().split('T')[0],
          merchant: tx.merchant || 'Imported Transaction',
          description: tx.description,
          tags: ['imported-csv'],
        });
      });

      showToast('success', 'CSV Imported', `Imported ${parsedTxs.length} transactions.`);
    } catch (err: unknown) {
      showToast('error', 'CSV Import Failed', err instanceof Error ? err.message : 'Invalid CSV file format.');
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings & Preferences</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize currency, visuals, privacy protection, and manage local data backup
        </p>
      </div>

      {/* 1. General Preferences Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>General & Localization</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Primary Currency
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
              Date Format
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

      {/* 2. Appearance & Haptics Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-emerald-500" />
          <span>Appearance & Privacy</span>
        </h4>

        {/* Theme mode selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
              { id: 'oled', label: 'OLED Black' },
              { id: 'system', label: 'System' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  theme === t.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Privacy mode toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Privacy Mode</p>
                <p className="text-[11px] text-slate-400">Mask all account numbers and balance values</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.privacyMode}
              onChange={(e) => updateSettings({ privacyMode: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Haptic Sound Effects</p>
                <p className="text-[11px] text-slate-400">Audio chimes for milestones and actions</p>
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

      {/* 3. Data Portability, Backup & Restore Card */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Data Backup, Export & Restore</span>
        </h4>
        <p className="text-xs text-slate-400">
          Your financial data is stored 100% locally and privately in your browser. You can export complete backups anytime.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
          >
            <FileCode className="w-4 h-4 text-cyan-500" />
            <span>Export Full Backup (JSON)</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export Ledger as (CSV)</span>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={jsonInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Import Backup (JSON)</span>
            </button>
          </div>

          {/* Import CSV */}
          <div>
            <input
              type="file"
              ref={csvInputRef}
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <button
              onClick={() => csvInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Import Transactions (CSV)</span>
            </button>
          </div>
        </div>

        {/* Reset & Restore Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm('Restore demo sample data? This will overwrite your current dataset.')) {
                resetToSampleData();
                showToast('info', 'Demo Data Restored', 'Sample financial records populated.');
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Demo Sample Records</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('WARNING: Are you sure you want to clear ALL data? This cannot be undone unless you have a backup.')) {
                clearAllData();
                showToast('error', 'All Data Cleared', 'Your workspace is now empty.');
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* 4. GitHub Pages Deployment Info Card */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>GitHub Pages (`github.io`) Ready</span>
        </h4>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          This application is built with relative base paths (`./`) and pure client-side LocalStorage. You can deploy it to any GitHub repository and host it for free at <code className="font-mono bg-white/40 dark:bg-slate-800/40 px-1 py-0.5 rounded">https://&lt;username&gt;.github.io/&lt;repository&gt;/</code>.
        </p>
      </div>
    </div>
  );
};
