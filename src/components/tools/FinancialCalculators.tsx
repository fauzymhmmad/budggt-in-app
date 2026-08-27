import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { CurrencyIcon } from '../ui/CurrencyIcon';
import {
  calculate503020Rule,
  calculateCompoundInterest,
  calculateLoanPayoff,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export const FinancialCalculators: React.FC = () => {
  const { settings } = useFinance();
  const { t } = useTranslation();
  const [activeCalculator, setActiveCalculator] = useState<'503020' | 'compound' | 'loan'>('503020');

  // 50/30/20 State
  const [monthlyIncome503020, setMonthlyIncome503020] = useState<number>(4500);
  const budget503020 = useMemo(() => calculate503020Rule(monthlyIncome503020), [monthlyIncome503020]);

  // Compound Interest State
  const [principal, setPrincipal] = useState<number>(5000);
  const [monthlyAdd, setMonthlyAdd] = useState<number>(400);
  const [rate, setRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);

  const compoundResult = useMemo(
    () => calculateCompoundInterest(principal, monthlyAdd, rate, years),
    [principal, monthlyAdd, rate, years]
  );

  // Loan State
  const [loanAmount, setLoanAmount] = useState<number>(25000);
  const [loanRate, setLoanRate] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(5);

  const loanResult = useMemo(
    () => calculateLoanPayoff(loanAmount, loanRate, loanYears),
    [loanAmount, loanRate, loanYears]
  );

  const calcTabs: { id: '503020' | 'compound' | 'loan'; label: string }[] = [
    { id: '503020', label: t('tab503020') },
    { id: 'compound', label: t('tabCompound') },
    { id: 'loan', label: t('tabLoan') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('calcHeader')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('calcSub')}</p>
      </div>

      {/* Calculator Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl w-fit">
        {calcTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCalculator(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCalculator === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 50/30/20 CALCULATOR */}
      {activeCalculator === '503020' && (
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('afterTaxIncome')} ({settings.currency})
            </label>
            <div className="relative">
              <CurrencyIcon currency={settings.currency} className="w-5 h-5 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="number"
                step="50"
                value={monthlyIncome503020}
                onChange={(e) => setMonthlyIncome503020(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold text-sm">
                <span>{t('essentialNeeds')}</span>
                <span className="font-mono">50%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {formatCurrency(budget503020.needs.amount, settings.currency, settings.privacyMode)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {budget503020.needs.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold text-sm">
                <span>{t('flexibleWants')}</span>
                <span className="font-mono">30%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {formatCurrency(budget503020.wants.amount, settings.currency, settings.privacyMode)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {budget503020.wants.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <span>{t('savingsAndWealth')}</span>
                <span className="font-mono">20%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {formatCurrency(budget503020.savings.amount, settings.currency, settings.privacyMode)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {budget503020.savings.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPOUND INTEREST CALCULATOR */}
      {activeCalculator === 'compound' && (
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('initialPrincipal')} ({settings.currency})
              </label>
              <input
                type="number"
                step="500"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('monthlyAdd')} ({settings.currency})
              </label>
              <input
                type="number"
                step="50"
                value={monthlyAdd}
                onChange={(e) => setMonthlyAdd(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('roiRate')}
              </label>
              <input
                type="number"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('investmentYears')}
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t('totalFutureValue')}
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(compoundResult.totalBalance, settings.currency, settings.privacyMode)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('totalPrincipalInvested')}
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatCurrency(compoundResult.totalPrincipal, settings.currency, settings.privacyMode)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {t('compoundInterestEarned')}
              </span>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                +{formatCurrency(compoundResult.totalInterest, settings.currency, settings.privacyMode)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LOAN CALCULATOR */}
      {activeCalculator === 'loan' && (
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('loanAmount')} ({settings.currency})
              </label>
              <input
                type="number"
                step="1000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('loanApr')}
              </label>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('loanTermYears')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={loanYears}
                onChange={(e) => setLoanYears(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                {t('monthlyRepayment')}
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                {formatCurrency(loanResult.monthlyPayment, settings.currency, settings.privacyMode)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('totalPayment')} ({loanResult.numberOfPayments} mo.)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatCurrency(loanResult.totalPayment, settings.currency, settings.privacyMode)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {t('totalInterestCost')}
              </span>
              <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(loanResult.totalInterest, settings.currency, settings.privacyMode)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
