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

/**
 * Canonical Workforce Guard Types
 */
export const WORKFORCE_ROLES = [
  'SECURITY_GUARD',
  'CCTV_OPERATOR',
  'DOOR_SUPERVISOR',
  'MOBILE_PATROL',
  'CONTROL_ROOM_OPERATOR',
  'KEYHOLDER',
  'FIRST_AID_RESPONDER',
  'FIRE_MARSHAL',
  'SITE_SUPERVISOR',
  'SITE_LEAD'
] as const;

export type WorkforceRole = typeof WORKFORCE_ROLES[number];

export type PermissionAction = 'view' | 'manage' | 'finance' | 'hr' | 'client' | 'guard' | 'schedule' | 'schedule.publish' | 'audit' | 'location' | 'ai' | 'compliance.manage' | 'compliance.override';

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

export type DocumentType = 'SOP' | 'POST_ORDER' | 'RISK_ASSESSMENT' | 'CONTRACT' | 'LICENCE' | 'CERTIFICATE' | 'ID' | 'TRAINING' | 'DBS' | 'RTW';

export type MockDocument = {
  id: string;
  organizationId: string;
  clientId?: string;
  siteId?: string;
  guardId?: string;
  name: string;
  type: DocumentType;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Current' | 'Archived' | 'Draft';
  expiryDate?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  scope: 'Site' | 'Client' | 'Global' | 'Guard';
  content?: string;
};

export type GuardStatus = 'Active' | 'On Break' | 'Off Duty' | 'Suspended' | 'Inactive' | 'On Leave' | 'Applicant';
export type ComplianceStatus = 'Compliant' | 'Expiring Soon' | 'Non-Compliant' | 'Pending Verification' | 'Expired' | 'Missing';

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
  licenceExpiry: string; // SIA Expiry
  siaNumber?: string;
  dbsNumber?: string;
  dbsExpiry?: string;
  rtwType?: string;
  rtwExpiry?: string;
  docsMissing: number;
  performanceScore: number;
  weeklyHours: number;
  isAvailable: boolean;
  preferredSites?: string[];
  unavailableDates?: string[];
  recruitmentStage?: RecruitmentStage;
  primaryRole?: WorkforceRole;
  isComplianceOverridden?: boolean;
  overrideReason?: string;
  overrideBy?: string;
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

export type ShiftAssignmentStatus = 'Pending' | 'Assigned' | 'Confirmed' | 'In Transit' | 'On Site' | 'Rejected' | 'Withdrawn';

export type ShiftAssignment = {
  id: string;
  guardId: string;
  guardName: string;
  rolePerformed: string;
  status: ShiftAssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  checkInTime?: string;
  checkOutTime?: string;
  rejectionReason?: string;
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
  name: string;
  code: string;
  startTime: string; 
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  status: 'Draft' | 'Open' | 'Claimed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Published';
  priority: 'Routine' | 'Urgent' | 'STAT';
  requirements: RoleRequirement[];
  assignments: ShiftAssignment[];
  role: string; 
  version: number;
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
  model: string;
  plate: string;
  status: 'Active' | 'Idle' | 'Maintenance' | 'Offline' | 'Available';
  location: string;
  fuelLevel: number;
  nextService: string;
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
  | 'CLIENT_CREATED' | 'CLIENT_UPDATED' | 'CLIENT_STATUS_CHANGED'
  | 'SITE_CREATED' | 'SITE_UPDATED' | 'SITE_STATUS_CHANGED'
  | 'CONTRACT_CREATED' | 'CONTRACT_UPDATED' | 'CONTRACT_STATUS_CHANGED'
  | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_DELETED' | 'SHIFT_PUBLISHED' | 'SHIFT_RESCHEDULED'
  | 'GUARD_ASSIGNED' | 'GUARD_REMOVED' | 'GUARD_REPLACED' | 'SHIFT_GUARD_SWAPPED'
  | 'CLAIM_REQUESTED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CLAIM_WITHDRAWN'
  | 'CONFLICT_DETECTED' | 'AI_SCHEDULING_RUN' | 'AI_ASSIGNMENT_PROPOSED'
  | 'SWAP_REQUESTED' | 'SWAP_APPROVED' | 'SWAP_REJECTED'
  | 'ASSIGNMENT_REJECTED' | 'ROLE_CHANGED' | 'GUARD_REPLACED'
  | 'USER_LOGIN' | 'USER_LOGOUT' | 'LOGIN_FAILED' | 'ACCESS_DENIED' | 'LOGIN_BLOCKED_DEVICE_LIMIT'
  | 'ROLE_CHANGED' | 'SCOPE_CHANGED' | 'PERMISSION_CHANGED'
  | 'INCIDENT_CREATED' | 'SOS_TRIGGERED' | 'ALARM_TRIGGERED'
  | 'DOC_UPLOADED' | 'DOC_VERIFIED' | 'DOCUMENT_CREATED' | 'DOCUMENT_VERSION_CREATED' | 'CONTRACT_UPDATED'
  | 'ATTENDANCE_CHECK_IN' | 'ATTENDANCE_CHECK_OUT'
  | 'SESSION_REVOKED'
  | 'CONCURRENT_UPDATE_REJECTED'
  | 'SHIFT_PUBLISHED'
  | 'SHIFT_DEPLOYED' | 'SHIFT_DEPLOYMENT_CHANGED' | 'SHIFT_UNDEPLOYED'
  | 'COMPLIANCE_RECORD_UPDATED' | 'COMPLIANCE_OVERRIDE' | 'DOC_REJECTED';

export type AuditRecord = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entityType: 'user' | 'guard' | 'client' | 'site' | 'shift' | 'shift_assignment' | 'system' | 'subcontractor' | 'incident' | 'finance' | 'document' | 'contract' | 'session' | 'compliance';
  entityId: string;
  description: string;
  oldValues: any | null;
  newValues: any | null;
  metadata?: Record<string, any>;
  status: 'success' | 'warning' | 'error' | 'info' | 'REJECTED';
  organizationId: string;
};

export type ValidationResult = {
  isValid: boolean;
  code: 'VALID' | 'SHIFT_OVERLAP' | 'DAILY_HOURS_EXCEEDED' | 'GUARD_UNAVAILABLE' | 'GUARD_ON_LEAVE' | 'ROLE_NOT_QUALIFIED' | 'CERTIFICATION_REQUIRED' | 'GUARD_INACTIVE' | 'SITE_REQUIREMENT_NOT_MET' | 'FATIGUE_LIMIT' | 'COMPLIANCE_BLOCK' | 'REST_PERIOD_VIOLATION';
  message: string;
  details?: any;
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
