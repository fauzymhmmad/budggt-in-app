import { CurrencyConfig } from '../types/finance';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ',' },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimalPlaces: 0, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: '\'', decimalSeparator: '.' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalPlaces: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ',' },
];

export function getCurrencyConfig(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  privacyMode: boolean = false
): string {
  if (privacyMode) {
    return '••••••';
  }

  const config = getCurrencyConfig(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNum = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  });

  const formattedWithCustomSeparators = formattedNum
    .replace(/,/g, 'TEMP_THOUSAND')
    .replace(/\./g, config.decimalSeparator)
    .replace(/TEMP_THOUSAND/g, config.thousandSeparator);

  const signed = isNegative ? '-' : '';

  if (config.symbolPosition === 'before') {
    const space = config.symbol.length >= 2 ? ' ' : '';
    return `${signed}${config.symbol}${space}${formattedWithCustomSeparators}`;
  } else {
    return `${signed}${formattedWithCustomSeparators} ${config.symbol}`;
  }
}

export function formatCompactNumber(amount: number, currencyCode: string = 'USD', privacyMode: boolean = false): string {
  if (privacyMode) return '••••';
  const config = getCurrencyConfig(currencyCode);
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  let valueStr = '';

  if (abs >= 1_000_000_000) {
    valueStr = (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (abs >= 1_000_000) {
    valueStr = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (abs >= 1_000) {
    valueStr = (abs / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    valueStr = abs.toFixed(config.decimalPlaces);
  }

  const signed = isNegative ? '-' : '';
  return config.symbolPosition === 'before'
    ? `${signed}${config.symbol}${valueStr}`
    : `${signed}${valueStr} ${config.symbol}`;
}

export function formatDate(dateString: string, format: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
    default:
      return dateString;
  }
}

export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const targetDate = new Date(dateString + 'T00:00:00');
  const todayDate = new Date(todayStr + 'T00:00:00');

  const diffTime = todayDate.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < -1 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;

  // Format month and day
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatPercentage(value: number, includeSign: boolean = false): string {
  const formatted = Math.abs(value).toFixed(1).replace(/\.0$/, '') + '%';
  if (includeSign && value > 0) return `+${formatted}`;
  if (includeSign && value < 0) return `-${formatted}`;
  return formatted;
}
