import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Filter,
  Layers3,
  Lightbulb,
  ListChecks,
  MoveRight,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Wrench
} from 'lucide-react';
import {
  LEAN_TOOLS_META,
  LeanToolMeta,
  LeanMethodId,
  LeanToolkitState,
  PointOfWorkAction,
  INITIAL_LEAN_STATE
} from '../data/leanToolkitInitialData';
import {
  loadLeanToolkitState,
  saveLeanToolkitState,
  addPointOfWorkAction,
  togglePointOfWorkAction,
  deletePointOfWorkAction
} from '../lib/lean-storage';
import { PointOfWorkActionsPanel } from './lean/PointOfWorkActionsPanel';
import { MethodDetailModal } from './lean/MethodDetailModal';

const ACCENT_STYLES: Record<string, { icon: string; marker: string; wash: string; badge: string }> = {
  teal: {
    icon: 'bg-[#dceceb] text-[#176f78]',
    marker: 'bg-[#176f78]',
    wash: 'group-hover:bg-[#f0f8f6]',
    badge: 'bg-[#dceceb] text-[#176f78]'
  },
  orange: {
    icon: 'bg-[#f8e5d7] text-[#b85f2b]',
    marker: 'bg-[#e6813e]',
    wash: 'group-hover:bg-[#fff7f1]',
    badge: 'bg-[#f8e5d7] text-[#b85f2b]'
  },
  gold: {
    icon: 'bg-[#f5e9c8] text-[#926a1f]',
    marker: 'bg-[#c9982f]',
    wash: 'group-hover:bg-[#fffbef]',
    badge: 'bg-[#f5e9c8] text-[#926a1f]'
  },
  slate: {
    icon: 'bg-[#e5eaeb] text-[#3f5a60]',
    marker: 'bg-[#527078]',
    wash: 'group-hover:bg-[#f5f8f8]',
    badge: 'bg-[#e5eaeb] text-[#3f5a60]'
  }
};

interface LeanToolkitViewProps {
  accountId?: string;
  availableLines?: string[];
}

