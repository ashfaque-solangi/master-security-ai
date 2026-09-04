
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Archived';
export type IncidentType = 'Intrusion' | 'Fire' | 'Vandalism' | 'Medical' | 'Maintenance' | 'Observation';

export type UserRole = 
  | 'Super Admin' 
  | 'Admin'
  | 'Operations Manager' 
  | 'Scheduler'
  | 'Site Manager'
  | 'Client'
  | 'Guard'
  | 'Subcontractor'
  | 'HR/Compliance'
  | 'Company Admin'
  | 'Dispatcher'
  | 'HR / Recruitment'
  | 'Compliance Manager'
  | 'Payroll / Finance'
  | 'Client Admin';

export type PermissionAction = 'view' | 'manage' | 'finance' | 'hr' | 'client' | 'guard' | 'schedule';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  password?: string;
  clientId?: string; 
  subcontractorId?: string;
  extraPermissions?: PermissionAction[];
};

export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  industry: string;
  settings?: Record<string, any>;
};

export type Site = {
  id: string;
  name: string;
  code: string;
  clientId: string;
  clientName: string;
  address: string;
  contactInfo: string;
  status: 'Active' | 'Inactive';
  operatingHours: string;
  requiredGuardCount: number;
  requiredRoles: string[];
  riskLevel: Severity;
  activeGuardsCount: number;
  openShifts: number;
  healthScore: number;
  revenuePerMonth: number;
  instructions?: string;
};

export type Subcontractor = {
  id: string;
  name: string;
  contactPerson?: string;
  companyReg?: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Active' | 'Inactive' | 'Approved' | 'Pending' | 'Suspended';
  rating: number;
  guardCount: number;
};

export type GuardStatus = 'Active' | 'On Break' | 'Off Duty' | 'Suspended' | 'Inactive' | 'On Leave';
export type ComplianceStatus = 'Compliant' | 'Expiring Soon' | 'Non-Compliant';

export type Guard = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: GuardStatus;
  complianceStatus: ComplianceStatus;
  roles?: string[]; 
  skills?: string[];
  qualifications?: string[];
  licenceExpiry: string;
  docsMissing: number;
  performanceScore: number;
  weeklyHours: number;
  isAvailable: boolean;
  currentSiteId?: string;
  currentSiteName?: string;
  lastLocationUpdate?: string;
  subcontractorId?: string;
  avatarUrl?: string;
};

export type ShiftAssignment = {
  guardId: string;
  guardName: string;
  role: string;
};

export type Shift = {
  id: string;
  siteId: string;
  siteName: string;
  startTime: string; 
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  status: 'Open' | 'Claimed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Published';
  priority: 'Routine' | 'Urgent' | 'STAT';
  requiredGuards: number;
  assignments: ShiftAssignment[];
};

export type Incident = {
  id: string;
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  description: string;
  timestamp: string;
};

export type Visitor = {
  id: string;
  name: string;
  company: string;
  siteName: string;
  hostName: string;
  checkIn: string;
  status: 'Expected' | 'Checked In' | 'Checked Out';
};

export type Invoice = {
  id: string;
  clientName: string;
  siteName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export type Applicant = {
  id: string;
  name: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Background Check' | 'Hired' | 'Rejected';
  appliedDate: string;
  experience: string;
};

export type Patrol = {
  id: string;
  siteName: string;
  guardName: string;
  startTime: string;
  completion: number;
  checkpoints: number;
  status: 'In Progress' | 'Completed' | 'Alert';
};

export type PayrollRecord = {
  id: string;
  guardName: string;
  period: string;
  hours: number;
  amount: number;
  status: 'Paid' | 'Pending' | 'Approved';
};

export type FormDefinition = {
  id: string;
  name: string;
  fields: number;
  lastModified: string;
  status: 'Active' | 'Draft';
};
