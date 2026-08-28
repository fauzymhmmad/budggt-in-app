import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Account,
  AppSettings,
  Budget,
  Category,
  FinanceSnapshot,
  SavingsGoal,
  Subscription,
  Transaction,
} from '../types/finance';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  DEFAULT_GOALS,
  DEFAULT_SUBSCRIPTIONS,
  generateSampleTransactions,
} from '../utils/sampleData';
import { FullBackupData } from '../utils/exportImport';
import { playCelebration, playClick, playDelete, playSuccess } from '../utils/soundEffects';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'aurabudget_data_v1';
const LEGACY_OWNER_KEY = 'aurabudget_data_v1_cloud_owner';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD', language: 'en', dateFormat: 'YYYY-MM-DD', soundEnabled: true,
  privacyMode: false, startOfMonthDay: 1, theme: 'dark',
};

type SyncStatus = 'loading' | 'synced' | 'syncing' | 'conflict' | 'error';

interface StoredSnapshot extends Omit<FinanceSnapshot, 'version'> { version?: string; }
interface RemoteSnapshot { data: FinanceSnapshot; version: number; updated_at: string; }

interface FinanceContextType {
  transactions: Transaction[]; categories: Category[]; accounts: Account[]; budgets: Budget[];
  goals: SavingsGoal[]; subscriptions: Subscription[]; settings: AppSettings; activeTab: string;
  syncStatus: SyncStatus; setActiveTab: (tab: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void; duplicateTransaction: (id: string) => void;
  batchDeleteTransactions: (ids: string[]) => void;
  setBudget: (categoryId: string, amount: number, alertThreshold?: number) => void;
  deleteBudget: (categoryId: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void; deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number, sourceAccountId?: string) => void;
  withdrawFromGoal: (goalId: string, amount: number, targetAccountId?: string) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void; deleteSubscription: (id: string) => void;
  markSubscriptionPaid: (id: string) => void;
  addAccount: (acc: Omit<Account, 'id'>) => void; updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void; updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void; togglePrivacyMode: () => void;
  resetToSampleData: () => void; clearAllData: () => void; restoreFromBackup: (data: FullBackupData) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const createDefaultSnapshot = (): FinanceSnapshot => ({
  version: '1.0.0', transactions: generateSampleTransactions(), categories: DEFAULT_CATEGORIES,
  accounts: DEFAULT_ACCOUNTS, budgets: DEFAULT_BUDGETS, goals: DEFAULT_GOALS,
  subscriptions: DEFAULT_SUBSCRIPTIONS, settings: DEFAULT_SETTINGS,
});

const isSnapshot = (value: unknown): value is StoredSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<StoredSnapshot>;
  return Boolean(Array.isArray(snapshot.transactions) && Array.isArray(snapshot.categories)
    && Array.isArray(snapshot.accounts) && Array.isArray(snapshot.budgets) && Array.isArray(snapshot.goals)
    && Array.isArray(snapshot.subscriptions) && snapshot.settings);
};

const readLocalSnapshot = (): FinanceSnapshot => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isSnapshot(parsed)) {
        return {
          version: '1.0.0', transactions: parsed.transactions, categories: parsed.categories,
          accounts: parsed.accounts, budgets: parsed.budgets, goals: parsed.goals,
          subscriptions: parsed.subscriptions, settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        };
      }
    }
  } catch {
    // Use default data when legacy storage is unreadable.
  }
  return createDefaultSnapshot();
};

