import React, { useState } from 'react';
import { TierDefinition, RolePerson, CustomRoleDefinition } from '../types';
import { DEFAULT_CUSTOMIZABLE_TIERS } from '../data/initialData';
import {
  Layers,
  Settings2,
  Check,
  CheckCircle2,
  ShieldCheck,
  Users,
  Briefcase,
  ChevronRight,
  Clock,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck2,
  SlidersHorizontal,
  Table,
  Trash2,
  Edit3,
  Eye,
  Lock
} from 'lucide-react';

export interface ActiveRoleSwitcherProps {
  // Tier-based props
  tiers?: TierDefinition[];
  activeTierId?: string;
  onSelectTier?: (tierId: string) => void;
  onOpenTierCustomizer?: () => void;
  // Role-based props
  currentRole?: string;
  onSelectRole?: (roleKey: string, matchedPersonName?: string) => void;
  rolePeople?: RolePerson[];
  customRoles?: CustomRoleDefinition[];
  onOpenCreateCustomRole?: () => void;
  // Display mode
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
    lightBadge: string;
  }
> = {
  violet: {
    bg: 'bg-violet-50/70',
    text: 'text-violet-900',
    border: 'border-violet-200',
    badge: 'bg-violet-600',
    badgeText: 'text-white',
    ring: 'ring-violet-500/30',
    lightBadge: 'bg-violet-100 text-violet-800'
  },
  sky: {
    bg: 'bg-sky-50/70',
    text: 'text-sky-900',
    border: 'border-sky-200',
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    ring: 'ring-sky-500/30',
    lightBadge: 'bg-sky-100 text-sky-800'
  },
  emerald: {
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600',
    badgeText: 'text-white',
    ring: 'ring-emerald-500/30',
    lightBadge: 'bg-emerald-100 text-emerald-800'
  },
  amber: {
    bg: 'bg-amber-50/70',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badge: 'bg-amber-600',
    badgeText: 'text-white',
    ring: 'ring-amber-500/30',
    lightBadge: 'bg-amber-100 text-amber-800'
  },
  brand: {
    bg: 'bg-blue-50/70',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badge: 'bg-blue-600',
    badgeText: 'text-white',
    ring: 'ring-blue-500/30',
    lightBadge: 'bg-blue-100 text-blue-800'
  },
  indigo: {
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    badge: 'bg-indigo-600',
    badgeText: 'text-white',
    ring: 'ring-indigo-500/30',
    lightBadge: 'bg-indigo-100 text-indigo-800'
  },
  slate: {
    bg: 'bg-slate-50/70',
    text: 'text-slate-900',
    border: 'border-slate-200',
    badge: 'bg-slate-600',
    badgeText: 'text-white',
    ring: 'ring-slate-500/30',
    lightBadge: 'bg-slate-100 text-slate-800'
  }
};

