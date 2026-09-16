import React, { useState } from 'react';
import { AppStore, PageId, ProductionLine, TeamMember } from '../types';
import { ArrowLeft, Plus, Trash2, Edit2, Users, Layers, CheckCircle2 } from 'lucide-react';

interface LineManagementViewProps {
  store: AppStore;
  canManageLines: boolean;
  canDelete: boolean;
  onSaveLine: (line: ProductionLine) => void;
  onDeleteLine: (id: number) => void;
  onNavigate: (page: PageId) => void;
}

export const LineManagementView: React.FC<LineManagementViewProps> = ({
  store,
  canManageLines,
  canDelete,
  onSaveLine,
  onDeleteLine,
  onNavigate
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lineNo, setLineNo] = useState('');
  const [floor, setFloor] = useState('Floor 01 / Unit A');
  const [active, setActive] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [message, setMessage] = useState('');

  const addTeamMemberRow = () => {
    setTeamMembers(prev => [...prev, { name: '', role: 'Operator' }]);
  };

  const removeTeamMemberRow = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, val: string) => {
    setTeamMembers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageLines) {
      alert('Permission denied: Your role cannot edit production lines.');
      return;
    }
    if (!lineNo.trim()) {
      alert('Please enter a Line Number.');
      return;
    }

    const cleanMembers = teamMembers
      .filter(m => m.name.trim().length > 0)
      .map(m => ({ name: m.name.trim(), role: m.role }));

    const payload: ProductionLine = {
      id: editingId || Date.now(),
      lineNo: lineNo.trim(),
      floor: floor.trim(),
      teamMembers: cleanMembers,
      active
    };

    onSaveLine(payload);
    setMessage(editingId ? 'Line updated successfully ✓' : 'Line added successfully ✓');
    setTimeout(() => setMessage(''), 3000);
    resetForm();
  };

  const handleEdit = (line: ProductionLine) => {
    setEditingId(line.id);
    setLineNo(line.lineNo);
    setFloor(line.floor);
    setActive(line.active);
    setTeamMembers(line.teamMembers ? line.teamMembers.map(m => ({ ...m })) : []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setLineNo('');
    setFloor('Floor 01 / Unit A');
    setActive(true);
    setTeamMembers([]);
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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Line Configuration &amp; Teams</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Define apparel production lines, floor units, and structured team staffing.
        </p>
      </div>

      {!canManageLines && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4">
          <strong>Read-Only Mode:</strong> Your role has view-only access to line setup.
        </div>
      )}

      {/* Form Card */}
      {canManageLines && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm mb-8">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {editingId ? 'Edit Line Parameters' : 'Add New Production Line'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Line Number</label>
              <input
                type="text"
                placeholder="e.g. 18 or Line 18"
                value={lineNo}
                onChange={e => setLineNo(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Floor / Unit</label>
              <input
                type="text"
                placeholder="e.g. Floor 01 / Unit A"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Team Members Section */}
          <div className="mb-5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Structured Team Members &amp; Key Operators
              </div>
              <button
                type="button"
                onClick={addTeamMemberRow}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
              >
                <Plus className="w-3 h-3" /> Add Member
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                No team members assigned to this line yet. Click "Add Member" to record key supervisors and operators.
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Member full name"
                      value={m.name}
                      onChange={e => updateMember(idx, 'name', e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                    <select
                      value={m.role}
                      onChange={e => updateMember(idx, 'role', e.target.value)}
                      className="w-36 border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white font-medium"
                    >
                      <option value="Operator">Operator</option>
                      <option value="Helper">Helper</option>
                      <option value="Iron Man">Iron Man</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeTeamMemberRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800">Line Active &amp; Ready for Production</span>
            </label>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              {editingId ? 'Update Line' : 'Add Line'}
            </button>
          </div>

          {message && (
            <p className="mt-3 text-xs font-bold text-emerald-600 text-center animate-fade-in">{message}</p>
          )}
        </form>
      )}

      {/* Configured Lines Listing */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Configured Lines ({store.lines.length})</h2>
        </div>

        <div className="space-y-3">
          {store.lines.map(line => (
            <div
              key={line.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-black text-sm">
                    L{line.lineNo}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">Line {line.lineNo}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          line.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {line.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{line.floor}</div>
                  </div>
                </div>

                {line.teamMembers && line.teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {line.teamMembers.map((member, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70"
                      >
                        {member.name} <span className="text-slate-400 font-normal">({member.role})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {canManageLines && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEdit(line)}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                    title="Edit line"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete Line ${line.lineNo}?`)) {
                          onDeleteLine(line.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
