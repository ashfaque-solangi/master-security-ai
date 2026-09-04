import type { Guard, Site, Incident, Shift, SOSAlert, Vehicle, Visitor, Patrol, PayrollRecord, Applicant } from './types';
import { addDays, subHours, subMinutes, subDays } from 'date-fns';

const now = new Date();

export const guards: Guard[] = [
  {
    id: 'GRD-001',
    name: 'Marcus Thorne',
    email: 'm.thorne@security.com',
    status: 'Active',
    complianceStatus: 'Compliant',
    currentSiteId: 'SITE-001',
    currentSiteName: 'Tech Hub HQ',
    lastLocationUpdate: subMinutes(now, 2).toISOString(),
    licenceExpiry: addDays(now, 240).toISOString(),
    docsMissing: 0,
    performanceScore: 94,
  },
  {
    id: 'GRD-002',
    name: 'Sarah Jenkins',
    email: 's.jenkins@security.com',
    status: 'On Break',
    complianceStatus: 'Expiring Soon',
    currentSiteId: 'SITE-002',
    currentSiteName: 'Retail Park East',
    lastLocationUpdate: subMinutes(now, 15).toISOString(),
    licenceExpiry: addDays(now, 15).toISOString(),
    docsMissing: 1,
    performanceScore: 88,
  },
  {
    id: 'GRD-003',
    name: 'Leo Varga',
    email: 'l.varga@security.com',
    status: 'Active',
    complianceStatus: 'Compliant',
    currentSiteId: 'SITE-001',
    currentSiteName: 'Tech Hub HQ',
    lastLocationUpdate: subMinutes(now, 5).toISOString(),
    licenceExpiry: addDays(now, 180).toISOString(),
    docsMissing: 0,
    performanceScore: 91,
  },
  {
    id: 'GRD-004',
    name: 'Elena Rossi',
    email: 'e.rossi@security.com',
    status: 'Off Duty',
    complianceStatus: 'Non-Compliant',
    lastLocationUpdate: subHours(now, 2).toISOString(),
    licenceExpiry: now.toISOString(),
    docsMissing: 3,
    performanceScore: 72,
  }
];

export const sites: Site[] = [
  {
    id: 'SITE-001',
    name: 'Tech Hub HQ',
    clientId: 'CL-001',
    clientName: 'Global Tech Corp',
    address: '123 Innovation Way, Silicon Valley',
    riskLevel: 'High',
    activeGuardsCount: 5,
    openShifts: 2,
    healthScore: 92,
    revenuePerMonth: 45000,
  },
  {
    id: 'SITE-002',
    name: 'Retail Park East',
    clientId: 'CL-002',
    clientName: 'Eastside Properties',
    address: '45 Commerce Blvd, Springfield',
    riskLevel: 'Medium',
    activeGuardsCount: 2,
    openShifts: 0,
    healthScore: 78,
    revenuePerMonth: 12000,
  },
  {
    id: 'SITE-003',
    name: 'Data Center Alpha',
    clientId: 'CL-001',
    clientName: 'Global Tech Corp',
    address: 'Secret Location, Nevada',
    riskLevel: 'Critical',
    activeGuardsCount: 12,
    openShifts: 5,
    healthScore: 98,
    revenuePerMonth: 85000,
  }
];

export const incidents: Incident[] = [
  {
    id: 'INC-2024-001',
    siteId: 'SITE-001',
    siteName: 'Tech Hub HQ',
    guardId: 'GRD-001',
    guardName: 'Marcus Thorne',
    type: 'Intrusion',
    severity: 'High',
    status: 'Open',
    description: 'Unauthorized access detected at Perimeter Fence B. Person scaled fence and headed towards Server Room 1.',
    timestamp: subHours(now, 1).toISOString(),
  },
  {
    id: 'INC-2024-002',
    siteId: 'SITE-002',
    siteName: 'Retail Park East',
    guardId: 'GRD-002',
    guardName: 'Sarah Jenkins',
    type: 'Observation',
    severity: 'Low',
    status: 'Resolved',
    description: 'Minor water leak discovered in the parking garage ceiling. Maintenance notified.',
    timestamp: subHours(now, 4).toISOString(),
  }
];