export const LeanToolkitView: React.FC<LeanToolkitViewProps> = ({
  accountId = 'default',
  availableLines = ['01', '02', '03', '04', '05', '06']
}) => {
  const [leanState, setLeanState] = useState<LeanToolkitState>(() =>
    loadLeanToolkitState(accountId)
  );
  const [selectedTool, setSelectedTool] = useState<LeanToolMeta | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Re-load if account changes
  useEffect(() => {
    setLeanState(loadLeanToolkitState(accountId));
  }, [accountId]);

  // Sync state helper
  const handleUpdateState = (updater: (prev: LeanToolkitState) => LeanToolkitState) => {
    setLeanState(prev => {
      const next = updater(prev);
      saveLeanToolkitState(accountId, next);
      return next;
    });
  };

  const handleAddAction = (actionData: Omit<PointOfWorkAction, 'id' | 'createdAt'>) => {
    const updated = addPointOfWorkAction(accountId, leanState, actionData);
    setLeanState(updated);
  };

  const handleToggleAction = (actionId: string) => {
    const updated = togglePointOfWorkAction(accountId, leanState, actionId);
    setLeanState(updated);
  };

  const handleDeleteAction = (actionId: string) => {
    const updated = deletePointOfWorkAction(accountId, leanState, actionId);
    setLeanState(updated);
  };

  // Open modal for a method
  const handleSelectMethodById = (methodId: LeanMethodId) => {
    const found = LEAN_TOOLS_META.find(m => m.id === methodId);
    if (found) {
      setSelectedTool(found);
    }
  };

  // Filter tools
  const filteredTools = useMemo(() => {
    return LEAN_TOOLS_META.filter(tool => {
      if (categoryFilter !== 'all' && tool.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = tool.title.toLowerCase().includes(query);
        const matchesDesc = tool.description.toLowerCase().includes(query);
        const matchesTip = tool.walkTip.toLowerCase().includes(query);
        const matchesMetric = tool.focusMetric.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesTip || matchesMetric;
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  // Stats calculation
  const totalActions = leanState.activeActions.length;
  const pendingActions = leanState.activeActions.filter(a => a.status !== 'completed').length;
  const completedActions = totalActions - pendingActions;

  return (
    <section className="min-h-[calc(100dvh-72px)] px-3 py-5 sm:px-5 sm:py-7 lg:px-8" data-testid="page-lean-toolkit">
      <div className="mx-auto max-w-[1320px] space-y-6">
        {/* Header Hero Banner */}
        <div className="surface-grid relative overflow-hidden rounded-[1.6rem] border border-[#d9d2c2] bg-[#f1eee6] px-4 py-5 shadow-[0_10px_36px_rgba(23,52,58,0.06)] sm:px-7 sm:py-7 lg:px-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[22px] border-[#e6813e]/10" />
          <div className="pointer-events-none absolute right-12 top-12 hidden h-24 w-24 rounded-full border border-[#176f78]/10 sm:block" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#176f78]" data-testid="text-lean-kicker">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Floor Methods / Industrial Engineering</span>
              </div>
              <h1 className="font-display text-[2.4rem] font-bold uppercase leading-[0.9] tracking-tight text-[#17343a] sm:text-5xl" data-testid="text-lean-title">
                Lean Toolkit
              </h1>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#527078] sm:text-[15px]" data-testid="text-lean-intro">
                Twelve practical methods for the production walk — built to keep the next action clear at the point of work.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] px-3 py-2 shadow-2xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e6813e]/50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e6813e]" />
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#17343a]">
                  12 Active Methods
                </span>
              </div>

              <div className="rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] px-3 py-2 text-[11px] font-bold text-[#176f78] shadow-2xs">
                <span className="font-mono">{pendingActions}</span> pending walk actions
              </div>
            </div>
          </div>
        </div>

        {/* Unified Point-of-Work Actions Summary Panel */}
        <PointOfWorkActionsPanel
          actions={leanState.activeActions}
          onToggleAction={handleToggleAction}
          onDeleteAction={handleDeleteAction}
          onAddAction={handleAddAction}
          onSelectMethod={handleSelectMethodById}
          availableLines={availableLines}
        />

        {/* Filter and Search Bar for Methods */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-[#17343a] text-white shadow-2xs'
                  : 'bg-[#f1eee6] text-[#527078] hover:bg-[#e7e1d5]'
              }`}
            >
              All 12 Methods
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('flow-standard')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                categoryFilter === 'flow-standard'
                  ? 'bg-[#176f78] text-white shadow-2xs'
                  : 'bg-[#f1eee6] text-[#527078] hover:bg-[#e7e1d5]'
              }`}
            >
              Flow & Standard Work
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('quality-waste')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                categoryFilter === 'quality-waste'
                  ? 'bg-[#e6813e] text-white shadow-2xs'
                  : 'bg-[#f1eee6] text-[#527078] hover:bg-[#e7e1d5]'
              }`}
            >
              Quality & Waste (Kaizen)
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('equipment-support')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                categoryFilter === 'equipment-support'
                  ? 'bg-[#926a1f] text-white shadow-2xs'
                  : 'bg-[#f1eee6] text-[#527078] hover:bg-[#e7e1d5]'
              }`}
            >
              Equipment & Setup
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9aa9a9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search methods, tips, metrics..."
              className="w-full rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] py-1.5 pl-8 pr-3 text-xs text-[#17343a] placeholder:text-[#9aa9a9] focus:border-[#176f78] focus:outline-hidden"
            />
          </div>
        </div>

        {/* 12 Practical Methods Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="lean-toolkit-grid">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            const accent = ACCENT_STYLES[tool.accent] || ACCENT_STYLES.teal;
            const methodActionsCount = leanState.activeActions.filter(
              a => a.methodId === tool.id && a.status !== 'completed'
            ).length;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedTool(tool)}
                data-testid={`lean-tool-card-${tool.id}`}
                aria-label={`Open ${tool.title} interactive tool`}
                className={`group animate-rise-in relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-[#d9d2c2] bg-[#fbfaf6] p-4 text-left shadow-[0_4px_14px_rgba(23,52,58,0.045)] transition-all duration-200 hover:-translate-y-1 hover:border-[#8bb7b7] hover:shadow-[0_12px_24px_rgba(23,52,58,0.11)] active:translate-y-0 ${accent.wash}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.icon} shadow-2xs`}>
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {methodActionsCount > 0 && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-800">
                          {methodActionsCount} open
                        </span>
                      )}
                      <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#9aa9a9]">
                        {tool.index}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3.5">
                    <h2
                      className="font-display text-[1.25rem] font-bold uppercase leading-tight tracking-tight text-[#17343a]"
                      data-testid={`text-lean-tool-title-${tool.id}`}
                    >
                      {tool.title}
                    </h2>
                    <p
                      className="mt-1 text-xs leading-[1.4] text-[#527078]"
                      data-testid={`text-lean-tool-description-${tool.id}`}
                    >
                      {tool.description}
                    </p>
                  </div>

                  {/* Walk Tip Callout on card */}
                  <div className="mt-3 rounded-lg bg-[#f1eee6]/80 p-2 text-[11px] text-[#527078] leading-tight flex items-start gap-1.5">
                    <Lightbulb className="h-3 w-3 text-[#e6813e] shrink-0 mt-0.5" />
                    <span>{tool.walkTip}</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f1eee6]">
                  <span className="font-mono text-[9px] font-bold uppercase text-[#176f78] truncate max-w-[130px]">
                    {tool.focusMetric}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#176f78] opacity-80 group-hover:opacity-100">
                    Open Tool <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                {/* Accent line */}
                <span
                  className={`absolute bottom-0 left-0 h-1 w-12 rounded-r-full ${accent.marker} transition-all duration-200 group-hover:w-24`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] p-3 text-xs text-[#527078]" data-testid="text-lean-footer-note">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-[#e6813e]" />
            <span>
              All 12 methods are interactive. Open any card to calculate, tally, or log point-of-work actions for this walk.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase text-[#176f78]">
            Workspace isolated to active account
          </span>
        </div>
      </div>

      {/* Interactive Detail & Action Workspace Modal */}
      {selectedTool && (
        <MethodDetailModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          state={leanState}
          onUpdateState={handleUpdateState}
          onAddPointOfWorkAction={handleAddAction}
          onTogglePointOfWorkAction={handleToggleAction}
          availableLines={availableLines}
        />
      )}
    </section>
  );
};
