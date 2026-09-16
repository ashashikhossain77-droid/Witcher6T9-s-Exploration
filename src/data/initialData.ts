import { AppStore, LineEntry, ProductionLine, RolePerson } from '../types';

export function getTodayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function getDateOffsetISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const BASE_PRESETS: Record<string, {
  label: string;
  color: 'brand' | 'violet' | 'sky' | 'emerald' | 'amber' | 'slate';
  edit: boolean;
  checklist: boolean;
  linedata: boolean;
  reports: boolean;
  download: boolean;
  audit: boolean;
  manageLines: boolean;
  export: boolean;
  delete: boolean;
  manageRoles: boolean;
  defaultLines: string[] | null;
}> = {
  admin: {
    label: 'Admin',
    color: 'brand',
    edit: true,
    checklist: true,
    linedata: true,
    reports: true,
    download: true,
    audit: true,
    manageLines: true,
    export: true,
    delete: true,
    manageRoles: true,
    defaultLines: null
  },
  manager: {
    label: 'Manager',
    color: 'violet',
    edit: true,
    checklist: true,
    linedata: true,
    reports: true,
    download: true,
    audit: true,
    manageLines: true,
    export: true,
    delete: true,
    manageRoles: true,
    defaultLines: null
  },
  officer: {
    label: 'IE Officer',
    color: 'emerald',
    edit: true,
    checklist: true,
    linedata: true,
    reports: true,
    download: true,
    audit: false,
    manageLines: false,
    export: false,
    delete: false,
    manageRoles: false,
    defaultLines: null
  },
  operator: {
    label: 'Operator',
    color: 'slate',
    edit: false,
    checklist: false,
    linedata: false,
    reports: true,
    download: false,
    audit: false,
    manageLines: false,
    export: false,
    delete: false,
    manageRoles: false,
    defaultLines: null
  },
  user: {
    label: 'User',
    color: 'slate',
    edit: false,
    checklist: false,
    linedata: false,
    reports: true,
    download: false,
    audit: false,
    manageLines: false,
    export: false,
    delete: false,
    manageRoles: false,
    defaultLines: null
  }
};

export const INITIAL_LINES: ProductionLine[] = [
  {
    id: 1,
    lineNo: '18',
    floor: 'Floor 01 / Unit A',
    teamMembers: [
      { name: 'Rina Begum', role: 'Operator' },
      { name: 'Karim Mollah', role: 'Helper' },
      { name: 'Sabbir Hossain', role: 'Iron Man' }
    ],
    active: true
  },
  {
    id: 2,
    lineNo: '19',
    floor: 'Floor 01 / Unit A',
    teamMembers: [
      { name: 'Nasima Khatun', role: 'Operator' },
      { name: 'Nila Akhter', role: 'Helper' },
      { name: 'Jahangir Alam', role: 'Supervisor' }
    ],
    active: true
  },
  {
    id: 3,
    lineNo: '20',
    floor: 'Floor 01 / Unit B',
    teamMembers: [
      { name: 'Imran Khan', role: 'Operator' },
      { name: 'Shahidul Islam', role: 'Helper' }
    ],
    active: true
  },
  {
    id: 4,
    lineNo: '21',
    floor: 'Floor 01 / Unit B',
    teamMembers: [
      { name: 'Tania Sultana', role: 'Operator' },
      { name: 'Morium Begum', role: 'Helper' }
    ],
    active: true
  },
  {
    id: 5,
    lineNo: '22',
    floor: 'Floor 01 / Unit C',
    teamMembers: [
      { name: 'Raju Ahmed', role: 'Operator' }
    ],
    active: true
  },
  {
    id: 6,
    lineNo: '23',
    floor: 'Floor 01 / Unit C',
    teamMembers: [
      { name: 'Hasina Banu', role: 'Operator' }
    ],
    active: true
  },
  {
    id: 7,
    lineNo: '24',
    floor: 'Floor 02 / Unit A',
    teamMembers: [
      { name: 'Faruk Hossain', role: 'Operator' },
      { name: 'Bilkis Akter', role: 'Helper' }
    ],
    active: true
  },
  {
    id: 8,
    lineNo: '25',
    floor: 'Floor 02 / Unit A',
    teamMembers: [
      { name: 'Shakil Mia', role: 'Operator' }
    ],
    active: true
  }
];

