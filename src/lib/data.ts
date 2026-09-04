
import type { Guard, Site, Incident, Shift, SOSAlert } from './types';
import { addDays, subHours, subMinutes } from 'date-fns';

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
