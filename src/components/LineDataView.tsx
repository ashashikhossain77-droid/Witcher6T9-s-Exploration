import React, { useState } from 'react';
import { AppStore, LineEntry, PageId } from '../types';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
  Activity,
  Layers
} from 'lucide-react';

interface LineDataViewProps {
  store: AppStore;
  today: string;
  canEdit: boolean;
  onSaveLineEntry: (entry: LineEntry) => void;
  onNavigate: (page: PageId) => void;
}

export const LineDataView: React.FC<LineDataViewProps> = ({
  store,
  today,
  canEdit,
  onSaveLineEntry,
  onNavigate
}) => {
  const [formData, setFormData] = useState<Omit<LineEntry, 'id' | 'efficiency'>>({
    date: today,
    lineNo: store.lines[0]?.lineNo || '18',
    floor: store.lines[0]?.floor || 'Floor 01 / Unit A',
    buyer: 'H&M',
    style: '',
    smv: 0.85,
    plannedMP: 38,
    workingHours: 8,
    targetEff: 85,
    targetProd: 1200,
    achievedProd: 1080,
    remarks: '',
    orderQty: 10000,
    dailyInput: 1100,
    dailyOutput: 1080,
    wip: 250,
    balancingGraph: 'day1',
    nextStyle: '',
    nextStyleDate: '',
    mp: {
      Operator: { present: 28, absent: 2 },
      Helper: { present: 8, absent: 1 },
      'Iron Man': { present: 3, absent: 0 }
    },
    balanceMethod: 'Overtime',
    balanceNotes: '',
    top5: {
      held: 'yes',
      attendance: 95,
      items: ['', '', '', '', ''],
      notes: ''
    },
    bottleneck: {
      station: '',
      cycleTime: 0,
      targetCT: 0,
      status: 'ok',
      action: '',
      notes: ''
    },
    timeStudy: {
      done: 'no',
      type: 'time',
      observedRate: 0,
      standardRate: 0,
      findings: ''
    },
    buildUp: {
      day: '1',
      plannedPct: 60,
      achievedPct: 60,
      operators: 35,
      notes: ''
    },
    lineIE: {
      name: store.profile.name || 'IE Officer',
      level: 'executive',
      period: 'daily',
      weeklyNotes: '',
      monthlyNotes: '',
      additionalInfo: ''
    }
  });

  const [openFolders, setOpenFolders] = useState<{
    lineSetup: boolean;
    productionFlow: boolean;
    manpower: boolean;
    top5: boolean;
    bottleneck: boolean;
    timeStudy: boolean;
    buildUp: boolean;
    lineIE: boolean;
  }>({
    lineSetup: true,
    productionFlow: true,
    manpower: true,
    top5: false,
    bottleneck: false,
    timeStudy: false,
    buildUp: false,
    lineIE: false
  });

  const [saveMessage, setSaveMessage] = useState<string>('');

  const toggleFolder = (key: keyof typeof openFolders) => {
    setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLineSelect = (lineNo: string) => {
    const matched = store.lines.find(l => l.lineNo === lineNo);
    setFormData(prev => ({
      ...prev,
      lineNo,
      floor: matched?.floor || prev.floor
    }));
  };

  const calculatedEff =
    formData.targetProd && formData.targetProd > 0
      ? Math.round((formData.achievedProd / formData.targetProd) * 100)
      : 0;

  const totalPresentMP =
    (formData.mp.Operator.present || 0) +
    (formData.mp.Helper.present || 0) +
    (formData.mp['Iron Man'].present || 0);

  const totalAbsentMP =
    (formData.mp.Operator.absent || 0) +
    (formData.mp.Helper.absent || 0) +
    (formData.mp['Iron Man'].absent || 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Read-only: Your role does not have permission to save line entries.');
      return;
    }
    if (!formData.lineNo) {
      alert('Please specify a Line Number.');
      return;
    }
    if (!formData.style) {
      alert('Please enter a Style Name or PO number.');
      return;
    }

    const newEntry: LineEntry = {
      id: Date.now(),
      ...formData,
      efficiency: calculatedEff
    };
    onSaveLineEntry(newEntry);
    setSaveMessage(`Line ${formData.lineNo} entry recorded successfully ✓`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('line-management')}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 text-slate-700 hover:bg-blue-50 transition"
        >
          Manage Production Lines →
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Line Data Collection</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Record hourly output, SMV, manpower absents, bottleneck takt cycle times, and Top 5 monitoring.
        </p>
      </div>

      {/* Main Entry Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Capture Line Record
          </h2>
          <div className="text-xs font-semibold text-slate-400">
            Efficiency: <strong className="text-blue-700 font-extrabold text-sm">{calculatedEff}%</strong>
          </div>
        </div>

        {/* Capture folder 1: line setup and IE planning */}
        <div className="rounded-2xl border border-blue-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => toggleFolder('lineSetup')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-blue-50/70 hover:bg-blue-100/70 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-950 text-sm">Line Setup &amp; IE Planning</span>
            </div>
            {openFolders.lineSetup ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-blue-500" />}
          </button>

          {openFolders.lineSetup && (
            <div className="p-5 bg-blue-50/20 border-t border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Line Number</label>
            {store.lines.length > 0 ? (
              <select
                value={formData.lineNo}
                onChange={e => handleLineSelect(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
              >
                {store.lines.map(l => (
                  <option key={l.id} value={l.lineNo}>
                    Line {l.lineNo} ({l.floor}{l.apartment ? ` • ${l.apartment}` : ''})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="e.g. Line 18"
                value={formData.lineNo}
                onChange={e => setFormData({ ...formData, lineNo: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Floor / Unit</label>
            <input
              type="text"
              placeholder="e.g. Floor 01 / Unit A"
              value={formData.floor}
              onChange={e => setFormData({ ...formData, floor: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Buyer</label>
            <input
              type="text"
              placeholder="e.g. H&M, Zara, Uniqlo"
              value={formData.buyer}
              onChange={e => setFormData({ ...formData, buyer: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Style / PO Number</label>
            <input
              type="text"
              placeholder="e.g. TS-2401 Crewneck"
              value={formData.style}
              onChange={e => setFormData({ ...formData, style: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">SMV (Standard Minute Value)</label>
            <input
              type="number"
              step="0.01"
              value={formData.smv}
              onChange={e => setFormData({ ...formData, smv: parseFloat(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Planned Manpower</label>
            <input
              type="number"
              value={formData.plannedMP}
              onChange={e => setFormData({ ...formData, plannedMP: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
            <input
              type="number"
              step="0.5"
              value={formData.workingHours}
              onChange={e => setFormData({ ...formData, workingHours: parseFloat(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Efficiency %</label>
            <input
              type="number"
              value={formData.targetEff}
              onChange={e => setFormData({ ...formData, targetEff: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

              </div>
            </div>
          )}
        </div>

        {/* Capture folder 2: production flow and handoff */}
        <div className="rounded-2xl border border-emerald-200 overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => toggleFolder('productionFlow')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-950 text-sm">Production Flow &amp; Handoff</span>
            </div>
            {openFolders.productionFlow ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-emerald-500" />}
          </button>

          {openFolders.productionFlow && (
            <div className="p-5 bg-emerald-50/20 border-t border-emerald-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Production (Pcs)</label>
            <input
              type="number"
              value={formData.targetProd}
              onChange={e => setFormData({ ...formData, targetProd: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Achieved Production (Pcs)</label>
            <input
              type="number"
              value={formData.achievedProd}
              onChange={e => setFormData({ ...formData, achievedProd: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Order Qty</label>
            <input
              type="number"
              value={formData.orderQty}
              onChange={e => setFormData({ ...formData, orderQty: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Input (Cut Loaded)</label>
            <input
              type="number"
              value={formData.dailyInput}
              onChange={e => setFormData({ ...formData, dailyInput: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Output (Finished)</label>
            <input
              type="number"
              value={formData.dailyOutput}
              onChange={e => setFormData({ ...formData, dailyOutput: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">In-Line WIP</label>
            <input
              type="number"
              value={formData.wip}
              onChange={e => setFormData({ ...formData, wip: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Line Balancing Graph Status</label>
            <select
              value={formData.balancingGraph}
              onChange={e => setFormData({ ...formData, balancingGraph: e.target.value as LineEntry['balancingGraph'] })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="pending">Pending</option>
              <option value="day1">Day 1 Done (1st output)</option>
              <option value="day2">Day 2 Complete</option>
              <option value="day4">Day 4 Graph Done</option>
              <option value="complete">Fully Complete</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Next Style Name / PO</label>
            <input
              type="text"
              placeholder="e.g. JK-1200 Bomber"
              value={formData.nextStyle}
              onChange={e => setFormData({ ...formData, nextStyle: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Next Style Input Date</label>
            <input
              type="date"
              value={formData.nextStyleDate}
              onChange={e => setFormData({ ...formData, nextStyleDate: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">Submit file before 10 days of input</p>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Engineering Remarks / Action Plan</label>
            <input
              type="text"
              placeholder="e.g. Method improvement applied at collar attach station"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
              </div>
            </div>
          )}
        </div>

        {/* Foldable Section 1: Manpower & Absenteeism Balancing */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => toggleFolder('manpower')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">Manpower Allocation &amp; Absenteeism Balancing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Present: <strong className="text-emerald-700">{totalPresentMP}</strong> • Absent:{' '}
                <strong className="text-rose-700">{totalAbsentMP}</strong>
              </span>
              {openFolders.manpower ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {openFolders.manpower && (
            <div className="p-5 bg-white border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Operator', 'Helper', 'Iron Man'] as const).map(role => (
                  <div key={role} className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                    <div className="text-xs font-bold text-slate-800 mb-2">{role}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase">Present</label>
                        <input
                          type="number"
                          value={formData.mp[role].present}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              mp: {
                                ...formData.mp,
                                [role]: {
                                  ...formData.mp[role],
                                  present: parseInt(e.target.value) || 0
                                }
                              }
                            })
                          }
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase">Absent</label>
                        <input
                          type="number"
                          value={formData.mp[role].absent}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              mp: {
                                ...formData.mp,
                                [role]: {
                                  ...formData.mp[role],
                                  absent: parseInt(e.target.value) || 0
                                }
                              }
                            })
                          }
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-rose-600 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">How Absents Were Balanced</label>
                  <select
                    value={formData.balanceMethod}
                    onChange={e => setFormData({ ...formData, balanceMethod: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select balancing method...</option>
                    <option value="Overtime">Overtime</option>
                    <option value="Extra operators">Extra Operators</option>
                    <option value="Borrowed from other line">Borrowed from other line</option>
                    <option value="Multi-skilled floaters">Multi-skilled Floaters</option>
                    <option value="Reduced target">Reduced Target</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Balancing Action Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 operators worked 1 hr OT to absorb deficit"
                    value={formData.balanceNotes}
                    onChange={e => setFormData({ ...formData, balanceNotes: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Foldable Section 2: Top 5 Meeting Monitoring */}
        <div className="rounded-2xl border border-violet-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => toggleFolder('top5')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-violet-50/70 hover:bg-violet-100/70 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-black">
                5
              </span>
              <span className="font-bold text-violet-950 text-sm">Top 5 Meeting Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-violet-700 font-semibold">
                Status: {formData.top5.held ? formData.top5.held.toUpperCase() : 'Unset'}
              </span>
              {openFolders.top5 ? <ChevronDown className="w-4 h-4 text-violet-500" /> : <ChevronRight className="w-4 h-4 text-violet-500" />}
            </div>
          </button>

          {openFolders.top5 && (
            <div className="p-5 bg-violet-50/20 border-t border-violet-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Held?</label>
                  <select
                    value={formData.top5.held}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        top5: { ...formData.top5, held: e.target.value as LineEntry['top5']['held'] }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes (Fully Conducted)</option>
                    <option value="partial">Partial</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Rate %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.top5.attendance}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        top5: { ...formData.top5, attendance: parseInt(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Top 5 Issues / Quality &amp; Process Action Items
                </label>
                <div className="space-y-2">
                  {formData.top5.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Action item #${idx + 1}`}
                        value={item}
                        onChange={e => {
                          const updated = [...formData.top5.items];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, top5: { ...formData.top5, items: updated } });
                        }}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Follow-up Notes</label>
                <input
                  type="text"
                  placeholder="Supervisor comments &amp; commitments"
                  value={formData.top5.notes}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      top5: { ...formData.top5, notes: e.target.value }
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Foldable Section 3: Bottleneck Analysis & Cycle Time */}
        <div className="rounded-2xl border border-rose-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => toggleFolder('bottleneck')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-rose-50/70 hover:bg-rose-100/70 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-rose-950 text-sm">Bottleneck Flow Analysis &amp; Cycle Time Checking</span>
            </div>
            {openFolders.bottleneck ? <ChevronDown className="w-4 h-4 text-rose-500" /> : <ChevronRight className="w-4 h-4 text-rose-500" />}
          </button>

          {openFolders.bottleneck && (
            <div className="p-5 bg-rose-50/20 border-t border-rose-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bottleneck Station / Critical Operation</label>
                  <input
                    type="text"
                    placeholder="e.g. Collar attach, pocket welt join"
                    value={formData.bottleneck.station}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bottleneck: { ...formData.bottleneck, station: e.target.value }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.bottleneck.status}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bottleneck: { ...formData.bottleneck, status: e.target.value as LineEntry['bottleneck']['status'] }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                  >
                    <option value="ok">Within Target</option>
                    <option value="high">Above Target</option>
                    <option value="critical">Critical Bottleneck</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observed Cycle Time (seconds)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bottleneck.cycleTime}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bottleneck: { ...formData.bottleneck, cycleTime: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Takt / Cycle Time (seconds)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bottleneck.targetCT}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bottleneck: { ...formData.bottleneck, targetCT: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corrective Action Taken</label>
                  <input
                    type="text"
                    placeholder="e.g. Added workstation guide / jig"
                    value={formData.bottleneck.action}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bottleneck: { ...formData.bottleneck, action: e.target.value }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Analysis Remarks</label>
                  <input
                    type="text"
                    placeholder="Root cause &amp; observation details"
                    value={formData.bottleneck.notes}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bottleneck: { ...formData.bottleneck, notes: e.target.value }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Foldable Section 4: Time & Production Study */}
        <div className="rounded-2xl border border-sky-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => toggleFolder('timeStudy')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-sky-50/70 hover:bg-sky-100/70 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-sky-950 text-sm">Time / Production Study</span>
            </div>
            {openFolders.timeStudy ? <ChevronDown className="w-4 h-4 text-sky-500" /> : <ChevronRight className="w-4 h-4 text-sky-500" />}
          </button>

          {openFolders.timeStudy && (
            <div className="p-5 bg-sky-50/20 border-t border-sky-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Study Completed?</label>
                  <select
                    value={formData.timeStudy.done}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        timeStudy: { ...formData.timeStudy, done: e.target.value as LineEntry['timeStudy']['done'] }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                    <option value="partial">In Progress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Study Type</label>
                  <select
                    value={formData.timeStudy.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        timeStudy: { ...formData.timeStudy, type: e.target.value as LineEntry['timeStudy']['type'] }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="time">Time Study (Stopwatch)</option>
                    <option value="production">Production Study (Pitch)</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observed Rate (pcs/hr)</label>
                  <input
                    type="number"
                    value={formData.timeStudy.observedRate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        timeStudy: { ...formData.timeStudy, observedRate: parseInt(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standard Rate (pcs/hr)</label>
                  <input
                    type="number"
                    value={formData.timeStudy.standardRate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        timeStudy: { ...formData.timeStudy, standardRate: parseInt(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Study Findings &amp; Motion Efficiency</label>
                <input
                  type="text"
                  placeholder="Key observations on handling &amp; allowance"
                  value={formData.timeStudy.findings}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      timeStudy: { ...formData.timeStudy, findings: e.target.value }
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Foldable Section 5: Line Build Up Planning */}
        <div className="rounded-2xl border border-emerald-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => toggleFolder('buildUp')}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-950 text-sm">Line Build-Up &amp; Learning Curve Tracking</span>
            </div>
            {openFolders.buildUp ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-emerald-500" />}
          </button>

          {openFolders.buildUp && (
            <div className="p-5 bg-emerald-50/20 border-t border-emerald-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Build-Up Day</label>
                  <select
                    value={formData.buildUp.day}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        buildUp: { ...formData.buildUp, day: e.target.value as LineEntry['buildUp']['day'] }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="1">Day 1</option>
                    <option value="2">Day 2</option>
                    <option value="3">Day 3 (Peak 70% Target)</option>
                    <option value="4">Day 4</option>
                    <option value="5">Day 5+</option>
                    <option value="stable">Stable Run</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Planned Target %</label>
                  <input
                    type="number"
                    value={formData.buildUp.plannedPct}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        buildUp: { ...formData.buildUp, plannedPct: parseInt(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Achieved Target %</label>
                  <input
                    type="number"
                    value={formData.buildUp.achievedPct}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        buildUp: { ...formData.buildUp, achievedPct: parseInt(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operators Allocated</label>
                  <input
                    type="number"
                    value={formData.buildUp.operators}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        buildUp: { ...formData.buildUp, operators: parseInt(e.target.value) || 0 }
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={!canEdit}
            className={`w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${
              canEdit
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            Save Line Data Entry
          </button>
          {saveMessage && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
              {saveMessage}
            </span>
          )}
        </div>
      </form>

    </div>
  );
};