export const sosAlerts: SOSAlert[] = [
  {
    id: 'SOS-001',
    guardId: 'GRD-001',
    guardName: 'Marcus Thorne',
    siteName: 'Tech Hub HQ',
    timestamp: subMinutes(now, 2).toISOString(),
    status: 'Active',
    location: { lat: 37.7749, lng: -122.4194 }
  }
];

export const shifts: Shift[] = [
  {
    id: 'SHF-001',
    siteId: 'SITE-001',
    siteName: 'Tech Hub HQ',
    guardId: 'GRD-001',
    guardName: 'Marcus Thorne',
    startTime: subHours(now, 2).toISOString(),
    endTime: subHours(now, -6).toISOString(),
    status: 'In Progress',
    priority: 'Urgent',
    role: 'Armed Static Guard'
  },
  {
    id: 'SHF-002',
    siteId: 'SITE-002',
    siteName: 'Retail Park East',
    guardId: 'GRD-002',
    guardName: 'Sarah Jenkins',
    startTime: subHours(now, 1).toISOString(),
    endTime: subHours(now, -7).toISOString(),
    status: 'In Progress',
    priority: 'Routine',
    role: 'Patrol Officer'
  },
  {
    id: 'SHF-003',
    siteId: 'SITE-003',
    siteName: 'Data Center Alpha',
    startTime: addDays(now, 1).toISOString(),
    endTime: addDays(now, 1.33).toISOString(),
    status: 'Open',
    priority: 'STAT',
    role: 'Lead Supervisor'
  }
];

export const vehicles: Vehicle[] = [
  {
    id: 'VH-101',
    model: 'Toyota Hilux 4x4',
    plate: 'SEC-001-HQ',
    status: 'Active',
    location: 'Sector A-12',
    fuelLevel: 65,
    nextService: addDays(now, 45).toISOString(),
  },
  {
    id: 'VH-102',
    model: 'Ford Ranger',
    plate: 'SEC-002-HQ',
    status: 'Maintenance',
    location: 'Main Depot',
    fuelLevel: 12,
    nextService: subDays(now, 2).toISOString(),
  }
];

export const visitors: Visitor[] = [
  {
    id: 'VIS-001',
    name: 'Robert Miller',
    company: 'Otis Elevators',
    siteName: 'Tech Hub HQ',
    checkIn: subHours(now, 2).toISOString(),
    hostName: 'Admin Team',
    status: 'Checked In',
  },
  {
    id: 'VIS-002',
    name: 'Alice Wong',
    company: 'CleanCo Services',
    siteName: 'Retail Park East',
    checkIn: subHours(now, 1).toISOString(),
    hostName: 'Site Supervisor',
    status: 'Checked In',
  }
];

export const patrols: Patrol[] = [
  {
    id: 'PAT-001',
    siteName: 'Tech Hub HQ',
    guardName: 'Marcus Thorne',
    startTime: subMinutes(now, 45).toISOString(),
    completion: 85,
    status: 'In Progress',
    checkpoints: 12,
  },
  {
    id: 'PAT-002',
    siteName: 'Data Center Alpha',
    guardName: 'Leo Varga',
    startTime: subHours(now, 2).toISOString(),
    completion: 100,
    status: 'Completed',
    checkpoints: 24,
  }
];

export const payrollRecords: PayrollRecord[] = [
  {
    id: 'PAY-001',
    guardName: 'Marcus Thorne',
    period: 'Feb 01 - Feb 15',
    hours: 84,
    amount: 3250.50,
    status: 'Approved',
  },
  {
    id: 'PAY-002',
    guardName: 'Sarah Jenkins',
    period: 'Feb 01 - Feb 15',
    hours: 76,
    amount: 2850.00,
    status: 'Pending',
  }
];

export const applicants: Applicant[] = [
  {
    id: 'APP-001',
    name: 'John Doe',
    role: 'Static Guard',
    appliedDate: subDays(now, 2).toISOString(),
    status: 'Applied',
    experience: '5 years'
  },
  {
    id: 'APP-002',
    name: 'Jane Smith',
    role: 'Patrol Officer',
    appliedDate: subDays(now, 5).toISOString(),
    status: 'Interview',
    experience: '3 years'
  },
  {
    id: 'APP-003',
    name: 'Mike Brown',
    role: 'Supervisor',
    appliedDate: subDays(now, 10).toISOString(),
    status: 'Background Check',
    experience: '10 years'
  }
];
