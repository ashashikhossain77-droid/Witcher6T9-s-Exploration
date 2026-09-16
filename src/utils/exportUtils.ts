import * as XLSX from 'xlsx';
import { AppStore, IE_TASKS, LineEntry } from '../types';

export function downloadBlob(content: string | Blob, filename: string, mime: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function toCSV(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          const s = cell == null ? '' : String(cell);
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        })
        .join(',')
    )
    .join('\n');
}

export function generateChecklistRows(store: AppStore): (string | number)[][] {
  const header = [
    'Date',
    ...IE_TASKS.map((t, i) => `Task ${i + 1}: ${t}`),
    'Yes (Completed)',
    'Pending',
    'No (Not Done)',
    'Compliance %'
  ];
  const rows: (string | number)[][] = [header];
  const dates = Object.keys(store.checklists).sort();
  for (const date of dates) {
    const cl = store.checklists[date] || [];
    const yes = cl.filter(s => s === 'yes').length;
    const pending = cl.filter(s => s === 'pending').length;
    const no = cl.filter(s => s === 'no').length;
    const compliance = Math.round((yes / 12) * 100);
    rows.push([
      date,
      ...Array.from({ length: 12 }, (_, i) => (cl[i] || 'unmarked').toUpperCase()),
      yes,
      pending,
      no,
      compliance
    ]);
  }
  return rows;
}

export function generateLineDataRows(store: AppStore): (string | number)[][] {
  const header = [
    'Date',
    'Line No',
    'Floor/Unit',
    'Buyer',
    'Style',
    'SMV',
    'Planned MP',
    'Working Hours',
    'Target Eff %',
    'Target Prod',
    'Achieved Prod',
    'Efficiency %',
    'Order Qty',
    'Daily Input',
    'Daily Output',
    'WIP',
    'Balancing Graph Status',
    'Next Style',
    'Next Style Date',
    'Operator Present',
    'Operator Absent',
    'Helper Present',
    'Helper Absent',
    'Iron Man Present',
    'Iron Man Absent',
    'Balance Method',
    'Balance Notes',
    'Top5 Held',
    'Top5 Attendance %',
    'Bottleneck Station',
    'Cycle Time (sec)',
    'Target CT (sec)',
    'CT Status',
    'Time Study Done',
    'Time Study Type',
    'Build-Up Day',
    'Build-Up Achieved %',
    'Line IE Officer',
    'IE Level',
    'Tracking Period',
    'Remarks'
  ];
  const rows: (string | number)[][] = [header];
  for (const e of store.lineEntries) {
    const t5 = e.top5 || { held: '', attendance: 0 };
    const bn = e.bottleneck || { station: '', cycleTime: 0, targetCT: 0, status: '' };
    const ts = e.timeStudy || { done: '', type: '' };
    const bu = e.buildUp || { day: '', achievedPct: 0 };
    const ie = e.lineIE || { name: '', level: 'executive', period: 'daily' };
    const op = e.mp?.Operator || { present: 0, absent: 0 };
    const hlp = e.mp?.Helper || { present: 0, absent: 0 };
    const im = e.mp?.['Iron Man'] || { present: 0, absent: 0 };

    rows.push([
      e.date,
      e.lineNo,
      e.floor,
      e.buyer,
      e.style,
      e.smv,
      e.plannedMP,
      e.workingHours,
      e.targetEff,
      e.targetProd,
      e.achievedProd,
      e.efficiency,
      e.orderQty || 0,
      e.dailyInput || 0,
      e.dailyOutput || 0,
      e.wip || 0,
      e.balancingGraph || 'pending',
      e.nextStyle || '',
      e.nextStyleDate || '',
      op.present,
      op.absent,
      hlp.present,
      hlp.absent,
      im.present,
      im.absent,
      e.balanceMethod || '',
      e.balanceNotes || '',
      t5.held,
      t5.attendance,
      bn.station,
      bn.cycleTime,
      bn.targetCT,
      bn.status,
      ts.done,
      ts.type,
      bu.day,
      bu.achievedPct,
      ie.name,
      ie.level,
      ie.period,
      e.remarks || ''
    ]);
  }
  return rows;
}

export function exportChecklistsCSV(store: AppStore, dateStr: string) {
  const rows = generateChecklistRows(store);
  downloadBlob(toCSV(rows), `IE_Checklist_History_${dateStr}.csv`, 'text/csv;charset=utf-8');
}

export function exportChecklistsXLSX(store: AppStore, dateStr: string) {
  const rows = generateChecklistRows(store);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Checklist');
  XLSX.writeFile(wb, `IE_Checklist_History_${dateStr}.xlsx`);
}

export function exportLineDataCSV(store: AppStore, dateStr: string) {
  const rows = generateLineDataRows(store);
  downloadBlob(toCSV(rows), `IE_Line_Production_Data_${dateStr}.csv`, 'text/csv;charset=utf-8');
}

export function exportLineDataXLSX(store: AppStore, dateStr: string) {
  const rows = generateLineDataRows(store);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Line Production Data');
  XLSX.writeFile(wb, `IE_Line_Production_Data_${dateStr}.xlsx`);
}

