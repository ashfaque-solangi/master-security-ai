export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Archived';
export type IncidentType = 'Intrusion' | 'Fire' | 'Vandalism' | 'Medical' | 'Maintenance' | 'Observation';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COMPANY_ADMIN'
  | 'OPERATIONS_MANAGER' 
  | 'DISPATCHER'
  | 'SCHEDULER'
  | 'SITE_MANAGER'
  | 'HR_MANAGER'
  | 'COMPLIANCE_MANAGER'
  | 'FINANCE_MANAGER'
  | 'GUARD'
  | 'CLIENT_ADMIN'
  | 'CLIENT_VIEWER'
  | 'SUBCONTRACTOR_ADMIN';

export type PermissionAction = 'view' | 'manage' | 'finance' | 'hr' | 'client' | 'guard' | 'schedule' | 'audit' | 'location' | 'ai';

export type User = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  password?: string;
  clientId?: string; 
  siteIds?: string[];
  subcontractorId?: string;
  guardId?: string;
  extraPermissions?: PermissionAction[];
};

export type SessionStatus = 'Active' | 'LoggedOut' | 'Revoked' | 'Expired';

export type UserSession = {
  id: string;
  userId: string;
  userName: string;
  organizationId: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  status: SessionStatus;
};

export interface DashboardDefinition {
  id: string;
  title: string;
  description: string;
  allowedRoles: UserRole[];
  requiredPermissions?: PermissionAction[];
  icon: any;
  priority: number;
}

export type DocumentType = 'SOP' | 'POST_ORDER' | 'RISK_ASSESSMENT' | 'CONTRACT' | 'LICENCE' | 'CERTIFICATE' | 'ID' | 'TRAINING';

export type MockDocument = {
  id: string;
  organizationId: string;
  clientId?: string;
  siteId?: string;
  name: string;
  type: DocumentType;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Current' | 'Archived' | 'Draft';
  expiryDate?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  scope: 'Site' | 'Client' | 'Global';
};

export type Contract = {
  id: string;
  organizationId: string;
  clientId: string;
  siteId?: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Draft' | 'Terminated';
  billingRate: number;
  guardRate: number;
  requiredHours: number;
  kpis: string[];
  sla: string;
  penalties: string;
};

export type Client = {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  industry: string;
  accountOwner?: string;
};

export type Site = {
  id: string;
  organizationId: string;
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
  requiredSkills: string[];
  requiredQualifications: string[];
  riskLevel: Severity;
  activeGuardsCount: number;
  openShifts: number;
  healthScore: number;
  revenuePerMonth: number;
  instructions?: string;
  patrolFrequency?: string;
  patrolType?: string;
};

export type Subcontractor = {
  id: string;
  organizationId: string;
  name: string;
  contactPerson?: string;
  companyReg?: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Active' | 'Inactive' | 'Approved' | 'Pending' | 'Suspended';
  rating: number;
  guardCount: number;
};

export type GuardStatus = 'Active' | 'On Break' | 'Off Duty' | 'Suspended' | 'Inactive' | 'On Leave' | 'Applicant';
export type ComplianceStatus = 'Compliant' | 'Expiring Soon' | 'Non-Compliant';

export type Guard = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  status: GuardStatus;
  complianceStatus: ComplianceStatus;
  qualifiedRoles: string[];
  skills: string[];
  licenceExpiry: string;
  docsMissing: number;
  performanceScore: number;
  weeklyHours: number;
  isAvailable: boolean;
  preferredSites?: string[];
  unavailableDates?: string[];
  recruitmentStage?: RecruitmentStage;
};

export type RecruitmentStage = 
  | 'JOB_POSTED' | 'APPLICATION' | 'SHORTLISTED' | 'INTERVIEW' 
  | 'DOCUMENT_COLLECTION' | 'VALIDATION' | 'VERIFICATION' 
  | 'CONTRACT' | 'TRAINING' | 'ONBOARDING' | 'ACTIVE' | 'REJECTED';

export type Applicant = {
  id: string;
  organizationId: string;
  jobPostId: string;
  name: string;
  email: string;
  phone: string;
  currentStage: RecruitmentStage;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedDate: string;
  experience: string;
  notes: string;
};

export type ShiftAssignment = {
  id: string;
  guardId: string;
  guardName: string;
  rolePerformed: string;
  status: 'Assigned' | 'Confirmed' | 'In Transit' | 'On Site';
  assignedAt: string;
  assignedBy: string;
  checkInTime?: string;
  checkOutTime?: string;
};

