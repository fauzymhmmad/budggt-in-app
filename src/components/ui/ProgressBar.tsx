import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ProgressBarProps {
  value: number; // 0 to 100+
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  status?: 'healthy' | 'warning' | 'exceeded' | 'auto';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  size = 'md',
  showLabel = false,
  status = 'auto',
  className = '',
}) => {
  const { t } = useTranslation();
  const percentage = Math.max(0, Math.min(100, value));

  let barColor = color;
  if (!barColor) {
    if (status === 'exceeded' || (status === 'auto' && value >= 100)) {
      barColor = 'bg-rose-500';
    } else if (status === 'warning' || (status === 'auto' && value >= 80)) {
      barColor = 'bg-amber-500';
    } else {
      barColor = 'bg-emerald-500';
    }
  }

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-500 dark:text-slate-400">
          <span>{t('progress')}</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{value.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            color?.startsWith('#') ? '' : barColor
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color?.startsWith('#') ? color : undefined,
          }}
        />
      </div>
    </div>
  );
};
