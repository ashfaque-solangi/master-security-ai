
import type { Guard, Site, Incident, Shift } from './types';

export const guards: Guard[] = [
  {
    id: 'GRD-001',
    name: 'Marcus Thorne',
    email: 'm.thorne@security.com',
    status: 'Active',
    complianceStatus: 'Compliant',
    currentSiteId: 'SITE-001',
    currentSiteName: 'Tech Hub HQ',
    lastLocationUpdate: new Date().toISOString(),
  },
  {
    id: 'GRD-002',
    name: 'Sarah Jenkins',
    email: 's.jenkins@security.com',
    status: 'On Break',
    complianceStatus: 'Expiring Soon',
    currentSiteId: 'SITE-002',
    currentSiteName: 'Retail Park East',
    lastLocationUpdate: new Date().toISOString(),
  },
  {
    id: 'GRD-003',
    name: 'Leo Varga',
    email: 'l.varga@security.com',
    status: 'Active',
    complianceStatus: 'Compliant',
    currentSiteId: 'SITE-001',
    currentSiteName: 'Tech Hub HQ',
    lastLocationUpdate: new Date().toISOString(),
  },
  {
    id: 'GRD-004',
    name: 'Elena Rossi',
    email: 'e.rossi@security.com',
    status: 'Off Duty',
    complianceStatus: 'Non-Compliant',
    lastLocationUpdate: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
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
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const shifts: Shift[] = [
  {
    id: 'SHF-001',
    siteId: 'SITE-001',
    siteName: 'Tech Hub HQ',
    guardId: 'GRD-001',
    guardName: 'Marcus Thorne',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 28800000).toISOString(),
    status: 'In Progress',
    priority: 'Urgent',
  },
  {
    id: 'SHF-002',
    siteId: 'SITE-003',
    siteName: 'Data Center Alpha',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 115200000).toISOString(),
    status: 'Open',
    priority: 'STAT',
  }
];
