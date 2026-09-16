import React, { useState } from 'react';
import { AppStore, DEFAULT_DASHBOARD_LAYOUT, PageId } from '../types';
import { exportAllDataXLSX, exportMonthlySummaryCSV, exportDailyExecutiveBriefing } from '../utils/exportUtils';
import { DashboardView } from './DashboardView';
import { RecordedLineEntriesSection } from './RecordedLineEntriesSection';
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Calendar,
  BarChart3,
  CheckCircle2,
  Users,
  Activity,
  Printer,
  Award,
  ArrowRight
} from 'lucide-react';

interface ReportsViewProps {
  store: AppStore;
  today: string;
  onNavigate: (page: PageId) => void;
  canDelete: boolean;
  onDeleteLineEntry: (id: number) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  store,
  today,
  onNavigate,
  canDelete,
  onDeleteLineEntry
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(today.slice(0, 7));

  // High-level plant statistics
  const totalLineEntries = store.lineEntries.length;
  const uniqueLines = Array.from(new Set(store.lineEntries.map(e => e.lineNo)));
  const avgEfficiency =
    totalLineEntries > 0
      ? Math.round(store.lineEntries.reduce((acc, e) => acc + (e.efficiency || 0), 0) / totalLineEntries)
      : 0;

  const totalCompletedChecklists = Object.values(store.checklists).filter((c: any) =>
    Array.isArray(c) && c.some((s: any) => s === 'yes')
  ).length;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Print / PDF
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Executive Reports &amp; Export Center
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate production audits, manpower tracking reports, and comprehensive Excel workbooks.
        </p>
      </div>

      <div className="mb-8">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Operational analytics</div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Production efficiency and line flow
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review long-term efficiency, order flow, WIP, and today’s production records in one place.
          </p>
        </div>
        <DashboardView
          store={store}
          today={today}
          uiDensity="normal"
          dashLayout={{ ...DEFAULT_DASHBOARD_LAYOUT, showAbsents: false, showBalancingGraph: false, showUpcoming: false }}
          onNavigate={onNavigate}
          reportsOnly
          canEdit={false}
        />
      </div>

      {/* Individual IE & Roles Monthly KPI Reports Spotlight */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 mb-8 text-white shadow-lg shadow-blue-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2.5">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>New Feature • Officer &amp; Role Evaluation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Individual IE &amp; Roles Monthly KPI Reports
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Monthly executive performance scorecards for each IE Officer, Executive, and Manager. Computes Line Efficiency Index, Balancing Quality, SOP Compliance %, Task Completion, and Kaizen contributions with 1-click printable PDF &amp; Excel report generation.
          </p>
        </div>
        <button
          onClick={() => onNavigate('kpi-reports')}
          className="bg-white hover:bg-blue-50 text-blue-700 font-black px-5 py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0"
        >
          <span>Open IE Monthly KPI Reports</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Entries</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{totalLineEntries}</div>
          <div className="text-xs text-slate-400 mt-0.5">Across all lines</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracked Lines</div>
          <div className="text-3xl font-black text-blue-600 mt-1">{uniqueLines.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Active sewing lines</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Efficiency</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{avgEfficiency}%</div>
          <div className="text-xs text-slate-400 mt-0.5">Historical average</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Days</div>
          <div className="text-3xl font-black text-indigo-600 mt-1">{totalCompletedChecklists}</div>
          <div className="text-xs text-slate-400 mt-0.5">Days with checklists</div>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Full Plant Multi-Tab XLSX */}
        <div className="bg-white rounded-3xl border border-blue-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Complete Master XLSX Workbook</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Export everything into a structured Microsoft Excel file with dedicated worksheets for:
            </p>
            <ul className="text-xs text-slate-600 mt-3 space-y-1.5 list-disc list-inside">
              <li>Line Data &amp; Efficiency Logs</li>
              <li>Manpower &amp; Absenteeism Balancing</li>
              <li>Bottleneck Cycle Times &amp; Takt Analysis</li>
              <li>Top 5 Daily Meeting Notes &amp; Action Items</li>
              <li>Daily Audit Checklists History</li>
            </ul>
          </div>

          <button
            onClick={() => exportAllDataXLSX(store)}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Master Excel (.xlsx)
          </button>
        </div>

        {/* Executive Daily Briefing CSV */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Executive Daily Briefing (Today)</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Clean management briefing CSV for <strong>{today}</strong>. Includes plant-level checklist compliance score, line-wise attendance, bottleneck status, and goal progress.
            </p>
          </div>

          <button
            onClick={() => exportDailyExecutiveBriefing(store, today)}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Daily Briefing CSV
          </button>
        </div>

        {/* Monthly Compliance Audit CSV */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Monthly IE Compliance CSV Export
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select month to generate daily breakdown of 12-task compliance and line counts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
              />
              <button
                onClick={() => exportMonthlySummaryCSV(store, selectedMonth)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <RecordedLineEntriesSection
        store={store}
        canDelete={canDelete}
        onDeleteLineEntry={onDeleteLineEntry}
      />
    </div>
  );
};
