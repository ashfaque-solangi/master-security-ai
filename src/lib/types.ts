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
  extraPermissions?: string[];
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
  requiredPermissions?: string[];
  icon: any;
  priority: number;
}

export type GuardStatus = 'Active' | 'On Break' | 'Off Duty' | 'Suspended';
export type ComplianceStatus = 'Compliant' | 'Expiring Soon' | 'Non-Compliant' | 'Expired' | 'Missing';

export type Guard = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  status: GuardStatus;
  complianceStatus: ComplianceStatus;
  currentSiteId?: string;
  currentSiteName?: string;
  licenceExpiry: string;
  dbsExpiry?: string;
  rtwExpiry?: string;
  rtwType?: string;
  siaNumber?: string;
  docsMissing: number;
  performanceScore: number;
  weeklyHours: number;
  isAvailable: boolean;
  qualifiedRoles: string[];
  skills: string[];
  isComplianceOverridden?: boolean;
  overrideReason?: string;
  overrideBy?: string;
  unavailableDates?: string[];
};

export type ShiftAssignment = {
  id: string;
  guardId: string;
  guardName: string;
  rolePerformed: string;
  status: 'Assigned' | 'Confirmed' | 'In Transit' | 'On Site' | 'Pending' | 'Rejected' | 'Withdrawn';
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
  status: 'Published' | 'Open' | 'Claimed' | 'In Progress' | 'Completed' | 'Draft' | 'Cancelled';
  priority: 'Routine' | 'Urgent' | 'STAT';
  requirements: RoleRequirement[];
  assignments: ShiftAssignment[];
  role: string; 
  version?: number;
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

export type Client = {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  industry: string;
  address: string;
  clientCode?: string;
  notes?: string;
};

export type Site = {
  id: string;
  organizationId: string;
  name: string;
  clientId: string;
  clientName: string;
  address: string;
  riskLevel: Severity;
  activeGuardsCount: number;
  healthScore: number;
  revenuePerMonth: number;
  openShifts: number;
  code?: string;
  contactInfo?: string;
  status?: 'Active' | 'Inactive';
  operatingHours?: string;
  requiredGuardCount?: number;
  requiredRoles?: string[];
  requiredQualifications?: string[];
  requiredSkills?: string[];
  instructions?: string;
  latitude?: number;
  longitude?: number;
};

export type Subcontractor = {
  id: string;
  name: string;
  companyReg: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Approved' | 'Pending' | 'Suspended';
  guardCount: number;
  rating: number;
};

export type PayrollRecord = {
  id: string;
  guardName: string;
  period: string;
  hours: number;
  amount: number;
  status: 'Paid' | 'Pending' | 'Approved';
};

export type Invoice = {
  id: string;
  clientName: string;
  siteName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
};

export type Applicant = {
  id: string;
  name: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Background Check' | 'Hired' | 'Rejected';
  appliedDate: string;
  experience: string;
  currentStage: RecruitmentStage;
  email: string;
};

export type RecruitmentStage = 
  | 'JOB_POSTED' | 'APPLICATION' | 'SHORTLISTED' | 'INTERVIEW' 
  | 'DOCUMENT_COLLECTION' | 'VALIDATION' | 'VERIFICATION' 
  | 'CONTRACT' | 'TRAINING' | 'ONBOARDING' | 'ACTIVE';

export type FormDefinition = {
  id: string;
  name: string;
  fields: number;
  lastModified: string;
  status: 'Active' | 'Draft';
};

export type AuditAction = 
  | 'USER_LOGIN' | 'USER_LOGOUT' | 'LOGIN_FAILED' | 'ACCESS_DENIED' | 'LOGIN_BLOCKED_DEVICE_LIMIT'
  | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_DELETED' | 'GUARD_ASSIGNED' | 'GUARD_REMOVED'
  | 'INCIDENT_CREATED' | 'SOS_TRIGGERED' | 'ALARM_TRIGGERED' | 'SYSTEM_UPDATED' | 'DEMO_RESET'
  | 'SESSION_REVOKED' | 'ATTENDANCE_CHECK_IN' | 'ATTENDANCE_CHECK_OUT' | 'GUARD_STATUS_CHANGED'
  | 'CLAIM_REQUESTED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CLAIM_WITHDRAWN'
  | 'SHIFT_GUARD_SWAPPED' | 'SHIFT_PUBLISHED' | 'SHIFT_DEPLOYED' | 'SHIFT_UNDEPLOYED'
  | 'SHIFT_DEPLOYMENT_CHANGED' | 'ROLE_CHANGED' | 'GUARD_REPLACED' | 'AI_SCHEDULING_RUN'
  | 'CLIENT_CREATED' | 'CLIENT_UPDATED' | 'CLIENT_STATUS_CHANGED' | 'SITE_CREATED' | 'SITE_UPDATED'
  | 'SITE_STATUS_CHANGED' | 'PATROL_CHECKPOINT_CREATED' | 'PATROL_ROUTE_CREATED' | 'PATROL_SCAN'
  | 'COMPLIANCE_OVERRIDE' | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'DOCUMENT_CREATED'
  | 'CONTRACT_CREATED' | 'CONTRACT_UPDATED'
  | 'TRACKING_STARTED' | 'TRACKING_STOPPED';

export type AuditRecord = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entityType: 'user' | 'guard' | 'client' | 'site' | 'shift' | 'incident' | 'finance' | 'system' | 'session' | 'patrol' | 'shift_assignment' | 'contract' | 'document' | 'location';
  entityId: string;
  description: string;
  oldValues: any | null;
  newValues: any | null;
  metadata?: Record<string, any>;
  status: 'success' | 'warning' | 'error' | 'info' | 'REJECTED';
  organizationId: string;
};

