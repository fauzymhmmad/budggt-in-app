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
import { LanguageProvider } from './context/LanguageContext';
import { AuthScreen } from './components/auth/AuthScreen';

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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-rose-400">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred while loading the application.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuthenticatedApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300 text-sm">Checking your session…</div>;
  if (!user) return <AuthScreen />;

  return (
    <FinanceProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </FinanceProvider>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
