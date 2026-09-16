import React, { useState, useRef, useEffect } from 'react';
import { useSafeClerk as useClerk, useSafeUser as useUser } from '../lib/auth-provider';
import { PageId, UiTheme, AutoUpdateSettings, CustomRoleDefinition, RolePerson, TierDefinition, GoogleUserSession, CloudSyncState } from '../types';
import {
  Settings,
  Shield,
  User,
  Gauge,
  RefreshCw,
  Sun,
  Moon,
  Trees,
  Flame,
  Cpu,
  Check,
  Bell,
  ListTodo,
  ChevronDown,
  Layers,
  Settings2,
  Lock,
  LogOut,
  CloudLightning,
  CloudOff,
  Radio,
  Database,
  Award,
  Wrench
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  roleLabel: string;
  currentRoleKey?: string;
  pinLocked?: boolean;
  onLockApp?: () => void;
  uiTheme: UiTheme;
  onChangeTheme: (theme: UiTheme) => void;
  autoUpdate?: AutoUpdateSettings;
  onToggleAutoUpdate?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: Date;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  onSelectRole?: (roleKey: string, matchedPersonName?: string) => void;
  customRoles?: CustomRoleDefinition[];
  rolePeople?: RolePerson[];
  onOpenCreateCustomRole?: () => void;
  // Tier-based customizable system
  tiers?: TierDefinition[];
  activeTierId?: string;
  onSelectTier?: (tierId: string) => void;
  onOpenTierCustomizer?: () => void;
  // User Account & Login Options
  googleUser?: GoogleUserSession;
  onOpenGoogleAuth?: () => void;
  onGoogleSignOut?: () => void;
  // Cloud Data Sync & Live Telemetry
  cloudSyncState?: CloudSyncState;
  onOpenCloudSync?: () => void;
}