export const ActiveRoleSwitcher: React.FC<ActiveRoleSwitcherProps> = ({
  tiers = DEFAULT_CUSTOMIZABLE_TIERS,
  activeTierId,
  onSelectTier,
  onOpenTierCustomizer,
  currentRole = 'admin',
  onSelectRole,
  rolePeople = [],
  onOpenCreateCustomRole,
  compact = false
}) => {
  const [showMatrixTable, setShowMatrixTable] = useState(false);
  const [justSwitchedTier, setJustSwitchedTier] = useState<string | null>(null);

  // Determine current active tier
  const currentActiveTierId =
    activeTierId ||
    (currentRole === 'manager'
      ? 'tier_1'
      : currentRole === 'assistant_manager'
      ? 'tier_2'
      : currentRole === 'officer'
      ? 'tier_3'
      : tiers[0]?.id || 'tier_1');

  const activeTier = tiers.find(t => t.id === currentActiveTierId) || tiers[0] || {
    id: 'tier_1',
    level: 1,
    name: 'IE Operations Manager',
    shortCode: 'T1',
    color: 'violet',
    description: 'Head of Industrial Engineering & Strategic Operations',
    canManageTierLevels: [2, 3, 4],
    allowSelfAssignment: true,
    canCreateTodos: true,
    canCreateSchedules: true,
    canEditLineData: true,
    canApproveChecklist: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canManageLines: true,
    canManageRoles: true,
    systemRoleKey: 'admin'
  };

  const activeColorStyle = TIER_COLOR_STYLES[activeTier.color] || TIER_COLOR_STYLES.violet;

  // Active Tier is the Active System Role & Permission!
  const handleSelectTier = (tier: TierDefinition) => {
    if (onSelectTier) {
      onSelectTier(tier.id);
    }

    // Determine equivalent system role key
    const roleKey = tier.systemRoleKey || (
      tier.level === 1 ? 'admin' :
      tier.level === 2 ? 'manager' :
      tier.level === 3 ? 'ie_officer' : 'junior_ie'
    );

    if (onSelectRole) {
      const matched = rolePeople.find(p => p.roleKey === roleKey || p.name.toLowerCase().includes(tier.name.toLowerCase()));
      onSelectRole(roleKey, matched?.name);
    }

    setJustSwitchedTier(tier.id);
    setTimeout(() => setJustSwitchedTier(null), 2500);
  };

  // Compact Mode (for top bars or toolbars)
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Active Role &amp; Tier:
        </span>
        {tiers.map(tier => {
          const isSelected = tier.id === currentActiveTierId;
          const style = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.slate;
          return (
            <button
              key={tier.id}
              onClick={() => handleSelectTier(tier)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-md text-[10px] font-black flex items-center justify-center ${
                  isSelected ? 'bg-white/20 text-white' : `${style.badge} text-white`
                }`}
              >
                T{tier.level}
              </span>
              <span>{tier.shortCode || tier.name}</span>
              {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
            </button>
          );
        })}
        {onOpenTierCustomizer && (
          <button
            onClick={onOpenTierCustomizer}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition shrink-0"
            title="Manage Tiers & Delegation Matrix"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-sm shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Active System Role &amp; Operational Tier
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Unified RBAC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your operational tier to immediately activate its system permissions, line editing privileges, and floor delegation authority.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowMatrixTable(!showMatrixTable)}
            className="text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl border border-slate-200 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showMatrixTable ? 'Hide Matrix' : 'Delegation Matrix'}</span>
          </button>
          {onOpenTierCustomizer && (
            <button
              type="button"
              onClick={onOpenTierCustomizer}
              className="text-xs font-bold text-blue-700 hover:bg-blue-100 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Customize Tiers &amp; Hierarchy</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CURRENT ACTIVE STATUS & PERMISSION BANNER */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${activeColorStyle.border} ${activeColorStyle.bg} transition-all`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl ${activeColorStyle.badge} text-white font-black text-base flex items-center justify-center shadow-sm shrink-0`}
            >
              T{activeTier.level}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-black text-slate-900">{activeTier.name}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${activeColorStyle.lightBadge} border border-current/20`}>
                  Active System Tier {activeTier.level}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 uppercase font-bold shadow-2xs">
                  Role: {activeTier.systemRoleKey || currentRole}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {activeTier.description}
              </p>
            </div>
          </div>

          {/* System Permissions Summary Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
            <div className="bg-white/95 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">System Edit</span>
              <span className={`font-bold flex items-center gap-1 ${activeTier.canEdit !== false ? 'text-emerald-700' : 'text-slate-500'}`}>
                {activeTier.canEdit !== false ? (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>Full Edit</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Read Only</span>
                  </>
                )}
              </span>
            </div>
            <div className="bg-white/95 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Delete &amp; Purge</span>
              <span className={`font-bold flex items-center gap-1 ${activeTier.canDelete ? 'text-emerald-700' : 'text-slate-400'}`}>
                {activeTier.canDelete ? (
                  <>
                    <Trash2 className="w-3 h-3" />
                    <span>Authorized</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Protected</span>
                  </>
                )}
              </span>
            </div>
            <div className="bg-white/95 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Checklist Sign-off</span>
              <span className={`font-bold flex items-center gap-1 ${activeTier.canApproveChecklist ? 'text-emerald-700' : 'text-slate-500'}`}>
                {activeTier.canApproveChecklist ? (
                  <>
                    <CheckSquare className="w-3 h-3" />
                    <span>Authorized</span>
                  </>
                ) : (
                  <span>Submit Only</span>
                )}
              </span>
            </div>
            <div className="bg-white/95 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Delegation Reach</span>
              <span className="font-extrabold text-blue-700">
                {activeTier.canManageTierLevels && activeTier.canManageTierLevels.length > 0
                  ? `Tiers ${activeTier.canManageTierLevels.join(', ')}`
                  : 'Self Only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SWITCH ACTIVE OPERATIONAL TIER & SYSTEM ROLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Switch Active Operational Tier &amp; System Role
            </h3>
            <span className="text-xs text-slate-400">
              (Click any card to immediately assume its role and permissions)
            </span>
          </div>
          {justSwitchedTier && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl animate-in fade-in flex items-center gap-1.5 shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Active System Role &amp; Tier Switched
            </span>
          )}
        </div>

        {/* Quick Pill Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tiers.map(tier => {
            const isSelected = tier.id === currentActiveTierId;
            const style = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.slate;
            return (
              <button
                key={tier.id}
                onClick={() => handleSelectTier(tier)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? `${style.badge} text-white border-transparent ring-2 ${style.ring}`
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : `${style.badge} text-white`
                  }`}
                >
                  T{tier.level}
                </span>
                <span>{tier.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Detailed Tier & System Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map(tier => {
            const isSelected = tier.id === currentActiveTierId;
            const style = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.slate;
            return (
              <div
                key={tier.id}
                onClick={() => handleSelectTier(tier)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? `${style.bg} ${style.border} ring-2 ${style.ring} shadow-md`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: Level badge + Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-xl ${style.badge} text-white font-black text-xs flex items-center justify-center shadow-2xs`}
                      >
                        T{tier.level}
                      </span>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                          <span>{tier.name}</span>
                          {tier.shortCode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {tier.shortCode}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          Tier Level {tier.level}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Active Role
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        Click to Activate
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {tier.description}
                  </p>

                  {/* System Role Badge */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">System Role:</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {tier.systemRoleKey || (tier.level === 1 ? 'admin' : tier.level === 2 ? 'manager' : tier.level === 3 ? 'ie_officer' : 'junior_ie')}
                    </span>
                  </div>

                  {/* Permissions Checklist on Card */}
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-slate-400" /> System Edit
                      </span>
                      <span className={`font-bold ${tier.canEdit !== false ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {tier.canEdit !== false ? 'Full' : 'Read-Only'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Trash2 className="w-3 h-3 text-slate-400" /> Deletion &amp; Reset
                      </span>
                      <span className={`font-bold ${tier.canDelete ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {tier.canDelete ? 'Authorized' : 'Restricted'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-slate-400" /> Checklist Sign-off
                      </span>
                      <span className={`font-bold ${tier.canApproveChecklist ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {tier.canApproveChecklist ? 'Authorized' : 'Submit Only'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> Manages Tiers
                      </span>
                      <span className="font-bold text-slate-700">
                        {tier.canManageTierLevels && tier.canManageTierLevels.length > 0
                          ? `T${tier.canManageTierLevels.join(', T')}`
                          : 'Self Only'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTier(tier);
                    }}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active System Role</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Switch to Role &amp; Tier {tier.level}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DELEGATION AUTHORITY MATRIX TABLE (TOGGLEABLE) */}
      {showMatrixTable && (
        <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-blue-600" />
              <span>Delegation Authority Cross-Reference Matrix</span>
            </div>
            <span className="text-[10px] text-slate-400">Green = Authorized to delegate tasks &amp; schedules</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Source Tier / System Role</th>
                  {tiers.map(target => (
                    <th key={target.id} className="p-2.5 text-center">
                      Target T{target.level} ({target.shortCode || target.name})
                    </th>
                  ))}
                  <th className="p-2.5 text-center">Self-Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tiers.map(source => {
                  const isRowActive = source.id === currentActiveTierId;
                  return (
                    <tr
                      key={source.id}
                      className={isRowActive ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/60'}
                    >
                      <td className="p-2.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                          T{source.level}
                        </span>
                        <div>
                          <span className="text-slate-900 font-bold block leading-tight">{source.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">Role: {source.systemRoleKey || 'user'}</span>
                        </div>
                        {isRowActive && (
                          <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full ml-auto">
                            Active
                          </span>
                        )}
                      </td>
                      {tiers.map(target => {
                        const canManage = source.canManageTierLevels && source.canManageTierLevels.includes(target.level);
                        return (
                          <td key={target.id} className="p-2.5 text-center">
                            {canManage ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                ✓
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center">
                        {source.allowSelfAssignment !== false ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
