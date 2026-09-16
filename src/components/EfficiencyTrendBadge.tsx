import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export interface EfficiencyTrendBadgeProps {
  current?: number;
  previous?: number | null;
  delta?: number | null;
  direction?: 'up' | 'down' | 'same' | 'none';
  unit?: string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  showIconOnly?: boolean;
  className?: string;
}

export const EfficiencyTrendBadge: React.FC<EfficiencyTrendBadgeProps> = ({
  current,
  previous,
  delta: providedDelta,
  direction: providedDirection,
  unit = '%',
  size = 'sm',
  showLabel = true,
  showIconOnly = false,
  className = ''
}) => {
  let delta = providedDelta;
  let direction = providedDirection;

  if (delta === undefined && current !== undefined && previous !== undefined && previous !== null) {
    delta = Math.round((current - previous) * 10) / 10;
    if (delta > 0.05) direction = 'up';
    else if (delta < -0.05) direction = 'down';
    else direction = 'same';
  }

  if (direction === undefined) {
    if (delta !== null && delta !== undefined) {
      if (delta > 0.05) direction = 'up';
      else if (delta < -0.05) direction = 'down';
      else direction = 'same';
    } else {
      direction = 'none';
    }
  }

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5'
  };

  const textSizes = {
    xs: 'text-[9px] px-1 py-0.5 gap-0.5',
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1'
  };

  if (direction === 'none' || delta === null || delta === undefined) {
    return (
      <span
        title="No previous day record for comparison"
        className={`inline-flex items-center rounded-md font-semibold bg-slate-100 text-slate-500 border border-slate-200/80 ${textSizes[size]} ${className}`}
      >
        <Minus className={`${iconSizes[size]} text-slate-400 shrink-0`} />
        {!showIconOnly && showLabel && <span className="text-[9px]">baseline</span>}
      </span>
    );
  }

  const isUp = direction === 'up';
  const isDown = direction === 'down';
  const formattedDelta = delta > 0 ? `+${delta}${unit}` : `${delta}${unit}`;

  if (isUp) {
    return (
      <span
        title={`Improved by ${formattedDelta} compared to previous day`}
        className={`inline-flex items-center font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs ${textSizes[size]} ${className}`}
      >
        <ArrowUp className={`${iconSizes[size]} text-emerald-600 shrink-0`} strokeWidth={2.75} />
        {!showIconOnly && showLabel && <span className="tabular-nums tracking-tight">{formattedDelta}</span>}
      </span>
    );
  }

  if (isDown) {
    return (
      <span
        title={`Declined by ${formattedDelta} compared to previous day`}
        className={`inline-flex items-center font-extrabold rounded-lg bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs ${textSizes[size]} ${className}`}
      >
        <ArrowDown className={`${iconSizes[size]} text-rose-600 shrink-0`} strokeWidth={2.75} />
        {!showIconOnly && showLabel && <span className="tabular-nums tracking-tight">{formattedDelta}</span>}
      </span>
    );
  }

  return (
    <span
      title="No change compared to previous day"
      className={`inline-flex items-center font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 ${textSizes[size]} ${className}`}
    >
      <Minus className={`${iconSizes[size]} text-slate-400 shrink-0`} />
      {!showIconOnly && showLabel && <span className="tabular-nums">0.0{unit}</span>}
    </span>
  );
};
