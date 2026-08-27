import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CurrencyIcon } from '../ui/CurrencyIcon';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { useTranslation } from '../../hooks/useTranslation';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const GOAL_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#eab308', // Amber
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, settings } = useFinance();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Savings');

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetDate(goalToEdit.targetDate);
      setColor(goalToEdit.color || GOAL_COLORS[0]);
      setNotes(goalToEdit.notes || '');
      setCategory(goalToEdit.category || 'Savings');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Default target date to 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setColor(GOAL_COLORS[0]);
      setNotes('');
      setCategory('Savings');
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currentNum = parseFloat(currentAmount) || 0;

    if (isNaN(targetNum) || targetNum <= 0) {
      alert(t('validGoalAmount'));
      return;
    }

    if (!name.trim()) {
      alert(t('goalTitleRequired'));
      return;
    }

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        name: name.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate,
        color,
        notes: notes.trim() || undefined,
        category,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate,
        color,
        icon: 'Target',
        notes: notes.trim() || undefined,
        category,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? t('editSavingsGoal') : t('createSavingsGoal')}
      subtitle={t('goalModalSubtitle')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('goalTitle')}
          </label>
          <input
            type="text"
            required
            placeholder={t('goalNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            autoFocus
          />
        </div>

        {/* Target Amount and Initial/Current Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('targetGoal')} ({settings.currency})
            </label>
            <div className="relative">
              <CurrencyIcon currency={settings.currency} className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="number"
                step="any"
                required
                placeholder="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('currentlySaved')} ({settings.currency})
            </label>
            <div className="relative">
              <CurrencyIcon currency={settings.currency} className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="number"
                step="any"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* Target Date and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('targetCompletionDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('categoryTag')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="Safety">{t('categorySafety')}</option>
              <option value="Travel">{t('categoryTravel')}</option>
              <option value="Gear">{t('categoryGear')}</option>
              <option value="Investing">{t('categoryInvesting')}</option>
              <option value="Real Estate">{t('categoryRealEstate')}</option>
              <option value="Vehicle">{t('categoryVehicle')}</option>
              <option value="Other">{t('categoryOther')}</option>
            </select>
          </div>
        </div>

        {/* Color Accent Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            {t('colorTheme')}
          </label>
          <div className="flex items-center gap-2.5">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('goalNotes')}
          </label>
          <textarea
            rows={2}
            placeholder={t('goalNotesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {goalToEdit ? t('updateGoal') : t('createGoal')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