export function exportFullWorkbookXLSX(store: AppStore, dateStr: string) {
  const wb = XLSX.utils.book_new();

  // 1. Checklist History
  const clRows = generateChecklistRows(store);
  const clWs = XLSX.utils.aoa_to_sheet(clRows);
  XLSX.utils.book_append_sheet(wb, clWs, 'Daily Checklists');

  // 2. Line Production Data
  const lineRows = generateLineDataRows(store);
  const lineWs = XLSX.utils.aoa_to_sheet(lineRows);
  XLSX.utils.book_append_sheet(wb, lineWs, 'Line Production Data');

  // 3. Lines Configuration
  const linesHeader = ['Line No', 'Floor / Unit', 'Active', 'Team Members'];
  const linesData = [
    linesHeader,
    ...store.lines.map(l => [
      l.lineNo,
      l.floor,
      l.active ? 'Yes' : 'No',
      (l.teamMembers || []).map(m => `${m.name} (${m.role})`).join('; ')
    ])
  ];
  const linesWs = XLSX.utils.aoa_to_sheet(linesData);
  XLSX.utils.book_append_sheet(wb, linesWs, 'Lines Setup');

  XLSX.writeFile(wb, `IE_Tracking_Full_Workbook_${dateStr}.xlsx`);
}

export function exportSingleLineCSV(entry: LineEntry, track: 'manpower' | 'production' | 'bottleneck' | 'top5' | 'full') {
  const line = entry.lineNo || 'Unassigned';
  const date = entry.date;
  const mp = entry.mp || {
    Operator: { present: 0, absent: 0 },
    Helper: { present: 0, absent: 0 },
    'Iron Man': { present: 0, absent: 0 }
  };
  let rows: (string | number)[][] = [];
  let filename = `Line_${line}_${date}_${track}`;

  if (track === 'manpower') {
    rows = [
      ['Line Manpower & Absenteeism Balancing Report'],
      ['Line Number', line],
      ['Date', date],
      ['Floor / Unit', entry.floor || ''],
      ['Buyer & Style', `${entry.buyer} - ${entry.style}`],
      [],
      ['Role', 'Present Headcount', 'Absent Headcount', 'Total Allocated'],
      ['Operator', mp.Operator.present, mp.Operator.absent, mp.Operator.present + mp.Operator.absent],
      ['Helper', mp.Helper.present, mp.Helper.absent, mp.Helper.present + mp.Helper.absent],
      ['Iron Man', mp['Iron Man'].present, mp['Iron Man'].absent, mp['Iron Man'].present + mp['Iron Man'].absent],
      [],
      ['Balancing Action Method', entry.balanceMethod || 'N/A'],
      ['Balancing Action Details', entry.balanceNotes || 'N/A']
    ];
  } else if (track === 'production') {
    rows = [
      ['Line Production & Input/Output Summary'],
      ['Line Number', line],
      ['Date', date],
      ['Total Order Quantity', entry.orderQty || 0],
      ['Daily Input (Cut Pcs Loaded)', entry.dailyInput || 0],
      ['Daily Output (Finished Pcs)', entry.dailyOutput || entry.achievedProd || 0],
      ['WIP (Work In Progress in Line)', entry.wip || 0],
      ['Standard Minute Value (SMV)', entry.smv || 0],
      ['Target Production', entry.targetProd || 0],
      ['Achieved Production', entry.achievedProd || 0],
      ['Line Efficiency %', `${entry.efficiency || 0}%`]
    ];
  } else if (track === 'bottleneck') {
    const bn = entry.bottleneck || { station: '', cycleTime: 0, targetCT: 0, status: '', action: '', notes: '' };
    rows = [
      ['Bottleneck Analysis & Cycle Time Report'],
      ['Line Number', line],
      ['Date', date],
      ['Bottleneck Station / Operation', bn.station || 'None Identified'],
      ['Observed Cycle Time (seconds)', bn.cycleTime || 0],
      ['Target Takt / Cycle Time (seconds)', bn.targetCT || 0],
      ['Cycle Time Status', bn.status.toUpperCase()],
      ['Corrective Action Taken', bn.action || 'None'],
      ['Engineering Remarks', bn.notes || 'None']
    ];
  } else if (track === 'top5') {
    const t5 = entry.top5 || { held: '', attendance: 0, items: [], notes: '' };
    rows = [
      ['Daily Top 5 Meeting Monitoring'],
      ['Line Number', line],
      ['Date', date],
      ['Meeting Conducted', t5.held.toUpperCase()],
      ['Attendance %', `${t5.attendance}%`],
      ['Follow-up Notes', t5.notes || ''],
      [],
      ['#', 'Top Quality / Productivity Issue & Action Assigned']
    ];
    (t5.items || []).forEach((item, idx) => {
      rows.push([idx + 1, item || '']);
    });
  } else {
    // Full
    rows = [
      ['Industrial Engineering Complete Line Dossier'],
      ['Line Number', line],
      ['Date', date],
      ['Floor / Unit', entry.floor || ''],
      ['Buyer', entry.buyer || ''],
      ['Style Name / PO', entry.style || ''],
      ['SMV', entry.smv],
      ['Target Production', entry.targetProd],
      ['Achieved Production', entry.achievedProd],
      ['Efficiency %', `${entry.efficiency}%`],
      ['Order Quantity', entry.orderQty || 0],
      ['Daily Input', entry.dailyInput || 0],
      ['Daily Output', entry.dailyOutput || 0],
      ['WIP', entry.wip || 0],
      ['Balancing Graph Status', entry.balancingGraph],
      ['Next Style', entry.nextStyle || 'N/A'],
      ['Next Style Date', entry.nextStyleDate || 'N/A'],
      ['Line IE Officer', entry.lineIE?.name || 'Unassigned'],
      ['IE Officer Level', entry.lineIE?.level || 'N/A'],
      ['Supervisor / IE Remarks', entry.remarks || '']
    ];
  }

  downloadBlob(toCSV(rows), `${filename}.csv`, 'text/csv;charset=utf-8');
}