const THEME_OPTIONS: { id: UiTheme; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'light', label: 'Clean Light', icon: Sun, color: '#0284c7' },
  { id: 'dark', label: 'Twilight Dark', icon: Moon, color: '#818cf8' },
  { id: 'forest', label: 'Mint Forest', icon: Trees, color: '#059669' },
  { id: 'sunset', label: 'Warm Amber', icon: Flame, color: '#ea580c' },
  { id: 'industrial', label: 'Titanium Steel', icon: Cpu, color: '#38bdf8' }
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  roleLabel,
  currentRoleKey = 'admin',
  pinLocked,
  onLockApp,
  uiTheme,
  onChangeTheme,
  autoUpdate,
  onToggleAutoUpdate,
  onManualSync,
  isSyncing = false,
  lastSyncTime,
  onOpenNotifications,
  unreadNotificationCount = 0,
  onSelectRole,
  customRoles = [],
  rolePeople = [],
  onOpenCreateCustomRole,
  tiers = [],
  activeTierId = 'tier_1',
  onSelectTier,
  onOpenTierCustomizer,
  googleUser,
  onOpenGoogleAuth,
  onGoogleSignOut,
  cloudSyncState,
  onOpenCloudSync
}) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTier = tiers.find(t => t.id === activeTierId) || tiers[0] || {
    id: 'tier_1',
    level: 1,
    name: 'IE Operations Manager',
    shortCode: 'T1',
    color: 'violet',
    description: 'Head of Industrial Engineering',
    canManageTierLevels: [2, 3],
    allowSelfAssignment: true,
    canCreateTodos: true,
    canCreateSchedules: true,
    canEditLineData: true,
    canApproveChecklist: true
  };

  const currentThemeObj = THEME_OPTIONS.find(t => t.id === uiTheme) || THEME_OPTIONS[0];
  const CurrentThemeIcon = currentThemeObj.icon;

  const formatLastSync = (d?: Date) => {
    if (!d) return 'Just now';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fbfaf6]/95 backdrop-blur-md border-b border-[#d9d2c2] transition-colors">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#176f78] flex items-center justify-center text-white shadow-sm shadow-teal-800/20 group-hover:scale-105 transition-transform">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                <span>IE / DAILY CONTROL</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#f5e6bf] text-[#7c571f] border border-[#dfc887]">
                PROD
              </span>
            </div>
             <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
               Industrial Engineering / Apparel Systems
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Automatic Updates Live Indicator & Sync Trigger */}
          {autoUpdate && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50/90 border border-slate-200/90 rounded-xl px-2.5 py-1 text-xs">
              <button
                onClick={onToggleAutoUpdate}
                title={autoUpdate.enabled ? `Auto-Updates Active (${autoUpdate.intervalSeconds}s interval). Click to pause.` : 'Auto-Updates Paused. Click to resume.'}
                className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-600 transition"
              >
                <span className="relative flex h-2 w-2">
                  {autoUpdate.enabled && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${autoUpdate.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </span>
                 <span className="text-[11px] uppercase tracking-wider">
                  {autoUpdate.enabled ? 'Auto' : 'Paused'}
                </span>
              </button>
              <button
                onClick={onManualSync}
                title={`Last synced: ${formatLastSync(lastSyncTime)}. Click to force update.`}
                className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition hover:bg-slate-200/60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          )}

          {/* Quick Theme Selector Popover */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title={`Active Theme: ${currentThemeObj.label}. Click to change.`}
               className="h-9 px-2.5 rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] text-slate-600 hover:text-[#176f78] hover:border-[#8bb7b7] flex items-center gap-1.5 transition shadow-2xs text-xs font-semibold"
            >
              <CurrentThemeIcon className="w-4 h-4" />
              <span className="hidden md:inline text-[11px] font-medium text-slate-600">
                {currentThemeObj.label}
              </span>
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Visual Theme
                </div>
                {THEME_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = uiTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onChangeTheme(opt.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-xs text-left transition hover:bg-slate-50 ${
                        isSelected ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: opt.color }} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* To-Do & Time Scheduling Quick Link */}
          <button
            onClick={() => onNavigate('todo-schedule')}
            title={`Active System Role: ${activeTier.name} (T${activeTier.level}) - Click to manage tasks, schedules, and active tier`}
             className={`hidden sm:flex h-9 px-3 rounded-xl border items-center gap-1.5 transition shadow-2xs text-xs font-bold ${
              currentPage === 'todo-schedule'
                 ? 'bg-[#176f78] text-white border-[#176f78] shadow-xs'
                 : 'border-[#d9d2c2] bg-[#fbfaf6] text-slate-700 hover:text-[#176f78] hover:border-[#8bb7b7]'
            }`}
          >
               <span className="w-5 h-5 rounded-md bg-[#dceceb] text-[#176f78] flex items-center justify-center text-[10px] font-black">
              T{activeTier.level}
            </span>
            <span className="hidden sm:inline">Role: {activeTier.shortCode || activeTier.name}</span>
          </button>

          {/* Individual IE & Roles Monthly KPI Reports */}
          <button
            onClick={() => onNavigate('kpi-reports')}
            title="Individual IE & Roles Monthly KPI Reports"
             className={`hidden md:flex h-9 px-3 rounded-xl border items-center gap-1.5 transition shadow-2xs text-xs font-bold ${
              currentPage === 'kpi-reports'
                 ? 'bg-[#176f78] text-white border-[#176f78] shadow-xs'
                 : 'border-[#d9d2c2] bg-[#fbfaf6] text-slate-700 hover:text-[#176f78] hover:border-[#8bb7b7]'
            }`}
          >
             <Award className="w-4 h-4 text-[#176f78]" />
            <span className="hidden md:inline">Monthly KPI</span>
          </button>

          {/* Lean methods quick link */}
          <button
            onClick={() => onNavigate('lean-toolkit')}
            title="Lean Toolkit — floor methods and IE tools"
            data-testid="button-open-lean-toolkit"
            className={`hidden lg:flex h-9 px-3 rounded-xl border items-center gap-1.5 transition shadow-2xs text-xs font-bold ${
              currentPage === 'lean-toolkit'
                ? 'bg-[#176f78] text-white border-[#176f78] shadow-xs'
                : 'border-[#d9d2c2] bg-[#fbfaf6] text-slate-700 hover:text-[#176f78] hover:border-[#8bb7b7]'
            }`}
          >
            <Wrench className={`w-4 h-4 ${currentPage === 'lean-toolkit' ? 'text-white' : 'text-[#176f78]'}`} />
            <span>Lean Toolkit</span>
          </button>

          {/* Enterprise Database & Storage Center */}
          <button
            onClick={() => onNavigate('database')}
            title="Full Database & Storage Management Center"
               className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 transition shadow-2xs text-xs font-bold ${
              currentPage === 'database'
                 ? 'bg-[#176f78] text-white border-[#176f78] shadow-xs'
                 : 'border-[#d9d2c2] bg-[#fbfaf6] text-slate-700 hover:text-[#176f78] hover:border-[#8bb7b7]'
            }`}
          >
             <Database className="w-4 h-4 text-[#176f78]" />
            <span className="hidden md:inline">Database</span>
          </button>

          {/* Floor Push Notifications Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              title="Notifications & Floor Alerts"
              className="relative w-9 h-9 rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] text-slate-600 hover:text-[#176f78] hover:border-[#8bb7b7] flex items-center justify-center transition shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Live Cloud Data Sync Indicator & Trigger */}
          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              title={`Cloud Data Sync: ${cloudSyncState?.status.toUpperCase() || 'LIVE'} - ${cloudSyncState?.cloudEndpoint || 'WebSocket Connected'} (Click to manage sync)`}
               className="hidden lg:flex h-9 px-2.5 rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] hover:bg-[#f1eee6] text-slate-700 transition items-center gap-1.5 shadow-2xs text-xs font-bold"
            >
              <span className="relative flex h-2 w-2">
                {cloudSyncState?.status === 'syncing' ? (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                ) : (cloudSyncState?.status === 'live' || !cloudSyncState?.status) ? (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                ) : null}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    cloudSyncState?.status === 'live' || !cloudSyncState?.status
                      ? 'bg-emerald-500'
                      : cloudSyncState?.status === 'syncing'
                      ? 'bg-blue-500'
                      : cloudSyncState?.status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                ></span>
              </span>
               <CloudLightning className="w-3.5 h-3.5 text-[#176f78] hidden sm:inline" />
              <span className="hidden md:inline">
                {cloudSyncState?.status === 'live'
                  ? `Live (${cloudSyncState.latencyMs}ms)`
                  : cloudSyncState?.status === 'syncing'
                  ? 'Syncing...'
                  : 'Cloud Live'}
              </span>
            </button>
          )}

          {/* Clerk account control */}
          {isLoaded && user && (
            <button
              onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL || '/' })}
              title={`Signed in as ${user.fullName || user.primaryEmailAddress?.emailAddress || 'Account'} — click to sign out`}
              className="h-9 px-2.5 rounded-xl border border-[#d9d2c2] bg-[#fbfaf6] hover:bg-[#e6f0ee] text-slate-700 hover:border-[#8bb7b7] transition flex items-center gap-2 shadow-2xs"
            >
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-[#dceceb] text-[#176f78] border border-[#b8d4d1] flex items-center justify-center text-[9px] font-black">
                  {(user.firstName || user.primaryEmailAddress?.emailAddress || 'IE')
                    .split(' ')
                    .map(part => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-800 leading-none truncate max-w-[110px]">
                  {user.fullName || user.firstName || 'Account'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono leading-tight">
                  Sign out
                </span>
              </div>
              <LogOut className="w-3.5 h-3.5 text-[#176f78]" />
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => onNavigate('settings')}
            title="Settings & System Tools"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition shadow-2xs ${
              currentPage === 'settings'
                ? 'bg-blue-50 text-blue-600 border-blue-300 ring-2 ring-blue-100'
                 : 'border-[#d9d2c2] bg-[#fbfaf6] text-slate-600 hover:text-[#176f78] hover:border-[#8bb7b7]'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
