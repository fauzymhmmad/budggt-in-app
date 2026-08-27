import React, { useState, useMemo } from 'react';
import { Plus, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';
import { GoalDepositModal } from './GoalDepositModal';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const GoalsView: React.FC = () => {
  const { goals, deleteGoal, settings } = useFinance();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  const { totalTarget, totalSaved, totalRemaining, overallProgress } = useMemo(() => {
    const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const saved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const remaining = Math.max(0, target - saved);
    const progress = target > 0 ? (saved / target) * 100 : 0;
    return { totalTarget: target, totalSaved: saved, totalRemaining: remaining, overallProgress: progress };
  }, [goals]);

  const handleOpenAdd = (goal?: SavingsGoal) => {
    setGoalToEdit(goal || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('savingsGoalsHeader')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('goalsDescription')}</p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createNewGoal')}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('totalTargetAcrossGoals')}
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalTarget, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {goals.length} {t('acrossMilestones')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('totalAccumulatedSavings')}
          </span>
          <div className="text-xl font-bold font-mono text-emerald-500 mt-1">
            {formatCurrency(totalSaved, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{t('progress')}</span>
            <span className="font-mono font-semibold text-emerald-500">
              {formatPercentage(overallProgress)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('remainingToSave')}
          </span>
          <div className="text-xl font-bold font-mono text-purple-500 mt-1">
            {formatCurrency(totalRemaining, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{t('distanceToTargets')}</div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-8">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('noGoalsSet')}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">{t('noGoalsDesc')}</p>
          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
          >
            {t('createFirstGoal')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleOpenAdd(goal)}
              onDelete={() => {
                if (window.confirm(t('deleteItemConfirm', { name: goal.name }))) {
                  deleteGoal(goal.id);
                }
              }}
              onOpenDeposit={() => setDepositGoal(goal)}
            />
          ))}
        </div>
      )}

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} goalToEdit={goalToEdit} />
      <GoalDepositModal isOpen={!!depositGoal} onClose={() => setDepositGoal(null)} goal={depositGoal} />
    </div>
  );
};
