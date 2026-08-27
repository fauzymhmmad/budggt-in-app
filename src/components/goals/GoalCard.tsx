import React from 'react';
import { Target, Calendar, Plus, Edit2, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { calculateMonthlyRequiredForGoal } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
  onOpenDeposit: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onOpenDeposit,
}) => {
  const { settings } = useFinance();
  const { t } = useTranslation();

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isAchieved = progress >= 100;
  const monthlyRequired = calculateMonthlyRequiredForGoal(goal);

  // Days remaining
  const now = new Date();
  const target = new Date(goal.targetDate + 'T00:00:00');
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top Banner & Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: goal.color }}
            >
              {isAchieved ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {goal.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {goal.category || t('savings')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {diffDays > 0 ? `${diffDays} ${t('daysLeft')}` : diffDays === 0 ? t('dueToday') : t('pastDeadline')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t('editGoal')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t('deleteGoal')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress & Saved Numbers */}
        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('saved')} <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(goal.currentAmount, settings.currency, settings.privacyMode)}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-500">
              {formatPercentage(progress)}
            </span>
          </div>

          <ProgressBar
            value={progress}
            color={goal.color}
            size="md"
            status={isAchieved ? 'healthy' : 'auto'}
          />

          <div className="flex items-center justify-between text-xs pt-1 text-slate-500 dark:text-slate-400">
            <span>{t('target')}</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(goal.targetAmount, settings.currency, settings.privacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Quick Deposit Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {isAchieved ? (
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {t('targetMet')}
            </span>
          ) : (
            <div>
              <span>{t('needPerMonth')} </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(monthlyRequired, settings.currency, settings.privacyMode)}{t('perMonth')}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addFunds')}</span>
        </button>
      </div>
    </div>
  );
};
