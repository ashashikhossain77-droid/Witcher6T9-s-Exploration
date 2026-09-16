import React, { useState } from 'react';
import { AppStore, PageId } from '../types';
import {
  exportChecklistsCSV,
  exportChecklistsXLSX,
  exportLineDataCSV,
  exportLineDataXLSX,
  exportFullWorkbookXLSX,
  downloadBlob
} from '../utils/exportUtils';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Database,
  Upload,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  Archive
} from 'lucide-react';

interface DataExportViewProps {
  store: AppStore;
  today: string;
  canExport: boolean;
  onRestoreStore: (importedStore: AppStore) => void;
  onNavigate: (page: PageId) => void;
}

export const DataExportView: React.FC<DataExportViewProps> = ({
  store,
  today,
  canExport,
  onRestoreStore,
  onNavigate
}) => {
  const [feedback, setFeedback] = useState<string>('');

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleJsonExport = () => {
    const jsonStr = JSON.stringify(store, null, 2);
    downloadBlob(jsonStr, `IE_Activity_Tracking_Backup_${today}.json`, 'application/json');
    triggerFeedback('Full JSON backup downloaded ✓');
  };

  const handleJsonRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed.checklists === 'object' && Array.isArray(parsed.lineEntries)) {
          onRestoreStore(parsed);
          triggerFeedback('Database restored from JSON backup ✓');
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Data Export &amp; Backup</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate production-ready Excel workbooks, CSV files, and JSON system snapshots.
        </p>
      </div>

      {!canExport && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4">
          <strong>Restricted:</strong> Full export privileges are reserved for Admin and IE Manager roles.
        </div>
      )}

      {feedback && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 flex items-center gap-2 font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {feedback}
        </div>
      )}

      <div className="space-y-4">
        {/* Master Excel Workbook */}
        <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">Consolidated Master Excel Workbook</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete workbook featuring 3 dedicated sheets: <em>Daily Checklists</em>, <em>Line Production Data</em>, and <em>Lines Setup</em>.
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-semibold">
                  <span>{Object.keys(store.checklists).length} Checklists</span>
                  <span>·</span>
                  <span>{store.lineEntries.length} Line Records</span>
                  <span>·</span>
                  <span>{store.lines.length} Configured Lines</span>
                </div>
              </div>
            </div>

            <button
              disabled={!canExport}
              onClick={() => {
                exportFullWorkbookXLSX(store, today);
                triggerFeedback('Consolidated Excel Workbook downloaded ✓');
              }}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition shrink-0 ${
                canExport
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Download Master (.xlsx)
            </button>
          </div>
        </div>

        {/* Checklist History Export */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:border-slate-300 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Daily Checklist History</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All dates with individual statuses for each of the 12 IE protocols and calculated compliance rates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                disabled={!canExport}
                onClick={() => {
                  exportChecklistsXLSX(store, today);
                  triggerFeedback('Checklist Excel (.xlsx) downloaded ✓');
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  canExport
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel (.xlsx)
              </button>

              <button
                disabled={!canExport}
                onClick={() => {
                  exportChecklistsCSV(store, today);
                  triggerFeedback('Checklist CSV downloaded ✓');
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition ${
                  canExport
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Line Data Export */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:border-slate-300 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Line Production &amp; Efficiency Logs</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Line numbers, buyers, styles, SMV, planned manpower, actual output, WIP, and cycle times.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                disabled={!canExport}
                onClick={() => {
                  exportLineDataXLSX(store, today);
                  triggerFeedback('Line Data Excel (.xlsx) downloaded ✓');
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  canExport
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel (.xlsx)
              </button>

              <button
                disabled={!canExport}
                onClick={() => {
                  exportLineDataCSV(store, today);
                  triggerFeedback('Line Data CSV downloaded ✓');
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition ${
                  canExport
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* JSON System Backup & Restore */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:border-slate-300 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Full JSON Database Backup &amp; Restore</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Export complete application database for offline backup or transfer to another device.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={handleJsonExport}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>

              <label className="px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5 transition">
                <Upload className="w-4 h-4" />
                Restore JSON
                <input type="file" accept=".json" onChange={handleJsonRestore} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
