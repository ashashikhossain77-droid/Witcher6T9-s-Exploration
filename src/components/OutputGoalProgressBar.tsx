import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface OutputGoalProgressBarProps {
  achieved: number;
  target: number;
  lineNo?: string;
  compact?: boolean;
  showNumbers?: boolean;
  className?: string;
}

export const OutputGoalProgressBar: React.FC<OutputGoalProgressBarProps> = ({
  achieved,
  target,
  lineNo,
  compact = false,
  showNumbers = true,
  className = ''
}) => {
  const safeTarget = Math.max(0, Number(target) || 0);
  const safeAchieved = Math.max(0, Number(achieved) || 0);
  const pct = safeTarget > 0 ? Math.round((safeAchieved / safeTarget) * 100) : 0;
  const clampedWidth = Math.min(100, Math.max(0, pct));
  const gap = safeTarget - safeAchieved;

  // Status-based visual states
  const isGoalReached = pct >= 100;
  const isClose = pct >= 80 && pct < 100;
  const isModerate = pct >= 60 && pct < 80;

  const barColor = isGoalReached
    ? 'bg-emerald-500'
    : isClose
    ? 'bg-blue-600'
    : isModerate
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const badgeColor = isGoalReached
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
    : isClose
    ? 'bg-blue-50 text-blue-800 border-blue-200/90'
    : isModerate
    ? 'bg-amber-50 text-amber-800 border-amber-200/90'
    : 'bg-rose-50 text-rose-800 border-rose-200/90';

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between gap-1.5 mb-1 text-[11px]">
          <span className="font-semibold text-slate-700 tabular-nums truncate">
            {safeAchieved.toLocaleString()} <span className="text-slate-400 font-normal">/ {safeTarget.toLocaleString()} pcs</span>
          </span>
          <span className={`px-1.5 py-0.5 rounded-md font-black text-[10px] border shrink-0 tabular-nums ${badgeColor}`}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${clampedWidth}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showNumbers && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 truncate">
            {lineNo && (
              <span className="text-xs font-black text-slate-900 shrink-0">Line {lineNo}</span>
            )}
            <span className="text-xs font-bold text-slate-800 tabular-nums truncate">
              {safeAchieved.toLocaleString()}
              <span className="text-slate-400 font-normal"> / {safeTarget.toLocaleString()} pcs</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold border tabular-nums ${badgeColor}`}>
              {pct}% Attained
            </span>
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>

      {/* Micro Footnote Context */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
        <span>Daily Output vs Target</span>
        {isGoalReached ? (
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            {gap < 0 ? `+${Math.abs(gap).toLocaleString()} pcs surplus` : 'Target reached'}
          </span>
        ) : (
          <span className="text-slate-500 font-medium">
            {gap > 0 ? `${gap.toLocaleString()} pcs to target` : 'On track'}
          </span>
        )}
      </div>
    </div>
  );
};