export type Contract = {
  id: string;
  organizationId?: string;
  clientId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending';
  contractNumber: string;
  billingRate: number;
  guardRate: number;
  sla: string;
  penalties?: string;
  kpis: string[];
  terms?: string;
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

export type MockDocument = {
  id: string;
  guardId?: string;
  siteId?: string;
  name: string;
  type: string;
  version: number;
  status: 'Current' | 'Archived' | 'Draft';
  expiry?: string;
  verified: boolean;
  metadata?: Record<string, any>;
};

export type LeaveRecord = {
  id: string;
  guardId: string;
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Emergency';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
};

export type ScanValidationStatus = 'Valid' | 'Missed' | 'Out of Sequence' | 'Unexpected';

export type PatrolCheckpoint = {
  id: string;
  organizationId: string;
  siteId: string;
  name: string;
  code: string;
  type: 'QR' | 'NFC';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
};

export type PatrolRoute = {
  id: string;
  organizationId: string;
  siteId: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  estimatedDuration: number; // minutes
  checkpointIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type PatrolEvent = {
  id: string;
  organizationId: string;
  shiftId: string;
  routeId: string;
  checkpointId: string;
  guardId: string;
  timestamp: string;
  scanType: 'QR' | 'NFC';
  sequenceNumber: number;
  validationStatus: ScanValidationStatus;
  isSimulated: boolean;
};

export type Patrol = {
  id: string;
  shiftId: string;
  routeId: string;
  routeName: string;
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  startTime: string;
  endTime?: string;
  status: 'Active' | 'Completed' | 'Missed' | 'Aborted';
  checkpoints: number; // completed
  totalCheckpoints: number;
  completion: number; // percentage
};

export type TrackingSource = 'SIMULATED' | 'GPS' | 'MOBILE' | 'API';
export type TrackingStatus = 'Active' | 'Stale' | 'Offline';

export type GuardLocation = {
  id: string;
  organizationId: string;
  guardId: string;
  siteId: string;
  shiftId?: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: string;
  source: TrackingSource;
  status: TrackingStatus;
};

export type LiveGuardContext = {
  guard: Guard;
  assignment: ShiftAssignment;
  shift: Shift;
  site: Site;
  location?: GuardLocation;
  status: TrackingStatus;
  rolePerformed: string;
};

export type ValidationResult = {
  isValid: boolean;
  code?: string;
  message: string;
};

export type PermissionAction = 
  | 'view' 
  | 'manage' 
  | 'finance' 
  | 'hr' 
  | 'client' 
  | 'guard' 
  | 'schedule' 
  | 'schedule.publish' 
  | 'audit' 
  | 'location' 
  | 'ai' 
  | 'compliance.manage' 
  | 'compliance.override'
  | 'patrol.view'
  | 'patrol.manage'
  | 'patrol.assign'
  | 'patrol.monitor'
  | 'location.view'
  | 'location.manage';

// Legacy Medical Types
export type BloodUnit = {
  bloodType: string;
  quantity: number;
  lowStockThreshold: number;
};

export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  sampleCount: number;
};

export type SampleStatus = 'Collected' | 'Processing' | 'Pending Verification' | 'Verified' | 'Reported' | 'Disposed';
export type SamplePriority = 'Routine' | 'Urgent' | 'STAT';

export type TestResult = {
  parameter: string;
  value: number | null;
  unit: string;
  referenceRange: { min: number; max: number };
};

export type AuditEntry = {
  user: string;
  action: string;
  timestamp: string;
};

export type Sample = {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  status: SampleStatus;
  priority: SamplePriority;
  technician: string;
  collectionDate: string;
  turnaroundTime: string;
  results: TestResult[];
  auditTrail: AuditEntry[];
  remarks: string[];
  predefinedRules?: string;
  statisticalData?: string;
};