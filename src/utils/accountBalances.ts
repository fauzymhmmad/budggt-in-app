import { Account, Transaction } from '../types/finance';

/**
 * Returns the account balance movements caused by a transaction. A negative
 * value means money leaves the account; a positive value means it arrives.
 */
export function getAccountBalanceChanges(transaction: Transaction, multiplier = 1): Map<string, number> {
  const changes = new Map<string, number>();
  const amount = transaction.amount * multiplier;
  const addChange = (accountId: string | undefined, change: number) => {
    if (!accountId || change === 0) return;
    changes.set(accountId, (changes.get(accountId) || 0) + change);
  };

  if (transaction.type === 'income') addChange(transaction.accountId, amount);
  if (transaction.type === 'expense') addChange(transaction.accountId, -amount);
  if (transaction.type === 'transfer') {
    addChange(transaction.accountId, -amount);
    addChange(transaction.toAccountId, amount);
  }

  return changes;
}

export function applyAccountBalanceChanges(
  accounts: Account[],
  ...changes: Map<string, number>[]
): Account[] {
  const combinedChanges = new Map<string, number>();
  changes.forEach((changeSet) => changeSet.forEach((change, accountId) => {
    combinedChanges.set(accountId, (combinedChanges.get(accountId) || 0) + change);
  }));

  return accounts.map((account) => {
    const change = combinedChanges.get(account.id);
    return change ? { ...account, balance: account.balance + change } : account;
  });
}
