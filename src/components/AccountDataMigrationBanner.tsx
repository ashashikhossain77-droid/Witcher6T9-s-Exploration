import React from 'react';
import { Database, ArrowRight, RotateCcw, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getLegacyDataStats } from '../lib/account-storage';

interface AccountDataMigrationBannerProps {
  accountId: string;
  accountEmail?: string;
  onMigrate: () => void;
  onStartFresh: () => void;
  onDismiss: () => void;
}

export const AccountDataMigrationBanner: React.FC<AccountDataMigrationBannerProps> = ({
  accountId,
  accountEmail,
  onMigrate,
  onStartFresh,
  onDismiss
}) => {
  const stats = getLegacyDataStats();

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6">
      <div className="rounded-2xl border border-amber-300 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Account Data Isolation
                </span>
                <span className="text-xs font-bold text-amber-800">
                  Legacy Local Records Detected
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Found previous unassigned factory records on this browser
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Your workspace is now isolated for <strong className="text-slate-900">{accountEmail || accountId}</strong>.
                Would you like to import your previous {stats.lineEntriesCount} line entries, {stats.checklistsCount} checklists, and {stats.linesCount} production lines into this account, or start with a clean factory layout?
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={onMigrate}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Migrate to My Account
            </button>
            <button
              onClick={onStartFresh}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-amber-300 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Start Clean Demo
            </button>
            <button
              onClick={onDismiss}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-amber-100/60 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
