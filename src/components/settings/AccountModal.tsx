import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CurrencyIcon } from '../ui/CurrencyIcon';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types/finance';
import { SUPPORTED_CURRENCIES } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit: Account | null;
}

const ACCOUNT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4', '#eab308'];

const ACCOUNT_TYPE_KEYS: Record<AccountType, 'accountTypeCash' | 'accountTypeBank' | 'accountTypeCreditCard' | 'accountTypeSavings' | 'accountTypeCrypto' | 'accountTypeEWallet'> = {
  cash: 'accountTypeCash',
  bank: 'accountTypeBank',
  credit_card: 'accountTypeCreditCard',
  savings: 'accountTypeSavings',
  crypto: 'accountTypeCrypto',
  e_wallet: 'accountTypeEWallet',
};

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, accountToEdit }) => {
  const { settings, addAccount, updateAccount } = useFinance();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState(settings.currency);
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  useEffect(() => {
    if (!isOpen) return;

    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBalance(accountToEdit.balance.toString());
      setCurrency(accountToEdit.currency);
      setAccountNumber(accountToEdit.accountNumberMasked?.replace(/\D/g, '').slice(-4) || '');
      setColor(accountToEdit.color || ACCOUNT_COLORS[0]);
      return;
    }

    setName('');
    setType('bank');
    setBalance('0');
    setCurrency(settings.currency);
    setAccountNumber('');
    setColor(ACCOUNT_COLORS[0]);
  }, [accountToEdit, isOpen, settings.currency]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedBalance = Number(balance);

    if (!name.trim()) {
      alert(t('accountNameRequired'));
      return;
    }

    if (!Number.isFinite(parsedBalance)) {
      alert(t('validAccountBalance'));
      return;
    }

    const maskedNumber = accountNumber.trim() ? `•• ${accountNumber.replace(/\D/g, '').slice(-4)}` : undefined;
    const account = {
      name: name.trim(),
      type,
      balance: parsedBalance,
      currency,
      color,
      accountNumberMasked: maskedNumber,
    };

    if (accountToEdit) {
      updateAccount(accountToEdit.id, account);
    } else {
      addAccount(account);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? t('editAccount') : t('addAccount')}
      subtitle={t('accountsPaymentMethodsDesc')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('accountName')}</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('accountNamePlaceholder')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('accountType')}</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as AccountType)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {(Object.keys(ACCOUNT_TYPE_KEYS) as AccountType[]).map((option) => (
                <option key={option} value={option}>{t(ACCOUNT_TYPE_KEYS[option])}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('accountCurrency')}</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>{item.code} ({item.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('currentBalance')} ({currency})</label>
            <div className="relative">
              <CurrencyIcon currency={currency} className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="number"
                step="any"
                required
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('accountNumber')}</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ''))}
              placeholder={t('accountNumberPlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{t('colorAccent')}</label>
          <div className="flex items-center gap-2.5">
            {ACCOUNT_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setColor(item)}
                aria-label={t('colorAccent')}
                className={`w-7 h-7 rounded-full transition-transform ${color === item ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: item }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="primary" type="submit">{t('saveAccount')}</Button>
        </div>
      </form>
    </Modal>
  );
};
