import React, { useState } from 'react';
import {
  AppStore,
  PageId,
  UiTheme,
  UiDensity,
  DashboardLayoutSettings,
  AutoUpdateSettings
} from '../types';
import {
  ArrowLeft,
  User,
  Lock,
  Palette,
  Layout,
  Database,
  Volume2,
  Check,
  Shield,
  RefreshCw,
  Trash2,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { playIEAudioChime } from '../utils/notificationService';

interface SettingsViewProps {
  store: AppStore;
  onUpdateProfile: (profile: AppStore['profile']) => void;
  uiTheme: UiTheme;
  onChangeTheme: (theme: UiTheme) => void;
  uiDensity: UiDensity;
  onChangeDensity: (density: UiDensity) => void;
  dashLayout: DashboardLayoutSettings;
  onChangeDashLayout: (layout: DashboardLayoutSettings) => void;
  autoUpdate: AutoUpdateSettings;
  onChangeAutoUpdate: (autoUpdate: AutoUpdateSettings) => void;
  onSetPin?: (pin: string | null) => void;
  onOpenGoogleAuth?: () => void;
  onNavigate: (page: PageId) => void;
  onResetToDemoData: () => void;
  onImportStoreJSON: (imported: AppStore) => void;
  accountId?: string;
  accountEmail?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  store,
  onUpdateProfile,
  uiTheme,
  onChangeTheme,
  uiDensity,
  onChangeDensity,
  dashLayout,
  onChangeDashLayout,
  autoUpdate,
  onChangeAutoUpdate,
  onSetPin,
  onOpenGoogleAuth,
  onNavigate,
  onResetToDemoData,
  onImportStoreJSON,
  accountId = 'ashikur.rahman.0971@gmail.com',
  accountEmail = 'ashikur.rahman.0971@gmail.com'
}) => {
  const [profile, setProfile] = useState(store.profile);
  const [statusMsg, setStatusMsg] = useState('');

  const safeDashLayout: DashboardLayoutSettings = {
    showHero: true,
    showStats: true,
    showQuickActions: true,
    showAbsents: true,
    showBalancingGraph: true,
    showIO: true,
    showUpcoming: true,
    ...(dashLayout || {})
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setStatusMsg('Profile updated successfully ✓');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `IE_Tracking_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.lineEntries && parsed.checklists) {
          onImportStoreJSON(parsed);
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        {statusMsg && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {statusMsg}
          </span>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Settings &amp; Preferences</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure engineer profile, security PIN, dashboard cards, visual themes, and local backups.
        </p>
      </div>

      {/* Engineer Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Industrial Engineer Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Engineer Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation</label>
            <input
              type="text"
              value={profile.jobTitle}
              onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={e => setProfile({ ...profile, department: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Factory Unit / Building</label>
            <input
              type="text"
              value={profile.factoryUnit}
              onChange={e => setProfile({ ...profile, factoryUnit: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* User Authentication & Google Workspace Sign-In */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              User Account &amp; Google Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authenticate via Google Workspace or Corporate Engineer Profile to persist audits, sign reports, and unlock tier permissions.
            </p>
          </div>

          {onOpenGoogleAuth && (
            <button
              onClick={onOpenGoogleAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-2 shadow-xs shrink-0"
            >
              <User className="w-4 h-4" />
              <span>{store.googleUser?.isSignedIn ? 'Manage Account' : 'Sign In with Google'}</span>
            </button>
          )}
        </div>

        {/* Active Session Info */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#dceceb] text-[#176f78] border border-[#b8d4d1] flex items-center justify-center text-xs font-black">
              {(store.googleUser?.name || 'Guest Engineer').split(' ').map(part => part[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {store.googleUser?.isSignedIn ? store.googleUser.name : 'Not Signed In (Guest Mode)'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {store.googleUser?.isSignedIn
                  ? `${store.googleUser.email || 'Corporate Engineer'} • Provider: ${store.googleUser.authProvider?.toUpperCase() || 'GOOGLE'}`
                  : 'Open access terminal mode'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                store.googleUser?.isSignedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {store.googleUser?.isSignedIn ? 'Active Session' : 'Guest'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Theme & Density */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-teal-600" />
          Appearance &amp; Display Density
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Visual Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: 'Clean Light' },
                  { id: 'dark', label: 'Twilight Dark' },
                  { id: 'forest', label: 'Mint Forest' },
                  { id: 'sunset', label: 'Amber Warm' },
                  { id: 'industrial', label: 'Titanium' }
                ] as const
              ).map(t => (
                <button
                  key={t.id}
                  onClick={() => onChangeTheme(t.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    uiTheme === t.id
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{t.label}</span>
                  {uiTheme === t.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">UI Density</label>
            <div className="flex gap-2">
              {(
                [
                  { id: 'compact', label: 'Compact (High Density)' },
                  { id: 'normal', label: 'Comfortable' }
                ] as const
              ).map(d => (
                <button
                  key={d.id}
                  onClick={() => onChangeDensity(d.id)}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    uiDensity === d.id
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{d.label}</span>
                  {uiDensity === d.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Layout Customizer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Layout className="w-5 h-5 text-amber-500" />
          Dashboard Card Visibility
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Choose which metrics and tracking modules appear on your home overview.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'showHero', label: 'Overall Compliance Hero Card' },
            { key: 'showStats', label: 'Done / Pending / No Status Counter' },
            { key: 'showQuickActions', label: 'Quick Core Module Navigation' },
            { key: 'showAbsents', label: 'Line-wise Absenteeism & Attendance' },
            { key: 'showBalancingGraph', label: 'Line Balancing Graph Status' },
            { key: 'showIO', label: 'Order • Input / Output • WIP Flow' },
            { key: 'showUpcoming', label: 'Upcoming Styles 10-Day Alert' }
          ].map(w => (
            <label
              key={w.key}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800"
            >
              <input
                type="checkbox"
                checked={Boolean(safeDashLayout[w.key as keyof DashboardLayoutSettings])}
                onChange={e =>
                  onChangeDashLayout({
                    ...safeDashLayout,
                    [w.key]: e.target.checked
                  })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>{w.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Audio Sound & Notification Testing */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-600" />
          Floor Sound &amp; Chime Verification
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Test synthetic audio cues used for shift alerts, bottleneck warnings, and task completions.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => playIEAudioChime('chime')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
          >
            Play General Chime
          </button>
          <button
            onClick={() => playIEAudioChime('success')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition"
          >
            Play Success Chime
          </button>
          <button
            onClick={() => playIEAudioChime('alert')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-800 transition"
          >
            Play Alert Alarm
          </button>
        </div>
      </div>

      {/* Full Database & Storage Management Center */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Enterprise Database &amp; Storage Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect database tables, manage local persistence, perform diagnostics, or export JSON backups.
            </p>
          </div>

          <button
            onClick={() => onNavigate('database')}
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>Open Full Database Center</span>
            <span>→</span>
          </button>
        </div>

        {/* Quick Database Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Hourly Line Records</span>
            <span className="text-base font-black text-slate-900">{store.lineEntries?.length || 0} Entries</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Checklists</span>
            <span className="text-base font-black text-emerald-700">{Object.keys(store.checklists || {}).length} Dates</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Master Production Lines</span>
            <span className="text-base font-black text-blue-700">{store.lines?.length || 0} Lines</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Database Status</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy (Online)
            </span>
          </div>
        </div>

        {/* Account Workspace Isolation & Cross-Device Persistence */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Account Isolated Workspace</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Partition: <code className="font-bold text-indigo-700">{accountEmail}</code> — Line records, checklists, and roles are isolated and synced across devices.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
              Cross-device server sync ready
            </span>
          </div>
        </div>

        {/* Database Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Export JSON Snapshot
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-blue-600" />
            Restore JSON Snapshot
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={() => onNavigate('database')}
            className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Database className="w-4 h-4 text-blue-600" />
            Inspect All Database Records
          </button>

          <button
            onClick={() => {
              if (confirm('Reset application data to initial demo factory state? Any custom line entries will be replaced.')) {
                onResetToDemoData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition flex items-center gap-1.5 ml-auto shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            Reset to Demo Records
          </button>
        </div>
      </div>
    </div>
  );
};
