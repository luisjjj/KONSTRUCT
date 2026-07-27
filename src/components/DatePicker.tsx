"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  label?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(dateStr: string) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

export default function DatePicker({ value, onChange, placeholder = "Select date", min, max, label }: DatePickerProps) {
  const parsed = parseDate(value);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && parsed) {
      setViewMonth(parsed.month);
      setViewYear(parsed.year);
    }
  }, [open, parsed]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;

  const isDisabled = (y: number, m: number, d: number) => {
    const dateNum = y * 10000 + m * 100 + d;
    if (minDate) {
      const minNum = minDate.year * 10000 + minDate.month * 100 + minDate.day;
      if (dateNum < minNum) return true;
    }
    if (maxDate) {
      const maxNum = maxDate.year * 10000 + maxDate.month * 100 + maxDate.day;
      if (dateNum > maxNum) return true;
    }
    return false;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const selectDate = (day: number) => {
    const dateStr = formatDate(viewYear, viewMonth, day);
    if (isDisabled(viewYear, viewMonth, day)) return;
    onChange(dateStr);
    setOpen(false);
  };

  const displayValue = parsed
    ? `${parsed.day} ${MONTHS[parsed.month].slice(0, 3)} ${parsed.year}`
    : "";

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-[14px] rounded-xl border transition-all text-left",
          open
            ? "border-slate-400 dark:border-slate-500 ring-2 ring-slate-100 dark:ring-slate-800"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
          "bg-white dark:bg-slate-900",
          value ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <span>{displayValue || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500 flex-shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <IconChevronRight size={16} className="text-slate-600 dark:text-slate-300 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-1"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-none focus:outline-none cursor-pointer appearance-none w-14"
              >
                {Array.from({ length: 20 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <IconChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const disabled = isDisabled(viewYear, viewMonth, day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  disabled={disabled}
                  className={cn(
                    "h-9 w-full text-[13px] font-medium rounded-lg transition-all flex items-center justify-center",
                    disabled && "text-slate-300 dark:text-slate-600 cursor-not-allowed",
                    !disabled && !isSelected && "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    isSelected && "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md",
                    isToday && !isSelected && "ring-1 ring-slate-900 dark:ring-slate-100 text-slate-900 dark:text-slate-100 font-bold"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { onChange(todayStr); setOpen(false); }}
              className="text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
