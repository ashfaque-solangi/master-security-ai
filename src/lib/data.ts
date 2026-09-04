
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  MockDocument
} from './types';
import { addHours, addDays, subDays, getMonth, set } from 'date-fns';

const now = new Date();
const orgId = 'ORG-GLOBAL-001';

export const users: User[] = [
  { id: 'USR-001', organizationId: orgId, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-002', organizationId: orgId, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-005', organizationId: orgId, name: 'Global Tech Admin', email: 'client@secureguard.com', role: 'CLIENT_ADMIN', status: 'Active', password: 'password123', clientId: 'CL-001' },
  { id: 'USR-006', organizationId: orgId, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123' },
];

const mockSOPs: MockDocument[] = [
  { id: 'DOC-001', name: 'Standard Perimeter Patrol SOP', type: 'SOP', version: '2.1', uploadedBy: 'Sarah Miller', uploadedAt: subDays(now, 15).toISOString(), status: 'Current', scope: 'Global' },
  { id: 'DOC-002', name: 'Emergency Evacuation Plan', type: 'Risk Assessment', version: '1.0', uploadedBy: 'Sarah Miller', uploadedAt: subDays(now, 30).toISOString(), status: 'Current', scope: 'Site' },
];

export const clients: Client[] = [
  { 
    id: 'CL-001', 
    organizationId: orgId, 
    name: 'Global Tech Corp', 
    contactPerson: 'John Hammond', 
    email: 'j.hammond@globaltech.com', 
    phone: '+1 (555) 123-4567', 
    status: 'Active', 
    industry: 'Technology',
    contracts: [
      { id: 'CON-001', contractNumber: 'GT-2024-001', startDate: '2024-01-01', endDate: '2025-12-31', status: 'Active', billingRate: 45, guardRate: 18.5, kpis: ['98% Attendance', 'Zero Incidents'] }
    ]
  },
  { id: 'CL-002', organizationId: orgId, name: 'Eastside Properties', contactPerson: 'Linda Vance', email: 'vance@eastside.com', phone: '+1 (555) 987-6543', status: 'Active', industry: 'Real Estate' },
];

export const sites: Site[] = [
  { 
    id: 'SITE-001', 
    organizationId: orgId,
    name: 'Tech Hub HQ', 
    code: 'TH-01', 
    clientId: 'CL-001', 
    clientName: 'Global Tech Corp',
    address: '123 Innovation Way', 
    contactInfo: 'Security Desk: Ext 404', 
    status: 'Active', 
    operatingHours: '24/7', 
    requiredGuardCount: 5, 
    requiredRoles: ['Security Guard', 'Team Leader'],
    riskLevel: 'Medium',
    activeGuardsCount: 2,
    openShifts: 1,
    healthScore: 94,
    revenuePerMonth: 12500,
    documents: [mockSOPs[0], mockSOPs[1]]
  },
  { 
    id: 'SITE-002', 
    organizationId: orgId,
    name: 'Retail Park East', 
    code: 'RP-02', 
    clientId: 'CL-002', 
    clientName: 'Eastside Properties',
    address: '45 Commerce Blvd', 
    contactInfo: 'Manager: 555-0101', 
    status: 'Active', 
    operatingHours: '06:00-22:00', 
    requiredGuardCount: 2, 
    requiredRoles: ['Security Guard'],
    riskLevel: 'Low',
    activeGuardsCount: 1,
    openShifts: 0,
    healthScore: 98,
    revenuePerMonth: 8400
  },
];

// Generate 30+ realistic guards
export const guards: Guard[] = [
  { 
    id: 'GRD-001', organizationId: orgId, name: 'Marcus Thorne', email: 'm.thorne@security.com', phone: '555-0001', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 240).toISOString(), docsMissing: 0, performanceScore: 98, weeklyHours: 38, isAvailable: true, qualifiedRoles: ['Security Guard', 'Team Leader'], skills: ['First Aid', 'Fire Safety']
  },
  { 
    id: 'GRD-002', organizationId: orgId, name: 'Sarah Jenkins', email: 's.jenkins@security.com', phone: '555-0002', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 15).toISOString(), docsMissing: 0, performanceScore: 92, weeklyHours: 42, isAvailable: true, qualifiedRoles: ['Security Guard', 'CCTV Operator'], skills: ['CCTV']
  },
  { 
    id: 'GRD-003', organizationId: orgId, name: 'Leo Varga', email: 'l.varga@security.com', phone: '555-0003', status: 'On Break', complianceStatus: 'Expiring Soon',
    licenceExpiry: addDays(now, 5).toISOString(), docsMissing: 1, performanceScore: 85, weeklyHours: 32, isAvailable: false, qualifiedRoles: ['Security Guard'], skills: ['Patrol']
  },
  { 
    id: 'GRD-004', organizationId: orgId, name: 'Ahmed Khan', email: 'a.khan@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: subDays(now, 5).toISOString(), docsMissing: 0, performanceScore: 95, weeklyHours: 0, isAvailable: true, qualifiedRoles: ['Team Leader', 'Supervisor'], skills: ['Leadership']
  },
  // Adding more for demo volume
  ...Array.from({ length: 26 }, (_, i) => ({
    id: `GRD-10${i}`,
    organizationId: orgId,
    name: `Officer ${i + 5}`,
    email: `officer${i + 5}@security.com`,
    status: 'Active' as any,
    complianceStatus: 'Compliant' as any,
    licenceExpiry: addDays(now, 365).toISOString(),
    docsMissing: 0,
    performanceScore: 80 + Math.floor(Math.random() * 20),
    weeklyHours: Math.floor(Math.random() * 40),
    isAvailable: true,
    qualifiedRoles: ['Security Guard'],
    skills: ['Patrol']
  }))
];

