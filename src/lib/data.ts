import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Invoice, Applicant, SOSAlert, Alarm, Vehicle, Contract,
  Patrol, PayrollRecord, Visitor, FormDefinition, MockDocument, LeaveRecord
} from './types';
import { addDays, set } from 'date-fns';

const now = new Date();
const ORG_A = 'ORG-GLOBAL-001';
const ORG_B = 'ORG-APEX-002';

const createTimestamp = (daysOffset: number, hour: number, minute: number = 0) => {
  return set(addDays(now, daysOffset), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }).toISOString();
};

export const users: User[] = [
  { id: 'USR-ADMIN', organizationId: ORG_A, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-OPS', organizationId: ORG_A, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-GUARD-1', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-001' },
  { id: 'USR-GUARD-2', organizationId: ORG_A, name: 'Sarah Jenkins', email: 's.jenkins@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-002' }
];

export const clients: Client[] = [
  { id: 'CL-001', organizationId: ORG_A, name: 'Northgate Retail Group', contactPerson: 'John Hammond', email: 'j.hammond@northgate.com', phone: '+44 20 7123 4567', status: 'Active', industry: 'Retail', address: '123 Retail Lane, London' },
  { id: 'CL-002', organizationId: ORG_A, name: 'Metro Logistics Ltd', contactPerson: 'Linda Vance', email: 'vance@metrologistics.com', phone: '+44 20 7987 6543', status: 'Active', industry: 'Logistics', address: '50 Logistics Way, Dartford' },
  { id: 'CL-003', organizationId: ORG_A, name: 'Westfield Property Services', contactPerson: 'Mark Spencer', email: 'mspencer@westfield.com', phone: '+44 20 7111 2222', status: 'Active', industry: 'Real Estate', address: '88 Property Blvd, Manchester' },
  { id: 'CL-004', organizationId: ORG_A, name: 'Corporate City Tower', contactPerson: 'Sarah Kent', email: 'skent@citytower.com', phone: '+44 20 7333 4444', status: 'Active', industry: 'Commercial', address: '1 City Plaza, London' },
  { id: 'CL-005', organizationId: ORG_B, name: 'Sentinel Industrial Hub', contactPerson: 'James Reed', email: 'jreed@sentinel.com', phone: '+44 20 7555 6666', status: 'Active', industry: 'Industrial', address: 'Sentinel Park, Birmingham' }
];

export const sites: Site[] = [
  { 
    id: 'SITE-001', organizationId: ORG_A, name: 'Northgate Mall', code: 'NG-01', clientId: 'CL-001', clientName: 'Northgate Retail Group',
    address: '100 Mall Street, London', contactInfo: 'Desk: 020 7123 0001', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 4, requiredRoles: ['SECURITY_GUARD', 'CCTV_OPERATOR'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Medium', activeGuardsCount: 0, healthScore: 92, revenuePerMonth: 18500, openShifts: 0
  },
  { 
    id: 'SITE-002', organizationId: ORG_A, name: 'Metro Distribution Centre', code: 'MD-02', clientId: 'CL-002', clientName: 'Metro Logistics Ltd',
    address: '50 Logistics Way, Dartford', contactInfo: 'Gatehouse: 01322 700 800', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 6, requiredRoles: ['SECURITY_GUARD', 'MOBILE_PATROL'], requiredSkills: [], requiredQualifications: [], riskLevel: 'High', activeGuardsCount: 0, healthScore: 88, revenuePerMonth: 24000, openShifts: 0
  },
  { 
    id: 'SITE-003', organizationId: ORG_A, name: 'Central Office Tower', code: 'CT-03', clientId: 'CL-004', clientName: 'Corporate City Tower',
    address: '1 City Plaza, London', contactInfo: 'Reception: 020 7900 1000', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 3, requiredRoles: ['SECURITY_GUARD', 'SITE_LEAD'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Low', activeGuardsCount: 0, healthScore: 95, revenuePerMonth: 12000, openShifts: 0
  },
  { 
    id: 'SITE-004', organizationId: ORG_B, name: 'Sentinel Hub A', code: 'SH-01', clientId: 'CL-005', clientName: 'Sentinel Industrial Hub',
    address: 'Sentinel Park, Birmingham', contactInfo: 'HQ: 0121 500 6000', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 5, requiredRoles: ['SECURITY_GUARD', 'FIRE_MARSHAL'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Critical', activeGuardsCount: 0, healthScore: 82, revenuePerMonth: 30000, openShifts: 0
  }
];

export const guards: Guard[] = [
  {
    id: 'GRD-001', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 200).toISOString(), docsMissing: 0, performanceScore: 98, weeklyHours: 32, isAvailable: true,
    qualifiedRoles: ['SECURITY_GUARD', 'FIRST_AID_RESPONDER', 'MOBILE_PATROL'], skills: ['First Aid'], primaryRole: 'SECURITY_GUARD'
  },
  {
    id: 'GRD-002', organizationId: ORG_A, name: 'Sarah Jenkins', email: 's.jenkins@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 150).toISOString(), docsMissing: 0, performanceScore: 95, weeklyHours: 24, isAvailable: true,
    qualifiedRoles: ['SECURITY_GUARD', 'CCTV_OPERATOR'], skills: ['CCTV License'], primaryRole: 'CCTV_OPERATOR'
  },
  {
    id: 'GRD-003', organizationId: ORG_A, name: 'Ahmed Khan', email: 'ahmed@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 300).toISOString(), docsMissing: 0, performanceScore: 92, weeklyHours: 10, isAvailable: true,
    qualifiedRoles: ['SECURITY_GUARD', 'DOOR_SUPERVISOR'], skills: [], primaryRole: 'SECURITY_GUARD'
  },
  {
    id: 'GRD-004', organizationId: ORG_A, name: 'Leo Varga', email: 'leo@security.com', status: 'Active', complianceStatus: 'Compliant',
    licenceExpiry: addDays(now, 365).toISOString(), docsMissing: 0, performanceScore: 99, weeklyHours: 40, isAvailable: true,
    qualifiedRoles: ['SECURITY_GUARD', 'SITE_LEAD', 'FIRST_AID_RESPONDER'], skills: ['First Aid'], primaryRole: 'SITE_LEAD'
  }
];

export const shifts: Shift[] = [
  {
    id: 'SHF-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Northgate Mall',
    name: 'Morning Mall Patrol', code: 'SH-2024-000001',
    startTime: createTimestamp(0, 8), endTime: createTimestamp(0, 16), status: 'Open', priority: 'Routine',
    requirements: [
      { role: 'SECURITY_GUARD', count: 2 },
      { role: 'CCTV_OPERATOR', count: 1 },
      { role: 'FIRST_AID_RESPONDER', count: 1 }
    ],
    assignments: [
      { id: 'ASG-1', guardId: 'GRD-001', guardName: 'Marcus Thorne', rolePerformed: 'SECURITY_GUARD', status: 'On Site', assignedAt: now.toISOString(), assignedBy: 'SYSTEM' },
      { id: 'ASG-PEND-1', guardId: 'GRD-002', guardName: 'Sarah Jenkins', rolePerformed: 'CCTV_OPERATOR', status: 'Pending', assignedAt: now.toISOString(), assignedBy: 'GUARD_CLAIM' }
    ],
    role: 'Team Deployment',
    version: 1
  },
  {
    id: 'SHF-DRAFT-001', organizationId: ORG_A, siteId: 'SITE-003', siteName: 'Central Office Tower',
    name: 'Standard Office Static Post', code: 'SH-2024-000002',
    startTime: createTimestamp(1, 10), endTime: createTimestamp(1, 18), status: 'Draft', priority: 'Routine',
    requirements: [{ role: 'SECURITY_GUARD', count: 1 }],
    assignments: [],
    role: 'Static Post',
    version: 1
  }
];

export const incidents: Incident[] = [];
export const sosAlerts: SOSAlert[] = [];
export const alarms: Alarm[] = [];
export const vehicles: Vehicle[] = [];
export const contracts: Contract[] = [];
export const applicants: Applicant[] = [];
export const invoices: Invoice[] = [];
export const subcontractors: Subcontractor[] = [];
export const patrols: Patrol[] = [];
export const payrollRecords: PayrollRecord[] = [];
export const visitors: Visitor[] = [];
export const forms: FormDefinition[] = [];
export const documents: MockDocument[] = [];
export const leaveRecords: LeaveRecord[] = [];
