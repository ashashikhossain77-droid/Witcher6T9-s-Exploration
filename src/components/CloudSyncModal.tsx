import React, { useState } from 'react';
import { CloudSyncState } from '../types';
import { CloudLightning, RefreshCw, X, Check, Wifi, Globe, ShieldCheck, HardDrive } from 'lucide-react';

interface CloudSyncModalProps {
  syncState: CloudSyncState;
  onUpdateSyncState: (updated: Partial<CloudSyncState>) => void;
  onForceSync: () => void;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  syncState,
  onUpdateSyncState,
  onForceSync,
  onClose
}) => {
  const [endpoint, setEndpoint] = useState(syncState.cloudEndpoint || 'wss://ie-telemetry.apparelcloud.internal/v2');
  const [frequency, setFrequency] = useState(syncState.syncFrequencySeconds || 15);
  const [autoUpload, setAutoUpload] = useState(syncState.autoUploadEntries ?? true);

  const handleSave = () => {
    onUpdateSyncState({
      cloudEndpoint: endpoint,
      syncFrequencySeconds: frequency,
      autoUploadEntries: autoUpload
    });
    onForceSync();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Cloud Data Sync &amp; Telemetry</h2>
              <div className="text-[11px] text-slate-500">
                Real-time factory telemetry &amp; live line synchronization
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

        {/* Live Status Summary Card */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-black uppercase text-emerald-700">
                {syncState.status.toUpperCase()} CONNECTION
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Ping: {syncState.latencyMs || 28}ms
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Pending Queued</div>
              <div className="font-black text-slate-800 text-base">{syncState.pendingUploadCount || 0} items</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Sync Interval</div>
              <div className="font-black text-blue-600 text-base">{syncState.syncFrequencySeconds}s</div>
            </div>
          </div>
        </div>

        {/* Form Settings */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Telemetry Server Endpoint
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              Sync Cycle Frequency (Seconds)
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(parseInt(e.target.value) || 15)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
            >
              <option value="5">Every 5 Seconds (Ultra Real-Time)</option>
              <option value="15">Every 15 Seconds (Recommended)</option>
              <option value="30">Every 30 Seconds</option>
              <option value="60">Every 60 Seconds (Low Bandwidth)</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={autoUpload}
              onChange={e => setAutoUpload(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-bold text-slate-800">Auto-Push Line Entries to Central MES</div>
              <div className="text-[11px] text-slate-400">Instantly stream captured operator and SMV logs to factory servers</div>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onForceSync}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Force Sync
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            Save &amp; Connect
          </button>
        </div>
      </div>
    </div>
  );
};
