import React, { useState } from 'react';
import { ProductionLine, PageId } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Layers,
  Check,
  Search,
  Edit2,
  Save,
  X,
  Sliders,
  TrendingUp,
  Building
} from 'lucide-react';

interface LineManagementModalProps {
  lines: ProductionLine[];
  onSaveLines: (lines: ProductionLine[]) => void;
  onNavigate: (page: PageId) => void;
}

export const LineManagementModal: React.FC<LineManagementModalProps> = ({
  lines,
  onSaveLines,
  onNavigate
}) => {
  const [localLines, setLocalLines] = useState<ProductionLine[]>(lines);
  const [newLineNo, setNewLineNo] = useState('');
  const [newFloor, setNewFloor] = useState('Floor 01');
  const [newApartment, setNewApartment] = useState('Unit A');
  const [newBuilding, setNewBuilding] = useState('Main Complex');
  const [newTargetEff, setNewTargetEff] = useState(85);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveNote, setSaveNote] = useState('');

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFloor, setEditFloor] = useState('');
  const [editApartment, setEditApartment] = useState('');
  const [editBuilding, setEditBuilding] = useState('');
  const [editTargetEff, setEditTargetEff] = useState(85);

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLineNo.trim()) return;

    if (localLines.some(l => l.lineNo.toLowerCase() === newLineNo.trim().toLowerCase())) {
      alert(`Line ${newLineNo} already exists.`);
      return;
    }

    const created: ProductionLine = {
      id: Date.now(),
      lineNo: newLineNo.trim(),
      floor: newFloor.trim() || 'Floor 01',
      apartment: newApartment.trim() || undefined,
      building: newBuilding.trim() || undefined,
      targetEfficiency: newTargetEff,
      active: true
    };

    const updated = [...localLines, created];
    setLocalLines(updated);
    onSaveLines(updated);
    setNewLineNo('');
    setSaveNote(`Line ${created.lineNo} added successfully (${created.floor}${created.apartment ? ' • ' + created.apartment : ''}) ✓`);
    setTimeout(() => setSaveNote(''), 2500);
  };

  const handleDeleteLine = (id: number | string, lineNo: string) => {
    if (!confirm(`Delete Line ${lineNo} from master line configuration?`)) return;
    const updated = localLines.filter(l => String(l.id) !== String(id));
    setLocalLines(updated);
    onSaveLines(updated);
    setSaveNote(`Line ${lineNo} removed from master configuration ✓`);
    setTimeout(() => setSaveNote(''), 2500);
  };

  const startEdit = (line: ProductionLine) => {
    setEditingId(line.id);
    setEditFloor(line.floor);
    setEditApartment(line.apartment || line.compartment || '');
    setEditBuilding(line.building || '');
    setEditTargetEff(line.targetEfficiency || 85);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: number) => {
    const updated = localLines.map(line => {
      if (line.id === id) {
        return {
          ...line,
          floor: editFloor.trim() || line.floor,
          apartment: editApartment.trim() || undefined,
          building: editBuilding.trim() || undefined,
          targetEfficiency: editTargetEff
        };
      }
      return line;
    });
    setLocalLines(updated);
    onSaveLines(updated);
    setEditingId(null);
    setSaveNote('Line updated successfully ✓');
    setTimeout(() => setSaveNote(''), 2500);
  };

  const toggleLineActive = (id: number) => {
    const updated = localLines.map(line => {
      if (line.id === id) {
        return { ...line, active: line.active === false ? true : false };
      }
      return line;
    });
    setLocalLines(updated);
    onSaveLines(updated);
  };

  const filteredLines = localLines.filter(line => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const apt = (line.apartment || line.compartment || '').toLowerCase();
    const bld = (line.building || '').toLowerCase();
    return line.lineNo.toLowerCase().includes(q) || line.floor.toLowerCase().includes(q) || apt.includes(q) || bld.includes(q);
  });

  const activeCount = localLines.filter(l => l.active !== false).length;
  const avgBenchmark = localLines.length > 0
    ? Math.round(localLines.reduce((acc, l) => acc + (l.targetEfficiency || 85), 0) / localLines.length)
    : 85;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('linedata')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Line Data Collection
        </button>
        <button
          onClick={() => onNavigate('database')}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1.5"
        >
          Open Database Manager →
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Factory Production Line Management
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure active plant production lines, units, and baseline benchmark efficiency targets.
        </p>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Total Lines</div>
            <div className="text-xl font-black text-slate-900">{localLines.length} Lines</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Active on Floor</div>
            <div className="text-xl font-black text-emerald-700">{activeCount} of {localLines.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Avg Benchmark Target</div>
            <div className="text-xl font-black text-violet-700">{avgBenchmark}% Eff</div>
          </div>
        </div>
      </div>

      {/* Add New Line Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Add New Production Line
        </h2>

        <form onSubmit={handleAddLine} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Line Number / Code</label>
            <input
              type="text"
              placeholder="e.g. 25 or Line 25"
              value={newLineNo}
              onChange={e => setNewLineNo(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              Floor
            </label>
            <input
              type="text"
              placeholder="e.g. Floor 02 or Ground Floor"
              value={newFloor}
              onChange={e => setNewFloor(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Apartment / Unit
            </label>
            <input
              type="text"
              placeholder="e.g. Apartment A, Unit B, Bay 1"
              value={newApartment}
              onChange={e => setNewApartment(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Efficiency %</label>
            <input
              type="number"
              min="10"
              max="100"
              value={newTargetEff}
              onChange={e => setNewTargetEff(parseInt(e.target.value) || 80)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Line
            </button>
          </div>
        </form>

        {saveNote && (
          <div className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in">
            {saveNote}
          </div>
        )}
      </div>

      {/* Configured Lines Table & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Configured Master Production Lines ({localLines.length})
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by line or floor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 w-full sm:w-56 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLines.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No production lines match "{searchQuery}".
            </div>
          ) : (
            filteredLines.map(line => {
              const isEditing = editingId === line.id;
              const isActive = line.active !== false;

              return (
                <div key={line.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      L{line.lineNo}
                    </span>

                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase">Floor</label>
                          <input
                            type="text"
                            value={editFloor}
                            onChange={e => setEditFloor(e.target.value)}
                            className="border border-blue-300 rounded-lg px-2 py-1 text-xs w-32 font-semibold"
                            placeholder="Floor"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase">Apartment / Unit</label>
                          <input
                            type="text"
                            value={editApartment}
                            onChange={e => setEditApartment(e.target.value)}
                            className="border border-indigo-300 rounded-lg px-2 py-1 text-xs w-32 font-semibold"
                            placeholder="Apartment / Unit"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>Line {line.lineNo}</span>
                          {!isActive && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-bold uppercase">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                            <Building className="w-3 h-3" />
                            Floor: {line.floor}
                          </span>
                          {(line.apartment || line.compartment) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                              <Layers className="w-3 h-3" />
                              Apt/Unit: {line.apartment || line.compartment}
                            </span>
                          )}
                          {line.building && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                              {line.building}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="10"
                          max="100"
                          value={editTargetEff}
                          onChange={e => setEditTargetEff(parseInt(e.target.value) || 80)}
                          className="w-16 border border-blue-300 rounded-lg px-2 py-1 text-xs font-black text-blue-700 text-right"
                        />
                        <span className="text-xs font-bold text-slate-500">% Target</span>
                        <button
                          onClick={() => saveEdit(line.id)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                          title="Save Changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-right">
                          <div className="font-extrabold text-blue-700">{line.targetEfficiency || 85}%</div>
                          <div className="text-[10px] text-slate-400 uppercase">Target Benchmark</div>
                        </div>

                        <button
                          onClick={() => toggleLineActive(line.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={isActive ? 'Deactivate line' : 'Activate line'}
                        >
                          {isActive ? 'Active' : 'Paused'}
                        </button>

                        <button
                          onClick={() => startEdit(line)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="Edit Line Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteLine(line.id, line.lineNo)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Remove Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
