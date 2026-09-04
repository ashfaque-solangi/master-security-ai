
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition
} from './types';
import { addHours, addDays, subDays, getMonth } from 'date-fns';

const now = new Date();

export const users: User[] = [
  { id: 'USR-001', name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'Super Admin', status: 'Active', password: 'password123' },
  { id: 'USR-002', name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'Operations Manager', status: 'Active', password: 'password123' },
  { id: 'USR-005', name: 'Global Tech Admin', email: 'client@secureguard.com', role: 'Client Admin', status: 'Active', password: 'password123', clientId: 'CL-001' },
  { id: 'USR-006', name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'Guard', status: 'Active', password: 'password123' },
];

export const clients: Client[] = [
  { id: 'CL-001', name: 'Global Tech Corp', contactPerson: 'John Hammond', email: 'j.hammond@globaltech.com', phone: '+1 (555) 123-4567', status: 'Active', industry: 'Technology' },
  { id: 'CL-002', name: 'Eastside Properties', contactPerson: 'Linda Vance', email: 'vance@eastside.com', phone: '+1 (555) 987-6543', status: 'Active', industry: 'Real Estate' },
];

export const sites: Site[] = [
  { 
    id: 'SITE-001', 
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
    revenuePerMonth: 12500
  },
  { 
    id: 'SITE-002', 
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

export const guards: Guard[] = [
  { 
    id: 'GRD-001', 
    name: 'Marcus Thorne', 
    email: 'm.thorne@security.com', 
    phone: '555-0001', 
    status: 'Active', 
    complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 240).toISOString(),
    docsMissing: 0,
    performanceScore: 98,
    weeklyHours: 38,
    isAvailable: true,
    currentSiteName: 'Tech Hub HQ'
  },
  { 
    id: 'GRD-002', 
    name: 'Sarah Jenkins', 
    email: 's.jenkins@security.com', 
    phone: '555-0002', 
    status: 'Active', 
    complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 15).toISOString(),
    docsMissing: 0,
    performanceScore: 92,
    weeklyHours: 42,
    isAvailable: true,
    currentSiteName: 'Retail Park East'
  },
  { 
    id: 'GRD-003', 
    name: 'Leo Varga', 
    email: 'l.varga@security.com', 
    phone: '555-0003', 
    status: 'On Break', 
    complianceStatus: 'Expiring Soon',
    licenceExpiry: addDays(now, 5).toISOString(),
    docsMissing: 1,
    performanceScore: 85,
    weeklyHours: 32,
    isAvailable: false 
  },
];

export const shifts: Shift[] = [
  { 
    id: 'SHF-001', 
    siteId: 'SITE-001', 
    siteName: 'Tech Hub HQ', 
    startTime: now.toISOString(), 
    endTime: addHours(now, 8).toISOString(), 
    status: 'In Progress',
    priority: 'Routine',
    requiredGuards: 2,
    assignments: [{ guardId: 'GRD-001', guardName: 'Marcus Thorne', role: 'Security Guard' }]
  },
  { 
    id: 'SHF-002', 
    siteId: 'SITE-002', 
    siteName: 'Retail Park East', 
    startTime: addDays(now, 1).toISOString(), 
    endTime: addDays(addHours(now, 8), 1).toISOString(), 
    status: 'Open',
    priority: 'Urgent',
    requiredGuards: 1,
    assignments: []
  }
];

export const incidents: Incident[] = [
  {
    id: 'INC-001',
    siteId: 'SITE-001',
    siteName: 'Tech Hub HQ',
    guardId: 'GRD-001',
    guardName: 'Marcus Thorne',
    type: 'Vandalism',
    severity: 'Medium',
    status: 'Open',
    description: 'Graffiti found on the rear entrance gate during perimeter patrol.',
    timestamp: subDays(now, 1).toISOString()
  }
];

export const visitors: Visitor[] = [
  { id: 'VIS-001', name: 'John Wick', company: 'Continental', siteName: 'Tech Hub HQ', hostName: 'Alex Thompson', checkIn: now.toISOString(), status: 'Checked In' },
  { id: 'VIS-002', name: 'Sarah Connor', company: 'Cyberdyne', siteName: 'Retail Park East', hostName: 'Sarah Miller', checkIn: addHours(now, 2).toISOString(), status: 'Expected' },
];

export const invoices: Invoice[] = [
  { id: 'INV-001', clientName: 'Global Tech Corp', siteName: 'Tech Hub HQ', amount: 12500, date: subDays(now, 5).toISOString(), status: 'Paid' },
  { id: 'INV-002', clientName: 'Eastside Properties', siteName: 'Retail Park East', amount: 8400, date: subDays(now, 1).toISOString(), status: 'Pending' },
];

export const applicants: Applicant[] = [
  { id: 'APP-001', name: 'Robert Fox', role: 'Security Guard', status: 'Interview', appliedDate: subDays(now, 10).toISOString(), experience: '5 years' },
  { id: 'APP-002', name: 'Jane Doe', role: 'CCTV Operator', status: 'Background Check', appliedDate: subDays(now, 15).toISOString(), experience: '2 years' },
];

export const patrols: Patrol[] = [
  { id: 'PAT-001', siteName: 'Tech Hub HQ', guardName: 'Marcus Thorne', startTime: now.toISOString(), completion: 65, checkpoints: 12, status: 'In Progress' },
];

export const payrollRecords: PayrollRecord[] = [
  { id: 'PAY-001', guardName: 'Marcus Thorne', period: 'Feb 01 - Feb 15', hours: 84, amount: 3250.50, status: 'Paid' },
];

export const forms: FormDefinition[] = [
  { id: 'FRM-001', name: 'Daily Activity Report', fields: 8, lastModified: subDays(now, 2).toISOString(), status: 'Active' },
  { id: 'FRM-002', name: 'Incident Report', fields: 12, lastModified: subDays(now, 5).toISOString(), status: 'Active' },
];

export const subcontractors: Subcontractor[] = [
  { id: 'SUB-001', name: 'Apex Protection', contactEmail: 'ops@apex.com', contactPhone: '555-9000', status: 'Approved', rating: 4.8, guardCount: 15 },
];
