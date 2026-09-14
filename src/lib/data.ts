import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Invoice, Applicant, SOSAlert, Alarm, Vehicle, Contract,
  BloodUnit, Patient, Sample, PayrollRecord, Visitor, FormDefinition,
  Patrol, MockDocument, LeaveRecord
} from './types';

export const users: User[] = [
  {
    id: 'USR-001',
    organizationId: 'ORG-001',
    name: 'Admin User',
    email: 'admin@secureguard.com',
    role: 'SUPER_ADMIN',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'USR-002',
    organizationId: 'ORG-001',
    name: 'Ops Manager',
    email: 'ops@secureguard.com',
    role: 'OPERATIONS_MANAGER',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'USR-003',
    organizationId: 'ORG-001',
    name: 'Marcus Thorne',
    email: 'm.thorne@security.com',
    role: 'GUARD',
    status: 'Active',
    password: 'password123',
    guardId: 'GRD-001'
  },
  {
    id: 'USR-004',
    organizationId: 'ORG-001',
    name: 'Partner Client',
    email: 'client@secureguard.com',
    role: 'CLIENT_ADMIN',
    status: 'Active',
    password: 'password123',
    clientId: 'CL-001'
  }
];

export const clients: Client[] = [
  {
    id: 'CL-001',
    organizationId: 'ORG-001',
    name: 'Global Tech Corp',
    contactPerson: 'Sarah Chen',
    email: 's.chen@globaltech.com',
    phone: '+44 20 7123 4567',
    status: 'Active',
    industry: 'Technology',
    address: '1 Tech Plaza, London',
    clientCode: 'C-101'
  },
  {
    id: 'CL-002',
    organizationId: 'ORG-001',
    name: 'Nakatomi Plaza',
    contactPerson: 'Joe Takagi',
    email: 'takagi@nakatomi.com',
    phone: '+44 20 8987 6543',
    status: 'Active',
    industry: 'Real Estate',
    address: 'Century City, London',
    clientCode: 'C-202'
  }
];

export const sites: Site[] = [
  {
    id: 'SITE-001',
    organizationId: 'ORG-001',
    name: 'Tech Hub HQ',
    clientId: 'CL-001',
    clientName: 'Global Tech Corp',
    address: 'Old Street, London',
    riskLevel: 'Medium',
    activeGuardsCount: 2,
    healthScore: 95,
    revenuePerMonth: 12000,
    openShifts: 0,
    code: 'SITE-LHR-101',
    status: 'Active',
    operatingHours: '24/7'
  },
  {
    id: 'SITE-002',
    organizationId: 'ORG-001',
    name: 'Nakatomi Executive Floors',
    clientId: 'CL-002',
    clientName: 'Nakatomi Plaza',
    address: 'The City, London',
    riskLevel: 'High',
    activeGuardsCount: 3,
    healthScore: 88,
    revenuePerMonth: 18500,
    openShifts: 1,
    code: 'SITE-LHR-202',
    status: 'Active',
    operatingHours: '24/7'
  }
];

export const guards: Guard[] = [
  {
    id: 'GRD-001',
    organizationId: 'ORG-001',
    name: 'Marcus Thorne',
    email: 'm.thorne@security.com',
    status: 'Active',
    complianceStatus: 'Compliant',
    licenceExpiry: '2025-12-31T00:00:00Z',
    siaNumber: 'SIA-1234567890',
    docsMissing: 0,
    performanceScore: 98,
    weeklyHours: 38,
    isAvailable: true,
    qualifiedRoles: ['SECURITY_GUARD', 'SITE_LEAD', 'FIRE_MARSHAL'],
    skills: ['CCTV', 'First Aid', 'Conflict Management']
  },
  {
    id: 'GRD-002',
    organizationId: 'ORG-001',
    name: 'Leo Varga',
    email: 'l.varga@security.com',
    status: 'On Break',
    complianceStatus: 'Expiring Soon',
    licenceExpiry: '2024-04-15T00:00:00Z',
    siaNumber: 'SIA-0987654321',
    docsMissing: 1,
    performanceScore: 92,
    weeklyHours: 42,
    isAvailable: true,
    qualifiedRoles: ['SECURITY_GUARD', 'CCTV_OPERATOR'],
    skills: ['Vigilance', 'Reporting']
  }
];

