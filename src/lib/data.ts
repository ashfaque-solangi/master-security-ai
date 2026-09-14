import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Invoice, Applicant, SOSAlert, Alarm, Vehicle, Contract,
  Patrol, PayrollRecord, Visitor, FormDefinition, MockDocument, LeaveRecord
} from './types';
import { addDays, subDays, set, subMinutes } from 'date-fns';

const now = new Date();
const ORG_A = 'ORG-GLOBAL-001';
const ORG_B = 'ORG-APEX-002';

const createTimestamp = (daysOffset: number, hour: number, minute: number = 0) => {
  return set(addDays(now, daysOffset), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }).toISOString();
};

export const users: User[] = [
  { id: 'USR-ADMIN', organizationId: ORG_A, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-OPS', organizationId: ORG_A, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-GUARD-1', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-001' }
];

export const clients: Client[] = [
  { id: 'CL-001', organizationId: ORG_A, name: 'Northgate Retail Group', contactPerson: 'John Hammond', email: 'j.hammond@northgate.com', phone: '+44 20 7123 4567', status: 'Active', industry: 'Retail' },
  { id: 'CL-002', organizationId: ORG_A, name: 'Metro Logistics Ltd', contactPerson: 'Linda Vance', email: 'vance@metrologistics.com', phone: '+44 20 7987 6543', status: 'Active', industry: 'Logistics' }
];

export const sites: Site[] = [
  { 
    id: 'SITE-001', organizationId: ORG_A, name: 'Northgate Mall', code: 'NG-01', clientId: 'CL-001', clientName: 'Northgate Retail Group',
    address: '100 Mall Street, London', contactInfo: 'Desk: 020 7123 0001', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 4, requiredRoles: ['SECURITY_GUARD', 'CCTV_OPERATOR'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Medium', activeGuardsCount: 0, healthScore: 92, revenuePerMonth: 18500, openShifts: 0
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
    startTime: createTimestamp(0, 8), endTime: createTimestamp(0, 16), status: 'Claimed', priority: 'Routine',
    requirements: [
      { role: 'SECURITY_GUARD', count: 2 },
      { role: 'CCTV_OPERATOR', count: 1 },
      { role: 'FIRST_AID_RESPONDER', count: 1 }
    ],
    assignments: [
      { id: 'ASG-1', guardId: 'GRD-001', guardName: 'Marcus Thorne', rolePerformed: 'SECURITY_GUARD', status: 'On Site', assignedAt: now.toISOString(), assignedBy: 'SYSTEM' },
      { id: 'ASG-2', guardId: 'GRD-002', guardName: 'Sarah Jenkins', rolePerformed: 'CCTV_OPERATOR', status: 'On Site', assignedAt: now.toISOString(), assignedBy: 'SYSTEM' }
    ],
    role: 'Team Deployment'
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
