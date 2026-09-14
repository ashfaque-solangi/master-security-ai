
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  MockDocument, JobPost, Interview, SOSAlert, Alarm, Vehicle, Contract, LeaveRecord
} from './types';
import { addHours, addDays, subDays, set, subHours } from 'date-fns';

const now = new Date();
const ORG_A = 'ORG-GLOBAL-001';
const ORG_B = 'ORG-APEX-002';

/**
 * SEEDED USERS WITH CROSS-TENANT SCOPES
 */
export const users: User[] = [
  // Super Admin (Global)
  { id: 'USR-001', organizationId: ORG_A, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  
  // Organization A Users
  { id: 'USR-002', organizationId: ORG_A, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-003', organizationId: ORG_A, name: 'David Jones', email: 'hr@secureguard.com', role: 'HR_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-004', organizationId: ORG_A, name: 'Fiona Banks', email: 'finance@secureguard.com', role: 'FINANCE_MANAGER', status: 'Active', password: 'password123' },
  
  // Scoped Users (Org A)
  { id: 'USR-005', organizationId: ORG_A, name: 'Global Tech Admin', email: 'client@secureguard.com', role: 'CLIENT_ADMIN', status: 'Active', password: 'password123', clientId: 'CL-001' },
  { id: 'USR-006', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-001' },
  { id: 'USR-007', organizationId: ORG_A, name: 'Site Lead Alpha', email: 'site1@secureguard.com', role: 'SITE_MANAGER', status: 'Active', password: 'password123', siteIds: ['SITE-001'] },

  // Organization B Users (Isolation Test)
  { id: 'USR-008', organizationId: ORG_B, name: 'Apex Admin', email: 'admin@apex-security.com', role: 'COMPANY_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-009', organizationId: ORG_B, name: 'Subcontractor Lead', email: 'sub@apex-security.com', role: 'SUBCONTRACTOR_ADMIN', status: 'Active', password: 'password123', subcontractorId: 'SUB-002' },
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
  { 
    id: 'SITE-003', organizationId: ORG_B, name: 'Apex Warehouse', code: 'AW-03', clientId: 'CL-003', clientName: 'Apex Logistics',
    address: '99 Freight Road', contactInfo: 'Rex: Ext 9', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 4, requiredRoles: ['Security Guard'], requiredSkills: ['Heavy Lifting'], requiredQualifications: ['SIA Badge'],
    riskLevel: 'High', activeGuardsCount: 0, openShifts: 2, healthScore: 100, revenuePerMonth: 15000
  },
];

export const guards: Guard[] = [
  { 
    id: 'GRD-001', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', phone: '555-0001', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 240).toISOString(), docsMissing: 0, performanceScore: 98, weeklyHours: 38, isAvailable: true, qualifiedRoles: ['Security Guard', 'Team Leader'], skills: ['First Aid']
  },
  { 
    id: 'GRD-002', organizationId: ORG_A, name: 'Sarah Jenkins', email: 's.jenkins@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 15).toISOString(), docsMissing: 0, performanceScore: 92, weeklyHours: 42, isAvailable: true, qualifiedRoles: ['Security Guard'], skills: ['CCTV']
  },
  { 
    id: 'GRD-003', organizationId: ORG_B, name: 'Apex Guard One', email: 'guard1@apex.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 300).toISOString(), docsMissing: 0, performanceScore: 95, weeklyHours: 40, isAvailable: true, qualifiedRoles: ['Security Guard'], skills: ['Patrol']
  }
];

export const shifts: Shift[] = [
  { 
    id: 'SHF-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Tech Hub HQ', startTime: set(now, { hours: 8, minutes: 0 }).toISOString(), endTime: set(now, { hours: 16, minutes: 0 }).toISOString(), 
    status: 'In Progress', priority: 'Routine', requirements: [{ role: 'Security Guard', count: 2 }], role: 'Security Guard',
    assignments: [{ id: 'ASG-001', guardId: 'GRD-001', guardName: 'Marcus Thorne', rolePerformed: 'Security Guard', status: 'On Site', assignedAt: subDays(now, 1).toISOString(), assignedBy: 'USR-002' }]
  },
  { 
    id: 'SHF-003', organizationId: ORG_B, siteId: 'SITE-003', siteName: 'Apex Warehouse', startTime: addDays(now, 1).toISOString(), endTime: addDays(addHours(now, 8), 1).toISOString(), 
    status: 'Open', priority: 'Urgent', requirements: [{ role: 'Security Guard', count: 1 }], assignments: [], role: 'Security Guard'
  }
];

export const incidents: Incident[] = [
  { id: 'INC-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardId: 'GRD-001', guardName: 'Marcus Thorne', type: 'Vandalism', severity: 'Medium', status: 'Open', description: 'Graffiti found on rear entrance gate.', timestamp: subDays(now, 1).toISOString() }
];

export const subcontractors: Subcontractor[] = [
  { id: 'SUB-001', organizationId: ORG_A, name: 'Apex Protection', contactEmail: 'ops@apex.com', contactPhone: '555-9000', status: 'Approved', rating: 4.8, guardCount: 15 },
  { id: 'SUB-002', organizationId: ORG_B, name: 'Apex Logistics Partners', contactEmail: 'ops@apex-log.com', contactPhone: '555-2222', status: 'Approved', rating: 5.0, guardCount: 20 }
];

export const visitors: Visitor[] = [
  { id: 'VIS-001', siteId: 'SITE-001', name: 'John Guest', company: 'External Audit Co', siteName: 'Tech Hub HQ', hostName: 'Sarah Miller', checkIn: now.toISOString(), status: 'Checked In' }
];

export const invoices: Invoice[] = [
  { id: 'INV-001', organizationId: ORG_A, clientName: 'Global Tech Corp', siteName: 'Tech Hub HQ', amount: 12500, date: subDays(now, 5).toISOString(), status: 'Paid' }
];

export const applicants: Applicant[] = [
  { id: 'APP-001', organizationId: ORG_A, jobPostId: 'JOB-001', name: 'New Candidate', email: 'new@applicant.com', phone: '555-9999', currentStage: 'SHORTLISTED', status: 'Pending', appliedDate: subDays(now, 2).toISOString(), experience: '3 Years', notes: 'Strong background in corporate security.' }
];

export const patrols: Patrol[] = [
  { id: 'PAT-001', siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardName: 'Marcus Thorne', startTime: subHours(now, 1).toISOString(), completion: 75, checkpoints: 10, status: 'In Progress' }
];

export const payrollRecords: PayrollRecord[] = [
  { id: 'PAY-001', organizationId: ORG_A, guardName: 'Marcus Thorne', period: 'August 2024', hours: 160, amount: 3200, status: 'Paid' }
];

export const forms: FormDefinition[] = [
  { id: 'FRM-001', name: 'Daily Activity Report', fields: 8, lastModified: subDays(now, 1).toISOString(), status: 'Active' }
];

export const jobPosts: JobPost[] = [
  { id: 'JOB-001', organizationId: ORG_A, siteId: 'SITE-001', title: 'Corporate Security Officer', requiredRoles: ['Security Guard'], count: 2, status: 'Open', closingDate: addDays(now, 14).toISOString() }
];

export const interviews: Interview[] = [
  { id: 'INT-001', applicantId: 'APP-001', date: addDays(now, 1).toISOString(), interviewer: 'Sarah Miller', type: 'F2F', score: 0, result: 'Pending', notes: 'Scheduled for tomorrow.' }
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

export const documents: MockDocument[] = [
  { id: 'DOC-001', organizationId: ORG_A, siteId: 'SITE-001', name: 'SOP-Standard-Patrol', type: 'SOP', version: '1.2', uploadedBy: 'Sarah Miller', uploadedAt: subDays(now, 30).toISOString(), status: 'Current', scope: 'Site' }
];

export const contracts: Contract[] = [
  { id: 'CON-001', organizationId: ORG_A, clientId: 'CL-001', siteId: 'SITE-001', contractNumber: 'CT-2024-001', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', billingRate: 45, guardRate: 20, requiredHours: 168, kpis: ['98% Coverage'], sla: '4h Response', penalties: '£500 per major breach' }
];

export const leaveRecords: LeaveRecord[] = [
  { id: 'LV-001', guardId: 'GRD-002', type: 'Annual', startDate: addDays(now, 30).toISOString(), endDate: addDays(now, 37).toISOString(), status: 'Approved', reason: 'Summer Holiday' }
];

// Helper for subMinutes (not imported from date-fns in current context)
function subMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() - minutes * 60000);
}
