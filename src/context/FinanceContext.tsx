import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Account,
  AppSettings,
  Budget,
  Category,
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
import { playClick, playDelete, playSuccess, playCelebration } from '../utils/soundEffects';

const STORAGE_KEY = 'aurabudget_data_v1';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  language: 'en',
  dateFormat: 'YYYY-MM-DD',
  soundEnabled: true,
  privacyMode: false,
  startOfMonthDay: 1,
  theme: 'dark',
};

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  settings: AppSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Transactions actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => void;
  batchDeleteTransactions: (ids: string[]) => void;
  // Budgets actions
  setBudget: (categoryId: string, amount: number, alertThreshold?: number) => void;
  deleteBudget: (categoryId: string) => void;
  // Goals actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number, sourceAccountId?: string) => void;
  withdrawFromGoal: (goalId: string, amount: number, targetAccountId?: string) => void;
  // Subscriptions actions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  markSubscriptionPaid: (id: string) => void;
  // Account actions
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  // Category actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Settings & System actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  togglePrivacyMode: () => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  restoreFromBackup: (data: FullBackupData) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // State initialization from LocalStorage or defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.transactions)) return parsed.transactions;
      }
    } catch {
      // Fallback
    }
    return generateSampleTransactions();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.categories)) return parsed.categories;
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.accounts)) return parsed.accounts;
      }
    } catch {}
    return DEFAULT_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.budgets)) return parsed.budgets;
      }
    } catch {}
    return DEFAULT_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.goals)) return parsed.goals;
      }
    } catch {}
    return DEFAULT_GOALS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.subscriptions)) return parsed.subscriptions;
      }
    } catch {}
    return DEFAULT_SUBSCRIPTIONS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) return { ...DEFAULT_SETTINGS, ...parsed.settings };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      const stateToSave = {
        version: '1.0.0',
        transactions,
        categories,
        accounts,
        budgets,
        goals,
        subscriptions,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [transactions, categories, accounts, budgets, goals, subscriptions, settings]);

  // Actions
  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
      const newTx: Transaction = {
        ...tx,
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);

      // Adjust account balance accordingly
      setAccounts((prev) =>
        prev.map((acc) => {
          if (tx.type === 'income' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (tx.type === 'expense' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
          if (tx.type === 'transfer') {
            if (acc.id === tx.accountId) return { ...acc, balance: acc.balance - tx.amount };
            if (acc.id === tx.toAccountId) return { ...acc, balance: acc.balance + tx.amount };
          }
          return acc;
        })
      );

      playSuccess(settings.soundEnabled);
      return newTx;
    },
    [settings.soundEnabled]
  );

  const updateTransaction = useCallback(
    (id: string, updated: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx))
      );
      playClick(settings.soundEnabled);
    },
    [settings.soundEnabled]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      playDelete(settings.soundEnabled);
    },
    [settings.soundEnabled]
  );

  const duplicateTransaction = useCallback(
    (id: string) => {
      const existing = transactions.find((t) => t.id === id);
      if (existing) {
        addTransaction({
          type: existing.type,
          amount: existing.amount,
          categoryId: existing.categoryId,
          accountId: existing.accountId,
          toAccountId: existing.toAccountId,
          date: new Date().toISOString().split('T')[0],
          merchant: `${existing.merchant} (Copy)`,
          description: existing.description,
          tags: existing.tags ? [...existing.tags] : [],
        });
      }
    },
    [transactions, addTransaction]
  );

  const batchDeleteTransactions = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      setTransactions((prev) => prev.filter((t) => !set.has(t.id)));
      playDelete(settings.soundEnabled);
    },
    [settings.soundEnabled]
  );

  const setBudget = useCallback((categoryId: string, amount: number, alertThreshold: number = 80) => {
    setBudgets((prev) => {
      const existingIdx = prev.findIndex((b) => b.categoryId === categoryId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], amount, alertThreshold };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: 'bgt_' + Math.random().toString(36).substring(2, 9),
            categoryId,
            amount,
            period: 'monthly',
            alertThreshold,
          },
        ];
      }
    });
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const deleteBudget = useCallback((categoryId: string) => {
    setBudgets((prev) => prev.filter((b) => b.categoryId !== categoryId));
    playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateGoal = useCallback((id: string, updated: Partial<SavingsGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const depositToGoal = useCallback((goalId: string, amount: number, sourceAccountId?: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newAmount = g.currentAmount + amount;
          if (newAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
            playCelebration(settings.soundEnabled);
          } else {
            playSuccess(settings.soundEnabled);
          }
          return { ...g, currentAmount: newAmount };
        }
        return g;
      })
    );

    if (sourceAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === sourceAccountId ? { ...acc, balance: acc.balance - amount } : acc))
      );
    }
  }, [settings.soundEnabled]);

  const withdrawFromGoal = useCallback((goalId: string, amount: number, targetAccountId?: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g))
    );
    if (targetAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === targetAccountId ? { ...acc, balance: acc.balance + amount } : acc))
      );
    }
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const addSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...sub,
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
    };
    setSubscriptions((prev) => [...prev, newSub]);
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateSubscription = useCallback((id: string, updated: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const markSubscriptionPaid = useCallback((id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;

    // Record as transaction
    addTransaction({
      type: 'expense',
      amount: sub.amount,
      categoryId: sub.categoryId,
      accountId: sub.accountId,
      date: new Date().toISOString().split('T')[0],
      merchant: sub.name,
      description: `Recurring subscription billing`,
      isRecurring: true,
      recurringId: sub.id,
      tags: ['subscription'],
    });

    // Advance next billing date based on cycle
    const curDate = new Date(sub.nextBillingDate + 'T00:00:00');
    if (sub.billingCycle === 'weekly') curDate.setDate(curDate.getDate() + 7);
    else if (sub.billingCycle === 'monthly') curDate.setMonth(curDate.getMonth() + 1);
    else if (sub.billingCycle === 'quarterly') curDate.setMonth(curDate.getMonth() + 3);
    else if (sub.billingCycle === 'yearly') curDate.setFullYear(curDate.getFullYear() + 1);

    updateSubscription(id, { nextBillingDate: curDate.toISOString().split('T')[0] });
    playSuccess(settings.soundEnabled);
  }, [subscriptions, addTransaction, updateSubscription, settings.soundEnabled]);

  const addAccount = useCallback((acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: 'acc_' + Math.random().toString(36).substring(2, 9),
    };
    setAccounts((prev) => [...prev, newAcc]);
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateAccount = useCallback((id: string, updated: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat_' + Math.random().toString(36).substring(2, 9),
    };
    setCategories((prev) => [...prev, newCat]);
    playSuccess(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateCategory = useCallback((id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    playDelete(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const togglePrivacyMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, privacyMode: !prev.privacyMode }));
  }, []);

  const resetToSampleData = useCallback(() => {
    setTransactions(generateSampleTransactions());
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setBudgets(DEFAULT_BUDGETS);
    setGoals(DEFAULT_GOALS);
    setSubscriptions(DEFAULT_SUBSCRIPTIONS);
    setSettings(DEFAULT_SETTINGS);
    playSuccess(true);
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setSubscriptions([]);
    setAccounts([
      { id: 'acc_main', name: 'Main Account', type: 'bank', balance: 0, currency: settings.currency, color: '#3b82f6' }
    ]);
    playDelete(true);
  }, [settings.currency]);

  const restoreFromBackup = useCallback((data: FullBackupData) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.categories) setCategories(data.categories);
    if (data.accounts) setAccounts(data.accounts);
    if (data.budgets) setBudgets(data.budgets);
    if (data.goals) setGoals(data.goals);
    if (data.subscriptions) setSubscriptions(data.subscriptions);
    if (data.settings) setSettings(data.settings);
    playSuccess(true);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        goals,
        subscriptions,
        settings,
        activeTab,
        setActiveTab,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        batchDeleteTransactions,
        setBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        withdrawFromGoal,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        markSubscriptionPaid,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        togglePrivacyMode,
        resetToSampleData,
        clearAllData,
        restoreFromBackup,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
