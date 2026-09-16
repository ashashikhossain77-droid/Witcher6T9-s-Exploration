import React, { useState } from 'react';
import { AppStore, PageId, UserProfile } from '../types';
import { ArrowLeft, User, Bell, Check, Save } from 'lucide-react';

interface ProfileViewProps {
  store: AppStore;
  onSaveProfile: (profile: UserProfile) => void;
  onNavigate: (page: PageId) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  store,
  onSaveProfile,
  onNavigate
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => ({
    name: store.profile.name || '',
    jobTitle: store.profile.jobTitle || '',
    role: store.profile.role || 'admin',
    notifications: {
      dailyReminder: store.profile.notifications?.dailyReminder ?? true,
      complianceAlert: store.profile.notifications?.complianceAlert ?? true,
      lineDataSummary: store.profile.notifications?.lineDataSummary ?? true,
      exportReady: store.profile.notifications?.exportReady ?? false
    }
  }));

  const [savedMsg, setSavedMsg] = useState(false);

  const availableRoles = [
    { key: 'admin', label: 'Admin (Full Access)' },
    { key: 'manager', label: 'IE Manager' },
    { key: 'officer', label: 'IE Officer (Floor Lines)' },
    { key: 'operator', label: 'Operator (View Only)' },
    { key: 'user', label: 'Standard User (View Only)' },
    ...store.customRoles.map(r => ({ key: r.key, label: `${r.label} (Custom)` }))
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User Profile &amp; Role</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure engineer identity, permission role, and daily alert notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ashikur Rahman"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Designation</label>
            <input
              type="text"
              placeholder="e.g. Senior Industrial Engineer"
              value={profile.jobTitle}
              onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Active User Role</label>
            <select
              value={profile.role}
              onChange={e => setProfile({ ...profile, role: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
            >
              {availableRoles.map(r => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select your operative role. Admin and Manager have full control over lines and custom roles.
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-blue-600" />
            Notification &amp; Alert Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={profile.notifications.dailyReminder}
                onChange={e =>
                  setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, dailyReminder: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Daily Checklist Incomplete Alert</div>
                <div className="text-[11px] text-slate-500">
                  Banner on dashboard when today's 12 IE tasks are pending or unmarked
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={profile.notifications.complianceAlert}
                onChange={e =>
                  setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, complianceAlert: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Low Compliance Warnings</div>
                <div className="text-[11px] text-slate-500">Highlight warning badges when task completion dips below 80%</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={profile.notifications.lineDataSummary}
                onChange={e =>
                  setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, lineDataSummary: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Daily Production &amp; WIP Summaries</div>
                <div className="text-[11px] text-slate-500">Show floor aggregate tiles and manpower balancing status</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>

          {savedMsg && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" /> Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
