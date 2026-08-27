import React, { useState } from 'react';
import { DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface GoalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const GoalDepositModal: React.FC<GoalDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { accounts, depositToGoal, withdrawFromGoal, settings } = useFinance();

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (mode === 'deposit') {
      const willComplete = goal.currentAmount + num >= goal.targetAmount;
      depositToGoal(goal.id, num, accountId);

      if (willComplete) {
        // Fire celebration confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      if (num > goal.currentAmount) {
        alert('Cannot withdraw more than current saved amount.');
        return;
      }
      withdrawFromGoal(goal.id, num, accountId);
    }

    setAmount('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'deposit' ? 'Add Funds to' : 'Withdraw from'} ${goal.name}`}
      subtitle={`Target: ${formatCurrency(goal.targetAmount, settings.currency, settings.privacyMode)} | Saved: ${formatCurrency(goal.currentAmount, settings.currency, settings.privacyMode)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'deposit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('withdraw')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'withdraw'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Amount ({settings.currency})
          </label>
          <div className="relative">
            <DollarSign className="w-5 h-5 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              autoFocus
            />
          </div>
        </div>

        {/* Account to link */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {mode === 'deposit' ? 'Transfer From Account' : 'Transfer To Account'}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatCurrency(acc.balance, settings.currency, settings.privacyMode)})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