const isRemoteSnapshot = (value: unknown): value is RemoteSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<RemoteSnapshot>;
  return typeof snapshot.version === 'number' && isSnapshot(snapshot.data);
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const initialSnapshot = useMemo(readLocalSnapshot, []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(initialSnapshot.transactions);
  const [categories, setCategories] = useState<Category[]>(initialSnapshot.categories);
  const [accounts, setAccounts] = useState<Account[]>(initialSnapshot.accounts);
  const [budgets, setBudgets] = useState<Budget[]>(initialSnapshot.budgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialSnapshot.goals);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSnapshot.subscriptions);
  const [settings, setSettings] = useState<AppSettings>(initialSnapshot.settings);
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const remoteVersion = useRef(0);
  const lastPersistedSnapshot = useRef('');

  const snapshot = useMemo<FinanceSnapshot>(() => ({
    version: '1.0.0', transactions, categories, accounts, budgets, goals, subscriptions, settings,
  }), [transactions, categories, accounts, budgets, goals, subscriptions, settings]);
  const snapshotJson = useMemo(() => JSON.stringify(snapshot), [snapshot]);

  const applySnapshot = useCallback((next: FinanceSnapshot) => {
    setTransactions(next.transactions); setCategories(next.categories); setAccounts(next.accounts);
    setBudgets(next.budgets); setGoals(next.goals); setSubscriptions(next.subscriptions);
    setSettings({ ...DEFAULT_SETTINGS, ...next.settings });
  }, []);

  const loadRemoteSnapshot = useCallback(async (): Promise<RemoteSnapshot | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from('finance_snapshots')
      .select('data, version, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return isRemoteSnapshot(data) ? data : null;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const hydrate = async () => {
      setIsHydrated(false); setSyncStatus('loading');
      try {
        let remote = await loadRemoteSnapshot();
        if (!remote) {
          const legacyOwner = localStorage.getItem(LEGACY_OWNER_KEY);
          const dataToMigrate = !legacyOwner || legacyOwner === user.id ? readLocalSnapshot() : createDefaultSnapshot();
          const { data, error } = await supabase.rpc('save_finance_snapshot', { p_data: dataToMigrate, p_expected_version: 0 });
          if (error) {
            remote = await loadRemoteSnapshot();
            if (!remote) throw error;
          } else if (isRemoteSnapshot(data)) {
            remote = data;
          }
        }
        if (cancelled || !remote) return;
        remoteVersion.current = remote.version;
        lastPersistedSnapshot.current = JSON.stringify(remote.data);
        localStorage.setItem(STORAGE_KEY, lastPersistedSnapshot.current);
        localStorage.setItem(LEGACY_OWNER_KEY, user.id);
        applySnapshot(remote.data);
        setSyncStatus('synced');
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load financial data from Supabase', error);
          setSyncStatus('error');
        }
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    };
    void hydrate();
    return () => { cancelled = true; };
  }, [applySnapshot, loadRemoteSnapshot, user]);

  useEffect(() => {
    if (!user || !isHydrated || snapshotJson === lastPersistedSnapshot.current) return;
    const timeout = window.setTimeout(() => {
      void (async () => {
        setSyncStatus('syncing');
        const { data, error } = await supabase.rpc('save_finance_snapshot', {
          p_data: snapshot, p_expected_version: remoteVersion.current,
        });
        if (error || !isRemoteSnapshot(data)) {
          try {
            const latest = await loadRemoteSnapshot();
            if (latest && latest.version > remoteVersion.current) {
              remoteVersion.current = latest.version;
              lastPersistedSnapshot.current = JSON.stringify(latest.data);
              localStorage.setItem(STORAGE_KEY, lastPersistedSnapshot.current);
              applySnapshot(latest.data);
              setSyncStatus('conflict');
              return;
            }
          } catch (loadError) {
            console.error('Failed to recover finance data after a sync error', loadError);
          }
          console.error('Failed to save financial data to Supabase', error);
          setSyncStatus('error');
          return;
        }
        remoteVersion.current = data.version;
        lastPersistedSnapshot.current = snapshotJson;
        localStorage.setItem(STORAGE_KEY, snapshotJson);
        localStorage.setItem(LEGACY_OWNER_KEY, user.id);
        setSyncStatus('synced');
      })();
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [applySnapshot, isHydrated, loadRemoteSnapshot, snapshot, snapshotJson, user]);

  useEffect(() => {
    if (!user || !isHydrated) return;
    const channel = supabase.channel(`finance-snapshot-${user.id}`).on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'finance_snapshots', filter: `user_id=eq.${user.id}` },
      (payload) => {
        if (!isRemoteSnapshot(payload.new) || payload.new.version <= remoteVersion.current) return;
        remoteVersion.current = payload.new.version;
        lastPersistedSnapshot.current = JSON.stringify(payload.new.data);
        localStorage.setItem(STORAGE_KEY, lastPersistedSnapshot.current);
        applySnapshot(payload.new.data);
        setSyncStatus('synced');
      }
    ).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [applySnapshot, isHydrated, user]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = { ...tx, id: `tx_${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() };
    setTransactions((prev) => [newTx, ...prev]);
    setAccounts((prev) => prev.map((account) => {
      if (tx.type === 'income' && account.id === tx.accountId) return { ...account, balance: account.balance + tx.amount };
      if (tx.type === 'expense' && account.id === tx.accountId) return { ...account, balance: account.balance - tx.amount };
      if (tx.type === 'transfer') {
        if (account.id === tx.accountId) return { ...account, balance: account.balance - tx.amount };
        if (account.id === tx.toAccountId) return { ...account, balance: account.balance + tx.amount };
      }
      return account;
    }));
    playSuccess(settings.soundEnabled);
    return newTx;
  }, [settings.soundEnabled]);

  const updateTransaction = useCallback((id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((tx) => tx.id === id ? { ...tx, ...updated } : tx));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id)); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const duplicateTransaction = useCallback((id: string) => {
    const existing = transactions.find((tx) => tx.id === id);
    if (existing) addTransaction({ type: existing.type, amount: existing.amount, categoryId: existing.categoryId,
      accountId: existing.accountId, toAccountId: existing.toAccountId, date: new Date().toISOString().split('T')[0],
      merchant: `${existing.merchant} (Copy)`, description: existing.description, tags: existing.tags ? [...existing.tags] : [] });
  }, [addTransaction, transactions]);
  const batchDeleteTransactions = useCallback((ids: string[]) => {
    const idSet = new Set(ids); setTransactions((prev) => prev.filter((tx) => !idSet.has(tx.id))); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const setBudget = useCallback((categoryId: string, amount: number, alertThreshold = 80) => {
    setBudgets((prev) => {
      const index = prev.findIndex((budget) => budget.categoryId === categoryId);
      if (index >= 0) { const next = [...prev]; next[index] = { ...next[index], amount, alertThreshold }; return next; }
      return [...prev, { id: `bgt_${Math.random().toString(36).substring(2, 9)}`, categoryId, amount, period: 'monthly', alertThreshold }];
    });
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const deleteBudget = useCallback((categoryId: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.categoryId !== categoryId)); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    setGoals((prev) => [...prev, { ...goal, id: `goal_${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() }]);
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const updateGoal = useCallback((id: string, updated: Partial<SavingsGoal>) => {
    setGoals((prev) => prev.map((goal) => goal.id === id ? { ...goal, ...updated } : goal)); playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id)); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const depositToGoal = useCallback((goalId: string, amount: number, sourceAccountId?: string) => {
    setGoals((prev) => prev.map((goal) => {
      if (goal.id !== goalId) return goal;
      const currentAmount = goal.currentAmount + amount;
      if (currentAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) playCelebration(settings.soundEnabled);
      else playSuccess(settings.soundEnabled);
      return { ...goal, currentAmount };
    }));
    if (sourceAccountId) setAccounts((prev) => prev.map((account) => account.id === sourceAccountId ? { ...account, balance: account.balance - amount } : account));
  }, [settings.soundEnabled]);
  const withdrawFromGoal = useCallback((goalId: string, amount: number, targetAccountId?: string) => {
    setGoals((prev) => prev.map((goal) => goal.id === goalId ? { ...goal, currentAmount: Math.max(0, goal.currentAmount - amount) } : goal));
    if (targetAccountId) setAccounts((prev) => prev.map((account) => account.id === targetAccountId ? { ...account, balance: account.balance + amount } : account));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const addSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    setSubscriptions((prev) => [...prev, { ...sub, id: `sub_${Math.random().toString(36).substring(2, 9)}` }]); playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const updateSubscription = useCallback((id: string, updated: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((subscription) => subscription.id === id ? { ...subscription, ...updated } : subscription)); playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id)); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const markSubscriptionPaid = useCallback((id: string) => {
    const subscription = subscriptions.find((item) => item.id === id);
    if (!subscription) return;
    addTransaction({ type: 'expense', amount: subscription.amount, categoryId: subscription.categoryId, accountId: subscription.accountId,
      date: new Date().toISOString().split('T')[0], merchant: subscription.name, description: 'Recurring subscription billing',
      isRecurring: true, recurringId: subscription.id, tags: ['subscription'] });
    const nextDate = new Date(`${subscription.nextBillingDate}T00:00:00`);
    if (subscription.billingCycle === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (subscription.billingCycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (subscription.billingCycle === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
    else nextDate.setFullYear(nextDate.getFullYear() + 1);
    updateSubscription(id, { nextBillingDate: nextDate.toISOString().split('T')[0] }); playSuccess(settings.soundEnabled);
  }, [addTransaction, settings.soundEnabled, subscriptions, updateSubscription]);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    setAccounts((prev) => [...prev, { ...account, id: `acc_${Math.random().toString(36).substring(2, 9)}` }]); playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const updateAccount = useCallback((id: string, updated: Partial<Account>) => {
    setAccounts((prev) => prev.map((account) => account.id === id ? { ...account, ...updated } : account)); playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((account) => account.id !== id)); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    setCategories((prev) => [...prev, { ...category, id: `cat_${Math.random().toString(36).substring(2, 9)}` }]); playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const updateCategory = useCallback((id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((category) => category.id === id ? { ...category, ...updated } : category)); playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id)); playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings })); playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);
  const togglePrivacyMode = useCallback(() => setSettings((prev) => ({ ...prev, privacyMode: !prev.privacyMode })), []);
  const resetToSampleData = useCallback(() => { applySnapshot(createDefaultSnapshot()); playSuccess(true); }, [applySnapshot]);
  const clearAllData = useCallback(() => {
    setTransactions([]); setBudgets([]); setGoals([]); setSubscriptions([]);
    setAccounts([{ id: 'acc_main', name: 'Main Account', type: 'bank', balance: 0, currency: settings.currency, color: '#3b82f6' }]);
    playDelete(true);
  }, [settings.currency]);
  const restoreFromBackup = useCallback((data: FullBackupData) => {
    applySnapshot({ version: '1.0.0', transactions: data.transactions || [], categories: data.categories || [], accounts: data.accounts || [],
      budgets: data.budgets || [], goals: data.goals || [], subscriptions: data.subscriptions || [], settings: { ...DEFAULT_SETTINGS, ...data.settings } });
    playSuccess(true);
  }, [applySnapshot]);

  if (!isHydrated) return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300 text-sm">Loading your secure finance data…</div>;

  return <FinanceContext.Provider value={{
    transactions, categories, accounts, budgets, goals, subscriptions, settings, activeTab, syncStatus, setActiveTab,
    addTransaction, updateTransaction, deleteTransaction, duplicateTransaction, batchDeleteTransactions,
    setBudget, deleteBudget, addGoal, updateGoal, deleteGoal, depositToGoal, withdrawFromGoal,
    addSubscription, updateSubscription, deleteSubscription, markSubscriptionPaid,
    addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory,
    updateSettings, togglePrivacyMode, resetToSampleData, clearAllData, restoreFromBackup,
  }}>{children}</FinanceContext.Provider>;
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
