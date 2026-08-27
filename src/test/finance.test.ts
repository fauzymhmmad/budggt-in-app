import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatCompactNumber } from '../utils/formatters';
import {
  calculateMonthlySummary,
  calculate503020Rule,
  calculateCompoundInterest,
  calculateLoanPayoff,
  calculateCategorySpending,
} from '../utils/calculations';
import { Transaction, Category, Budget } from '../types/finance';

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

    const summary = calculateMonthlySummary(transactions);
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

    const spending = calculateCategorySpending(transactions, categories, budgets);
    expect(spending.length).toBe(1);
    expect(spending[0].spent).toBe(450);
    expect(spending[0].percentageOfBudget).toBe(90);
    expect(spending[0].status).toBe('warning'); // 90% is above 80% threshold
  });
});
