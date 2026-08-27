import React, { useState, useEffect } from 'react';
import { Calendar, Globe } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CurrencyIcon } from '../ui/CurrencyIcon';
import { useFinance } from '../../context/FinanceContext';
import { BillingCycle, Subscription } from '../../types/finance';
import { useTranslation } from '../../hooks/useTranslation';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: Subscription | null;
}

const SUB_COLORS = ['#6366f1', '#ef4444', '#10b981', '#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6'];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscriptionToEdit,
}) => {
  const { categories, accounts, addSubscription, updateSubscription, settings } = useFinance();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [color, setColor] = useState(SUB_COLORS[0]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setAmount(subscriptionToEdit.amount.toString());
      setBillingCycle(subscriptionToEdit.billingCycle);
      setNextBillingDate(subscriptionToEdit.nextBillingDate);
      setCategoryId(subscriptionToEdit.categoryId);
      setAccountId(subscriptionToEdit.accountId);
      setWebsiteUrl(subscriptionToEdit.websiteUrl || '');
      setColor(subscriptionToEdit.color || SUB_COLORS[0]);
    } else {
      setName('');
      setAmount('');
      setBillingCycle('monthly');
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setNextBillingDate(d.toISOString().split('T')[0]);
      setCategoryId(expenseCategories.find((c) => c.name.toLowerCase().includes('entertainment'))?.id || expenseCategories[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setWebsiteUrl('');
      setColor(SUB_COLORS[0]);
    }
  }, [subscriptionToEdit, isOpen, categories, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert(t('validBillingAmount'));
      return;
    }

    if (!name.trim()) {
      alert(t('subscriptionNameRequired'));
      return;
    }

    if (subscriptionToEdit) {
      updateSubscription(subscriptionToEdit.id, {
        name: name.trim(),
        amount: num,
        billingCycle,
        nextBillingDate,
        categoryId,
        accountId,
        websiteUrl: websiteUrl.trim() || undefined,
        color,
      });
    } else {
      addSubscription({
        name: name.trim(),
        amount: num,
        billingCycle,
        nextBillingDate,
        categoryId,
        accountId,
        status: 'active',
        websiteUrl: websiteUrl.trim() || undefined,
        color,
        reminderDaysBefore: 2,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subscriptionToEdit ? t('editSubscription') : t('trackNewSubscription')}
      subtitle={t('subscriptionModalSubtitle')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('serviceBillName')}
          </label>
          <input
            type="text"
            required
            placeholder={t('subscriptionNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            autoFocus
          />
        </div>

        {/* Amount and Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('billingAmount')} ({settings.currency})
            </label>
            <div className="relative">
              <CurrencyIcon currency={settings.currency} className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="number"
                step="any"
                required
                placeholder={t('amountExample')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('billingCycle')}
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="weekly">{t('weekly')}</option>
              <option value="monthly">{t('monthly')}</option>
              <option value="quarterly">{t('quarterlyThreeMonths')}</option>
              <option value="yearly">{t('yearlyAnnual')}</option>
            </select>
          </div>
        </div>

        {/* Next Date & Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('nextRenewalDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('paymentAccount')}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('category')}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('websitePortalLink')}
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder={t('websitePlaceholder')}
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Color Accent Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            {t('colorAccent')}
          </label>
          <div className="flex items-center gap-2.5">
            {SUB_COLORS.map((c) => (
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {subscriptionToEdit ? t('saveChanges') : t('addSubscription')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
