import React from 'react';
import { AppStore, DashboardLayoutSettings, PageId, UiDensity, LineEntry, AutoUpdateSettings } from '../types';
import { exportSingleLineCSV } from '../utils/exportUtils';
import { EfficiencyTrendBadge } from './EfficiencyTrendBadge';
import { OutputGoalProgressBar } from './OutputGoalProgressBar';
import { LineEfficiencyTrendChart } from './LineEfficiencyTrendChart';
import { getLineEfficiencyTrend } from '../utils/kpiTrends';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ClipboardList,
  Layers,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Activity,
  Package,
  TrendingUp,
  RefreshCw,
  Zap,
  ListTodo
} from 'lucide-react';

interface DashboardViewProps {
  store: AppStore;
  today: string;
  uiDensity: UiDensity;
  dashLayout: DashboardLayoutSettings;
  onNavigate: (page: PageId) => void;
  reportsOnly?: boolean;
  hideReportSections?: boolean;
  canEdit: boolean;
  autoUpdate?: AutoUpdateSettings;
  onToggleAutoUpdate?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: Date;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  store,
  today,
  uiDensity,
  dashLayout,
  onNavigate,
  reportsOnly = false,
  hideReportSections = false,
  autoUpdate,
  onToggleAutoUpdate,
  onManualSync,
  isSyncing = false,
  lastSyncTime
}) => {
  const safeDashLayout: DashboardLayoutSettings = {
    showHero: true,
    showStats: true,
    showQuickActions: true,
    showAbsents: true,
    showBalancingGraph: true,
    showIO: true,
    showUpcoming: true,
    ...(dashLayout || {})
  };

  const todayChecklist = store.checklists[today] || [];
  const yesCount = todayChecklist.filter(s => s === 'yes').length;
  const pendingCount = todayChecklist.filter(s => s === 'pending').length;
  const noCount = todayChecklist.filter(s => s === 'no').length;
  const decidedCount = yesCount + pendingCount + noCount;
  const todayCompliance = decidedCount === 0 ? 0 : Math.round((yesCount / 12) * 100);

  const showReminder = store.profile.notifications.dailyReminder && (decidedCount < 12 || pendingCount > 0);
  const remainingCount = 12 - yesCount;

  // Active shift & operational timeframe calculation
  const shiftInfo = React.useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutesOfDay = hours * 60 + minutes;

    let shiftName = 'Shift A (Morning)';
    let shiftStart = 6 * 60; // 06:00
    let shiftEnd = 14 * 60;  // 14:00

    if (totalMinutesOfDay >= 14 * 60 && totalMinutesOfDay < 22 * 60) {
      shiftName = 'Shift B (Evening)';
      shiftStart = 14 * 60;
      shiftEnd = 22 * 60;
    } else if (totalMinutesOfDay >= 22 * 60 || totalMinutesOfDay < 6 * 60) {
      shiftName = 'Shift C (Night)';
      shiftStart = 22 * 60;
      shiftEnd = (24 + 6) * 60;
    }

    let elapsedMinutes = totalMinutesOfDay - shiftStart;
    if (elapsedMinutes < 0) elapsedMinutes += 24 * 60;
    const elapsedH = Math.floor(elapsedMinutes / 60);
    const elapsedM = elapsedMinutes % 60;

    return {
      name: shiftName,
      elapsedStr: `${elapsedH}h ${elapsedM}m elapsed`
    };
  }, []);

  // Filter line entries for today
  const todayEntries = store.lineEntries.filter(e => e.date === today);

  // Group line-wise absents and balancing
  interface FloorGroup {
    name: string;
    lines: {
      lineNo: string;
      floor: string;
      opAbsent: number;
      hlpAbsent: number;
      imAbsent: number;
      present: number;
      absent: number;
      balancingPct: number;
      balanced: boolean;
    }[];
    totalAbsent: number;
    totalPresent: number;
    balancingPct: number;
  }

  const absentByFloor: FloorGroup[] = React.useMemo(() => {
    const byLine: Record<string, FloorGroup['lines'][0]> = {};
    todayEntries.forEach(e => {
      const op = e.mp?.Operator || { present: 0, absent: 0 };
      const hlp = e.mp?.Helper || { present: 0, absent: 0 };
      const im = e.mp?.['Iron Man'] || { present: 0, absent: 0 };
      const present = (op.present || 0) + (hlp.present || 0) + (im.present || 0);
      const absent = (op.absent || 0) + (hlp.absent || 0) + (im.absent || 0);
      const headcount = present + absent;
      const balancingPct = headcount ? Math.round((present / headcount) * 100) : 100;

      byLine[e.lineNo] = {
        lineNo: e.lineNo,
        floor: e.floor || 'Floor 01 / Unit A',
        opAbsent: op.absent || 0,
        hlpAbsent: hlp.absent || 0,
        imAbsent: im.absent || 0,
        present,
        absent,
        balancingPct,
        balanced: Boolean(e.balanceMethod && e.balanceMethod.trim())
      };
    });

    const floors: Record<string, { lines: FloorGroup['lines']; totalAbsent: number; totalPresent: number }> = {};
    Object.values(byLine).forEach(line => {
      let fname = line.floor || 'General Floor';
      const m = fname.match(/Floor\s*0?(\d+)/i);
      if (m) fname = `Floor ${m[1].padStart(2, '0')}`;
      if (!floors[fname]) floors[fname] = { lines: [], totalAbsent: 0, totalPresent: 0 };
      floors[fname].lines.push(line);
      floors[fname].totalAbsent += line.absent;
      floors[fname].totalPresent += line.present;
    });

    return Object.entries(floors).map(([name, data]) => {
      const hc = data.totalPresent + data.totalAbsent;
      return {
        name,
        lines: data.lines.sort((a, b) => a.lineNo.localeCompare(b.lineNo, undefined, { numeric: true })),
        totalAbsent: data.totalAbsent,
        totalPresent: data.totalPresent,
        balancingPct: hc ? Math.round((data.totalPresent / hc) * 100) : 100
      };
    });
  }, [todayEntries]);

  const absentSummary = React.useMemo(() => {
    let totalAbsent = 0;
    let totalPresent = 0;
    let linesWithAbsent = 0;
    let linesBalanced = 0;
    absentByFloor.forEach(f => {
      totalAbsent += f.totalAbsent;
      totalPresent += f.totalPresent;
      f.lines.forEach(l => {
        if (l.absent > 0) {
          linesWithAbsent++;
          if (l.balanced) linesBalanced++;
        } else if (l.balanced) {
          linesBalanced++;
        }
      });
    });
    const hc = totalPresent + totalAbsent;
    return {
      totalAbsent,
      totalPresent,
      balancingPct: hc ? Math.round((totalPresent / hc) * 100) : 100,
      linesBalanced,
      linesWithAbsent: Math.max(linesWithAbsent, linesBalanced)
    };
  }, [absentByFloor]);

  // Balancing Graph status rows
  const balancingGraphRows = React.useMemo(() => {
    const map: Record<string, { lineNo: string; day1: boolean; day2: boolean; day4: boolean; complete: boolean }> = {};
    todayEntries.forEach(e => {
      const s = e.balancingGraph || 'pending';
      map[e.lineNo] = {
        lineNo: e.lineNo,
        day1: s === 'day1' || s === 'day2' || s === 'day4' || s === 'complete',
        day2: s === 'day2' || s === 'day4' || s === 'complete',
        day4: s === 'day4' || s === 'complete',
        complete: s === 'complete'
      };
    });
    return Object.values(map).sort((a, b) => a.lineNo.localeCompare(b.lineNo, undefined, { numeric: true }));
  }, [todayEntries]);

  // Order / Input / Output / Target / WIP summary by line
  const ioByLine = React.useMemo(() => {
    const map: Record<
      string,
      {
        lineNo: string;
        buyer: string;
        style: string;
        orderQty: number;
        input: number;
        output: number;
        target: number;
        wip: number;
        efficiency: number;
        targetEff: number;
        trend: ReturnType<typeof getLineEfficiencyTrend>;
      }
    > = {};
    todayEntries.forEach(e => {
      const trend = getLineEfficiencyTrend(store.lineEntries, e.lineNo, e.date);
      map[e.lineNo] = {
        lineNo: e.lineNo,
        buyer: e.buyer || '',
        style: e.style || '',
        orderQty: Number(e.orderQty) || 0,
        input: Number(e.dailyInput) || 0,
        output: Number(e.dailyOutput) || Number(e.achievedProd) || 0,
        target: Number(e.targetProd) || 0,
        wip: Number(e.wip) || 0,
        efficiency: Number(e.efficiency) || 0,
        targetEff: Number(e.targetEff) || 80,
        trend
      };
    });
    return Object.values(map).sort((a, b) => a.lineNo.localeCompare(b.lineNo, undefined, { numeric: true }));
  }, [todayEntries, store.lineEntries]);

  const ioSummary = React.useMemo(() => {
    return ioByLine.reduce(
      (acc, r) => {
        acc.orderQty += r.orderQty;
        acc.input += r.input;
        acc.output += r.output;
        acc.target += r.target;
        acc.wip += r.wip;
        return acc;
      },
      { orderQty: 0, input: 0, output: 0, target: 0, wip: 0 }
    );
  }, [ioByLine]);

  // Upcoming styles radar (within 10 days)
  const upcomingStyles = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const items: { lineNo: string; nextStyle: string; nextStyleDate: string; daysLeft: number }[] = [];
    const byLine: Record<string, LineEntry> = {};
    store.lineEntries
      .filter(e => e.nextStyleDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(e => {
        byLine[`${e.lineNo}|${e.nextStyleDate}`] = e;
      });

    Object.values(byLine).forEach(e => {
      const d = new Date(e.nextStyleDate + 'T12:00:00');
      const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft >= -1 && daysLeft <= 10) {
        items.push({
          lineNo: e.lineNo,
          nextStyle: e.nextStyle,
          nextStyleDate: e.nextStyleDate,
          daysLeft
        });
      }
    });
    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [store.lineEntries]);

  const formatDateDisplay = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`max-w-6xl mx-auto ${uiDensity === 'compact' ? 'p-4' : 'p-6 sm:p-8'}`}>
      {/* Top Welcome Title */}
      {!reportsOnly && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${uiDensity === 'compact' ? 'mb-4' : 'mb-6'}`}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {formatDateDisplay(today)} • Operational Control
          </div>
          <h1 className={`font-extrabold text-slate-900 tracking-tight ${uiDensity === 'compact' ? 'text-2xl' : 'text-3xl'}`}>
            Industrial Engineering Daily Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {store.profile.jobTitle || 'IE Management'} {store.profile.name ? `• ${store.profile.name}` : ''}
          </p>
        </div>
        </div>
      )}

      {/* Live Operational Status & Auto-Update Bar */}
      {!reportsOnly && (
        <div className="animate-tile-in mb-5 rounded-2xl bg-white border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              {autoUpdate?.enabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoUpdate?.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className="whitespace-nowrap">
              {autoUpdate?.enabled ? `Auto-Update: ${autoUpdate.intervalSeconds}s Sync` : 'Auto-Update: Paused'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-800">{shiftInfo.name}</span>
            <span className="text-slate-400">•</span>
            <span className="whitespace-nowrap">{shiftInfo.elapsedStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {autoUpdate?.simulateFloorFeed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200/70 whitespace-nowrap">
              <Zap className="w-3 h-3 text-cyan-600" />
              Floor Flow Active
            </span>
          )}

          <div className="text-[11px] text-slate-400 font-medium mr-1 whitespace-nowrap">
            Last synced: {lastSyncTime ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
          </div>

          {onManualSync && (
            <button
              onClick={onManualSync}
              title="Force Immediate Data Sync"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Sync Now</span>
            </button>
          )}

          {onToggleAutoUpdate && (
            <button
              onClick={onToggleAutoUpdate}
              title={autoUpdate?.enabled ? 'Pause background auto-updates' : 'Enable background auto-updates'}
              className={`text-xs font-bold px-3 py-1 rounded-xl border transition ${
                autoUpdate?.enabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {autoUpdate?.enabled ? 'Active' : 'Resume'}
            </button>
          )}
        </div>
        </div>
      )}

      {/* Reminder Banner */}
      {!reportsOnly && showReminder && (
        <div className="animate-tile-in tile-delay-1 mb-5 rounded-2xl bg-amber-50 border border-amber-200/80 px-4 py-3 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-amber-900">Daily Checklist Attention Required</div>
            <div className="text-xs text-amber-800 mt-0.5">
              {remainingCount} of 12 standard IE tasks still pending or unverified for today.
            </div>
          </div>
          <button
            onClick={() => onNavigate('checklist')}
            className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-xl shrink-0 shadow-2xs transition"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Compliance Hero Card */}
      {!reportsOnly && safeDashLayout.showHero && (
        <div
          className={`animate-tile-in tile-delay-1 relative overflow-hidden rounded-3xl text-white shadow-xl ${
            uiDensity === 'compact' ? 'p-5 mb-5' : 'p-7 mb-7'
          }`}
          style={{ background: 'linear-gradient(135deg, #042C53 0%, #0C447C 45%, #185FA5 100%)' }}
        >
          {/* Subtle Ambient Shapes */}
          <div
            className="absolute -right-8 -top-8 w-44 h-44 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #FAC775 0%, transparent 70%)' }}
          />

          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(250,199,117,0.2)', color: '#FAC775' }}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                Today's IE Protocol Compliance
              </div>
              <div className="text-sm font-medium text-blue-100">Overall Standard Completion</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  key={todayCompliance}
                  className={`animate-metric-pop font-black tabular-nums tracking-tight ${uiDensity === 'compact' ? 'text-5xl' : 'text-6xl'}`}
                >
                  {todayCompliance}
                </span>
                <span className="text-3xl font-bold text-amber-200">%</span>
              </div>
              <div className="text-sm text-blue-200 mt-2 font-medium">
                {yesCount} Completed • {pendingCount} Pending • {noCount} Marked No
              </div>

              {/* Mini Progress Bar */}
              <div className="mt-4 h-2 w-56 max-w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(todayCompliance, 100)}%`,
                    background: 'linear-gradient(90deg, #FAC775, #F0997B)'
                  }}
                />
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 drop-shadow-md">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#FAC775"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeDasharray={`${todayCompliance * 0.973} 100`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    key={todayCompliance}
                    className="animate-metric-pop text-base font-extrabold text-amber-200 tabular-nums leading-none"
                  >
                    {todayCompliance}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-blue-200 mt-0.5">Score</span>
                </div>
              </div>

              <div className="hidden sm:block text-xs text-blue-100 border-l border-white/20 pl-4 space-y-1">
                <div><span className="font-bold text-white">12</span> Standard Tasks</div>
                <div><span className="font-bold text-amber-300">{decidedCount}</span> Evaluated</div>
                <div><span className="font-bold text-amber-200">{12 - decidedCount}</span> Unmarked</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Status Tiles */}
      {!reportsOnly && safeDashLayout.showStats && (
        <div
          className={`grid grid-cols-3 ${uiDensity === 'compact' ? 'gap-3 mb-5' : 'gap-4 mb-7'}`}
        >
          <div
            className="animate-tile-in tile-delay-1 relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl" />
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Done</span>
            </div>
            <div
              key={yesCount}
              className="animate-metric-pop text-3xl font-black text-slate-900 tabular-nums leading-none"
            >
              {yesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">of 12 IE tasks</div>
          </div>

          <div
            className="animate-tile-in tile-delay-2 relative overflow-hidden rounded-2xl border border-amber-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-l-2xl" />
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending</span>
            </div>
            <div
              key={pendingCount}
              className="animate-metric-pop text-3xl font-black text-slate-900 tabular-nums leading-none"
            >
              {pendingCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">in review / progress</div>
          </div>

          <div
            className="animate-tile-in tile-delay-3 relative overflow-hidden rounded-2xl border border-rose-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-l-2xl" />
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Not Done</span>
            </div>
            <div
              key={noCount}
              className="animate-metric-pop text-3xl font-black text-slate-900 tabular-nums leading-none"
            >
              {noCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">marked non-compliant</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!reportsOnly && safeDashLayout.showQuickActions && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-500">Core Modules &amp; Roles</div>
            <button
              onClick={() => onNavigate('todo-schedule')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>Role Manager &amp; Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('todo-schedule')}
              className="animate-tile-in flex items-center gap-3.5 rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 p-4 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 text-left group ring-1 ring-blue-100"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <ListTodo className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>To-Do &amp; Schedule</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                    {(store.todos || []).length}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Manager &amp; Officer roles delegation</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigate('checklist')}
              className="animate-tile-in tile-delay-1 flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm">Daily IE Checklist</div>
                <div className="text-xs text-slate-500 mt-0.5">12 daily tasks • Yes / Pending / No</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigate('linedata')}
              className="animate-tile-in tile-delay-2 flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm">Line Data Collection</div>
                <div className="text-xs text-slate-500 mt-0.5">Capture production, SMV &amp; absents</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigate('monthly')}
              className="animate-tile-in tile-delay-3 flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm">Monthly Tracking</div>
                <div className="text-xs text-slate-500 mt-0.5">Historical calendar &amp; compliance</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      )}

      {/* Production Efficiency Long-Term Trends Chart */}
      {!hideReportSections && (
        <LineEfficiencyTrendChart
          lineEntries={store.lineEntries}
          targetEfficiency={80}
        />
      )}

      {/* Line-wise Absents & Balancing % */}
      {!reportsOnly && safeDashLayout.showAbsents && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Line-wise Absents &amp; Balancing Status
              </h2>
              <p className="text-xs text-slate-500">Live floor headcount and balancing coverage for today</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 w-fit">
              {todayEntries.length} Active Lines Logged Today
            </span>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="animate-tile-in tile-delay-1 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Absent</div>
              <div
                key={absentSummary.totalAbsent}
                className="animate-metric-pop text-2xl font-black text-rose-600 mt-0.5"
              >
                {absentSummary.totalAbsent}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Operators, helpers, iron man</div>
            </div>

            <div className="animate-tile-in tile-delay-2 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Present</div>
              <div
                key={absentSummary.totalPresent}
                className="animate-metric-pop text-2xl font-black text-emerald-600 mt-0.5"
              >
                {absentSummary.totalPresent}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">On-line headcount</div>
            </div>

            <div className="animate-tile-in tile-delay-3 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manpower Present %</div>
              <div
                key={absentSummary.balancingPct}
                className="animate-metric-pop text-2xl font-black text-blue-600 mt-0.5"
              >
                {absentSummary.balancingPct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Floor attendance rate</div>
            </div>

            <div className="animate-tile-in tile-delay-4 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lines Balanced</div>
              <div
                key={`${absentSummary.linesBalanced}-${absentSummary.linesWithAbsent}`}
                className="animate-metric-pop text-2xl font-black text-slate-900 mt-0.5"
              >
                {absentSummary.linesBalanced} / {absentSummary.linesWithAbsent || todayEntries.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">With documented action</div>
            </div>
          </div>

          {absentByFloor.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm shadow-2xs">
              No manpower records captured yet today. Add line entries with manpower numbers.
            </div>
          ) : (
            <div className="space-y-4">
              {absentByFloor.map(floor => (
                <div key={floor.name} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                    <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      {floor.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Absent <span className="font-bold text-rose-600">{floor.totalAbsent}</span> • Present{' '}
                      <span className="font-bold text-emerald-600">{floor.totalPresent}</span> • Attendance{' '}
                      <span className="font-bold text-blue-700">{floor.balancingPct}%</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {floor.lines.map(line => (
                      <div key={line.lineNo} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-800 text-xs">
                            L{line.lineNo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">Line {line.lineNo}</span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  line.balanced
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {line.balanced ? 'Balanced' : 'Open / Unbalanced'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                              <span>
                                Op Absent: <strong className="text-slate-800">{line.opAbsent}</strong>
                              </span>
                              <span>
                                Helper Absent: <strong className="text-slate-800">{line.hlpAbsent}</strong>
                              </span>
                              <span>
                                Iron Man Absent: <strong className="text-slate-800">{line.imAbsent}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-sm font-black ${
                              line.balancingPct >= 90
                                ? 'text-emerald-600'
                                : line.balancingPct >= 75
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {line.balancingPct}%
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {line.present} Present / {line.absent + line.present} Total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Line Balancing Graph Status Matrix */}
      {!reportsOnly && safeDashLayout.showBalancingGraph && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Line Balancing Graph Status
              </h2>
              <p className="text-xs text-slate-500">
                1st day output • 2nd day compl • 4th day balancing graph lifecycle
              </p>
            </div>
          </div>

          {balancingGraphRows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
              No line balancing records for today
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Line</th>
                    <th className="py-3 px-3 text-center">Day 1 (1st Output)</th>
                    <th className="py-3 px-3 text-center">Day 2 (Complete)</th>
                    <th className="py-3 px-3 text-center">Day 4 Graph</th>
                    <th className="py-3 px-3 text-center">Fully Complete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balancingGraphRows.map(row => (
                    <tr key={row.lineNo} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">Line {row.lineNo}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            row.day1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          {row.day1 ? '✓' : '–'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            row.day2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          {row.day2 ? '✓' : '–'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            row.day4 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          {row.day4 ? '✓' : '–'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            row.complete ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          {row.complete ? '✓' : '–'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Order • Input / Output • WIP Matrix */}
      {!hideReportSections && safeDashLayout.showIO && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                Order • Input / Output • WIP Flow
              </h2>
              <p className="text-xs text-slate-500">Cut input pcs, daily output, and in-line WIP</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="animate-tile-in tile-delay-1 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Order Qty</div>
              <div
                key={ioSummary.orderQty}
                className="animate-metric-pop text-xl font-black text-slate-900 mt-0.5"
              >
                {ioSummary.orderQty.toLocaleString()}
              </div>
            </div>

            <div className="animate-tile-in tile-delay-2 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Input Pcs</div>
              <div
                key={ioSummary.input}
                className="animate-metric-pop text-xl font-black text-blue-600 mt-0.5"
              >
                {ioSummary.input.toLocaleString()}
              </div>
            </div>

            <div className="animate-tile-in tile-delay-3 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Output Pcs</div>
              <div
                key={ioSummary.output}
                className="animate-metric-pop text-xl font-black text-emerald-600 mt-0.5"
              >
                {ioSummary.output.toLocaleString()}
              </div>
            </div>

            <div className="animate-tile-in tile-delay-4 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:-translate-y-0.5 transition-all duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Line WIP</div>
              <div
                key={ioSummary.wip}
                className="animate-metric-pop text-xl font-black text-amber-600 mt-0.5"
              >
                {ioSummary.wip.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Visual Goal Attainment Summary Grid */}
          {ioByLine.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Daily Output Goal Attainment (Achieved vs Target)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time production line goal completion and efficiency trend
                  </p>
                </div>
                {ioSummary.target > 0 && (
                  <div className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 self-start sm:self-auto">
                    Plant Attainment:{' '}
                    <span className="text-blue-700 font-black">
                      {Math.round((ioSummary.output / ioSummary.target) * 100)}%
                    </span>{' '}
                    <span className="text-slate-400 font-normal">
                      ({ioSummary.output.toLocaleString()} / {ioSummary.target.toLocaleString()} pcs)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ioByLine.map(row => (
                  <div
                    key={row.lineNo}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition shadow-2xs flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-black text-xs">
                            L{row.lineNo}
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[130px]">
                            {row.buyer || 'Line ' + row.lineNo}
                          </span>
                        </div>
                        {row.style && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5">
                            {row.style}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs font-black text-slate-800">{row.efficiency}%</span>
                          <EfficiencyTrendBadge
                            current={row.efficiency}
                            previous={row.trend.prevEff}
                            delta={row.trend.delta}
                            direction={row.trend.direction}
                            size="xs"
                            showIconOnly
                          />
                        </div>
                        <div className="text-[9px] text-slate-400">Eff Rate</div>
                      </div>
                    </div>

                    <OutputGoalProgressBar
                      achieved={row.output}
                      target={row.target}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {ioByLine.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Line</th>
                    <th className="py-3 px-3 text-right">Order Qty</th>
                    <th className="py-3 px-3 text-right">Daily Input</th>
                    <th className="py-3 px-3 text-right">Daily Output</th>
                    <th className="py-3 px-3 text-right">Target</th>
                    <th className="py-3 px-3 min-w-[180px]">Goal Attainment (Output vs Target)</th>
                    <th className="py-3 px-3 text-center">Efficiency Trend</th>
                    <th className="py-3 px-3 text-right">In-Line WIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ioByLine.map(row => (
                    <tr key={row.lineNo} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>Line {row.lineNo}</div>
                        {row.style && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">
                            {row.style}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">{row.orderQty.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-medium text-blue-700">{row.input.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">{row.output.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-500">{row.target.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <OutputGoalProgressBar
                          compact
                          achieved={row.output}
                          target={row.target}
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-xs text-slate-700">{row.efficiency}%</span>
                          <EfficiencyTrendBadge
                            current={row.efficiency}
                            previous={row.trend.prevEff}
                            delta={row.trend.delta}
                            direction={row.trend.direction}
                            size="xs"
                          />
                        </div>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          row.wip > 300 ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {row.wip.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Styles Radar (within 10 days) */}
      {!reportsOnly && safeDashLayout.showUpcoming && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Upcoming Styles (Next 10 Days)
              </h2>
              <p className="text-xs text-slate-500">Pre-production &amp; input date submission alerts</p>
            </div>
          </div>

          {upcomingStyles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
              No styles scheduled for input within the next 10 days.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {upcomingStyles.map((s, idx) => {
                const isUrgent = s.daysLeft <= 3;
                const isMedium = s.daysLeft <= 7;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 shadow-2xs transition ${
                      isUrgent
                        ? 'border-rose-200 bg-rose-50/40'
                        : isMedium
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-500">Line {s.lineNo}</div>
                        <div className="font-bold text-slate-900 text-sm truncate mt-0.5">{s.nextStyle}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Input Date: <strong>{formatDateDisplay(s.nextStyleDate)}</strong>
                        </div>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase shrink-0 ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isMedium
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {s.daysLeft <= 0 ? 'DUE NOW' : `${s.daysLeft}d left`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Today's Line Entries with Quick Track Exports */}
      {!hideReportSections && <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Line Production Records</h2>
            <p className="text-xs text-slate-500">Efficiency, target attainment, and individual track downloads</p>
          </div>
          <button
            onClick={() => onNavigate('linedata')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            Open Line Data Collection →
          </button>
        </div>

        {todayEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No line data recorded for today yet.
          </div>
        ) : (
          <div className="space-y-4">
            {todayEntries.map(entry => {
              const trend = getLineEfficiencyTrend(store.lineEntries, entry.lineNo, entry.date);
              const outputVal = Number(entry.achievedProd) || Number(entry.dailyOutput) || 0;
              const targetVal = Number(entry.targetProd) || 0;

              return (
                <div key={entry.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-xs">
                          Line {entry.lineNo}
                        </span>
                        <span className="font-bold text-slate-900 text-base">
                          {entry.buyer} • {entry.style}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {entry.floor} • SMV: <strong>{entry.smv}</strong> • Hours: <strong>{entry.workingHours}h</strong>
                        {entry.lineIE?.name && (
                          <span> • IE: {entry.lineIE.name} ({entry.lineIE.level.replace('_', ' ')})</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <div
                          className={`text-2xl font-black ${
                            entry.efficiency >= 85
                              ? 'text-emerald-600'
                              : entry.efficiency >= 70
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {entry.efficiency}%
                        </div>
                        <EfficiencyTrendBadge
                          current={entry.efficiency}
                          previous={trend.prevEff}
                          delta={trend.delta}
                          direction={trend.direction}
                          size="sm"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {trend.prevEff !== null ? `vs yesterday (${trend.prevEff}%)` : 'Efficiency Rate'}
                      </div>
                    </div>
                  </div>

                  {/* Goal attainment progress bar */}
                  <OutputGoalProgressBar
                    achieved={outputVal}
                    target={targetVal}
                    className="mt-3.5 pt-3 border-t border-slate-100"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-2 text-xs">
                    <div>
                      <span className="text-slate-400">Target Output:</span>{' '}
                      <strong className="text-slate-800">{entry.targetProd} pcs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Achieved Output:</span>{' '}
                      <strong className="text-slate-800">{entry.achievedProd} pcs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Daily Input:</span>{' '}
                      <strong className="text-slate-800">{entry.dailyInput || 0} pcs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">In-Line WIP:</span>{' '}
                      <strong className="text-slate-800">{entry.wip || 0} pcs</strong>
                    </div>
                  </div>

                  {entry.remarks && (
                    <div className="mt-3 text-xs bg-slate-50 rounded-xl px-3 py-2 text-slate-600 italic">
                      Note: {entry.remarks}
                    </div>
                  )}

                  {/* Individual track downloads */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Export Track:
                    </span>
                    <button
                      onClick={() => exportSingleLineCSV(entry, 'manpower')}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Manpower CSV
                    </button>
                    <button
                      onClick={() => exportSingleLineCSV(entry, 'production')}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Production I/O CSV
                    </button>
                    <button
                      onClick={() => exportSingleLineCSV(entry, 'bottleneck')}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Bottleneck CSV
                    </button>
                    <button
                      onClick={() => exportSingleLineCSV(entry, 'top5')}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Top 5 Meeting CSV
                    </button>
                    <button
                      onClick={() => exportSingleLineCSV(entry, 'full')}
                      className="text-[11px] font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                    >
                      Full Dossier CSV
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>}
    </div>
  );
};
