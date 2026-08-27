import { Account, AppSettings, Budget, Category, SavingsGoal, Subscription, Transaction } from '../types/finance';

export interface FullBackupData {
  version: string;
  exportDate: string;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  settings: AppSettings;
}

export function exportToJSON(data: FullBackupData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `budggt-in_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[]
): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

  const headers = ['Date', 'Type', 'Amount', 'Category', 'Account', 'Merchant/Payee', 'Description', 'Tags', 'Recurring'];
  const rows = transactions.map((tx) => [
    `"${tx.date}"`,
    `"${tx.type}"`,
    tx.amount.toString(),
    `"${categoryMap.get(tx.categoryId) || 'Uncategorized'}"`,
    `"${accountMap.get(tx.accountId) || 'Unknown'}"`,
    `"${(tx.merchant || '').replace(/"/g, '""')}"`,
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    `"${(tx.tags || []).join(', ')}"`,
    tx.isRecurring ? 'Yes' : 'No',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `budggt-in_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function parseJSONBackup(file: File): Promise<FullBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (!data || !Array.isArray(data.transactions)) {
          throw new Error('Invalid JSON backup format: transactions array not found.');
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function parseCSVTransactions(file: File): Promise<Partial<Transaction>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          resolve([]);
          return;
        }

        // Simple CSV parser ignoring header
        const parsedTxs: Partial<Transaction>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            const date = cols[0] || new Date().toISOString().split('T')[0];
            const type = (cols[1]?.toLowerCase() === 'income' ? 'income' : cols[1]?.toLowerCase() === 'transfer' ? 'transfer' : 'expense') as Transaction['type'];
            const amount = parseFloat(cols[2]) || 0;
            const merchant = cols[5] || cols[3] || 'Imported Transaction';
            const description = cols[6] || '';

            if (amount > 0) {
              parsedTxs.push({
                date,
                type,
                amount,
                merchant,
                description,
              });
            }
          }
        }
        resolve(parsedTxs);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
}
