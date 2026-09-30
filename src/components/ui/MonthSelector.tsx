import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getMonthDateRange } from '../../utils/calculations';

interface MonthSelectorProps {
  className?: string;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ className = '' }) => {
  const { selectedMonth, setSelectedMonth, settings } = useFinance();
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentYearMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const isCurrentMonth = selectedMonth === currentYearMonth;

  const [selectedYear, selectedMonthNum] = useMemo(() => {
    const [y, m] = (selectedMonth || currentYearMonth).split('-').map(Number);
    return [y, m];
  }, [selectedMonth, currentYearMonth]);

  const monthLabel = useMemo(() => {
    const date = new Date(selectedYear, selectedMonthNum - 1, 1);
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [selectedYear, selectedMonthNum, language]);

  const dateRangeLabel = useMemo(() => {
    const range = getMonthDateRange(selectedMonth, settings.startOfMonthDay);
    const [startY, startM, startD] = range.startDate.split('-').map(Number);
    const [endY, endM, endD] = range.endDate.split('-').map(Number);
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    const startDateObj = new Date(startY, startM - 1, startD);
    const endDateObj = new Date(endY, endM - 1, endD);

    const startFormatted = startDateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const endFormatted = endDateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

    return `${startFormatted} – ${endFormatted}`;
  }, [selectedMonth, settings.startOfMonthDay, language]);

  const handlePrevMonth = () => {
    let y = selectedYear;
    let m = selectedMonthNum - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let y = selectedYear;
    let m = selectedMonthNum + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleResetCurrent = () => {
    setSelectedMonth(currentYearMonth);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const availableYears = useMemo(() => {
    const now = new Date().getFullYear();
    const years: number[] = [];
    for (let i = now - 5; i <= now + 2; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const monthNames = useMemo(() => {
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2026, i, 1);
      return d.toLocaleDateString(locale, { month: 'short' });
    });
  }, [language]);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Month Navigator Bar */}
      <div className="flex items-center rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-1 transition-all">
        {/* Prev Month Button */}
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={t('previousMonth') || 'Previous month'}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Center Month Label / Trigger */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-expanded={isOpen}
          aria-label="Select month"
        >
          <Calendar className="w-4 h-4 text-emerald-500" />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-bold capitalize text-slate-900 dark:text-white tracking-tight">
              {monthLabel}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:block">
              {dateRangeLabel}
            </div>
          </div>
        </button>

        {/* Next Month Button */}
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={t('nextMonth') || 'Next month'}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick "This Month / Bulan Ini" Reset button when viewing other months */}
      {!isCurrentMonth && (
        <button
          onClick={handleResetCurrent}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all animate-fade-in"
          title={t('resetToCurrentMonth') || 'Back to this month'}
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">{t('thisMonth')}</span>
        </button>
      )}

      {/* Dropdown Month & Year Grid Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('selectedPeriod') || 'Select Period'}
            </span>
            <select
              value={selectedYear}
              onChange={(e) => {
                const newY = Number(e.target.value);
                setSelectedMonth(`${newY}-${String(selectedMonthNum).padStart(2, '0')}`);
              }}
              className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {monthNames.map((name, idx) => {
              const mNum = idx + 1;
              const isSelected = selectedMonthNum === mNum;
              const isCurrent =
                currentYearMonth === `${selectedYear}-${String(mNum).padStart(2, '0')}`;

              return (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedMonth(`${selectedYear}-${String(mNum).padStart(2, '0')}`);
                    setIsOpen(false);
                  }}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl capitalize transition-all relative ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {name}
                  {isCurrent && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleResetCurrent}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('thisMonth')}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