export const shifts: Shift[] = [
  { 
    id: 'SHF-001', organizationId: orgId, siteId: 'SITE-001', siteName: 'Tech Hub HQ', startTime: set(now, { hours: 8, minutes: 0 }).toISOString(), endTime: set(now, { hours: 16, minutes: 0 }).toISOString(), 
    status: 'In Progress', priority: 'Routine', requirements: [{ role: 'Security Guard', count: 2 }], 
    assignments: [{ id: 'ASG-001', guardId: 'GRD-001', guardName: 'Marcus Thorne', rolePerformed: 'Security Guard', status: 'On Site', assignedAt: subDays(now, 1).toISOString(), assignedBy: 'USR-002' }], role: 'Security Guard'
  },
  { 
    id: 'SHF-002', organizationId: orgId, siteId: 'SITE-002', siteName: 'Retail Park East', startTime: addDays(now, 1).toISOString(), endTime: addDays(addHours(now, 8), 1).toISOString(), 
    status: 'Open', priority: 'Urgent', requirements: [{ role: 'Security Guard', count: 1 }], assignments: [], role: 'Security Guard'
  }
];

export const incidents: Incident[] = [
  { id: 'INC-001', organizationId: orgId, siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardId: 'GRD-001', guardName: 'Marcus Thorne', type: 'Vandalism', severity: 'Medium', status: 'Open', description: 'Graffiti found on rear entrance gate.', timestamp: subDays(now, 1).toISOString() }
];

export const visitors: Visitor[] = [
  { id: 'VIS-001', siteId: 'SITE-001', name: 'John Wick', company: 'Continental', siteName: 'Tech Hub HQ', hostName: 'Alex Thompson', checkIn: now.toISOString(), status: 'Checked In' }
];

export const invoices: Invoice[] = [
  { id: 'INV-001', organizationId: orgId, clientName: 'Global Tech Corp', siteName: 'Tech Hub HQ', amount: 12500, date: subDays(now, 5).toISOString(), status: 'Paid' }
];

export const applicants: Applicant[] = [
  { id: 'APP-001', name: 'Robert Fox', role: 'Security Guard', status: 'Interview', appliedDate: subDays(now, 10).toISOString(), experience: '5 years', missingDocs: [] },
  { id: 'APP-002', name: 'Jane Doe', role: 'CCTV Operator', status: 'Background Check', appliedDate: subDays(now, 15).toISOString(), experience: '2 years', missingDocs: ['RTW'] },
];

export const patrols: Patrol[] = [
  { id: 'PAT-001', siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardName: 'Marcus Thorne', startTime: now.toISOString(), completion: 65, checkpoints: 12, status: 'In Progress' }
];

export const payrollRecords: PayrollRecord[] = [
  { id: 'PAY-001', organizationId: orgId, guardName: 'Marcus Thorne', period: 'Feb 01 - Feb 15', hours: 84, amount: 3250.50, status: 'Paid' }
];

export const forms: FormDefinition[] = [
  { id: 'FRM-001', name: 'Daily Activity Report', fields: 8, lastModified: subDays(now, 2).toISOString(), status: 'Active' }
];

export const subcontractors: Subcontractor[] = [
  { id: 'SUB-001', organizationId: orgId, name: 'Apex Protection', contactEmail: 'ops@apex.com', contactPhone: '555-9000', status: 'Approved', rating: 4.8, guardCount: 15 }
];