export const shifts: Shift[] = [
  {
    id: 'SH-001',
    organizationId: 'ORG-001',
    siteId: 'SITE-001',
    siteName: 'Tech Hub HQ',
    name: 'Morning Perimeter Security',
    code: 'SH-2024-001001',
    startTime: '2024-03-20T08:00:00Z',
    endTime: '2024-03-20T16:00:00Z',
    status: 'In Progress',
    priority: 'Routine',
    requirements: [{ role: 'SECURITY_GUARD', count: 2 }],
    assignments: [
      {
        id: 'ASG-001',
        guardId: 'GRD-001',
        guardName: 'Marcus Thorne',
        rolePerformed: 'SECURITY_GUARD',
        status: 'On Site',
        assignedAt: '2024-03-19T10:00:00Z',
        assignedBy: 'Ops Manager'
      }
    ],
    role: 'SECURITY_GUARD',
    version: 1
  }
];

export const incidents: Incident[] = [
  {
    id: 'INC-2024-001',
    organizationId: 'ORG-001',
    siteId: 'SITE-002',
    siteName: 'Nakatomi Executive Floors',
    guardId: 'GRD-001',
    guardName: 'Marcus Thorne',
    type: 'Observation',
    severity: 'Low',
    status: 'Resolved',
    description: 'Unsecured door found on floor 32 during patrol.',
    timestamp: '2024-03-18T22:30:00Z'
  }
];

export const sosAlerts: SOSAlert[] = [];
export const alarms: Alarm[] = [];
export const vehicles: Vehicle[] = [
  {
    id: 'VH-001',
    organizationId: 'ORG-001',
    model: 'Toyota Hilux (Armored)',
    plate: 'SEC-001',
    status: 'Available',
    location: 'Main Depot',
    fuelLevel: 85,
    nextService: '2024-06-01T00:00:00Z'
  }
];

export const contracts: Contract[] = [
  {
    id: 'CON-001',
    clientId: 'CL-001',
    title: 'Global Tech HQ Master Services',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T00:00:00Z',
    status: 'Active',
    contractNumber: 'CON-2024-GT01',
    billingRate: 35,
    guardRate: 18,
    sla: '98% Post Coverage',
    kpis: ['On-time arrival', 'Patrol completion', 'Incident response time']
  }
];

export const applicants: Applicant[] = [
  {
    id: 'APP-001',
    name: 'Elena Rossi',
    role: 'Security Officer',
    status: 'Interview',
    appliedDate: '2024-03-15T00:00:00Z',
    experience: '5 Years',
    currentStage: 'INTERVIEW',
    email: 'e.rossi@email.com'
  }
];

export const invoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    clientName: 'Global Tech Corp',
    siteName: 'Tech Hub HQ',
    amount: 14500,
    status: 'Paid',
    date: '2024-03-01T00:00:00Z'
  }
];

export const subcontractors: Subcontractor[] = [];
export const payrollRecords: PayrollRecord[] = [];
export const visitors: Visitor[] = [];
export const forms: FormDefinition[] = [];
export const patrols: Patrol[] = [];
export const documents: MockDocument[] = [];
export const leaveRecords: LeaveRecord[] = [];

// Legacy Medical Data (Restored for build stability)
export const bloodBankInventory: BloodUnit[] = [
  { bloodType: 'A+', quantity: 15, lowStockThreshold: 10 },
  { bloodType: 'A-', quantity: 5, lowStockThreshold: 10 },
  { bloodType: 'B+', quantity: 12, lowStockThreshold: 10 },
  { bloodType: 'B-', quantity: 3, lowStockThreshold: 5 },
  { bloodType: 'O+', quantity: 25, lowStockThreshold: 20 },
  { bloodType: 'O-', quantity: 8, lowStockThreshold: 10 },
  { bloodType: 'AB+', quantity: 6, lowStockThreshold: 5 },
  { bloodType: 'AB-', quantity: 2, lowStockThreshold: 5 },
];

export const patients: Patient[] = [
  { id: 'P001', name: 'John Doe', dateOfBirth: '1985-05-15', gender: 'Male', contact: '555-0101', sampleCount: 2 },
  { id: 'P002', name: 'Jane Smith', dateOfBirth: '1992-08-22', gender: 'Female', contact: '555-0102', sampleCount: 1 },
];

export const samples: Sample[] = [
  {
    id: 'S001',
    patientId: 'P001',
    patientName: 'John Doe',
    testName: 'Complete Blood Count',
    status: 'Pending Verification',
    priority: 'Routine',
    technician: 'Alice Johnson',
    collectionDate: new Date().toISOString(),
    turnaroundTime: '24h',
    results: [
      { parameter: 'Hemoglobin', value: 14.2, unit: 'g/dL', referenceRange: { min: 13.5, max: 17.5 } },
      { parameter: 'White Blood Cell', value: 7.5, unit: 'x10^3/uL', referenceRange: { min: 4.5, max: 11.0 } },
    ],
    auditTrail: [
      { user: 'Alice Johnson', action: 'Collected', timestamp: new Date().toISOString() },
    ],
    remarks: [],
  }
];

export const findSampleById = (id: string) => samples.find(s => s.id === id);