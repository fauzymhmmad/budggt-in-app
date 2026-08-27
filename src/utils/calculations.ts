import { Budget, Category, FinancialInsight, SavingsGoal, Subscription, Transaction } from '../types/finance';

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage, e.g. 35.5
  transactionCount: number;
  dailyAverageExpense: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  spent: number;
  budgetLimit?: number;
  percentageOfTotal: number;
  percentageOfBudget?: number;
  status: 'healthy' | 'warning' | 'exceeded';
}

export function getCurrentMonthDateRange(startDay: number = 1): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, startDay);
  if (now.getDate() < startDay) {
    start.setMonth(start.getMonth() - 1);
  }

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter((tx) => tx.date >= startDate && tx.date <= endDate);
}

export function calculateMonthlySummary(
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
): MonthlySummary {
  const range = startDate && endDate ? { startDate, endDate } : getCurrentMonthDateRange();
  const monthlyTxs = filterTransactionsByDateRange(transactions, range.startDate, range.endDate);

  let totalIncome = 0;
  let totalExpense = 0;

  monthlyTxs.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const now = new Date();
  const currentDay = Math.max(1, now.getDate());
  const dailyAverageExpense = totalExpense / currentDay;

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    transactionCount: monthlyTxs.length,
    dailyAverageExpense,
  };
}

export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  startDate?: string,
  endDate?: string
): CategorySpending[] {
  const range = startDate && endDate ? { startDate, endDate } : getCurrentMonthDateRange();
  const monthlyTxs = filterTransactionsByDateRange(transactions, range.startDate, range.endDate);

  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const budgetMap = new Map<string, Budget>();
  budgets.forEach((bgt) => budgetMap.set(bgt.categoryId, bgt));

  const spentMap = new Map<string, number>();
  let totalExpenses = 0;

  monthlyTxs.forEach((tx) => {
    if (tx.type === 'expense') {
      const current = spentMap.get(tx.categoryId) || 0;
      spentMap.set(tx.categoryId, current + tx.amount);
      totalExpenses += tx.amount;
    }
  });

  const results: CategorySpending[] = [];

  spentMap.forEach((spent, categoryId) => {
    const cat = categoryMap.get(categoryId) || {
      id: categoryId,
      name: 'Uncategorized',
      type: 'expense',
      icon: 'Tag',
      color: '#94a3b8',
    };
    const budget = budgetMap.get(categoryId);
    const percentageOfTotal = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0;
    const percentageOfBudget = budget && budget.amount > 0 ? (spent / budget.amount) * 100 : undefined;

    let status: 'healthy' | 'warning' | 'exceeded' = 'healthy';
    if (percentageOfBudget !== undefined) {
      if (percentageOfBudget >= 100) {
        status = 'exceeded';
      } else if (percentageOfBudget >= (budget?.alertThreshold || 80)) {
        status = 'warning';
      }
    }

    results.push({
      categoryId,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      spent,
      budgetLimit: budget?.amount,
      percentageOfTotal,
      percentageOfBudget,
      status,
    });
  });

  // Sort by highest spent
  return results.sort((a, b) => b.spent - a.spent);
}

export function calculateCashflowTrends(
  transactions: Transaction[],
  days: number = 30
): { date: string; displayDate: string; income: number; expense: number; net: number }[] {
  const result: { date: string; displayDate: string; income: number; expense: number; net: number }[] = [];
  const now = new Date();

  // Create date buckets
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    result.push({ date: dateStr, displayDate, income: 0, expense: 0, net: 0 });
  }

  const dateMap = new Map<string, { income: number; expense: number }>();
  transactions.forEach((tx) => {
    const cur = dateMap.get(tx.date) || { income: 0, expense: 0 };
    if (tx.type === 'income') cur.income += tx.amount;
    if (tx.type === 'expense') cur.expense += tx.amount;
    dateMap.set(tx.date, cur);
  });

  result.forEach((item) => {
    const data = dateMap.get(item.date);
    if (data) {
      item.income = data.income;
      item.expense = data.expense;
      item.net = data.income - data.expense;
    }
  });

  return result;
}

export function calculateMonthlyRequiredForGoal(goal: SavingsGoal): number {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  if (remaining === 0) return 0;

  const now = new Date();
  const target = new Date(goal.targetDate + 'T00:00:00');
  const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());

  if (diffMonths <= 0) return remaining;
  return Math.ceil(remaining / diffMonths);
}

