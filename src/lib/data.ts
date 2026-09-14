
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  MockDocument, JobPost, Interview, SOSAlert, Alarm, Vehicle, Contract, LeaveRecord,
  OperationalEvent
} from './types';
import { addHours, addDays, subDays, set, subHours, subMinutes } from 'date-fns';

const now = new Date();
const ORG_A = 'ORG-GLOBAL-001';
const ORG_B = 'ORG-APEX-002';

export const users: User[] = [
  { id: 'USR-001', organizationId: ORG_A, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-002', organizationId: ORG_A, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-005', organizationId: ORG_A, name: 'Global Tech Admin', email: 'client@secureguard.com', role: 'CLIENT_ADMIN', status: 'Active', password: 'password123', clientId: 'CL-001' },
  { id: 'USR-006', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-001' },
  { id: 'USR-008', organizationId: ORG_B, name: 'Apex Admin', email: 'admin@apex-security.com', role: 'COMPANY_ADMIN', status: 'Active', password: 'password123' },
];

export const clients: Client[] = [
  { id: 'CL-001', organizationId: ORG_A, name: 'Global Tech Corp', contactPerson: 'John Hammond', email: 'j.hammond@globaltech.com', phone: '+1 (555) 123-4567', status: 'Active', industry: 'Technology' },
  { id: 'CL-002', organizationId: ORG_A, name: 'Eastside Properties', contactPerson: 'Linda Vance', email: 'vance@eastside.com', phone: '+1 (555) 987-6543', status: 'Active', industry: 'Real Estate' },
  { id: 'CL-003', organizationId: ORG_B, name: 'Apex Logistics', contactPerson: 'Rex Apex', email: 'rex@apex.com', phone: '+1 (555) 222-3333', status: 'Active', industry: 'Logistics' },
];

export const sites: Site[] = [
  { 
    id: 'SITE-001', organizationId: ORG_A, name: 'Tech Hub HQ', code: 'TH-01', clientId: 'CL-001', clientName: 'Global Tech Corp',
    address: '123 Innovation Way', contactInfo: 'Security Desk: Ext 404', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 5, requiredRoles: ['Security Guard', 'Team Leader'], requiredSkills: ['First Aid'], requiredQualifications: ['SIA Badge'],
    riskLevel: 'Medium', activeGuardsCount: 2, openShifts: 1, healthScore: 94, revenuePerMonth: 12500
  },
  { 
    id: 'SITE-002', organizationId: ORG_A, name: 'Retail Park East', code: 'RP-02', clientId: 'CL-002', clientName: 'Eastside Properties',
    address: '45 Commerce Blvd', contactInfo: 'Manager: 555-0101', status: 'Active', operatingHours: '06:00-22:00', 
    requiredGuardCount: 2, requiredRoles: ['Security Guard'], requiredSkills: ['Patrol'], requiredQualifications: ['SIA Badge'],
    riskLevel: 'Low', activeGuardsCount: 1, openShifts: 0, healthScore: 98, revenuePerMonth: 8400
  },
];

export const guards: Guard[] = [
  { 
    id: 'GRD-001', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 240).toISOString(), docsMissing: 0, performanceScore: 98, weeklyHours: 38, isAvailable: true, qualifiedRoles: ['Security Guard', 'Team Leader'], skills: ['First Aid']
  },
  { 
    id: 'GRD-002', organizationId: ORG_A, name: 'Sarah Jenkins', email: 's.jenkins@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 15).toISOString(), docsMissing: 0, performanceScore: 92, weeklyHours: 42, isAvailable: true, qualifiedRoles: ['Security Guard'], skills: ['CCTV']
  },
];

export const shifts: Shift[] = [
  { 
    id: 'SHF-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Tech Hub HQ', startTime: set(now, { hours: 8, minutes: 0 }).toISOString(), endTime: set(now, { hours: 16, minutes: 0 }).toISOString(), 
    status: 'In Progress', priority: 'Routine', requirements: [{ role: 'Security Guard', count: 2 }], role: 'Security Guard',
    assignments: [{ id: 'ASG-001', guardId: 'GRD-001', guardName: 'Marcus Thorne', rolePerformed: 'Security Guard', status: 'On Site', assignedAt: subDays(now, 1).toISOString(), assignedBy: 'USR-002' }]
  },
];

export const incidents: Incident[] = [
  { id: 'INC-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardId: 'GRD-001', guardName: 'Marcus Thorne', type: 'Vandalism', severity: 'Medium', status: 'Open', description: 'Graffiti found on rear entrance gate.', timestamp: subDays(now, 1).toISOString() }
];

export const sosAlerts: SOSAlert[] = [
  { id: 'SOS-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardId: 'GRD-001', guardName: 'Marcus Thorne', timestamp: subMinutes(now, 10).toISOString(), status: 'Active', severity: 'Critical' }
];

export const alarms: Alarm[] = [
  { id: 'ALM-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Tech Hub HQ', type: 'Intrusion', severity: 'High', timestamp: subMinutes(now, 5).toISOString(), status: 'Active' }
];

export const vehicles: Vehicle[] = [
  { id: 'VEH-001', organizationId: ORG_A, name: 'Patrol Unit 1', status: 'Active', siteId: 'SITE-001', lastUpdate: now.toISOString() }
];

export const contracts: Contract[] = [
  { id: 'CON-001', organizationId: ORG_A, clientId: 'CL-001', siteId: 'SITE-001', contractNumber: 'CT-2026-001', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active', billingRate: 45, guardRate: 20, requiredHours: 168, kpis: ['98% Coverage'], sla: '4h Response', penalties: '£500 per breach' }
];

export const applicants: Applicant[] = [
  { id: 'APP-001', organizationId: ORG_A, jobPostId: 'JOB-001', name: 'John Doe', email: 'j.doe@applicants.com', phone: '555-0199', currentStage: 'SHORTLISTED', status: 'Pending', appliedDate: subDays(now, 3).toISOString(), experience: '4 Years', notes: 'Ex-military experience.' }
];

export const documents: MockDocument[] = [
  { id: 'DOC-001', organizationId: ORG_A, siteId: 'SITE-001', name: 'Standard Patrol SOP', type: 'SOP', version: '1.2', uploadedBy: 'Sarah Miller', uploadedAt: subDays(now, 30).toISOString(), status: 'Current', scope: 'Site' }
];

export const subcontractors: Subcontractor[] = [];
export const visitors: Visitor[] = [];
export const invoices: Invoice[] = [];
export const patrols: Patrol[] = [];
export const payrollRecords: PayrollRecord[] = [];
export const forms: FormDefinition[] = [];
export const jobPosts: JobPost[] = [];
export const interviews: Interview[] = [];
export const leaveRecords: LeaveRecord[] = [];
