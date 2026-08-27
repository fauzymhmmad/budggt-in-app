import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { generateSmartAlerts } from '../../utils/calculations';

export const SmartAlerts: React.FC = () => {
  const { transactions, categories, budgets, subscriptions, goals, setActiveTab } = useFinance();
  const { t } = useTranslation();

  const alerts = React.useMemo(() => {
    return generateSmartAlerts(transactions, categories, budgets, subscriptions, goals);
  }, [transactions, categories, budgets, subscriptions, goals]);

  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('allClearTitle')}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('allClearDesc')}</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('budgets')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1"
        >
          {t('checkLimits')} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {alerts.slice(0, 3).map((alert) => {
        const isDanger = alert.type === 'danger';
        const isWarning = alert.type === 'warning';
        const isSuccess = alert.type === 'success';

        return (
          <div
            key={alert.id}
            className={`p-3.5 rounded-2xl border flex items-start sm:items-center justify-between gap-3 backdrop-blur-md transition-all ${
              isDanger
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : isWarning
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-900 dark:text-cyan-200'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isDanger
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : isSuccess
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                }`}
              >
                {isDanger && <AlertCircle className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {alert.type === 'info' && <Calendar className="w-4 h-4" />}
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold">{alert.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5">{alert.message}</p>
              </div>
            </div>

            {alert.actionText && (
              <button
                onClick={() => alert.actionTab && setActiveTab(alert.actionTab)}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700 transition-all flex items-center gap-1"
              >
                <span>{alert.actionText}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
