import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  MockDocument, JobPost, Interview, SOSAlert, Alarm, Vehicle, Contract, LeaveRecord,
  OperationalEvent
} from './types';
import { addHours, addDays, subDays, set, subHours, subMinutes, startOfDay, format } from 'date-fns';

const now = new Date();
const ORG_A = 'ORG-GLOBAL-001';
const ORG_B = 'ORG-APEX-002';

// SEED GENERATION HELPERS
const createTimestamp = (daysOffset: number, hour: number, minute: number = 0) => {
  return set(addDays(now, daysOffset), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }).toISOString();
};

export const users: User[] = [
  { id: 'USR-ADMIN', organizationId: ORG_A, name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'SUPER_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-OPS', organizationId: ORG_A, name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'OPERATIONS_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-CLIENT', organizationId: ORG_A, name: 'Northgate Admin', email: 'client@secureguard.com', role: 'CLIENT_ADMIN', status: 'Active', password: 'password123', clientId: 'CL-001' },
  { id: 'USR-GUARD-1', organizationId: ORG_A, name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-001' },
  { id: 'USR-GUARD-2', organizationId: ORG_A, name: 'Sarah Jenkins', email: 's.jenkins@security.com', role: 'GUARD', status: 'Active', password: 'password123', guardId: 'GRD-002' },
  { id: 'USR-APEX', organizationId: ORG_B, name: 'Sentinel Director', email: 'admin@apex-security.com', role: 'COMPANY_ADMIN', status: 'Active', password: 'password123' },
  { id: 'USR-FIN', organizationId: ORG_A, name: 'Financial Officer', email: 'finance@secureguard.com', role: 'FINANCE_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-HR', organizationId: ORG_A, name: 'HR Director', email: 'hr@secureguard.com', role: 'HR_MANAGER', status: 'Active', password: 'password123' },
  { id: 'USR-COMP', organizationId: ORG_A, name: 'Compliance Officer', email: 'compliance@secureguard.com', role: 'COMPLIANCE_MANAGER', status: 'Active', password: 'password123' }
];

export const clients: Client[] = [
  { id: 'CL-001', organizationId: ORG_A, name: 'Northgate Retail Group', contactPerson: 'John Hammond', email: 'j.hammond@northgate.com', phone: '+44 20 7123 4567', status: 'Active', industry: 'Retail' },
  { id: 'CL-002', organizationId: ORG_A, name: 'Metro Logistics Ltd', contactPerson: 'Linda Vance', email: 'vance@metrologistics.com', phone: '+44 20 7987 6543', status: 'Active', industry: 'Logistics' },
  { id: 'CL-003', organizationId: ORG_A, name: 'Westfield Property Services', contactPerson: 'David Ross', email: 'd.ross@westfield.com', phone: '+44 20 7222 3333', status: 'Active', industry: 'Real Estate' },
  { id: 'CL-004', organizationId: ORG_B, name: 'Sentinel Private Assets', contactPerson: 'Bruce Wayne', email: 'bruce@sentinel.com', phone: '+44 20 7555 1111', status: 'Active', industry: 'Corporate' },
  { id: 'CL-005', organizationId: ORG_A, name: 'City Retail Park', contactPerson: 'Emma Watson', email: 'e.watson@cityretail.com', phone: '+44 20 7666 4444', status: 'Active', industry: 'Retail' },
  { id: 'CL-006', organizationId: ORG_A, name: 'Airport Logistics Hub', contactPerson: 'Robert Brown', email: 'r.brown@airportlogistics.com', phone: '+44 20 7888 9999', status: 'Active', industry: 'Aviation' }
];

export const sites: Site[] = [
  { 
    id: 'SITE-001', organizationId: ORG_A, name: 'Northgate Mall', code: 'NG-01', clientId: 'CL-001', clientName: 'Northgate Retail Group',
    address: '100 Mall Street, London', contactInfo: 'Security Desk: 020 7123 0001', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 8, requiredRoles: ['Security Guard', 'Team Leader', 'CCTV Operator'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Medium', activeGuardsCount: 3, healthScore: 92, revenuePerMonth: 18500, openShifts: 2
  },
  { 
    id: 'SITE-002', organizationId: ORG_A, name: 'Metro Distribution Hub', code: 'MH-02', clientId: 'CL-002', clientName: 'Metro Logistics Ltd',
    address: 'Warehouse Ave, Slough', contactInfo: 'Manager: 020 7987 0002', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 4, requiredRoles: ['Security Guard', 'Mobile Patrol'], requiredSkills: [], requiredQualifications: [], riskLevel: 'High', activeGuardsCount: 2, healthScore: 88, revenuePerMonth: 12400, openShifts: 1
  },
  { 
    id: 'SITE-003', organizationId: ORG_A, name: 'Corporate HQ Tower', code: 'HQ-03', clientId: 'CL-003', clientName: 'Westfield Property Services',
    address: '1 Financial Square, London', contactInfo: 'Desk: 020 7222 0003', status: 'Active', operatingHours: '06:00-22:00', 
    requiredGuardCount: 3, requiredRoles: ['Concierge Security'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Low', activeGuardsCount: 1, healthScore: 98, revenuePerMonth: 9500, openShifts: 0
  },
  { 
    id: 'SITE-004', organizationId: ORG_B, name: 'Private Storage Facility', code: 'SF-04', clientId: 'CL-004', clientName: 'Sentinel Private Assets',
    address: 'Secret Location, Rural', contactInfo: 'Emergency Only', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 10, requiredRoles: ['Armed Response', 'K9 Unit'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Critical', activeGuardsCount: 5, healthScore: 95, revenuePerMonth: 45000, openShifts: 2
  },
  { 
    id: 'SITE-005', organizationId: ORG_A, name: 'City Centre Retail Park', code: 'RP-05', clientId: 'CL-005', clientName: 'City Retail Park',
    address: 'High St, Manchester', contactInfo: 'Office: 0161 555 1234', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 6, requiredRoles: ['Security Guard', 'Mobile Patrol'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Medium', activeGuardsCount: 2, healthScore: 85, revenuePerMonth: 15000, openShifts: 4
  },
  { 
    id: 'SITE-006', organizationId: ORG_A, name: 'Airport Logistics Hub', code: 'AL-06', clientId: 'CL-006', clientName: 'Airport Logistics Hub',
    address: 'Terminal 4 Way, Heathrow', contactInfo: 'Ops: 020 8888 7777', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 12, requiredRoles: ['Security Guard', 'CCTV Operator', 'Team Leader'], requiredSkills: [], requiredQualifications: [], riskLevel: 'High', activeGuardsCount: 6, healthScore: 90, revenuePerMonth: 28000, openShifts: 6
  },
  { 
    id: 'SITE-007', organizationId: ORG_A, name: 'Riverside Apartments', code: 'RA-07', clientId: 'CL-003', clientName: 'Westfield Property Services',
    address: 'Thames Path, London', contactInfo: 'Reception: 020 7333 4444', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 2, requiredRoles: ['Concierge Security'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Low', activeGuardsCount: 2, healthScore: 99, revenuePerMonth: 8200, openShifts: 0
  },
  { 
    id: 'SITE-008', organizationId: ORG_A, name: 'Westfield Industrial Park', code: 'IP-08', clientId: 'CL-003', clientName: 'Westfield Property Services',
    address: 'Factory Lane, Birmingham', contactInfo: 'Gatehouse: 0121 444 5555', status: 'Active', operatingHours: '24/7', 
    requiredGuardCount: 4, requiredRoles: ['Security Guard', 'Gatekeeper'], requiredSkills: [], requiredQualifications: [], riskLevel: 'Medium', activeGuardsCount: 3, healthScore: 94, revenuePerMonth: 11000, openShifts: 1
  }
];

export const guards: Guard[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `GRD-${String(i + 1).padStart(3, '0')}`,
  organizationId: i < 30 ? ORG_A : ORG_B,
  name: i === 0 ? 'Marcus Thorne' : i === 1 ? 'Sarah Jenkins' : `Officer ${i + 1}`,
  email: i === 0 ? 'm.thorne@security.com' : i === 1 ? 's.jenkins@security.com' : `officer${i+1}@security.com`,
  status: i < 3 ? 'Active' : i === 4 ? 'On Leave' : i === 5 ? 'Suspended' : 'Active',
  complianceStatus: i === 6 ? 'Non-Compliant' : i === 7 ? 'Expiring Soon' : 'Compliant',
  licenceExpiry: i === 6 ? subDays(now, 5).toISOString() : i === 7 ? addDays(now, 10).toISOString() : addDays(now, 200).toISOString(),
  docsMissing: i === 6 ? 2 : 0,
  performanceScore: Math.floor(Math.random() * 20) + 80,
  weeklyHours: Math.floor(Math.random() * 30) + 10,
  isAvailable: true,
  qualifiedRoles: ['Security Guard', 'Mobile Patrol', 'CCTV Operator', 'Concierge Security'],
  skills: ['First Aid', 'Fire Marshal']
}));

export const shifts: Shift[] = [];

// Seed 50-80 shifts across past, today, and future
sites.forEach(site => {
  for (let d = -7; d <= 14; d++) {
    const isPast = d < 0;
    const isToday = d === 0;
    
    // Morning Shift
    shifts.push({
      id: `SHF-${site.id}-${d}-MOR`,
      organizationId: site.organizationId,
      siteId: site.id,
      siteName: site.name,
      startTime: createTimestamp(d, 8),
      endTime: createTimestamp(d, 16),
      status: isPast ? 'Completed' : isToday ? 'In Progress' : 'Published',
      priority: 'Routine',
      requirements: [{ role: 'Security Guard', count: 1 }],
      role: 'Security Guard',
      assignments: d === 0 || isPast ? [{
        id: `ASG-${site.id}-${d}-MOR-1`,
        guardId: guards[Math.floor(Math.random() * 10)].id,
        guardName: guards[Math.floor(Math.random() * 10)].name,
        rolePerformed: 'Security Guard',
        status: isPast ? 'Confirmed' : 'On Site',
        assignedAt: subDays(now, 10).toISOString(),
        assignedBy: 'SYSTEM'
      }] : []
    });
  }
});

export const incidents: Incident[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `INC-${i + 100}`,
  organizationId: ORG_A,
  siteId: 'SITE-001',
  siteName: 'Northgate Mall',
  guardId: 'GRD-001',
  guardName: 'Marcus Thorne',
  type: i % 5 === 0 ? 'Vandalism' : i % 3 === 0 ? 'Intrusion' : 'Observation',
  severity: i % 10 === 0 ? 'Critical' : i % 5 === 0 ? 'High' : 'Medium',
  status: i < 10 ? 'Open' : 'Resolved',
  description: `Reported incident ${i + 1} at site location.`,
  timestamp: subDays(now, i).toISOString()
}));

export const sosAlerts: SOSAlert[] = [
  { id: 'SOS-001', organizationId: ORG_A, siteId: 'SITE-001', siteName: 'Northgate Mall', guardId: 'GRD-001', guardName: 'Marcus Thorne', timestamp: subMinutes(now, 15).toISOString(), status: 'Active', severity: 'Critical' }
];

export const alarms: Alarm[] = [
  { id: 'ALM-001', organizationId: ORG_A, siteId: 'SITE-002', siteName: 'Metro Distribution Hub', type: 'Intrusion', severity: 'High', timestamp: subMinutes(now, 5).toISOString(), status: 'Active' }
];

export const vehicles: Vehicle[] = [
  { id: 'VEH-001', organizationId: ORG_A, name: 'Patrol Unit 01', status: 'Active', siteId: 'SITE-002', lastUpdate: now.toISOString() },
  { id: 'VEH-002', organizationId: ORG_A, name: 'Patrol Unit 02', status: 'Idle', siteId: 'SITE-001', lastUpdate: now.toISOString() },
  { id: 'VEH-003', organizationId: ORG_A, name: 'Patrol Unit 03', status: 'Maintenance', siteId: 'SITE-003', lastUpdate: now.toISOString() }
];

export const contracts: Contract[] = [
  { id: 'CON-001', organizationId: ORG_A, clientId: 'CL-001', contractNumber: 'CT-2024-001', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', billingRate: 45, guardRate: 18, requiredHours: 168, kpis: ['98% Coverage'], sla: '4h Response', penalties: '£500 per breach' },
  { id: 'CON-002', organizationId: ORG_A, clientId: 'CL-002', contractNumber: 'CT-2024-002', startDate: '2024-02-15', endDate: '2025-02-14', status: 'Active', billingRate: 48, guardRate: 20, requiredHours: 100, kpis: ['100% Patrol Completion'], sla: '2h Response', penalties: '£1000 per breach' }
];

export const applicants: Applicant[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `APP-${String(i + 1).padStart(3, '0')}`,
  organizationId: ORG_A,
  jobPostId: 'JOB-001',
  name: `Applicant ${i + 1}`,
  email: `app${i+1}@gmail.com`,
  phone: '07700 900000',
  currentStage: i < 5 ? 'APPLICATION' : i < 10 ? 'SHORTLISTED' : i < 15 ? 'INTERVIEW' : i < 20 ? 'VERIFICATION' : 'ACTIVE',
  status: 'Pending',
  appliedDate: subDays(now, i).toISOString(),
  experience: '3 Years',
  notes: 'Qualified candidate.'
}));

export const invoices: Invoice[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `INV-${i + 1000}`,
  organizationId: ORG_A,
  clientName: i % 2 === 0 ? 'Northgate Retail Group' : 'Metro Logistics Ltd',
  siteName: 'Multiple Sites',
  amount: Math.floor(Math.random() * 5000) + 2000,
  date: subDays(now, i * 5).toISOString(),
  status: i < 5 ? 'Paid' : i < 10 ? 'Pending' : 'Overdue'
}));

export const subcontractors: Subcontractor[] = [
  { id: 'SUB-001', organizationId: ORG_A, name: 'Apex Protection Ltd', contactEmail: 'ops@apex-protection.com', contactPhone: '+44 7700 900001', status: 'Approved', rating: 4.8, guardCount: 15 },
  { id: 'SUB-002', organizationId: ORG_A, name: 'Guardian Services UK', contactEmail: 'info@guardianservices.co.uk', contactPhone: '+44 7700 900002', status: 'Pending', rating: 4.2, guardCount: 8 }
];

export const payrollRecords: PayrollRecord[] = [];
export const visitors: Visitor[] = [];
export const patrols: Patrol[] = [];
export const forms: FormDefinition[] = [];
export const jobPosts: JobPost[] = [];
export const interviews: Interview[] = [];
export const leaveRecords: LeaveRecord[] = [];
export const documents: MockDocument[] = [];
