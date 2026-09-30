import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CurrencyIcon } from '../ui/CurrencyIcon';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types/finance';
import { useTranslation } from '../../hooks/useTranslation';

export interface BudgetEditTarget {
  id?: string;
  categoryId: string;
  accountId?: string;
  amount: number;
  alertThreshold?: number;
}

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToBudget?: Category | null;
  budgetToEdit?: BudgetEditTarget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categoryToBudget,
  budgetToEdit,
}) => {
  const { categories, accounts, budgets, setBudget, settings } = useFinance();
  const { t } = useTranslation();

  const [budgetId, setBudgetId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('all');
  const [amount, setAmount] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (!isOpen) return;

    if (budgetToEdit) {
      setBudgetId(budgetToEdit.id);
      setCategoryId(budgetToEdit.categoryId);
      setAccountId(budgetToEdit.accountId || 'all');
      setAmount(budgetToEdit.amount.toString());
      setAlertThreshold(budgetToEdit.alertThreshold || 80);
    } else if (categoryToBudget) {
      setBudgetId(undefined);
      setCategoryId(categoryToBudget.id);
      setAccountId('all');
      const existing = budgets.find(
        (b) => b.categoryId === categoryToBudget.id && !b.accountId
      );
      if (existing) {
        setBudgetId(existing.id);
        setAmount(existing.amount.toString());
        setAlertThreshold(existing.alertThreshold || 80);
      } else {
        setAmount('300000');
        setAlertThreshold(80);
      }
    } else {
      setBudgetId(undefined);
      const firstCat = expenseCategories[0];
      if (firstCat) {
        setCategoryId(firstCat.id);
        setAccountId('all');
        const existing = budgets.find((b) => b.categoryId === firstCat.id && !b.accountId);
        if (existing) {
          setBudgetId(existing.id);
          setAmount(existing.amount.toString());
          setAlertThreshold(existing.alertThreshold || 80);
        } else {
          setAmount('300000');
          setAlertThreshold(80);
        }
      }
    }
  }, [budgetToEdit, categoryToBudget, isOpen, budgets]);

  const handleCategoryOrAccountChange = (newCatId: string, newAccId: string) => {
    setCategoryId(newCatId);
    setAccountId(newAccId);
    const normalizedAcc = newAccId === 'all' ? undefined : newAccId;
    const existing = budgets.find(
      (b) => b.categoryId === newCatId && (b.accountId || undefined) === normalizedAcc
    );
    if (existing) {
      setBudgetId(existing.id);
      setAmount(existing.amount.toString());
      setAlertThreshold(existing.alertThreshold || 80);
    } else if (!budgetToEdit) {
      setBudgetId(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert(t('validBudgetAmount') || 'Please enter a valid budget amount');
      return;
    }

    setBudget(
      categoryId,
      num,
      alertThreshold,
      accountId === 'all' ? undefined : accountId,
      budgetId
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('setMonthlyBudget')}
      subtitle={t('budgetModalSubtitle')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('category')}
          </label>
          <select
            value={categoryId}
            onChange={(e) => handleCategoryOrAccountChange(e.target.value, accountId)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bank / Account Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('account') || 'Account'} / Bank
          </label>
          <div className="relative">
            <select
              value={accountId}
              onChange={(e) => handleCategoryOrAccountChange(categoryId, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="all">🌐 {t('allAccountsBudget') || 'Semua Akun (Gabungan)'}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  🏦 {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {accountId === 'all'
              ? (t('allAccountsBudgetDesc') || 'Anggaran ini akan menghitung pengeluaran kategori dari seluruh akun.')
              : (t('specificAccountBudgetDesc') || 'Anggaran ini hanya akan menghitung pengeluaran kategori yang dibayar melalui akun ini.')}
          </p>
        </div>

        {/* Monthly Limit Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('monthlySpendingLimit')} ({settings.currency})
          </label>
          <div className="relative">
            <CurrencyIcon currency={settings.currency} className="w-5 h-5 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="number"
              step="any"
              required
              placeholder={t('exampleAmount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              autoFocus
            />
          </div>
        </div>

        {/* Alert Threshold Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>{t('warningAlertTrigger')}</span>
            <span className="font-mono text-emerald-500 font-bold">{alertThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {t('alertThresholdDescription', { threshold: alertThreshold })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {t('saveBudget')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
