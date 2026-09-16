import React, { useState } from 'react';
import { AppStore, CustomRoleDefinition, PageId, RolePerson } from '../types';
import { BASE_PRESETS } from '../data/initialData';
import {
  ArrowLeft,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Users,
  Check,
  X,
  UserCheck
} from 'lucide-react';

interface RoleManagementViewProps {
  store: AppStore;
  canManageRoles: boolean;
  onSavePerson: (person: RolePerson) => void;
  onDeletePerson: (id: number) => void;
  onSaveCustomRole: (role: CustomRoleDefinition) => void;
  onDeleteCustomRole: (key: string) => void;
  onNavigate: (page: PageId) => void;
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({
  store,
  canManageRoles,
  onSavePerson,
  onDeletePerson,
  onSaveCustomRole,
  onDeleteCustomRole,
  onNavigate
}) => {
  // Person form
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);
  const [personName, setPersonName] = useState('');
  const [personRoleKey, setPersonRoleKey] = useState('officer');
  const [personLinesStr, setPersonLinesStr] = useState('');
  const [personActive, setPersonActive] = useState(true);

  // Custom role form
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleLabel, setRoleLabel] = useState('');
  const [roleColor, setRoleColor] = useState<'brand' | 'violet' | 'sky' | 'emerald' | 'amber' | 'slate'>('sky');
  const [rolePerms, setRolePerms] = useState({
    edit: true,
    checklist: true,
    linedata: true,
    reports: true,
    download: true,
    audit: false,
    manageLines: false,
    export: false,
    delete: false,
    manageRoles: false
  });

  const availableRoleOptions = [
    { key: 'admin', label: 'Admin' },
    { key: 'manager', label: 'Manager' },
    { key: 'officer', label: 'IE Officer' },
    { key: 'operator', label: 'Operator' },
    { key: 'user', label: 'User' },
    ...store.customRoles.map(r => ({ key: r.key, label: r.label }))
  ];

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoles) {
      alert('Permission denied: Only Admin / Manager can manage roles.');
      return;
    }
    if (!personName.trim()) {
      alert('Please enter Person Name.');
      return;
    }

    const lines = personLinesStr
      ? personLinesStr.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean)
      : [];

    const payload: RolePerson = {
      id: editingPersonId || Date.now(),
      name: personName.trim(),
      roleKey: personRoleKey,
      lines,
      active: personActive
    };

    onSavePerson(payload);
    resetPersonForm();
  };

  const editPerson = (p: RolePerson) => {
    setEditingPersonId(p.id);
    setPersonName(p.name);
    setPersonRoleKey(p.roleKey);
    setPersonLinesStr((p.lines || []).join(', '));
    setPersonActive(p.active !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPersonForm = () => {
    setEditingPersonId(null);
    setPersonName('');
    setPersonRoleKey('officer');
    setPersonLinesStr('');
    setPersonActive(true);
  };

  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoles) return;
    if (!roleLabel.trim()) {
      alert('Please enter a Role Name.');
      return;
    }

    const key = `custom_${roleLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newRole: CustomRoleDefinition = {
      key,
      label: roleLabel.trim(),
      color: roleColor,
      defaultLines: null,
      ...rolePerms
    };

    onSaveCustomRole(newRole);
    setRoleLabel('');
    setShowRoleForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Role &amp; Line Scope Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Assign personnel to roles, restrict line scopes, and configure custom permissions.
        </p>
      </div>

      {!canManageRoles && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm p-4">
          <strong>Access Restricted:</strong> Only Admin and Manager roles can add personnel assignments or create custom roles.
        </div>
      )}

      {/* Add / Edit Person Assignment Form */}
      {canManageRoles && (
        <form onSubmit={handleSavePerson} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm mb-8">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              {editingPersonId ? 'Edit Personnel Assignment' : 'Assign Individual to Role & Line Scope'}
            </h2>
            {editingPersonId && (
              <button
                type="button"
                onClick={resetPersonForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Personnel Full Name</label>
              <input
                type="text"
                placeholder="e.g. Engr. Tanvir Hasan"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role Classification</label>
              <select
                value={personRoleKey}
                onChange={e => setPersonRoleKey(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {availableRoleOptions.map(r => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Lines (Scope)</label>
              <input
                type="text"
                placeholder="e.g. 18, 19, 20 (leave blank for all)"
                value={personLinesStr}
                onChange={e => setPersonLinesStr(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated line numbers</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={personActive}
                onChange={e => setPersonActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800">Active Assignment</span>
            </label>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              {editingPersonId ? 'Update Assignment' : 'Save Assignment'}
            </button>
          </div>
        </form>
      )}

      {/* Role Cards Grid with Assigned People & Permissions */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Active Role Matrix &amp; Personnel
          </h2>
          {canManageRoles && (
            <button
              onClick={() => setShowRoleForm(!showRoleForm)}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {showRoleForm ? 'Close Role Form' : 'Create Custom Role'}
            </button>
          )}
        </div>

        {/* Custom Role Creation Drawer */}
        {showRoleForm && canManageRoles && (
          <form onSubmit={handleSaveCustomRole} className="bg-slate-50 rounded-3xl border border-slate-200 p-5 mb-6 shadow-xs animate-fade-in">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Define New Custom Role</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 01 Chief IE"
                  value={roleLabel}
                  onChange={e => setRoleLabel(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Color Theme</label>
                <select
                  value={roleColor}
                  onChange={e => setRoleColor(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="brand">Blue</option>
                  <option value="violet">Violet</option>
                  <option value="sky">Sky Blue</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="amber">Amber</option>
                  <option value="slate">Slate Grey</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">Granted Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries({
                  edit: 'Can Edit Entries',
                  checklist: 'Daily Checklist Access',
                  linedata: 'Line Data Capture',
                  reports: 'Reports & Analytics',
                  download: 'Individual Line CSVs',
                  export: 'Full Excel Export',
                  manageLines: 'Manage Lines & Teams',
                  delete: 'Delete Records',
                  manageRoles: 'Manage Personnel & Roles',
                  audit: 'View Audit Log'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(rolePerms as any)[key]}
                      onChange={e => setRolePerms({ ...rolePerms, [key]: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
            >
              Create Role
            </button>
          </form>
        )}

        {/* Roles listing */}
        {availableRoleOptions.map(role => {
          const customDef = store.customRoles.find(r => r.key === role.key);
          const baseDef = BASE_PRESETS[role.key];
          const def = customDef || baseDef || BASE_PRESETS.user;

          const people = store.rolePeople.filter(p => p.roleKey === role.key);

          const permChips = [
            { label: 'Checklist', ok: def.checklist },
            { label: 'Line Data', ok: def.linedata },
            { label: 'Reports', ok: def.reports },
            { label: 'Download', ok: def.download },
            { label: 'Export', ok: def.export },
            { label: 'Manage Lines', ok: def.manageLines },
            { label: 'Delete', ok: def.delete },
            { label: 'Manage Roles', ok: def.manageRoles },
            { label: 'Audit Log', ok: def.audit }
          ];

          return (
            <div
              key={role.key}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden"
            >
              <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    {role.label.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{role.label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                        {people.length} {people.length === 1 ? 'person' : 'people'}
                      </span>
                      {customDef && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {permChips.map(chip => (
                        <span
                          key={chip.label}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            chip.ok
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-400 line-through'
                          }`}
                        >
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {customDef && canManageRoles && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete custom role ${role.label}?`)) {
                        onDeleteCustomRole(customDef.key);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Personnel list */}
              <div className="p-4 sm:p-5 bg-white">
                {people.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-1">
                    No personnel assigned to this role yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {people.map(person => (
                      <div
                        key={person.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {person.name[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{person.name}</span>
                            <span className="text-slate-400 ml-2">
                              Scope:{' '}
                              <strong className="text-slate-700">
                                {person.lines && person.lines.length > 0
                                  ? `Line ${person.lines.join(', Line ')}`
                                  : 'All Lines (Unrestricted)'}
                              </strong>
                            </span>
                            {!person.active && (
                              <span className="ml-2 text-rose-500 font-bold">(Inactive)</span>
                            )}
                          </div>
                        </div>

                        {canManageRoles && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => editPerson(person)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              title="Edit assignment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove assignment for ${person.name}?`)) {
                                  onDeletePerson(person.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Remove person"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
