import React, { useState, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Tag,
  Repeat,
  FileText,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CurrencyIcon } from '../ui/CurrencyIcon';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { useTranslation } from '../../hooks/useTranslation';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { categories, accounts, addTransaction, updateTransaction, settings } = useFinance();
  const { t } = useTranslation();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategoryId(transactionToEdit.categoryId);
      setAccountId(transactionToEdit.accountId);
      setToAccountId(transactionToEdit.toAccountId || '');
      setDate(transactionToEdit.date);
      setMerchant(transactionToEdit.merchant);
      setDescription(transactionToEdit.description || '');
      setTags((transactionToEdit.tags || []).join(', '));
      setIsRecurring(!!transactionToEdit.isRecurring);
    } else {
      setType('expense');
      setAmount('');
      setCategoryId(categories.find((c) => c.type === 'expense')?.id || categories[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setToAccountId(accounts[1]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setMerchant('');
      setDescription('');
      setTags('');
      setIsRecurring(false);
    }
  }, [transactionToEdit, isOpen, categories, accounts]);

  // Update default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const match = categories.find((c) => c.type === newType);
      if (match) setCategoryId(match.id);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert(t('validTransactionAmount'));
      return;
    }

    if (!merchant.trim()) {
      alert(t('merchantRequired'));
      return;
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, {
        type,
        amount: numAmount,
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        merchant: merchant.trim(),
        description: description.trim() || undefined,
        tags: parsedTags,
        isRecurring,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        merchant: merchant.trim(),
        description: description.trim() || undefined,
        tags: parsedTags,
        isRecurring,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? t('editTransaction') : t('recordNewTransaction')}
      subtitle={t('transactionSubtitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t('expense')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{t('income')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              type === 'transfer'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t('transfer')}</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('amount')} ({settings.currency})
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono font-bold text-lg">
              <CurrencyIcon currency={settings.currency} className="w-5 h-5 text-emerald-500" />
            </div>
            <input
              type="number"
              step="any"
              required
              placeholder={t('amountPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              autoFocus
            />
          </div>
        </div>

        {/* Merchant / Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('merchantTitle')}
          </label>
          <input
            type="text"
            required
            placeholder={t('merchantPlaceholder')}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Date and Category / To Account in 2-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('date')}
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {type !== 'transfer' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('category')}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('transferToAccount')}
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Account selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {type === 'transfer' ? t('fromAccount') : t('account')}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        {/* Tags & Recurring */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('tagsPlaceholder')}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('tagsExample')}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="relative flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-emerald-500" />
                {t('recurringTransaction')}
              </span>
            </label>
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('notesMemo')}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t('notesPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Modal footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {transactionToEdit ? t('saveChanges') : t('addTransaction')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
