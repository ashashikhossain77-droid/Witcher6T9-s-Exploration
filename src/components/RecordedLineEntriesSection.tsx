import React, { useState } from 'react';
import { AppStore } from '../types';
import { exportSingleLineCSV } from '../utils/exportUtils';
import { FileSpreadsheet, Search, Trash2 } from 'lucide-react';

interface RecordedLineEntriesSectionProps {
  store: AppStore;
  canDelete: boolean;
  onDeleteLineEntry: (id: number) => void;
}

export const RecordedLineEntriesSection: React.FC<RecordedLineEntriesSectionProps> = ({
  store,
  canDelete,
  onDeleteLineEntry
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredEntries = store.lineEntries.filter(entry => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      entry.lineNo.toLowerCase().includes(q) ||
      entry.buyer.toLowerCase().includes(q) ||
      entry.style.toLowerCase().includes(q) ||
      entry.floor.toLowerCase().includes(q) ||
      entry.date.includes(q)
    );
  });

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Recorded Line Entries</h2>
          <p className="text-xs text-slate-500">Historical production, SMV, efficiency, and exportable line files</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search line, buyer, style..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          No line entries found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-black text-xs">
                      Line {entry.lineNo}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{entry.date}</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {entry.buyer} • {entry.style}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {entry.floor} • SMV: <strong>{entry.smv}</strong> • Hours: <strong>{entry.workingHours}h</strong> • MP:{' '}
                    <strong>{entry.plannedMP}</strong>
                    {entry.lineIE?.name && <span> • IE: {entry.lineIE.name}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="text-right">
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
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Efficiency</div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete entry for Line ${entry.lineNo} on ${entry.date}?`)) {
                          onDeleteLineEntry(entry.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Target Output:</span>{' '}
                  <strong className="text-slate-800">{entry.targetProd} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400">Achieved Output:</span>{' '}
                  <strong className="text-slate-800">{entry.achievedProd} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400">Order Qty:</span>{' '}
                  <strong className="text-slate-800">{entry.orderQty || 0} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400">In-Line WIP:</span>{' '}
                  <strong className="text-slate-800">{entry.wip || 0} pcs</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Exports:
                </span>
                <button
                  onClick={() => exportSingleLineCSV(entry, 'manpower')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition"
                >
                  Manpower CSV
                </button>
                <button
                  onClick={() => exportSingleLineCSV(entry, 'production')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition"
                >
                  Production I/O CSV
                </button>
                <button
                  onClick={() => exportSingleLineCSV(entry, 'bottleneck')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition"
                >
                  Bottleneck CSV
                </button>
                <button
                  onClick={() => exportSingleLineCSV(entry, 'top5')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition"
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
          ))}
        </div>
      )}
    </section>
  );
};