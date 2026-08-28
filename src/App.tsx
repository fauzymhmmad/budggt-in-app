import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetSummary } from './components/budgets/BudgetSummary';
import { GoalsView } from './components/goals/GoalsView';
import { UpcomingCalendar } from './components/subscriptions/UpcomingCalendar';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { FinancialCalculators } from './components/tools/FinancialCalculators';
import { SettingsView } from './components/settings/SettingsView';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Modal } from './components/ui/Modal';
import { Transaction } from './types/finance';
import { CalendarCheck, BarChart3, Calculator, Settings } from 'lucide-react';
import { useTranslation } from './hooks/useTranslation';
import { AuthProvider, useAuth } from './context/AuthContext';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, togglePrivacyMode } = useFinance();
  const { t } = useTranslation();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const handleOpenNewTransaction = () => {
    setTransactionToEdit(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsTransactionModalOpen(true);
  };

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onOpenNewTransaction: handleOpenNewTransaction,
    onTogglePrivacy: togglePrivacyMode,
    onSelectTab: (index) => {
      const tabs = ['dashboard', 'transactions', 'budgets', 'goals', 'subscriptions', 'analytics', 'tools'];
      if (tabs[index]) setActiveTab(tabs[index]);
    },
    onCloseModal: () => {
      setIsTransactionModalOpen(false);
      setIsCommandPaletteOpen(false);
      setIsMobileMoreOpen(false);
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f17] dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Sticky Header */}
        <Header
          onOpenNewTransaction={handleOpenNewTransaction}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenNewTransaction={handleOpenNewTransaction} />
          )}
          {activeTab === 'transactions' && (
            <TransactionList
              onOpenNewTransaction={handleOpenNewTransaction}
              onEditTransaction={handleEditTransaction}
            />
          )}
          {activeTab === 'budgets' && <BudgetSummary />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'subscriptions' && <UpcomingCalendar />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'tools' && <FinancialCalculators />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <MobileNav onOpenMoreMenu={() => setIsMobileMoreOpen(true)} />

      {/* New / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionToEdit={transactionToEdit}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewTransaction={handleOpenNewTransaction}
      />

      {/* Mobile More Navigation Sheet */}
      <Modal
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        title={t('mobileMoreTitle')}
        subtitle={t('mobileMoreSubtitle')}
        maxWidth="sm"
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          {[
            { id: 'subscriptions', label: t('tabSubscriptions'), icon: CalendarCheck, color: 'text-indigo-500' },
            { id: 'analytics', label: t('tabAnalytics'), icon: BarChart3, color: 'text-emerald-500' },
            { id: 'tools', label: t('tabTools'), icon: Calculator, color: 'text-purple-500' },
            { id: 'settings', label: t('tabSettings'), icon: Settings, color: 'text-cyan-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMoreOpen(false);
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

const SignInScreen: React.FC = () => {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSending(true);
    try {
      await sendMagicLink(email.trim());
      setMessage('Check your email for a secure sign-in link.');
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to send the sign-in link.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-slate-950 px-4 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-emerald-400">Budggt.in</p>
          <h1 className="mt-2 text-2xl font-bold">Your finances, on every device.</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with the same email anywhere to access your private data.</p>
        </div>
        <label className="block text-sm font-medium text-slate-300" htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm outline-none ring-emerald-500 placeholder:text-slate-500 focus:ring-2"
        />
        {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={isSending}
          className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? 'Sending link…' : 'Email me a sign-in link'}
        </button>
      </form>
    </main>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300 text-sm">Checking your session…</div>;
  if (!user) return <SignInScreen />;

  return (
    <ThemeProvider>
      <FinanceProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </FinanceProvider>
    </ThemeProvider>
  );
};

export function App() {
  return <AuthProvider><AuthenticatedApp /></AuthProvider>;
}

export default App;
