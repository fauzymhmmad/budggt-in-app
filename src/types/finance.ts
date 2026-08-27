export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings' | 'crypto' | 'e_wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  accountNumberMasked?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  date: string; // ISO YYYY-MM-DD
  merchant: string;
  description?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number; // Monthly spending limit
  period: 'monthly' | 'weekly' | 'annual';
  alertThreshold: number; // Percentage, e.g. 80
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO YYYY-MM-DD
  color: string;
  icon: string;
  notes?: string;
  category?: string;
  createdAt: string;
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string; // ISO YYYY-MM-DD
  categoryId: string;
  accountId: string;
  status: 'active' | 'paused' | 'canceled';
  websiteUrl?: string;
  icon?: string;
  color: string;
  reminderDaysBefore?: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandSeparator: string;
  decimalSeparator: string;
}

export interface AppSettings {
  currency: string;
  language: 'en' | 'id';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  soundEnabled: boolean;
  privacyMode: boolean;
  startOfMonthDay: number; // e.g. 1
  theme: 'light' | 'dark' | 'oled' | 'system';
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  actionText?: string;
  actionTab?: string;
  timestamp: string;
}
