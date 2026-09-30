import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatCompactNumber } from '../utils/formatters';
import {
  calculateMonthlySummary,
  calculate503020Rule,
  calculateCompoundInterest,
  calculateLoanPayoff,
  calculateCategorySpending,
  getMonthDateRange,
} from '../utils/calculations';
import { Account, Transaction, Category, Budget } from '../types/finance';
import { applyAccountBalanceChanges, getAccountBalanceChanges } from '../utils/accountBalances';

describe('Financial Formatters', () => {
  it('formats USD currency correctly', () => {
    expect(formatCurrency(1250.5, 'USD')).toBe('$1,250.50');
    expect(formatCurrency(-45.2, 'USD')).toBe('-$45.20');
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('masks currency when privacyMode is enabled', () => {
    expect(formatCurrency(1250.5, 'USD', true)).toBe('••••••');
  });

  it('formats IDR and JPY without decimals', () => {
    expect(formatCurrency(50000, 'IDR')).toBe('Rp 50.000');
    expect(formatCurrency(1500, 'JPY')).toBe('¥1,250'.length ? '¥1,500' : '¥1,500');
  });

  it('formats compact numbers properly', () => {
    expect(formatCompactNumber(1500, 'USD')).toBe('$1.5k');
    expect(formatCompactNumber(2500000, 'USD')).toBe('$2.5M');
  });

  it('formats percentages correctly', () => {
    expect(formatPercentage(25.67)).toBe('25.7%');
    expect(formatPercentage(40, true)).toBe('+40%');
    expect(formatPercentage(-15.2, true)).toBe('-15.2%');
  });
});

describe('Financial Calculations', () => {
  it('calculates monthly summary income, expenses, and savings rate', () => {
    const today = new Date().toISOString().split('T')[0];
    const transactions: Transaction[] = [
      {
        id: 't1',
        type: 'income',
        amount: 5000,
        categoryId: 'cat_salary',
        accountId: 'acc1',
        date: today,
        merchant: 'Employer',
        createdAt: today,
      },
      {
        id: 't2',
        type: 'expense',
        amount: 2000,
        categoryId: 'cat_rent',
        accountId: 'acc1',
        date: today,
        merchant: 'Landlord',
        createdAt: today,
      },
    ];

    const summary = calculateMonthlySummary(transactions, today, today);
    expect(summary.totalIncome).toBe(5000);
    expect(summary.totalExpense).toBe(2000);
    expect(summary.netSavings).toBe(3000);
    expect(summary.savingsRate).toBe(60);
  });

  it('calculates 50/30/20 rule properly', () => {
    const result = calculate503020Rule(6000);
    expect(result.needs.amount).toBe(3000);
    expect(result.wants.amount).toBe(1800);
    expect(result.savings.amount).toBe(1200);
  });

  it('calculates compound interest growth accurately', () => {
    // $10,000 initial, $500/month, 8% annual ROI for 5 years
    const result = calculateCompoundInterest(10000, 500, 8, 5);
    expect(result.totalPrincipal).toBe(10000 + 500 * 60); // $40,000
    expect(result.totalBalance).toBeGreaterThan(result.totalPrincipal);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.yearlyBreakdown.length).toBe(5);
  });

  it('calculates loan monthly payments and total interest', () => {
    // $10,000 loan, 5% interest, 3 years
    const result = calculateLoanPayoff(10000, 5, 3);
    expect(result.numberOfPayments).toBe(36);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalPayment).toBeGreaterThan(10000);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - 10000, 2);
  });

  it('calculates category spending and budget warning/exceeded status', () => {
    const today = new Date().toISOString().split('T')[0];
    const categories: Category[] = [
      { id: 'cat_food', name: 'Food', type: 'expense', icon: 'Utensils', color: '#f97316' },
    ];
    const budgets: Budget[] = [
      { id: 'b1', categoryId: 'cat_food', amount: 500, period: 'monthly', alertThreshold: 80 },
    ];
    const transactions: Transaction[] = [
      {
        id: 't1',
        type: 'expense',
        amount: 450,
        categoryId: 'cat_food',
        accountId: 'acc1',
        date: today,
        merchant: 'Groceries',
        createdAt: today,
      },
    ];

    const spending = calculateCategorySpending(transactions, categories, budgets, today, today, true);
    expect(spending.length).toBe(1);
    expect(spending[0].spent).toBe(450);
    expect(spending[0].percentageOfBudget).toBe(90);
    expect(spending[0].status).toBe('warning'); // 90% is above 80% threshold
  });

  it('calculates account-specific budgets properly (e.g. Neo bank vs Krom bank for same category)', () => {
    const categories: Category[] = [
      { id: 'cat_shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
    ];
    const accounts: Account[] = [
      { id: 'acc_neo', name: 'Neo Bank', type: 'bank', balance: 5000000, currency: 'IDR', color: '#f59e0b' },
      { id: 'acc_krom', name: 'Krom Bank', type: 'bank', balance: 3000000, currency: 'IDR', color: '#6366f1' },
    ];
    const budgets: Budget[] = [
      { id: 'b_neo', categoryId: 'cat_shopping', accountId: 'acc_neo', amount: 2500000, period: 'monthly', alertThreshold: 80 },
      { id: 'b_krom', categoryId: 'cat_shopping', accountId: 'acc_krom', amount: 1000000, period: 'monthly', alertThreshold: 80 },
    ];
    const transactions: Transaction[] = [
      {
        id: 'tx_neo_1',
        type: 'expense',
        amount: 2000000,
        categoryId: 'cat_shopping',
        accountId: 'acc_neo',
        date: '2026-09-05',
        merchant: 'Shopping at Store A',
        createdAt: '2026-09-05T10:00:00.000Z',
      },
      {
        id: 'tx_krom_1',
        type: 'expense',
        amount: 500000,
        categoryId: 'cat_shopping',
        accountId: 'acc_krom',
        date: '2026-09-10',
        merchant: 'Shopping at Store B',
        createdAt: '2026-09-10T10:00:00.000Z',
      },
    ];

    const spending = calculateCategorySpending(transactions, categories, budgets, '2026-09-01', '2026-09-30', true, accounts);

    expect(spending).toHaveLength(2);
    const neoBudget = spending.find((s) => s.accountId === 'acc_neo');
    const kromBudget = spending.find((s) => s.accountId === 'acc_krom');

    expect(neoBudget).toBeDefined();
    expect(neoBudget?.spent).toBe(2000000);
    expect(neoBudget?.budgetLimit).toBe(2500000);
    expect(neoBudget?.percentageOfBudget).toBe(80);
    expect(neoBudget?.accountName).toBe('Neo Bank');
    expect(neoBudget?.status).toBe('warning'); // 80% hits alert threshold

    expect(kromBudget).toBeDefined();
    expect(kromBudget?.spent).toBe(500000);
    expect(kromBudget?.budgetLimit).toBe(1000000);
    expect(kromBudget?.percentageOfBudget).toBe(50);
    expect(kromBudget?.accountName).toBe('Krom Bank');
    expect(kromBudget?.status).toBe('healthy');
  });

  it('retains configured category budgets with no spending for the period', () => {
    const today = new Date().toISOString().split('T')[0];
    const categories: Category[] = [
      { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f97316' },
      { id: 'cat_groceries', name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#10b981' },
    ];
    const budgets: Budget[] = [
      { id: 'b1', categoryId: 'cat_food', amount: 500, period: 'monthly', alertThreshold: 80 },
      { id: 'b2', categoryId: 'cat_groceries', amount: 300, period: 'monthly', alertThreshold: 80 },
    ];

    const spending = calculateCategorySpending([], categories, budgets, today, today, true);

    expect(spending).toHaveLength(2);
    expect(spending).toEqual(expect.arrayContaining([
      expect.objectContaining({ categoryId: 'cat_food', spent: 0, budgetLimit: 500 }),
      expect.objectContaining({ categoryId: 'cat_groceries', spent: 0, budgetLimit: 300 }),
    ]));
  });

  it('correctly calculates and isolates income/expenses per month (e.g. September vs October reset)', () => {
    const septemberRange = getMonthDateRange('2026-09');
    expect(septemberRange.startDate).toBe('2026-09-01');
    expect(septemberRange.endDate).toBe('2026-09-30');

    const octoberRange = getMonthDateRange('2026-10');
    expect(octoberRange.startDate).toBe('2026-10-01');
    expect(octoberRange.endDate).toBe('2026-10-31');

    const transactions: Transaction[] = [
      {
        id: 't_sep_1',
        type: 'expense',
        amount: 12000000,
        categoryId: 'cat_rent',
        accountId: 'acc1',
        date: '2026-09-15',
        merchant: 'September Expense',
        createdAt: '2026-09-15T10:00:00.000Z',
      },
      {
        id: 't_sep_2',
        type: 'income',
        amount: 20000000,
        categoryId: 'cat_salary',
        accountId: 'acc1',
        date: '2026-09-01',
        merchant: 'September Salary',
        createdAt: '2026-09-01T10:00:00.000Z',
      },
    ];

    // September summary
    const sepSummary = calculateMonthlySummary(transactions, septemberRange.startDate, septemberRange.endDate);
    expect(sepSummary.totalExpense).toBe(12000000);
    expect(sepSummary.totalIncome).toBe(20000000);
    expect(sepSummary.netSavings).toBe(8000000);

    // October summary (no October transactions yet -> resets to 0)
    const octSummary = calculateMonthlySummary(transactions, octoberRange.startDate, octoberRange.endDate);
    expect(octSummary.totalExpense).toBe(0);
    expect(octSummary.totalIncome).toBe(0);
    expect(octSummary.netSavings).toBe(0);
    expect(octSummary.transactionCount).toBe(0);
  });
});

describe('Account balance changes', () => {
  it('moves the balance between bank accounts and can reverse the transfer', () => {
    const accounts = [
      { id: 'bank_a', name: 'Bank A', type: 'bank' as const, balance: 500, currency: 'USD', color: '#000' },
      { id: 'bank_b', name: 'Bank B', type: 'bank' as const, balance: 100, currency: 'USD', color: '#000' },
    ];
    const transfer: Transaction = {
      id: 'transfer_1', type: 'transfer', amount: 125, categoryId: '', accountId: 'bank_a', toAccountId: 'bank_b',
      date: '2026-08-31', merchant: 'Move funds', createdAt: '2026-08-31T00:00:00.000Z',
    };

    const afterTransfer = applyAccountBalanceChanges(accounts, getAccountBalanceChanges(transfer));
    expect(afterTransfer.map((account) => account.balance)).toEqual([375, 225]);

    const afterDeletion = applyAccountBalanceChanges(afterTransfer, getAccountBalanceChanges(transfer, -1));
    expect(afterDeletion.map((account) => account.balance)).toEqual([500, 100]);
  });
});
