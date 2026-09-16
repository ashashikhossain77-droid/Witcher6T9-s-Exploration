import React, { useState } from 'react';
import { TierDefinition } from '../types';
import { Shield, Check, X, Plus, Trash2, Edit2, Sliders, Layers } from 'lucide-react';

interface TierCustomizerModalProps {
  tiers: TierDefinition[];
  onSaveTiers: (tiers: TierDefinition[]) => void;
  onClose: () => void;
}

export const TierCustomizerModal: React.FC<TierCustomizerModalProps> = ({
  tiers,
  onSaveTiers,
  onClose
}) => {
  const [localTiers, setLocalTiers] = useState<TierDefinition[]>(tiers);
  const [selectedTierId, setSelectedTierId] = useState<string>(tiers[0]?.id || 'tier_1');

  const selectedTier = localTiers.find(t => t.id === selectedTierId) || localTiers[0];

  const updateSelectedTier = (updated: Partial<TierDefinition>) => {
    setLocalTiers(prev =>
      prev.map(t => (t.id === selectedTier.id ? { ...t, ...updated } : t))
    );
  };

  const handleSave = () => {
    onSaveTiers(localTiers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Customizable Tier Hierarchy &amp; Permissions</h2>
              <div className="text-xs text-slate-500">
                Configure operational authority, delegation scopes, and task editing rules
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Tier List Selector */}
          <div className="space-y-2 border-r border-slate-100 pr-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Configured Tiers
            </div>
            {localTiers.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedTierId(tier.id)}
                className={`w-full p-3 rounded-2xl text-left border transition flex items-center justify-between ${
                  tier.id === selectedTier.id
                    ? 'border-indigo-400 bg-indigo-50/60 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{tier.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Level {tier.level} • {tier.shortCode}
                  </div>
                </div>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color === 'violet' ? '#7c3aed' : tier.color === 'blue' ? '#2563eb' : '#059669' }} />
              </button>
            ))}
          </div>

          {/* Right: Selected Tier Details Form */}
          <div className="md:col-span-2 space-y-4 text-xs">
            {selectedTier && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tier Name</label>
                    <input
                      type="text"
                      value={selectedTier.name}
                      onChange={e => updateSelectedTier({ name: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Short Badge Code</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={selectedTier.shortCode}
                      onChange={e => updateSelectedTier({ shortCode: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Description / Scope</label>
                  <input
                    type="text"
                    value={selectedTier.description}
                    onChange={e => updateSelectedTier({ description: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-800 text-xs mb-2">Authority &amp; Action Permissions</div>
                  <div className="space-y-2">
                    {[
                      { key: 'canCreateTodos', label: 'Create & Assign To-Do Action Items' },
                      { key: 'canCreateSchedules', label: 'Schedule Custom Shift Timetables' },
                      { key: 'canEditLineData', label: 'Record & Modify Line Hourly Output Data' },
                      { key: 'canApproveChecklist', label: 'Approve & Audit IE Daily 12-Task Checklist' },
                      { key: 'allowSelfAssignment', label: 'Permit Self-Assignment of Floor Tasks' }
                    ].map(perm => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(selectedTier[perm.key as keyof TierDefinition])}
                          onChange={e =>
                            updateSelectedTier({ [perm.key]: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
          >
            Save Tier Hierarchy
          </button>
        </div>
      </div>
    </div>
  );
};
