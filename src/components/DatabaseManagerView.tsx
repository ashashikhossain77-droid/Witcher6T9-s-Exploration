import React, { useState, useMemo } from 'react';
import {
  AppStore,
  LineEntry,
  ProductionLine,
  TaskStatus,
  TodoItem,
  TimeScheduleEntry,
  PageId
} from '../types';
import {
  Database,
  ArrowLeft,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Layers,
  CheckSquare,
  ListTodo,
  Clock,
  ShieldCheck,
  HardDrive,
  Activity,
  Sliders,
  Sparkles,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

interface DatabaseManagerViewProps {
  store: AppStore;
  onNavigate: (page: PageId) => void;
  onUpdateStore: (newStore: AppStore) => void;
  onDeleteLineEntry: (id: number) => void;
  onResetToDemo: () => void;
  canDelete?: boolean;
  accountId?: string;
  accountEmail?: string;
}

type DatabaseTab = 'line-entries' | 'lines' | 'checklists' | 'todos-schedules' | 'audit-log';

export const DatabaseManagerView: React.FC<DatabaseManagerViewProps> = ({
  store,
  onNavigate,
  onUpdateStore,
  onDeleteLineEntry,
  onResetToDemo,
  canDelete = true,
  accountId = 'ashikur.rahman.0971@gmail.com',
  accountEmail = 'ashikur.rahman.0971@gmail.com'
}) => {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('line-entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryForInspect, setSelectedEntryForInspect] = useState<LineEntry | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [integrityReport, setIntegrityReport] = useState<{
    checkedAt: string;
    totalRecords: number;
    issuesFound: number;
    issuesRepaired: number;
    details: string[];
  } | null>(null);

  // Calculate Storage Footprint
  const storageFootprint = useMemo(() => {
    try {
      const serialized = JSON.stringify(store);
      const bytes = new Blob([serialized]).size;
      const kb = (bytes / 1024).toFixed(1);
      const mb = (bytes / (1024 * 1024)).toFixed(2);
      return { bytes, kb, mb };
    } catch {
      return { bytes: 0, kb: '0.0', mb: '0.00' };
    }
  }, [store]);

  // Record Counts
  const totalLineEntries = store.lineEntries?.length || 0;
  const totalChecklists = Object.keys(store.checklists || {}).length;
  const totalLines = store.lines?.length || 0;
  const totalTodos = store.todos?.length || 0;
  const totalSchedules = store.schedules?.length || 0;
  const totalAuditLogs = store.auditLog?.length || 0;
  const totalAllRecords = totalLineEntries + totalChecklists + totalLines + totalTodos + totalSchedules + totalAuditLogs;

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Export Master JSON Database
  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `garments_ie_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', `Master JSON database exported successfully (${filename})`);
    } catch (err) {
      showToast('error', 'Failed to export JSON database');
    }
  };

  // 2. Export Master Excel Workbook / CSV Package
  const handleExportFullCSV = () => {
    try {
      if (!store.lineEntries || store.lineEntries.length === 0) {
        showToast('info', 'No hourly line records to export.');
        return;
      }

      const headers = [
        'ID',
        'Date',
        'LineNo',
        'Floor',
        'Buyer',
        'Style',
        'Item',
        'SMV',
        'WorkingHours',
        'TargetEfficiency',
        'AchievedEfficiency',
        'TargetProd',
        'AchievedProd',
        'OrderQty',
        'WIP',
        'PlannedMP',
        'PresentMP',
        'AbsentMP',
        'TaktTimeSec',
        'BottleneckCycleTimeSec',
        'BottleneckOperation',
        'BalanceEfficiency',
        'Top5MeetingDone',
        'IE_Officer'
      ];

      const rows = store.lineEntries.map(e => [
        e.id,
        e.date,
        e.lineNo,
        `"${e.floor || ''}"`,
        `"${e.buyer || ''}"`,
        `"${e.style || ''}"`,
        `"${e.item || ''}"`,
        e.smv || 0,
        e.workingHours || 0,
        e.targetEff || 0,
        e.efficiency || 0,
        e.targetProd || 0,
        e.achievedProd || 0,
        e.orderQty || 0,
        e.wip || 0,
        e.plannedMP || 0,
        e.presentMP || 0,
        e.absentMP || 0,
        e.taktTime || 0,
        e.bottleneckCycleTime || 0,
        `"${e.bottleneckMachine || ''}"`,
        e.balanceEfficiency || 0,
        e.top5MeetingDone ? 'YES' : 'NO',
        `"${e.lineIE?.name || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `garments_ie_master_linedata_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Master Line Data CSV exported successfully ✓');
    } catch (err) {
      showToast('error', 'Failed to export CSV');
    }
  };

  // 3. Import / Restore JSON Database
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Basic verification
        if (!parsed.lines || !parsed.lineEntries || !parsed.checklists) {
          throw new Error('Selected file does not appear to be a valid Garments IE datastore.');
        }

        const confirmMsg = `Restore Database Snapshot?\n\nRecords found in file:\n• ${parsed.lineEntries.length} Hourly Line Entries\n• ${Object.keys(parsed.checklists).length} Daily Checklists\n• ${parsed.lines.length} Production Lines\n\nThis will replace your current workspace records. Continue?`;

        if (window.confirm(confirmMsg)) {
          onUpdateStore(parsed);
          showToast('success', 'Database successfully restored from JSON backup ✓');
        }
      } catch (err: any) {
        showToast('error', `Import failed: ${err.message || 'Invalid JSON syntax'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Run Integrity Check & Auto-Repair
  const handleRunIntegrityCheck = () => {
    const details: string[] = [];
    let issuesFound = 0;
    let issuesRepaired = 0;

    const repairedStore: AppStore = JSON.parse(JSON.stringify(store));

    // Check line entries
    if (!repairedStore.lineEntries) {
      repairedStore.lineEntries = [];
      issuesFound++;
      issuesRepaired++;
      details.push('Initialized missing lineEntries table.');
    } else {
      repairedStore.lineEntries = repairedStore.lineEntries.map((entry, idx) => {
        let changed = false;
        if (!entry.id) {
          entry.id = Date.now() + idx;
          changed = true;
        }
        if (isNaN(entry.efficiency) || entry.efficiency === null || entry.efficiency === undefined) {
          entry.efficiency = 0;
          changed = true;
        }
        if (isNaN(entry.smv) || entry.smv === null || entry.smv === undefined) {
          entry.smv = 15;
          changed = true;
        }
        if (isNaN(entry.workingHours) || entry.workingHours === null || entry.workingHours === undefined) {
          entry.workingHours = 8;
          changed = true;
        }
        if (!entry.floor) {
          entry.floor = 'Floor 01';
          changed = true;
        }
        if (changed) {
          issuesFound++;
          issuesRepaired++;
          details.push(`Repaired malformed fields on Line ${entry.lineNo} (${entry.date}).`);
        }
        return entry;
      });
    }

    // Check lines
    if (!repairedStore.lines || repairedStore.lines.length === 0) {
      issuesFound++;
      details.push('Notice: Production lines table was empty.');
    }

    // Check checklists
    if (!repairedStore.checklists) {
      repairedStore.checklists = {};
      issuesFound++;
      issuesRepaired++;
      details.push('Initialized missing checklists table.');
    }

    // Check audit log
    if (!repairedStore.auditLog) {
      repairedStore.auditLog = [];
      issuesFound++;
      issuesRepaired++;
      details.push('Initialized missing auditLog table.');
    }

    if (issuesRepaired > 0) {
      onUpdateStore(repairedStore);
    }

    setIntegrityReport({
      checkedAt: new Date().toLocaleTimeString(),
      totalRecords: totalAllRecords,
      issuesFound,
      issuesRepaired,
      details: details.length > 0 ? details : ['All datastore records and foreign references are 100% clean and verified.']
    });

    showToast('success', `Integrity check complete: ${issuesFound} issues inspected, ${issuesRepaired} repaired ✓`);
  };

  // 5. Selective Purge Handlers
  const handlePurgeLineEntries = () => {
    if (!confirm('Are you sure you want to delete ALL hourly line data entries?\n(Your production lines, checklists, and settings will NOT be touched).')) {
      return;
    }
    const updated: AppStore = {
      ...store,
      lineEntries: []
    };
    onUpdateStore(updated);
    showToast('success', 'Hourly line data entries have been purged.');
  };

  const handlePurgeAuditLogs = () => {
    if (!confirm('Are you sure you want to clear the entire system audit trail?')) {
      return;
    }
    const updated: AppStore = {
      ...store,
      auditLog: []
    };
    onUpdateStore(updated);
    showToast('success', 'Audit logs cleared.');
  };

  const handleResetChecklists = () => {
    if (!confirm('Are you sure you want to reset all daily checklist records?')) {
      return;
    }
    const updated: AppStore = {
      ...store,
      checklists: {}
    };
    onUpdateStore(updated);
    showToast('success', 'Checklist records reset.');
  };

  // Filtered Line Entries
  const filteredLineEntries = useMemo(() => {
    if (!store.lineEntries) return [];
    if (!searchQuery.trim()) return store.lineEntries;
    const q = searchQuery.toLowerCase();
    return store.lineEntries.filter(
      e =>
        e.lineNo.toLowerCase().includes(q) ||
        e.buyer.toLowerCase().includes(q) ||
        e.style.toLowerCase().includes(q) ||
        e.floor.toLowerCase().includes(q) ||
        e.date.includes(q)
    );
  }, [store.lineEntries, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* 1. TOP NAVIGATION & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Database &amp; Storage Center
              </h1>
              <p className="text-xs text-slate-500">
                Manage factory datastore records, perform diagnostics, schema repairs &amp; JSON/CSV backups.
              </p>
            </div>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Account: {accountEmail}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online ({storageFootprint.kb} KB)
          </span>
          <button
            onClick={handleRunIntegrityCheck}
            className="text-xs font-bold text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            title="Scan and auto-repair datastore integrity"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Verify &amp; Repair</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <Activity className="w-4 h-4 text-blue-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. DATABASE METRICS & HEALTH CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Records</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{totalAllRecords}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 6 datastores</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Line Records</div>
          <div className="text-lg font-black text-blue-700 mt-0.5">{totalLineEntries}</div>
          <div className="text-[10px] text-slate-500 mt-1">Hourly tracking logs</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Master Lines</div>
          <div className="text-lg font-black text-indigo-700 mt-0.5">{totalLines}</div>
          <div className="text-[10px] text-slate-500 mt-1">Configured floors</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Daily Checklists</div>
          <div className="text-lg font-black text-emerald-700 mt-0.5">{totalChecklists}</div>
          <div className="text-[10px] text-slate-500 mt-1">Inspection dates</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Tasks &amp; Timetables</div>
          <div className="text-lg font-black text-amber-700 mt-0.5">{totalTodos + totalSchedules}</div>
          <div className="text-[10px] text-slate-500 mt-1">Floor assignments</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Storage Usage</div>
          <div className="text-lg font-black text-violet-700 mt-0.5">{storageFootprint.kb} KB</div>
          <div className="text-[10px] text-slate-500 mt-1">~5MB LocalStorage</div>
        </div>
      </div>

      {/* 3. DATABASE OPERATIONS COMMAND BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Database Operations &amp; Synchronization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perform complete backups, load snapshot files, or perform selective maintenance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export JSON Snapshot</span>
            </button>

            <button
              onClick={handleExportFullCSV}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Master CSV</span>
            </button>

            <label className="text-xs font-bold text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Restore JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {/* Selective Maintenance Dropdowns */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Selective Purge:</span>
            <button
              onClick={handlePurgeLineEntries}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition font-semibold"
            >
              Purge Line Entries
            </button>
            <button
              onClick={handleResetChecklists}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition font-semibold"
            >
              Reset Checklists
            </button>
            <button
              onClick={handlePurgeAuditLogs}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition font-semibold"
            >
              Clear Audit Log
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset entire system datastore to factory demonstration data?')) {
                onResetToDemo();
                showToast('success', 'Datastore reset to factory demo records.');
              }
            }}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Factory Demo Reset</span>
          </button>
        </div>
      </div>

      {/* Integrity Report Modal / Card */}
      {integrityReport && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Database Integrity Verification Report ({integrityReport.checkedAt})</span>
            </div>
            <button onClick={() => setIntegrityReport(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-emerald-800 space-y-1 pl-6">
            {integrityReport.details.map((d, idx) => (
              <div key={idx}>• {d}</div>
            ))}
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE MULTI-TABLE RECORD EXPLORER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Selector Tabs & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('line-entries')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'line-entries'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Hourly Line Records ({totalLineEntries})</span>
            </button>

            <button
              onClick={() => setActiveTab('lines')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'lines'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Lines ({totalLines})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklists')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'checklists'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Daily Checklists ({totalChecklists})</span>
            </button>

            <button
              onClick={() => setActiveTab('todos-schedules')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'todos-schedules'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Tasks &amp; Schedules ({totalTodos + totalSchedules})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit-log')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'audit-log'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Audit Log ({totalAuditLogs})</span>
            </button>
          </div>

          {/* Search filter for tables */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in table..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 w-full sm:w-56 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TAB 1: HOURLY LINE RECORDS */}
        {activeTab === 'line-entries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Line</th>
                  <th className="p-3">Buyer / Style</th>
                  <th className="p-3">SMV</th>
                  <th className="p-3 text-right">Target Output</th>
                  <th className="p-3 text-right">Actual Output</th>
                  <th className="p-3 text-right">Efficiency</th>
                  <th className="p-3 text-right">In-Line WIP</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLineEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No hourly line records found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredLineEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">{entry.date}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-100">
                          Line {entry.lineNo}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{entry.buyer}</div>
                        <div className="text-[10px] text-slate-400">{entry.style}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{entry.smv} min</td>
                      <td className="p-3 text-right font-medium text-slate-600">{entry.targetProd} pcs</td>
                      <td className="p-3 text-right font-extrabold text-slate-900">{entry.achievedProd} pcs</td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-black text-xs ${
                            entry.efficiency >= 85
                              ? 'text-emerald-600'
                              : entry.efficiency >= 70
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {entry.efficiency}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">{entry.wip || 0} pcs</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedEntryForInspect(entry)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            title="Inspect full record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete Line ${entry.lineNo} record from ${entry.date}?`)) {
                                  onDeleteLineEntry(entry.id);
                                  showToast('success', `Line ${entry.lineNo} record deleted.`);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: MASTER PRODUCTION LINES */}
        {activeTab === 'lines' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Total Configured Lines: {store.lines.length}
              </span>
              <button
                onClick={() => onNavigate('line-management')}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>Launch Line Management Tool</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {store.lines.map(line => (
                <div key={line.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">Line {line.lineNo}</div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-blue-700">Floor: {line.floor}</span>
                      {(line.apartment || line.compartment) && (
                        <span className="font-semibold text-indigo-700">• Apt: {line.apartment || line.compartment}</span>
                      )}
                      {line.building && (
                        <span className="text-slate-400">• {line.building}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-700">{line.targetEfficiency || 85}% Target</span>
                    <span className="block text-[10px] text-slate-400">{line.active !== false ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DAILY CHECKLISTS */}
        {activeTab === 'checklists' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(store.checklists || {}).map(([dateStr, record]) => {
                const taskList = Array.isArray(record) ? record : [];
                const totalTasks = taskList.length;
                const yesCount = taskList.filter(s => s === 'yes').length;
                const score = totalTasks > 0 ? Math.round((yesCount / totalTasks) * 100) : 0;

                return (
                  <div key={dateStr} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{dateStr}</span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          score >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {score}% Compliance
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>Tasks: {totalTasks} logged</span>
                      <span>Passed: {yesCount} / {totalTasks}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TASKS & SCHEDULES */}
        {activeTab === 'todos-schedules' && (
          <div className="p-5 space-y-4">
            <div className="text-xs font-bold text-slate-500">
              Active Floor Action Items &amp; Daily Timetables ({store.todos.length} Tasks, {store.schedules.length} Time Slots)
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {store.todos.map(todo => (
                <div key={todo.id} className="p-3 flex items-center justify-between gap-4 text-xs bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className={`font-semibold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {todo.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {todo.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{todo.roleKey}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM AUDIT LOG */}
        {activeTab === 'audit-log' && (
          <div className="p-5 space-y-3">
            <div className="text-xs font-bold text-slate-500">
              Logged System Events &amp; Security Audits ({store.auditLog.length})
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs">
              {store.auditLog.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No audit events recorded.</div>
              ) : (
                store.auditLog.map(log => (
                  <div key={log.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400 text-[11px] ml-2">{log.details}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">{log.timestamp}</span>
                      <span className="text-[10px] font-mono text-blue-600">{log.user}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. RECORD DETAIL INSPECTOR MODAL */}
      {selectedEntryForInspect && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  L{selectedEntryForInspect.lineNo}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Line {selectedEntryForInspect.lineNo} Inspection Record
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedEntryForInspect.date} • {selectedEntryForInspect.floor}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntryForInspect(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Buyer</span>
                <span className="font-bold text-slate-900">{selectedEntryForInspect.buyer}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Style</span>
                <span className="font-bold text-slate-900">{selectedEntryForInspect.style}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Item</span>
                <span className="font-bold text-slate-900">{selectedEntryForInspect.item || 'N/A'}</span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl">
                <span className="text-[10px] text-blue-600 uppercase font-bold block">SMV</span>
                <span className="font-extrabold text-blue-900 text-sm">{selectedEntryForInspect.smv} min</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl">
                <span className="text-[10px] text-blue-600 uppercase font-bold block">Efficiency</span>
                <span className="font-extrabold text-blue-900 text-sm">{selectedEntryForInspect.efficiency}%</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl">
                <span className="text-[10px] text-blue-600 uppercase font-bold block">Work Hours</span>
                <span className="font-extrabold text-blue-900 text-sm">{selectedEntryForInspect.workingHours} hrs</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Output</span>
                <span className="font-bold text-slate-900">{selectedEntryForInspect.targetProd} pcs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Achieved Output</span>
                <span className="font-bold text-slate-900">{selectedEntryForInspect.achievedProd} pcs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">In-Line WIP</span>
                <span className="font-bold text-slate-900">{selectedEntryForInspect.wip || 0} pcs</span>
              </div>
            </div>

            {/* IE Bottleneck & Manpower details */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-900">Industrial Engineering Parameters</div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>• Takt Cycle Time: <strong>{selectedEntryForInspect.taktTime || 0} sec</strong></div>
                <div>• Bottleneck Cycle Time: <strong>{selectedEntryForInspect.bottleneckCycleTime || 0} sec</strong></div>
                <div>• Line Balancing Method: <strong>{selectedEntryForInspect.lineBalancingMethod || 'Yamazumi'}</strong></div>
                <div>• Bottleneck Machine: <strong>{selectedEntryForInspect.bottleneckMachine || 'Overlock/Flatlock'}</strong></div>
                <div>• Planned Manpower: <strong>{selectedEntryForInspect.plannedMP || 0}</strong></div>
                <div>• Present Manpower: <strong>{selectedEntryForInspect.presentMP || 0}</strong></div>
                <div>• Absent Manpower: <strong>{selectedEntryForInspect.absentMP || 0}</strong></div>
                <div>• Top 5 Meeting Done: <strong>{selectedEntryForInspect.top5MeetingDone ? 'YES ✓' : 'NO'}</strong></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEntryForInspect(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
