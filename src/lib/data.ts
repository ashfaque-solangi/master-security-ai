import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Invoice, Applicant, SOSAlert, Alarm, Vehicle, Contract,
  Patrol, PayrollRecord, Visitor, FormDefinition, MockDocument, LeaveRecord
} from './types';
import { addDays, set, subDays } from 'date-fns';

const now = new Date();
const ORG_A = 'ORG-GLOBAL-001';
const ORG_B = 'ORG-APEX-002';

const createTimestamp = (daysOffset: number, hour: number, minute: number = 0) => {
  return set(addDays(now, daysOffset), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }).toISOString();
};

export const users: User[] = [
  { id: 'USR-ADMIN', organizationId: ORG_A, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-OPS', organizationId: ORG_A, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-GUARD-1', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-101' },
  { id: 'USR-GUARD-2', organizationId: ORG_A, name: 'Sarah Jenkins', email: 's.jenkins@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-102' }
];

export const clients: Client[] = [
  { id: 'CL-001', organizationId: ORG_A, name: 'Northgate Retail Group', contactPerson: 'John Hammond', email: 'j.hammond@northgate.com', phone: '+44 20 7123 4567', status: 'Active', industry: 'Retail', address: '123 Retail Lane, London' },
  { id: 'CL-002', organizationId: ORG_A, name: 'Metro Logistics Ltd', contactPerson: 'Linda Vance', email: 'vance@metrologistics.com', phone: '+44 20 7987 6543', status: 'Active', industry: 'Logistics', address: '50 Logistics Way, Dartford' },
  { id: 'CL-003', organizationId: ORG_A, name: 'Westfield Property Services', contactPerson: 'Mark Spencer', email: 'mspencer@westfield.com', phone: '+44 20 7111 2222', status: 'Active', industry: 'Real Estate', address: '88 Property Blvd, Manchester' },
  { id: 'CL-004', organizationId: ORG_A, name: 'Corporate City Tower', contactPerson: 'Sarah Kent', email: 'skent@citytower.com', phone: '+44 20 7333 4444', status: 'Active', industry: 'Commercial', address: '1 City Plaza, London' },
  { id: 'CL-005', organizationId: ORG_A, name: 'St. Marys Hospital', contactPerson: 'Dr. Emily Rose', email: 'erose@stmarys.nhs.uk', phone: '+44 20 7444 5555', status: 'Active', industry: 'Healthcare', address: 'Hospital Road, London' },
  { id: 'CL-006', organizationId: ORG_A, name: 'Apex Construction', contactPerson: 'Bill Builder', email: 'b.builder@apex.co.uk', phone: '+44 20 7666 7777', status: 'Active', industry: 'Construction', address: 'Building Site A, Croydon' },
  { id: 'CL-007', organizationId: ORG_A, name: 'Global Tech Hub', contactPerson: 'Tim Cook', email: 'tim@globaltech.com', phone: '+44 20 7888 9999', status: 'Active', industry: 'Technology', address: 'Silicon Way, Reading' },
  { id: 'CL-008', organizationId: ORG_A, name: 'Regent Street Luxury', contactPerson: 'Diana Prince', email: 'diana@regent.com', phone: '+44 20 7000 1111', status: 'Active', industry: 'Luxury Retail', address: 'Regent St, London' }
];

export const sites: Site[] = Array.from({ length: 25 }).map((_, i) => {
  const client = clients[i % clients.length];
  const siteNames = ['Main Gate', 'North Wing', 'South Gate', 'Perimeter Patrol', 'Reception Desk', 'CCTV Room', 'Loading Bay', 'Server Room', 'Retail Floor', 'Executive Suite'];
  const name = `${client.name} - ${siteNames[i % siteNames.length]}`;
  const code = `SITE-${client.name.substring(0, 3).toUpperCase()}-${101 + i}`;
  return {
    id: `SITE-${101 + i}`,
    organizationId: client.organizationId,
    name,
    code,
    clientId: client.id,
    clientName: client.name,
    address: `${10 + i} ${client.industry} Way, London`,
    contactInfo: `Desk: 020 ${7000 + i} ${1000 + i}`,
    status: 'Active',
    operatingHours: '24/7',
    requiredGuardCount: (i % 3) + 2,
    requiredRoles: ['SECURITY_GUARD', (i % 3 === 0 ? 'CCTV_OPERATOR' : 'SITE_LEAD')],
    requiredSkills: i % 2 === 0 ? ['First Aid'] : [],
    requiredQualifications: i % 3 === 0 ? ['SIA_CCTV'] : ['SIA_DOOR'],
    riskLevel: i % 4 === 0 ? 'High' : i % 3 === 0 ? 'Critical' : 'Medium',
    activeGuardsCount: 0,
    healthScore: 85 + (i % 15),
    revenuePerMonth: 5000 + (i * 1000),
    openShifts: 0,
    instructions: 'Monitor perimeter fence every 60 mins. Log all deliveries.',
    patrolFrequency: '60 mins',
    patrolType: 'Checkpoint'
  };
});

export const guards: Guard[] = Array.from({ length: 80 }).map((_, i) => {
  const names = ['Marcus Thorne', 'Sarah Jenkins', 'Ahmed Khan', 'Leo Varga', 'Emma Watson', 'John Wick', 'Sarah Connor', 'Peter Parker', 'Bruce Wayne', 'Tony Stark', 'Natasha Romanoff', 'Logan Howlett', 'Wanda Maximoff', 'Barry Allen', 'Steve Rogers', 'Diana Prince', 'Arthur Curry', 'Clark Kent', 'Victor Stone', 'Jean Grey'];
  const name = names[i % names.length] + (i > 19 ? ` ${i}` : '');
  const roles = ['SECURITY_GUARD', 'CCTV_OPERATOR', 'SITE_LEAD', 'FIRE_MARSHAL', 'FIRST_AID_RESPONDER'];
  return {
    id: `GRD-${101 + i}`,
    organizationId: ORG_A,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@security.com`,
    status: 'Active',
    complianceStatus: i % 15 === 0 ? 'Expiring Soon' : 'Compliant',
    licenceExpiry: addDays(now, 100 + (i * 5)).toISOString(),
    docsMissing: 0,
    performanceScore: 85 + (i % 15),
    weeklyHours: 0,
    isAvailable: true,
    qualifiedRoles: [roles[i % roles.length], 'SECURITY_GUARD'],
    skills: i % 2 === 0 ? ['First Aid'] : [],
    primaryRole: roles[i % roles.length] as any
  };
});

export const shifts: Shift[] = Array.from({ length: 60 }).map((_, i) => {
  const site = sites[i % sites.length];
  const dayOffset = Math.floor(i / 6);
  const hourStart = (i % 3) * 8;
  const start = createTimestamp(dayOffset, hourStart);
  const end = createTimestamp(dayOffset, hourStart + 8);
  
  const status: any = i % 8 === 0 ? 'Draft' : i % 5 === 0 ? 'Open' : 'Published';
  const shiftName = `${site.name} - ${i % 3 === 0 ? 'Morning' : i % 3 === 1 ? 'Afternoon' : 'Night'} Security`;
  
  const shiftAssignments: any[] = [];
  if (status !== 'Draft' && i % 2 === 0) {
    const assignedCount = site.requiredGuardCount - (i % 2);
    for (let j = 0; j < assignedCount; j++) {
      const guard = guards[(i + j * 7) % guards.length];
      shiftAssignments.push({
        id: `ASG-${i}-${j}`,
        guardId: guard.id,
        guardName: guard.name,
        rolePerformed: site.requiredRoles[j % site.requiredRoles.length],
        status: 'Assigned',
        assignedAt: subDays(now, 2).toISOString(),
        assignedBy: 'Sarah Miller'
      });
    }
  }

  return {
    id: `SHF-${101 + i}`,
    organizationId: ORG_A,
    siteId: site.id,
    siteName: site.name,
    name: shiftName,
    code: `SH-2024-${(101 + i).toString().padStart(6, '0')}`,
    startTime: start,
    endTime: end,
    status,
    priority: i % 10 === 0 ? 'Urgent' : 'Routine',
    requirements: site.requiredRoles.map(r => ({ role: r, count: 1 })),
    assignments: shiftAssignments,
    role: site.requiredRoles[0],
    version: 1
  };
});

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
