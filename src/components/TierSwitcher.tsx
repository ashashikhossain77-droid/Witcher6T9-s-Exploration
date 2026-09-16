import React, { useState } from 'react';
import { TierDefinition, GoogleUserSession } from '../types';
import {
  Layers,
  Settings2,
  Check,
  ChevronRight,
  ShieldCheck,
  User,
  Plus,
  Table,
  Eye,
  EyeOff
} from 'lucide-react';

interface TierSwitcherProps {
  tiers: TierDefinition[];
  activeTierId: string;
  onSelectTier: (tierId: string) => void;
  onOpenTierCustomizer: () => void;
  googleUser?: GoogleUserSession;
  compact?: boolean;
}

const TIER_COLOR_STYLES: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    badge: string;
    badgeText: string;
    ring: string;
  }
> = {
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-900',
    border: 'border-violet-200',
    badge: 'bg-violet-600',
    badgeText: 'text-white',
    ring: 'ring-violet-500'
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-900',
    border: 'border-sky-200',
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    ring: 'ring-sky-500'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600',
    badgeText: 'text-white',
    ring: 'ring-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badge: 'bg-amber-600',
    badgeText: 'text-white',
    ring: 'ring-amber-500'
  },
  brand: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badge: 'bg-blue-600',
    badgeText: 'text-white',
    ring: 'ring-blue-500'
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-300',
    badge: 'bg-slate-700',
    badgeText: 'text-white',
    ring: 'ring-slate-500'
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    border: 'border-rose-200',
    badge: 'bg-rose-600',
    badgeText: 'text-white',
    ring: 'ring-rose-500'
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    badge: 'bg-indigo-600',
    badgeText: 'text-white',
    ring: 'ring-indigo-500'
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-200',
    badge: 'bg-teal-600',
    badgeText: 'text-white',
    ring: 'ring-teal-500'
  }
};

export const TierSwitcher: React.FC<TierSwitcherProps> = ({
  tiers,
  activeTierId,
  onSelectTier,
  onOpenTierCustomizer,
  googleUser,
  compact = false
}) => {
  const [showMatrix, setShowMatrix] = useState(false);

  const activeTier = tiers.find(t => t.id === activeTierId) || tiers[0] || {
    id: 'tier_1',
    level: 1,
    name: 'IE Operations Manager',
    shortCode: 'T1',
    color: 'violet',
    description: 'Strategic Operations Lead',
    canManageTierLevels: [2, 3],
    allowSelfAssignment: true,
    canCreateTodos: true,
    canCreateSchedules: true,
    canEditLineData: true,
    canApproveChecklist: true
  };

  const activeColorStyle = TIER_COLOR_STYLES[activeTier.color] || TIER_COLOR_STYLES.violet;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
              Active Tier
            </span>
          </div>
          <button
            onClick={onOpenTierCustomizer}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
          >
            <Settings2 className="w-3 h-3" />
            <span>Customize Tiers</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {tiers.map(tier => {
            const isSelected = tier.id === activeTierId;
            const style = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.slate;
            return (
              <button
                key={tier.id}
                onClick={() => onSelectTier(tier.id)}
                className={`w-full p-2 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? `${style.bg} ${style.border} ring-2 ${style.ring}`
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg ${style.badge} ${style.badgeText} text-[10px] font-black flex items-center justify-center`}
                  >
                    T{tier.level}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {tier.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {tier.canManageTierLevels.length > 0
                        ? `Manages: Tiers ${tier.canManageTierLevels.join(', ')}`
                        : 'Independent Contributor'}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${activeColorStyle.badge} text-white flex items-center justify-center font-black text-sm shadow-md`}>
            {activeTier.shortCode || `T${activeTier.level}`}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Active Tier Level {activeTier.level}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-none">
                {activeTier.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeTier.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {googleUser?.isSignedIn && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-[11px] truncate max-w-[130px]">
                {googleUser.name}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Table className="w-3.5 h-3.5 text-blue-600" />
            <span>{showMatrix ? 'Hide Matrix' : 'Delegation Matrix'}</span>
          </button>
          <button
            onClick={onOpenTierCustomizer}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Customize Tiers &amp; Delegation</span>
          </button>
        </div>
      </div>

      {/* Delegation Matrix Table (Collapsible) */}
      {showMatrix && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Delegation Authority Matrix (Source Tier → Target Tier)</span>
            <span className="text-[10px] text-slate-500 font-normal">
              Green checks indicate authority to assign To-Dos &amp; shift schedules
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left bg-white border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Source Tier</th>
                  {tiers.map(target => (
                    <th key={target.id} className="p-2.5 text-center">
                      Target T{target.level}
                    </th>
                  ))}
                  <th className="p-2.5 text-center">Self-Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tiers.map(source => (
                  <tr
                    key={source.id}
                    className={source.id === activeTierId ? 'bg-blue-50/60 font-semibold' : ''}
                  >
                    <td className="p-2.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        T{source.level}
                      </span>
                      <span className="truncate">{source.name}</span>
                    </td>
                    {tiers.map(target => {
                      const canManage = source.canManageTierLevels.includes(target.level);
                      return (
                        <td key={target.id} className="p-2.5 text-center">
                          {canManage ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-center">
                      {source.allowSelfAssignment ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Selector Chips */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Switch Active Tier:</span>
          <span className="text-[10px] font-semibold text-slate-500">
            {tiers.length} Customizable Tiers Configured
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {tiers.map(tier => {
            const isSelected = tier.id === activeTierId;
            const style = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.slate;
            return (
              <button
                key={tier.id}
                onClick={() => onSelectTier(tier.id)}
                className={`p-3 rounded-2xl border text-left transition relative overflow-hidden group ${
                  isSelected
                    ? `${style.bg} ${style.border} ring-2 ${style.ring} shadow-xs`
                    : 'bg-slate-50/70 border-slate-200/90 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${style.badge} ${style.badgeText}`}
                  >
                    Tier {tier.level}
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded-full shadow-2xs">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-600">
                      Select
                    </span>
                  )}
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight mb-1 truncate">
                  {tier.name}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1">
                  {tier.description}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">
                    Delegates to:
                  </span>
                  <span className="font-bold text-slate-700">
                    {tier.canManageTierLevels.length > 0
                      ? `Tiers ${tier.canManageTierLevels.join(', ')}`
                      : 'Self Only'}
                  </span>
                </div>
              </button>
            );
          })}
          <button
            onClick={onOpenTierCustomizer}
            className="p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 text-slate-500 hover:text-blue-600 transition flex flex-col items-center justify-center text-center gap-1 group"
          >
            <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            <span className="text-xs font-bold">Add / Edit Tier</span>
            <span className="text-[10px] text-slate-400">Customize hierarchy rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
