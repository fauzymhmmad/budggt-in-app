import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface MonthData {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}

export const MonthOverMonth: React.FC = () => {
  const { transactions, settings } = useFinance();

  const monthsData: MonthData[] = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const now = new Date();

    // Create 6 monthly buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, { income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      const key = tx.date.substring(0, 7);
      if (map.has(key)) {
        const cur = map.get(key)!;
        if (tx.type === 'income') cur.income += tx.amount;
        if (tx.type === 'expense') cur.expense += tx.amount;
      }
    });

    const result: MonthData[] = [];
    map.forEach((val, key) => {
      const [y, m] = key.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const net = val.income - val.expense;
      const savingsRate = val.income > 0 ? (net / val.income) * 100 : 0;
      result.push({
        key,
        label,
        income: val.income,
        expense: val.expense,
        net,
        savingsRate,
      });
    });

    return result;
  }, [transactions]);

  const maxVal = useMemo(() => {
    return Math.max(...monthsData.map((m) => Math.max(m.income, m.expense)), 1000);
  }, [monthsData]);

  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Month-over-Month Comparison
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          6-month historical income, expenses & savings trajectory
        </p>
      </div>

      {/* Visual Comparative Bars */}
      <div className="pt-2 pb-4">
        <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end border-b border-slate-200 dark:border-slate-800 pb-2">
          {monthsData.map((m) => {
            const incomeHeight = Math.max(4, (m.income / maxVal) * 100);
            const expenseHeight = Math.max(4, (m.expense / maxVal) * 100);

            return (
              <div key={m.key} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-full">
                  {/* Income bar */}
                  <div
                    className="w-3 sm:w-5 bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${incomeHeight}%` }}
                    title={`Income: ${formatCurrency(m.income, settings.currency, settings.privacyMode)}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-3 sm:w-5 bg-rose-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${expenseHeight}%` }}
                    title={`Expense: ${formatCurrency(m.expense, settings.currency, settings.privacyMode)}`}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate text-center">
                  {m.label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
              <th className="py-2.5">Month</th>
              <th className="py-2.5 text-right">Income</th>
              <th className="py-2.5 text-right">Expenses</th>
              <th className="py-2.5 text-right">Net Savings</th>
              <th className="py-2.5 text-right">Savings Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {monthsData.map((m) => (
              <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{m.label}</td>
                <td className="py-2.5 text-right font-mono text-emerald-500 font-semibold">
                  +{formatCurrency(m.income, settings.currency, settings.privacyMode)}
                </td>
                <td className="py-2.5 text-right font-mono text-rose-500 font-semibold">
                  -{formatCurrency(m.expense, settings.currency, settings.privacyMode)}
                </td>
                <td
                  className={`py-2.5 text-right font-mono font-bold ${
                    m.net >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {m.net >= 0 ? '+' : ''}
                  {formatCurrency(m.net, settings.currency, settings.privacyMode)}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-purple-500">
                  {formatPercentage(m.savingsRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
