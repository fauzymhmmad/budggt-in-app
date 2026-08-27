import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToBudget?: Category | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categoryToBudget,
}) => {
  const { categories, budgets, setBudget, settings } = useFinance();

  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (categoryToBudget) {
      setCategoryId(categoryToBudget.id);
      const existing = budgets.find((b) => b.categoryId === categoryToBudget.id);
      if (existing) {
        setAmount(existing.amount.toString());
        setAlertThreshold(existing.alertThreshold || 80);
      } else {
        setAmount('300');
        setAlertThreshold(80);
      }
    } else {
      const firstCat = expenseCategories[0];
      if (firstCat) {
        setCategoryId(firstCat.id);
        const existing = budgets.find((b) => b.categoryId === firstCat.id);
        setAmount(existing ? existing.amount.toString() : '300');
        setAlertThreshold(existing?.alertThreshold || 80);
      }
    }
  }, [categoryToBudget, isOpen, budgets]);

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const existing = budgets.find((b) => b.categoryId === newCatId);
    if (existing) {
      setAmount(existing.amount.toString());
      setAlertThreshold(existing.alertThreshold || 80);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid positive budget amount.');
      return;
    }

    setBudget(categoryId, num, alertThreshold);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Category Monthly Budget"
      subtitle="Define a spending target to prevent overspending"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Limit Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Monthly Spending Limit ({settings.currency})
          </label>
          <div className="relative">
            <DollarSign className="w-5 h-5 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 500"
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
            <span>Warning Alert Trigger</span>
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
            You'll receive a warning alert banner once this category reaches {alertThreshold}% of its limit.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};