export type RoleRequirement = {
  role: string;
  count: number;
};

export type Shift = {
  id: string;
  organizationId: string;
  siteId: string;
  siteName: string;
  startTime: string; 
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  status: 'Open' | 'Claimed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Published';
  priority: 'Routine' | 'Urgent' | 'STAT';
  requirements: RoleRequirement[];
  assignments: ShiftAssignment[];
  role: string; 
};

export type Incident = {
  id: string;
  organizationId: string;
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

export type SOSAlert = {
  id: string;
  organizationId: string;
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  timestamp: string;
  status: 'Active' | 'Resolved';
  severity: 'Critical';
};

export type Alarm = {
  id: string;
  organizationId: string;
  siteId: string;
  siteName: string;
  type: string;
  severity: Severity;
  timestamp: string;
  status: 'Active' | 'Resolved';
};

export type Vehicle = {
  id: string;
  organizationId: string;
  name: string;
  status: 'Active' | 'Idle' | 'Maintenance' | 'Offline';
  siteId?: string;
  lastUpdate: string;
};

export type Visitor = {
  id: string;
  siteId: string;
  name: string;
  company: string;
  siteName: string;
  hostName: string;
  checkIn: string;
  status: 'Expected' | 'Checked In' | 'Checked Out';
};

export type Invoice = {
  id: string;
  organizationId: string;
  clientName: string;
  siteName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
};

export type Patrol = {
  id: string;
  siteId: string;
  siteName: string;
  guardName: string;
  startTime: string;
  completion: number;
  checkpoints: number;
  status: 'In Progress' | 'Completed' | 'Alert' | 'Scheduled' | 'Delayed' | 'Missed';
};

export type PayrollRecord = {
  id: string;
  organizationId: string;
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

export type LeaveRecord = {
  id: string;
  guardId: string;
  type: 'Sick' | 'Annual' | 'Compassionate' | 'Emergency Leave';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
};

export type AuditAction = 
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'ROLE_ASSIGNED'
  | 'GUARD_CREATED' | 'GUARD_UPDATED' | 'GUARD_STATUS_CHANGED'
  | 'CLIENT_CREATED' | 'CLIENT_UPDATED'
  | 'SITE_CREATED' | 'SITE_UPDATED'
  | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_DELETED' | 'SHIFT_PUBLISHED' | 'SHIFT_RESCHEDULED'
  | 'GUARD_ASSIGNED' | 'GUARD_REMOVED' | 'GUARD_REPLACED'
  | 'CONFLICT_DETECTED' | 'AI_SCHEDULING_RUN' | 'AI_ASSIGNMENT_PROPOSED'
  | 'SWAP_REQUESTED' | 'SWAP_APPROVED' | 'SWAP_REJECTED'
  | 'ASSIGNMENT_REJECTED'
  | 'USER_LOGIN' | 'USER_LOGOUT' | 'LOGIN_FAILED' | 'ACCESS_DENIED' | 'LOGIN_BLOCKED_DEVICE_LIMIT'
  | 'ROLE_CHANGED' | 'SCOPE_CHANGED' | 'PERMISSION_CHANGED'
  | 'INCIDENT_CREATED' | 'SOS_TRIGGERED' | 'ALARM_TRIGGERED'
  | 'DOC_UPLOADED' | 'DOC_VERIFIED' | 'CONTRACT_UPDATED'
  | 'ATTENDANCE_CHECK_IN' | 'ATTENDANCE_CHECK_OUT'
  | 'SESSION_REVOKED';

export type AuditRecord = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entityType: 'user' | 'guard' | 'client' | 'site' | 'shift' | 'shift_assignment' | 'system' | 'subcontractor' | 'incident' | 'finance' | 'document' | 'contract' | 'session';
  entityId: string;
  description: string;
  oldValues: any | null;
  newValues: any | null;
  metadata?: Record<string, any>;
  status: 'success' | 'warning' | 'error' | 'info' | 'REJECTED';
  organizationId: string;
};

export type OperationalEvent = {
  id: string;
  timestamp: string;
  type: 'GUARD_CHECK_IN' | 'GUARD_CHECK_OUT' | 'SOS_TRIGGERED' | 'INCIDENT_CREATED' | 'PATROL_STARTED' | 'ALARM_TRIGGERED' | 'VEHICLE_UPDATED';
  siteId: string;
  siteName: string;
  description: string;
  severity: Severity;
  metadata?: any;
};