export function generateSmartAlerts(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  subscriptions: Subscription[],
  goals: SavingsGoal[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const spending = calculateCategorySpending(transactions, categories, budgets);
  const now = new Date();

  // 1. Budget warnings
  spending.forEach((cat) => {
    if (cat.status === 'exceeded' && cat.budgetLimit) {
      insights.push({
        id: `alert_budget_exceeded_${cat.categoryId}`,
        type: 'danger',
        title: `Budget Exceeded: ${cat.categoryName}`,
        message: `You've spent ${cat.percentageOfBudget?.toFixed(0)}% of your budget limit ($${cat.spent.toFixed(2)} / $${cat.budgetLimit.toFixed(2)}).`,
        actionText: 'Adjust Budget',
        actionTab: 'budgets',
        timestamp: new Date().toISOString(),
      });
    } else if (cat.status === 'warning' && cat.budgetLimit) {
      insights.push({
        id: `alert_budget_warn_${cat.categoryId}`,
        type: 'warning',
        title: `Approaching Budget Limit: ${cat.categoryName}`,
        message: `You've utilized ${cat.percentageOfBudget?.toFixed(0)}% of your monthly limit. $${(cat.budgetLimit - cat.spent).toFixed(2)} remaining.`,
        actionText: 'View Details',
        actionTab: 'budgets',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 2. Upcoming recurring subscriptions (within next 7 days)
  subscriptions.forEach((sub) => {
    if (sub.status !== 'active') return;
    const nextDate = new Date(sub.nextBillingDate + 'T00:00:00');
    const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 7) {
      insights.push({
        id: `alert_sub_${sub.id}`,
        type: 'info',
        title: `Upcoming Bill: ${sub.name}`,
        message: `Scheduled charge of $${sub.amount.toFixed(2)} is due in ${diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `${diffDays} days`} (${sub.nextBillingDate}).`,
        actionText: 'View Subscriptions',
        actionTab: 'subscriptions',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 3. Goal milestones
  goals.forEach((goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    if (progress >= 100) {
      insights.push({
        id: `alert_goal_${goal.id}`,
        type: 'success',
        title: `🎉 Goal Achieved: ${goal.name}!`,
        message: `Congratulations! You have reached 100% of your $${goal.targetAmount.toFixed(2)} target.`,
        actionText: 'View Goals',
        actionTab: 'goals',
        timestamp: new Date().toISOString(),
      });
    } else if (progress >= 80 && progress < 100) {
      insights.push({
        id: `alert_goal_near_${goal.id}`,
        type: 'info',
        title: `Almost There: ${goal.name}`,
        message: `You are at ${progress.toFixed(0)}% of your goal! Only $${(goal.targetAmount - goal.currentAmount).toFixed(2)} left to reach the finish line.`,
        actionText: 'Deposit Funds',
        actionTab: 'goals',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return insights;
}

// Financial Calculator Utilities

export interface CompoundInterestResult {
  totalBalance: number;
  totalPrincipal: number;
  totalInterest: number;
  yearlyBreakdown: {
    year: number;
    balance: number;
    totalDeposits: number;
    interestEarned: number;
  }[];
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualInterestRate: number, // percentage e.g. 7 for 7%
  years: number
): CompoundInterestResult {
  const r = annualInterestRate / 100 / 12; // monthly rate
  let currentBalance = principal;
  let totalDeposits = principal;
  const breakdown: CompoundInterestResult['yearlyBreakdown'] = [];

  for (let year = 1; year <= years; year++) {
    let yearStartBalance = currentBalance;
    for (let month = 1; month <= 12; month++) {
      currentBalance = (currentBalance + monthlyContribution) * (1 + r);
      totalDeposits += monthlyContribution;
    }
    const yearInterest = currentBalance - yearStartBalance - (monthlyContribution * 12);
    breakdown.push({
      year,
      balance: Math.round(currentBalance * 100) / 100,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      interestEarned: Math.round(yearInterest * 100) / 100,
    });
  }

  return {
    totalBalance: Math.round(currentBalance * 100) / 100,
    totalPrincipal: Math.round(totalDeposits * 100) / 100,
    totalInterest: Math.round((currentBalance - totalDeposits) * 100) / 100,
    yearlyBreakdown: breakdown,
  };
}

export interface Budget503020Result {
  needs: { amount: number; percentage: 50; description: string };
  wants: { amount: number; percentage: 30; description: string };
  savings: { amount: number; percentage: 20; description: string };
}

export function calculate503020Rule(netIncome: number): Budget503020Result {
  return {
    needs: {
      amount: netIncome * 0.5,
      percentage: 50,
      description: 'Rent, groceries, utilities, insurance, minimum debt',
    },
    wants: {
      amount: netIncome * 0.3,
      percentage: 30,
      description: 'Dining out, shopping, entertainment, hobbies, travel',
    },
    savings: {
      amount: netIncome * 0.2,
      percentage: 20,
      description: 'Emergency fund, investments, extra debt payoff, retirement',
    },
  };
}

export interface LoanPayoffResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  numberOfPayments: number;
}

export function calculateLoanPayoff(
  loanAmount: number,
  annualInterestRate: number, // percentage e.g. 5.5
  loanTermYears: number
): LoanPayoffResult {
  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    numberOfPayments,
  };
}
