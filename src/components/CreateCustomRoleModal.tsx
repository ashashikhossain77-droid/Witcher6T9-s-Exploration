import React, { useState } from 'react';
import { CustomRoleDefinition } from '../types';
import { Shield, Check, X, Plus, Sparkles } from 'lucide-react';

interface CreateCustomRoleModalProps {
  onSaveRole: (role: CustomRoleDefinition) => void;
  onClose: () => void;
}

export const CreateCustomRoleModal: React.FC<CreateCustomRoleModalProps> = ({
  onSaveRole,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [canEdit, setCanEdit] = useState(true);
  const [canExport, setCanExport] = useState(true);
  const [canDelete, setCanDelete] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canManageLines, setCanManageLines] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a Role Title');
      return;
    }

    const key = `role_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newRole: CustomRoleDefinition = {
      key,
      label: title.trim(),
      title: title.trim(),
      description: description.trim() || 'Custom plant operational role',
      color,
      edit: canEdit,
      canEdit,
      export: canExport,
      canExport,
      delete: canDelete,
      canDelete,
      manageRoles: canManageUsers,
      canManageUsers,
      manageLines: canManageLines,
      canManageLines,
      isCustom: true
    };

    onSaveRole(newRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Create Custom Role</h2>
              <div className="text-[11px] text-slate-500">Define bespoke permissions &amp; designations</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs flex-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Role Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Method Study Lead"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Conducts motion cycle audits on cutting and sewing"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Permissions Granted</label>
            <div className="space-y-2">
              {[
                { label: 'Can Edit Line Data & Checklist', val: canEdit, set: setCanEdit },
                { label: 'Can Export CSV & Excel Workbooks', val: canExport, set: setCanExport },
                { label: 'Can Delete Records & Entries', val: canDelete, set: setCanDelete },
                { label: 'Can Configure Production Lines', val: canManageLines, set: setCanManageLines },
                { label: 'Can Manage User Roles & Tiers', val: canManageUsers, set: setCanManageUsers }
              ].map((p, idx) => (
                <label key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.val}
                    onChange={e => p.set(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              Save Custom Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
