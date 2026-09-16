import React, { useState, useEffect } from 'react';
import { AppStore, IE_TASKS, TaskStatus, PageId } from '../types';
import {
  ArrowLeft,
  Check,
  Clock,
  X,
  Calendar,
  Save,
  RotateCcw
} from 'lucide-react';

interface ChecklistViewProps {
  store: AppStore;
  today: string;
  canEdit: boolean;
  onSaveChecklist: (date: string, tasks: TaskStatus[]) => void;
  onNavigate: (page: PageId) => void;
  initialDate?: string;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  store,
  today,
  canEdit,
  onSaveChecklist,
  onNavigate,
  initialDate
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || today);
  const [tasks, setTasks] = useState<TaskStatus[]>(() => {
    return store.checklists[initialDate || today] || Array(12).fill(null);
  });
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'yes' | 'no'>('all');

  useEffect(() => {
    const existing = store.checklists[selectedDate];
    setTasks(existing ? [...existing] : Array(12).fill(null));
    setSaveStatus('');
  }, [selectedDate, store.checklists]);

  const setTaskStatus = (index: number, status: TaskStatus) => {
    if (!canEdit) return;
    const next = [...tasks];
    next[index] = status;
    setTasks(next);
    // Auto-save immediately to store
    onSaveChecklist(selectedDate, next);
    setSaveStatus('Auto-saved ✓');
    const t = setTimeout(() => setSaveStatus(''), 2000);
    return () => clearTimeout(t);
  };

  const resetAll = () => {
    if (!canEdit) return;
    if (!confirm('Reset all 12 tasks to unmarked for this date?')) return;
    const next = Array(12).fill(null) as TaskStatus[];
    setTasks(next);
    onSaveChecklist(selectedDate, next);
    setSaveStatus('Reset ✓');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleManualSave = () => {
    if (!canEdit) return;
    onSaveChecklist(selectedDate, tasks);
    setSaveStatus('Checklist saved successfully ✓');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const yesCount = tasks.filter(t => t === 'yes').length;
  const pendingCount = tasks.filter(t => t === 'pending').length;
  const noCount = tasks.filter(t => t === 'no').length;
  const decidedCount = yesCount + pendingCount + noCount;
  const compliance = decidedCount === 0 ? 0 : Math.round((yesCount / 12) * 100);

  const prevDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const nextDay = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const formatDateDisplay = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={resetAll}
              className="text-xs font-semibold px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition flex items-center gap-1"
              title="Reset checklist"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Daily IE Task Checklist</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Mark each standard Industrial Engineering daily protocol as Yes, Pending, or No.
        </p>
      </div>

      {/* Date Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={prevDay}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              onClick={() => setSelectedDate(today)}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition ${
                selectedDate === today
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
          </div>
          <button
            onClick={nextDay}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
          >
            →
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatDateDisplay(selectedDate)}
        </div>
      </div>

      {/* Score Summary Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 divide-x divide-slate-100">
          <div className="text-center pr-2">
            <div className="text-2xl font-black text-emerald-600 tabular-nums">{yesCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Yes</div>
          </div>
          <div className="text-center pl-4 pr-2">
            <div className="text-2xl font-black text-amber-600 tabular-nums">{pendingCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending</div>
          </div>
          <div className="text-center pl-4">
            <div className="text-2xl font-black text-rose-600 tabular-nums">{noCount}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">No</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in">
              {saveStatus}
            </span>
          )}
          <div className="text-right">
            <div className="text-3xl font-black text-blue-700 tabular-nums tracking-tight">
              {compliance}%
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Task Compliance
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All 12 Tasks
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
            filter === 'pending'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('yes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
            filter === 'yes'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          Completed ({yesCount})
        </button>
        <button
          onClick={() => setFilter('no')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
            filter === 'no'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          Not Done ({noCount})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3 mb-8">
        {IE_TASKS.map((task, idx) => {
          const status = tasks[idx];
          if (filter !== 'all') {
            if (filter === 'pending' && status !== 'pending') return null;
            if (filter === 'yes' && status !== 'yes') return null;
            if (filter === 'no' && status !== 'no') return null;
          }
          const isYes = status === 'yes';
          const isPending = status === 'pending';
          const isNo = status === 'no';

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-4 transition-all duration-200 ${
                isYes
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                  : isPending
                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                  : isNo
                  ? 'bg-rose-50/70 border-rose-300 shadow-2xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isYes
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isPending
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : isNo
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {task}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {idx === 0 && 'Plan line progression & efficiency target curve for new styles'}
                      {idx === 1 && 'Initial layout balance graph plotted on 1st output and finalized Day 2'}
                      {idx === 2 && 'Ensure line hits minimum 70% of standard production capacity in 3 days'}
                      {idx === 3 && 'Re-evaluate bottleneck operations and update graph by Day 4'}
                      {idx === 4 && 'Prepare comprehensive line projection and cost/minute study'}
                      {idx === 5 && 'Conduct motion study and video flow cycle time audit'}
                      {idx === 6 && 'Check pre-costing, technical package, and cutting schedule 10 days prior'}
                      {idx === 7 && 'Track trial run and tech sample approval with merchandising team'}
                      {idx === 8 && 'Check floor 5S, visual management, line displays, and maintenance call logs'}
                      {idx === 9 && 'Log individual operator skill matrix and target attainment'}
                      {idx === 10 && 'Implement poka-yoke jigs, folder attachments, or workstation ergonomics'}
                      {idx === 11 && 'Verify real-time line board production and standard SMV efficiency rate'}
                    </div>
                  </div>
                </div>

                {/* Yes / Pending / No Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    disabled={!canEdit}
                    onClick={() => setTaskStatus(idx, 'yes')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      isYes
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Yes
                  </button>
                  <button
                    disabled={!canEdit}
                    onClick={() => setTaskStatus(idx, 'pending')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      isPending
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                  </button>
                  <button
                    disabled={!canEdit}
                    onClick={() => setTaskStatus(idx, 'no')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      isNo
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <X className="w-3.5 h-3.5" />
                    No
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!canEdit && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4 mb-6">
          <strong>Read-Only Mode:</strong> Your current role has view-only permissions for daily checklists. Switch to an Admin or IE Officer profile in Settings to make changes.
        </div>
      )}

      {canEdit && (
        <div className="sticky bottom-20 z-20">
          <button
            onClick={handleManualSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Checklist for {selectedDate}
          </button>
        </div>
      )}
    </div>
  );
};
