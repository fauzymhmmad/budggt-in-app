import React, { useState, useMemo } from 'react';
import { Plus, CalendarCheck } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionModal } from './SubscriptionModal';
import { Subscription } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

export const UpcomingCalendar: React.FC = () => {
  const { subscriptions, deleteSubscription, markSubscriptionPaid, settings } = useFinance();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);

  const { monthlyTotal, annualTotal } = useMemo(() => {
    let monthly = 0;
    subscriptions.forEach((sub) => {
      if (sub.status !== 'active') return;
      if (sub.billingCycle === 'weekly') monthly += (sub.amount * 52) / 12;
      else if (sub.billingCycle === 'monthly') monthly += sub.amount;
      else if (sub.billingCycle === 'quarterly') monthly += sub.amount / 3;
      else if (sub.billingCycle === 'yearly') monthly += sub.amount / 12;
    });
    return { monthlyTotal: monthly, annualTotal: monthly * 12 };
  }, [subscriptions]);

  const sortedSubs = useMemo(() => {
    return [...subscriptions].sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate));
  }, [subscriptions]);

  const handleOpenAdd = (sub?: Subscription) => {
    setSubscriptionToEdit(sub || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recurringHeader')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('recurringDesc')}</p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addSubscription')}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('monthlyRecurringCost')}
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(monthlyTotal, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{t('amortizedAcrossServices')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('projectedAnnualTotal')}
          </span>
          <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(annualTotal, settings.currency, settings.privacyMode)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{t('annualProjectionSubtitle')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('activeSubscriptions')}
          </span>
          <div className="text-xl font-bold font-mono text-emerald-500 mt-1">
            {subscriptions.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">{t('automatedTracking')}</div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {sortedSubs.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('noSubscriptionsAdded')}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">{t('noSubscriptionsDesc')}</p>
          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
          >
            {t('trackFirstSubscription')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSubs.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onEdit={() => handleOpenAdd(sub)}
              onDelete={() => {
                if (window.confirm(t('deleteItemConfirm', { name: sub.name }))) {
                  deleteSubscription(sub.id);
                }
              }}
              onMarkPaid={() => markSubscriptionPaid(sub.id)}
            />
          ))}
        </div>
      )}

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriptionToEdit={subscriptionToEdit}
      />
    </div>
  );
};
