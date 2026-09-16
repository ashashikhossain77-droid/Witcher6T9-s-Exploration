import React, { useState } from 'react';
import { AppStore, PageId } from '../types';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { exportMonthlySummaryCSV } from '../utils/exportUtils';

interface MonthlyViewProps {
  store: AppStore;
  today: string;
  onNavigate: (page: PageId) => void;
  onSelectDateForChecklist: (date: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  store,
  today,
  onNavigate,
  onSelectDateForChecklist
}) => {
  const [currentMonth, setCurrentMonth] = useState<string>(() => today.slice(0, 7)); // YYYY-MM

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr); // 1-based

  const prevMonth = () => {
    let y = year;
    let m = month - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setCurrentMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    let y = year;
    let m = month + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCurrentMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  // Days in current month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay(); // 0=Sun

  // Calculate stats for month
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  let totalYes = 0;
  let totalTasksChecked = 0;
  let daysWithRecords = 0;

  monthDates.forEach(date => {
    const chk = store.checklists[date];
    if (chk && chk.some(s => s !== null)) {
      daysWithRecords++;
      chk.forEach(s => {
        if (s === 'yes') totalYes++;
        if (s !== null) totalTasksChecked++;
      });
    }
  });

  const avgCompliance =
    daysWithRecords > 0 ? Math.round((totalYes / (daysWithRecords * 12)) * 100) : 0;

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Back to dashboard */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => exportMonthlySummaryCSV(store, currentMonth)}
          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 text-slate-700 hover:bg-blue-50 transition flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export {monthName} CSV
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Monthly Activity &amp; Audit Log</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          View past checklist completion rates, audit compliance, and jump directly to any day.
        </p>
      </div>

      {/* Month Selector & KPI Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {monthName}
            </div>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-100">
            <div className="pr-4 text-right sm:text-left">
              <div className="text-2xl font-black text-blue-700">{avgCompliance}%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Avg Compliance</div>
            </div>
            <div className="pl-4">
              <div className="text-2xl font-black text-slate-800">{daysWithRecords}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days Logged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs mb-8">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] rounded-2xl bg-slate-50/50 border border-transparent" />
          ))}

          {/* Actual days */}
          {monthDates.map((dateStr, i) => {
            const dayNum = i + 1;
            const chk = store.checklists[dateStr];
            const isToday = dateStr === today;
            const lineCount = store.lineEntries.filter(e => e.date === dateStr).length;

            const yesC = chk ? chk.filter(s => s === 'yes').length : 0;
            const pendingC = chk ? chk.filter(s => s === 'pending').length : 0;
            const noC = chk ? chk.filter(s => s === 'no').length : 0;
            const evaluated = yesC + pendingC + noC;
            const compliancePct = evaluated > 0 ? Math.round((yesC / 12) * 100) : null;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDateForChecklist(dateStr)}
                className={`min-h-[85px] rounded-2xl border p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:border-blue-400 hover:shadow-md ${
                  isToday
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-200'
                    : compliancePct !== null
                    ? compliancePct >= 80
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : compliancePct >= 50
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black rounded-lg px-1.5 py-0.5 ${
                      isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {compliancePct !== null && (
                    <span
                      className={`text-[10px] font-black ${
                        compliancePct >= 80
                          ? 'text-emerald-700'
                          : compliancePct >= 50
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {compliancePct}%
                    </span>
                  )}
                </div>

                <div className="text-[10px] space-y-0.5 mt-1">
                  {chk ? (
                    <div className="text-slate-500 font-medium">
                      <span className="text-emerald-600 font-bold">{yesC}✓</span>{' '}
                      <span className="text-amber-600 font-bold">{pendingC}⏳</span>{' '}
                      <span className="text-rose-600 font-bold">{noC}✗</span>
                    </div>
                  ) : (
                    <div className="text-slate-300 italic">No checklist</div>
                  )}

                  {lineCount > 0 && (
                    <div className="text-blue-600 font-bold text-[9px]">
                      {lineCount} lines
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
