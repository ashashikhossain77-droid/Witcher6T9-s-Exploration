export const IE_TASKS = [
  "Learning Curve Plan",
  "Line Balancing Graph (1st day output - 2nd day compl)",
  "Learning Curve First 3 Days (Peak Target 70% Prod.)",
  "Line Balancing Graph 4th Day",
  "Line Estimate Report (6-7 Day)",
  "Line Study & Bottleneck Flow Analysis",
  "Next Style Input Date File Submit (Before 10 Days)",
  "T.R Sample Make Follow-up Update",
  "Floor Status Update",
  "Individual Operator Performance Tracking",
  "Kaizen Work / Continuous Improvement",
  "Running Line Efficiency % & Production"
] as const;

export type TaskStatus = 'yes' | 'pending' | 'no' | null;

export type BaseRoleKey = 'admin' | 'manager' | 'officer' | 'operator' | 'user';

export interface RolePermissions {
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
}

export interface CustomRoleDefinition extends RolePermissions {
  key: string;
}

export interface RolePerson {
  id: number;
  name: string;
  roleKey: string;
  lines: string[];
  active: boolean;
}

export interface TeamMember {
  name: string;
  role: 'Operator' | 'Helper' | 'Iron Man' | 'Supervisor' | 'Other';
}

export interface ProductionLine {
  id: number;
  lineNo: string;
  floor: string;
  teamMembers: TeamMember[];
  active: boolean;
}

export interface ManpowerDetail {
  present: number;
  absent: number;
}

export interface Top5MeetingData {
  held: 'yes' | 'no' | 'partial' | '';
  attendance: number;
  items: string[];
  notes: string;
}

export interface BottleneckData {
  station: string;
  cycleTime: number;
  targetCT: number;
  status: 'ok' | 'high' | 'critical' | '';
  action: string;
  notes: string;
}

export interface TimeStudyData {
  done: 'yes' | 'no' | 'partial' | '';
  type: 'time' | 'production' | 'both' | '';
  observedRate: number;
  standardRate: number;
  findings: string;
}

export interface BuildUpData {
  day: '1' | '2' | '3' | '4' | '5' | 'stable' | '';
  plannedPct: number;
  achievedPct: number;
  operators: number;
  notes: string;
}

export interface LineIEData {
  name: string;
  level: 'jr_executive' | 'executive' | 'sr_executive';
  period: 'daily' | 'weekly' | 'monthly' | 'additional';
  weeklyNotes: string;
  monthlyNotes: string;
  additionalInfo: string;
}

export interface LineEntry {
  id: number;
  date: string;
  lineNo: string;
  floor: string;
  buyer: string;
  style: string;
  smv: number;
  plannedMP: number;
  workingHours: number;
  targetEff: number;
  targetProd: number;
  achievedProd: number;
  efficiency: number;
  remarks: string;
  orderQty: number;
  dailyInput: number;
  dailyOutput: number;
  wip: number;
  balancingGraph: 'pending' | 'day1' | 'day2' | 'day4' | 'complete';
  nextStyle: string;
  nextStyleDate: string;
  mp: {
    Operator: ManpowerDetail;
    Helper: ManpowerDetail;
    'Iron Man': ManpowerDetail;
  };
  balanceMethod: string;
  balanceNotes: string;
  top5: Top5MeetingData;
  bottleneck: BottleneckData;
  timeStudy: TimeStudyData;
  buildUp: BuildUpData;
  lineIE: LineIEData;
}

export interface UserProfile {
  name: string;
  jobTitle: string;
  role: string;
  notifications: {
    dailyReminder: boolean;
    complianceAlert: boolean;
    lineDataSummary: boolean;
    exportReady: boolean;
  };
}

export interface SecuritySettings {
  pinEnabled: boolean;
  pinHash: string;
  lockOnHide: boolean;
  restrictRoleChange: boolean;
}

export interface AuditLogItem {
  id: number;
  at: string;
  action: string;
  detail: string;
  role: string;
  user: string;
}

export interface AppStore {
  checklists: Record<string, TaskStatus[]>;
  lineEntries: LineEntry[];
  profile: UserProfile;
  lines: ProductionLine[];
  rolePeople: RolePerson[];
  customRoles: CustomRoleDefinition[];
  auditLog: AuditLogItem[];
  security: SecuritySettings;
  autoUpdate?: AutoUpdateSettings;
}

export type PageId =
  | 'dashboard'
  | 'checklist'
  | 'linedata'
  | 'monthly'
  | 'reports'
  | 'line-management'
  | 'role-management'
  | 'settings'
  | 'data-export'
  | 'profile';

export type UiDensity = 'comfortable' | 'compact';
export type UiTheme = 'light' | 'dark' | 'forest' | 'sunset' | 'industrial';

export interface AutoUpdateSettings {
  enabled: boolean;
  intervalSeconds: number; // 15, 30, 60, 120
  simulateFloorFeed: boolean;
  notifyOnUpdate: boolean;
}

export interface DashboardLayoutSettings {
  showHero: boolean;
  showStats: boolean;
  showQuickActions: boolean;
  showAbsents: boolean;
  showBalancingGraph: boolean;
  showIO: boolean;
  showUpcoming: boolean;
}