export const INITIAL_ROLE_PEOPLE: RolePerson[] = [
  { id: 1, name: 'Engr. Ashikur Rahman', roleKey: 'admin', lines: [], active: true },
  { id: 2, name: 'Tanvir Hasan', roleKey: 'manager', lines: [], active: true },
  { id: 3, name: 'Mahmudul Hoque', roleKey: 'officer', lines: ['18', '19', '20'], active: true },
  { id: 4, name: 'Sharmin Sultana', roleKey: 'officer', lines: ['21', '22', '24'], active: true }
];

export function getInitialData(): AppStore {
  const today = getTodayISO();
  const dMinus1 = getDateOffsetISO(-1);
  const dMinus2 = getDateOffsetISO(-2);
  const dMinus3 = getDateOffsetISO(-3);
  const dMinus4 = getDateOffsetISO(-4);
  const dMinus5 = getDateOffsetISO(-5);
  const dMinus6 = getDateOffsetISO(-6);
  const dMinus7 = getDateOffsetISO(-7);
  const dMinus8 = getDateOffsetISO(-8);
  const dMinus9 = getDateOffsetISO(-9);
  const dMinus10 = getDateOffsetISO(-10);
  const dMinus11 = getDateOffsetISO(-11);
  const dMinus12 = getDateOffsetISO(-12);
  const dMinus13 = getDateOffsetISO(-13);
  const dMinus14 = getDateOffsetISO(-14);

  const initialLineEntries: LineEntry[] = [
    {
      id: 1,
      date: today,
      lineNo: '18',
      floor: 'Floor 01 / Unit A',
      buyer: 'H&M',
      style: 'TS-2401 Crewneck',
      smv: 0.85,
      plannedMP: 40,
      workingHours: 8,
      targetEff: 85,
      targetProd: 1200,
      achievedProd: 1080,
      efficiency: 90,
      remarks: 'Smooth run, neckline attachment improved after method change',
      orderQty: 15000,
      dailyInput: 1150,
      dailyOutput: 1080,
      wip: 320,
      balancingGraph: 'day4',
      nextStyle: 'TS-2501 Winter Thermal',
      nextStyleDate: getDateOffsetISO(5),
      mp: {
        Operator: { present: 28, absent: 2 },
        Helper: { present: 8, absent: 1 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Overtime',
      balanceNotes: '2 operators worked 1 hr OT to absorb backlog',
      top5: {
        held: 'yes',
        attendance: 95,
        items: [
          'Rib attach thread tension check completed',
          'Needle break rate reduced to <0.5%',
          'Hourly output target 145 pcs aligned',
          'Helper bundle handling optimized',
          'End-line inspector feedback recorded'
        ],
        notes: 'Line supervisor confirmed all 5 actions acknowledged by batch chiefs'
      },
      bottleneck: {
        station: 'Cuff & Hem stitch',
        cycleTime: 48.5,
        targetCT: 45.0,
        status: 'ok',
        action: 'Guide attachment added to folder',
        notes: 'Within 7% of target cycle time'
      },
      timeStudy: {
        done: 'yes',
        type: 'time',
        observedRate: 142,
        standardRate: 150,
        findings: 'Operator motion efficiency 94.6%'
      },
      buildUp: {
        day: '4',
        plannedPct: 90,
        achievedPct: 90,
        operators: 39,
        notes: 'Learning curve peak achieved ahead of schedule'
      },
      lineIE: {
        name: 'Mahmudul Hoque',
        level: 'sr_executive',
        period: 'daily',
        weeklyNotes: 'On track to meet weekly shipping milestone',
        monthlyNotes: 'Consistent line efficiency >88%',
        additionalInfo: 'Line ready for upcoming audit inspection'
      }
    },
    {
      id: 2,
      date: today,
      lineNo: '19',
      floor: 'Floor 01 / Unit A',
      buyer: 'Zara',
      style: 'JK-1180 Windbreaker',
      smv: 1.25,
      plannedMP: 45,
      workingHours: 8,
      targetEff: 80,
      targetProd: 900,
      achievedProd: 720,
      efficiency: 80,
      remarks: 'Zipper insertion bottleneck addressed with temporary helper',
      orderQty: 8500,
      dailyInput: 750,
      dailyOutput: 720,
      wip: 410,
      balancingGraph: 'day2',
      nextStyle: 'JK-1200 Bomber',
      nextStyleDate: getDateOffsetISO(2),
      mp: {
        Operator: { present: 24, absent: 4 },
        Helper: { present: 6, absent: 2 },
        'Iron Man': { present: 2, absent: 1 }
      },
      balanceMethod: 'Borrowed from other line',
      balanceNotes: '2 operators borrowed from training pool',
      top5: {
        held: 'yes',
        attendance: 90,
        items: [
          'Zipper slider test done with QC',
          'Interlining fusing heat calibrated at 140°C',
          'Pocket welt placement template deployed',
          'Helper sorting tags validated',
          'WIP buffer maintained at 30 pcs'
        ],
        notes: 'Supervisor instructed on continuous piece flow'
      },
      bottleneck: {
        station: 'Front zipper attach',
        cycleTime: 62.0,
        targetCT: 52.0,
        status: 'high',
        action: 'Assigned senior multi-skilled operator',
        notes: 'Cycle time dropped from 68s to 62s'
      },
      timeStudy: {
        done: 'yes',
        type: 'production',
        observedRate: 90,
        standardRate: 112,
        findings: 'Material handling delay accounts for 4.2s per garment'
      },
      buildUp: {
        day: '2',
        plannedPct: 75,
        achievedPct: 80,
        operators: 32,
        notes: 'Target achieved despite 4 absentees'
      },
      lineIE: {
        name: 'Mahmudul Hoque',
        level: 'sr_executive',
        period: 'daily',
        weeklyNotes: 'Focus on zipper station balancing',
        monthlyNotes: 'Targeting 85% stable efficiency by Friday',
        additionalInfo: 'Fabric lot change scheduled tomorrow morning'
      }
    },
    {
      id: 3,
      date: today,
      lineNo: '20',
      floor: 'Floor 01 / Unit B',
      buyer: 'Gap',
      style: 'PL-3302 Pique Polo',
      smv: 0.95,
      plannedMP: 38,
      workingHours: 8,
      targetEff: 88,
      targetProd: 1100,
      achievedProd: 990,
      efficiency: 90,
      remarks: 'Placket folding accurate, collar rib tension stable',
      orderQty: 12000,
      dailyInput: 1050,
      dailyOutput: 990,
      wip: 180,
      balancingGraph: 'complete',
      nextStyle: 'PL-3305 Long Sleeve',
      nextStyleDate: getDateOffsetISO(8),
      mp: {
        Operator: { present: 26, absent: 1 },
        Helper: { present: 7, absent: 0 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Overtime',
      balanceNotes: 'Regular line balance maintained',
      top5: {
        held: 'yes',
        attendance: 100,
        items: [
          'Box placket stitch quality reviewed',
          'Collar point symmetry matched spec',
          'Buttons pull test passed at 90N',
          'Thread trim speed enhanced',
          'Operator fatigue reduction rest breaks'
        ],
        notes: 'Excellent teamwork and communication'
      },
      bottleneck: {
        station: 'Collar join & band',
        cycleTime: 44.0,
        targetCT: 43.5,
        status: 'ok',
        action: 'Standard gauge foot applied',
        notes: 'Very stable cycle'
      },
      timeStudy: {
        done: 'yes',
        type: 'both',
        observedRate: 128,
        standardRate: 135,
        findings: 'High pitch operator performance'
      },
      buildUp: {
        day: 'stable',
        plannedPct: 90,
        achievedPct: 90,
        operators: 36,
        notes: 'Stable production phase'
      },
      lineIE: {
        name: 'Mahmudul Hoque',
        level: 'sr_executive',
        period: 'daily',
        weeklyNotes: 'Consistently top performing line this week',
        monthlyNotes: 'Ready for lean benchmark showcase',
        additionalInfo: ''
      }
    },
    {
      id: 4,
      date: today,
      lineNo: '21',
      floor: 'Floor 01 / Unit B',
      buyer: 'H&M',
      style: 'TS-2410 V-Neck',
      smv: 0.90,
      plannedMP: 36,
      workingHours: 8,
      targetEff: 85,
      targetProd: 1000,
      achievedProd: 850,
      efficiency: 85,
      remarks: 'V-neck center point alignment monitored hourly',
      orderQty: 10000,
      dailyInput: 900,
      dailyOutput: 850,
      wip: 250,
      balancingGraph: 'day1',
      nextStyle: 'TS-2420 Henley',
      nextStyleDate: getDateOffsetISO(9),
      mp: {
        Operator: { present: 25, absent: 3 },
        Helper: { present: 7, absent: 1 },
        'Iron Man': { present: 2, absent: 0 }
      },
      balanceMethod: 'Reduced target',
      balanceNotes: 'Adjusted target for first day run',
      top5: {
        held: 'yes',
        attendance: 88,
        items: [
          'V-neck tape binding tension fixed',
          'Shoulder stay tape position checked',
          'Bottom hem twin needle guide set',
          'Bundling sequence clarified',
          'Safety guard on overlock machines'
        ],
        notes: 'Day 1 setup complete'
      },
      bottleneck: {
        station: 'V-neck insert & topstitch',
        cycleTime: 54.0,
        targetCT: 48.0,
        status: 'high',
        action: 'Pre-creasing jig supplied',
        notes: 'Expect improvement tomorrow'
      },
      timeStudy: {
        done: 'partial',
        type: 'time',
        observedRate: 106,
        standardRate: 125,
        findings: 'First day learning curve underway'
      },
      buildUp: {
        day: '1',
        plannedPct: 60,
        achievedPct: 85,
        operators: 34,
        notes: 'Better than planned first day'
      },
      lineIE: {
        name: 'Sharmin Sultana',
        level: 'executive',
        period: 'daily',
        weeklyNotes: 'Style transition completed successfully',
        monthlyNotes: 'Expected to reach 85%+ in 2 days',
        additionalInfo: ''
      }
    },
    {
      id: 5,
      date: today,
      lineNo: '24',
      floor: 'Floor 02 / Unit A',
      buyer: 'Uniqlo',
      style: 'PL-1100 Dry-Ex',
      smv: 0.80,
      plannedMP: 42,
      workingHours: 8,
      targetEff: 92,
      targetProd: 1300,
      achievedProd: 1200,
      efficiency: 92,
      remarks: 'Synthetic fabric handling optimal, zero static issues reported',
      orderQty: 20000,
      dailyInput: 1250,
      dailyOutput: 1200,
      wip: 90,
      balancingGraph: 'complete',
      nextStyle: 'PL-1150 Mesh Polo',
      nextStyleDate: getDateOffsetISO(5),
      mp: {
        Operator: { present: 30, absent: 0 },
        Helper: { present: 9, absent: 1 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Extra operators',
      balanceNotes: '1 extra floating helper deployed',
      top5: {
        held: 'yes',
        attendance: 100,
        items: [
          'Silicon spray applied to needle bars',
          'Mesh panel match points verified',
          'Heat seal brand label test approved',
          'Anti-snagging glove check enforced',
          'Inspection light intensity checked (1000 lux)'
        ],
        notes: 'Standard operating procedures fully complied'
      },
      bottleneck: {
        station: 'Raglan sleeve join',
        cycleTime: 39.0,
        targetCT: 38.0,
        status: 'ok',
        action: 'Differential feed fine-tuned',
        notes: 'Puckering eliminated'
      },
      timeStudy: {
        done: 'yes',
        type: 'time',
        observedRate: 152,
        standardRate: 160,
        findings: 'High consistency across all operators'
      },
      buildUp: {
        day: 'stable',
        plannedPct: 92,
        achievedPct: 92,
        operators: 42,
        notes: 'Target exceeded consistently'
      },
      lineIE: {
        name: 'Sharmin Sultana',
        level: 'executive',
        period: 'daily',
        weeklyNotes: 'Uniqlo auditor praised layout and visual management',
        monthlyNotes: 'Model line candidate',
        additionalInfo: ''
      }
    },
    // Historical entries for dMinus1 (previous day baseline for efficiency comparison)
    {
      id: 101,
      date: dMinus1,
      lineNo: '18',
      floor: 'Floor 01 / Unit A',
      buyer: 'H&M',
      style: 'TS-2401 Crewneck',
      smv: 0.85,
      plannedMP: 40,
      workingHours: 8,
      targetEff: 85,
      targetProd: 1200,
      achievedProd: 1044,
      efficiency: 87, // Yesterday 87% -> Today 90% (+3.0% improvement)
      remarks: 'Moderate run, minor machine needle downtime',
      orderQty: 15000,
      dailyInput: 1100,
      dailyOutput: 1044,
      wip: 350,
      balancingGraph: 'day2',
      nextStyle: 'TS-2501 Winter Thermal',
      nextStyleDate: getDateOffsetISO(6),
      mp: {
        Operator: { present: 27, absent: 3 },
        Helper: { present: 8, absent: 1 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Overtime',
      balanceNotes: '1 hr OT planned',
      top5: { held: 'yes', attendance: 90, items: ['Rib attach', 'Needle checks'], notes: 'Standard checks' },
      bottleneck: { station: 'Cuff stitch', cycleTime: 49.0, targetCT: 45.0, status: 'ok', action: 'Attachment adjusted', notes: '' },
      timeStudy: { done: 'yes', type: 'time', observedRate: 135, standardRate: 150, findings: 'Standard pace' },
      buildUp: { day: '3', plannedPct: 85, achievedPct: 87, operators: 38, notes: 'Build-up progression' },
      lineIE: { name: 'Mahmudul Hoque', level: 'sr_executive', period: 'daily', weeklyNotes: '', monthlyNotes: '', additionalInfo: '' }
    },
    {
      id: 102,
      date: dMinus1,
      lineNo: '19',
      floor: 'Floor 01 / Unit A',
      buyer: 'Zara',
      style: 'JK-1180 Windbreaker',
      smv: 1.25,
      plannedMP: 45,
      workingHours: 8,
      targetEff: 80,
      targetProd: 900,
      achievedProd: 756,
      efficiency: 84, // Yesterday 84% -> Today 80% (-4.0% decline)
      remarks: 'Zipper operator worked full shift without bottleneck',
      orderQty: 8500,
      dailyInput: 800,
      dailyOutput: 756,
      wip: 380,
      balancingGraph: 'day1',
      nextStyle: 'JK-1200 Bomber',
      nextStyleDate: getDateOffsetISO(3),
      mp: {
        Operator: { present: 26, absent: 2 },
        Helper: { present: 7, absent: 1 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Overtime',
      balanceNotes: 'Normal shift',
      top5: { held: 'yes', attendance: 92, items: ['Zipper verify'], notes: 'On target' },
      bottleneck: { station: 'Zipper install', cycleTime: 65.0, targetCT: 60.0, status: 'high', action: 'Support helper assigned', notes: '' },
      timeStudy: { done: 'yes', type: 'time', observedRate: 95, standardRate: 110, findings: 'Acceptable speed' },
      buildUp: { day: '1', plannedPct: 70, achievedPct: 84, operators: 36, notes: 'Good initial start' },
      lineIE: { name: 'Mahmudul Hoque', level: 'sr_executive', period: 'daily', weeklyNotes: '', monthlyNotes: '', additionalInfo: '' }
    },
    {
      id: 103,
      date: dMinus1,
      lineNo: '20',
      floor: 'Floor 01 / Unit B',
      buyer: 'Tommy Hilfiger',
      style: 'SH-402 Polo Pique',
      smv: 1.10,
      plannedMP: 38,
      workingHours: 8,
      targetEff: 88,
      targetProd: 1100,
      achievedProd: 1001,
      efficiency: 91, // Yesterday 91% -> Today 95% (+4.0% improvement)
      remarks: 'Steady run, minor trim check in mid-afternoon',
      orderQty: 12000,
      dailyInput: 1050,
      dailyOutput: 1001,
      wip: 210,
      balancingGraph: 'day4',
      nextStyle: 'SH-405 Long Sleeve Polo',
      nextStyleDate: getDateOffsetISO(8),
      mp: {
        Operator: { present: 25, absent: 2 },
        Helper: { present: 7, absent: 0 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Overtime',
      balanceNotes: 'Smooth operations',
      top5: { held: 'yes', attendance: 98, items: ['Placket folder'], notes: '' },
      bottleneck: { station: 'Collar join', cycleTime: 45.0, targetCT: 43.5, status: 'ok', action: '', notes: '' },
      timeStudy: { done: 'yes', type: 'both', observedRate: 122, standardRate: 135, findings: 'Efficient movement' },
      buildUp: { day: 'stable', plannedPct: 90, achievedPct: 91, operators: 35, notes: '' },
      lineIE: { name: 'Mahmudul Hoque', level: 'sr_executive', period: 'daily', weeklyNotes: '', monthlyNotes: '', additionalInfo: '' }
    },
    {
      id: 104,
      date: dMinus1,
      lineNo: '21',
      floor: 'Floor 01 / Unit B',
      buyer: 'H&M',
      style: 'TS-2410 V-Neck',
      smv: 0.90,
      plannedMP: 36,
      workingHours: 8,
      targetEff: 85,
      targetProd: 1000,
      achievedProd: 810,
      efficiency: 81, // Yesterday 81% -> Today 85% (+4.0% improvement)
      remarks: 'Initial trial runs on new neck binding jig',
      orderQty: 10000,
      dailyInput: 850,
      dailyOutput: 810,
      wip: 290,
      balancingGraph: 'day1',
      nextStyle: 'TS-2420 Henley',
      nextStyleDate: getDateOffsetISO(10),
      mp: {
        Operator: { present: 24, absent: 4 },
        Helper: { present: 6, absent: 2 },
        'Iron Man': { present: 2, absent: 0 }
      },
      balanceMethod: 'Reduced target',
      balanceNotes: 'Trial day',
      top5: { held: 'yes', attendance: 85, items: ['V-neck trial'], notes: '' },
      bottleneck: { station: 'V-neck insert', cycleTime: 57.0, targetCT: 48.0, status: 'high', action: 'Trained instructor present', notes: '' },
      timeStudy: { done: 'partial', type: 'time', observedRate: 100, standardRate: 125, findings: '' },
      buildUp: { day: '1', plannedPct: 60, achievedPct: 81, operators: 32, notes: '' },
      lineIE: { name: 'Sharmin Sultana', level: 'executive', period: 'daily', weeklyNotes: '', monthlyNotes: '', additionalInfo: '' }
    },
    {
      id: 105,
      date: dMinus1,
      lineNo: '24',
      floor: 'Floor 02 / Unit A',
      buyer: 'Uniqlo',
      style: 'PL-1100 Dry-Ex',
      smv: 0.80,
      plannedMP: 42,
      workingHours: 8,
      targetEff: 92,
      targetProd: 1300,
      achievedProd: 1235,
      efficiency: 95, // Yesterday 95% -> Today 92% (-3.0% decline)
      remarks: 'Peak record output day with zero quality rejects',
      orderQty: 20000,
      dailyInput: 1300,
      dailyOutput: 1235,
      wip: 70,
      balancingGraph: 'complete',
      nextStyle: 'PL-1150 Mesh Polo',
      nextStyleDate: getDateOffsetISO(6),
      mp: {
        Operator: { present: 30, absent: 0 },
        Helper: { present: 9, absent: 1 },
        'Iron Man': { present: 3, absent: 0 }
      },
      balanceMethod: 'Extra operators',
      balanceNotes: 'High pacing',
      top5: { held: 'yes', attendance: 100, items: ['Silicon needle', 'Anti-snagging'], notes: 'Optimal conditions' },
      bottleneck: { station: 'Raglan sleeve', cycleTime: 38.0, targetCT: 38.0, status: 'ok', action: '', notes: '' },
      timeStudy: { done: 'yes', type: 'time', observedRate: 156, standardRate: 160, findings: 'Flawless cycle' },
      buildUp: { day: 'stable', plannedPct: 92, achievedPct: 95, operators: 42, notes: '' },
      lineIE: { name: 'Sharmin Sultana', level: 'executive', period: 'daily', weeklyNotes: '', monthlyNotes: '', additionalInfo: '' }
    }
  ];

  return {
    checklists: {
      [today]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'pending', 'pending', 'pending', 'no', 'no'
      ],
      [dMinus1]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'pending', 'yes', 'yes'
      ],
      [dMinus2]: [
        'yes', 'yes', 'yes', 'yes', 'no', 'yes',
        'yes', 'yes', 'pending', 'yes', 'pending', 'yes'
      ],
      [dMinus3]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes'
      ],
      [dMinus4]: [
        'yes', 'yes', 'pending', 'yes', 'yes', 'yes',
        'no', 'yes', 'yes', 'yes', 'pending', 'yes'
      ],
      [dMinus5]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'pending', 'yes', 'yes'
      ],
      [dMinus6]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'pending',
        'yes', 'yes', 'pending', 'yes', 'yes', 'yes'
      ],
      [dMinus7]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes'
      ],
      [dMinus8]: [
        'yes', 'yes', 'yes', 'pending', 'yes', 'yes',
        'pending', 'yes', 'yes', 'yes', 'no', 'yes'
      ],
      [dMinus9]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'yes', 'pending', 'yes'
      ],
      [dMinus10]: [
        'yes', 'yes', 'yes', 'yes', 'no', 'yes',
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes'
      ],
      [dMinus11]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'pending', 'yes', 'yes'
      ],
      [dMinus12]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes'
      ],
      [dMinus13]: [
        'yes', 'yes', 'pending', 'yes', 'yes', 'yes',
        'yes', 'pending', 'yes', 'yes', 'yes', 'yes'
      ],
      [dMinus14]: [
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes',
        'yes', 'yes', 'yes', 'yes', 'yes', 'yes'
      ]
    },
    lineEntries: initialLineEntries,
    profile: {
      name: 'Ashikur Rahman',
      jobTitle: 'Senior Industrial Engineer',
      role: 'admin',
      notifications: {
        dailyReminder: true,
        complianceAlert: true,
        lineDataSummary: true,
        exportReady: false
      }
    },
    lines: INITIAL_LINES,
    rolePeople: INITIAL_ROLE_PEOPLE,
    customRoles: [],
    auditLog: [
      {
        id: 1,
        at: new Date().toISOString(),
        action: 'system_init',
        detail: 'System initialized with garment manufacturing baseline',
        role: 'admin',
        user: 'Ashikur Rahman'
      }
    ],
    security: {
      pinEnabled: false,
      pinHash: '',
      lockOnHide: false,
      restrictRoleChange: false
    },
    autoUpdate: {
      enabled: true,
      intervalSeconds: 30,
      simulateFloorFeed: false,
      notifyOnUpdate: false
    }
  };
}
