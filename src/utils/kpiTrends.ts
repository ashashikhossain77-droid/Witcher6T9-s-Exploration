import { LineEntry } from '../types';

export interface EfficiencyTrendResult {
  currentEff: number;
  prevEff: number | null;
  delta: number | null;
  direction: 'up' | 'down' | 'same' | 'none';
  prevDate: string | null;
}

export type LineEfficiencyTrend = EfficiencyTrendResult;

/**
 * Calculates efficiency comparison for a specific production line vs its previous recorded day.
 * Flexible signature supports:
 *   (lineNo, currentDate, entries) OR (entries, lineNo, currentDate)
 */
export function getLineEfficiencyTrend(
  arg1: string | LineEntry[],
  arg2: string,
  arg3?: LineEntry[] | string
): EfficiencyTrendResult {
  let lineNo: string;
  let currentDate: string;
  let entries: LineEntry[];

  if (Array.isArray(arg1)) {
    entries = arg1;
    lineNo = arg2;
    currentDate = typeof arg3 === 'string' ? arg3 : '';
  } else {
    lineNo = arg1;
    currentDate = arg2;
    entries = Array.isArray(arg3) ? arg3 : [];
  }

  const lineEntries = entries
    .filter(e => e.lineNo === lineNo)
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  const currentEntry = (currentDate ? lineEntries.find(e => e.date === currentDate) : null) || lineEntries[0];
  if (!currentEntry) {
    return { currentEff: 0, prevEff: null, delta: null, direction: 'none', prevDate: null };
  }

  // Find the entry strictly before currentEntry.date
  const prevEntry = lineEntries.find(e => e.date < currentEntry.date);
  if (!prevEntry || prevEntry.efficiency == null) {
    return {
      currentEff: currentEntry.efficiency || 0,
      prevEff: null,
      delta: null,
      direction: 'none',
      prevDate: null
    };
  }

  const currentEff = currentEntry.efficiency;
  const prevEff = prevEntry.efficiency;
  const delta = Math.round((currentEff - prevEff) * 10) / 10;
  let direction: 'up' | 'down' | 'same' = 'same';
  if (delta > 0.05) direction = 'up';
  else if (delta < -0.05) direction = 'down';

  return {
    currentEff,
    prevEff,
    delta,
    direction,
    prevDate: prevEntry.date
  };
}

/**
 * Calculates overall factory average efficiency trend comparing latest recorded day vs previous day.
 */
export function getOverallEfficiencyTrend(
  entries: LineEntry[],
  referenceDate?: string
): {
  currentAvg: number;
  prevAvg: number | null;
  delta: number | null;
  direction: 'up' | 'down' | 'same' | 'none';
  currentDate: string | null;
  prevDate: string | null;
} {
  const dates = Array.from(new Set(entries.map(e => e.date))).sort().reverse();
  if (dates.length === 0) {
    return { currentAvg: 0, prevAvg: null, delta: null, direction: 'none', currentDate: null, prevDate: null };
  }

  const currDate = referenceDate && dates.includes(referenceDate) ? referenceDate : dates[0];
  const currEntries = entries.filter(e => e.date === currDate);
  const currentAvg = currEntries.length > 0
    ? Math.round((currEntries.reduce((sum, e) => sum + (e.efficiency || 0), 0) / currEntries.length) * 10) / 10
    : 0;

  // Find previous date
  const prevDate = dates.find(d => d < currDate) || null;
  if (!prevDate) {
    return { currentAvg, prevAvg: null, delta: null, direction: 'none', currentDate: currDate, prevDate: null };
  }

  const prevEntries = entries.filter(e => e.date === prevDate);
  const prevAvg = prevEntries.length > 0
    ? Math.round((prevEntries.reduce((sum, e) => sum + (e.efficiency || 0), 0) / prevEntries.length) * 10) / 10
    : null;

  if (prevAvg === null) {
    return { currentAvg, prevAvg: null, delta: null, direction: 'none', currentDate: currDate, prevDate };
  }

  const delta = Math.round((currentAvg - prevAvg) * 10) / 10;
  let direction: 'up' | 'down' | 'same' = 'same';
  if (delta > 0.05) direction = 'up';
  else if (delta < -0.05) direction = 'down';

  return {
    currentAvg,
    prevAvg,
    delta,
    direction,
    currentDate: currDate,
    prevDate
  };
}
