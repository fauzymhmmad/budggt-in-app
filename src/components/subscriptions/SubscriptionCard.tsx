import React from 'react';
import { Calendar, Check, ExternalLink, Edit2, Trash2, Clock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Subscription } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SubscriptionCardProps {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  sub,
  onEdit,
  onDelete,
  onMarkPaid,
}) => {
  const { categories, accounts, settings } = useFinance();

  const category = categories.find((c) => c.id === sub.categoryId);
  const account = accounts.find((a) => a.id === sub.accountId);

  // Compute monthly equivalent
  let monthlyEquivalent = sub.amount;
  if (sub.billingCycle === 'weekly') monthlyEquivalent = (sub.amount * 52) / 12;
  else if (sub.billingCycle === 'quarterly') monthlyEquivalent = sub.amount / 3;
  else if (sub.billingCycle === 'yearly') monthlyEquivalent = sub.amount / 12;

  // Days remaining
  const now = new Date();
  const nextDate = new Date(sub.nextBillingDate + 'T00:00:00');
  const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays >= 0 && diffDays <= 3;

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: sub.color }}
            >
              {sub.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {sub.name}
                </h4>
                {sub.websiteUrl && (
                  <a
                    href={sub.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {category?.name || 'Subscription'} • {account?.name || 'Main Account'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pricing details */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(sub.amount, settings.currency, settings.privacyMode)}
              <span className="text-xs text-slate-400 font-sans font-normal ml-1">
                / {sub.billingCycle}
              </span>
            </div>
            {sub.billingCycle !== 'monthly' && (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                ~{formatCurrency(monthlyEquivalent, settings.currency, settings.privacyMode)}/mo
              </div>
            )}
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 ${
              isUrgent
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            {diffDays === 0
              ? 'Due Today'
              : diffDays === 1
              ? 'Due Tomorrow'
              : diffDays > 1
              ? `In ${diffDays} days`
              : 'Past Due'}
          </span>
        </div>
      </div>

      {/* Footer & Mark Paid */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(sub.nextBillingDate, settings.dateFormat)}</span>
        </div>

        <button
          onClick={onMarkPaid}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold active:scale-95 transition-all"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark Paid</span>
        </button>
      </div>
    </div>
  );
};
