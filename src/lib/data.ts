
import type { 
  Guard, 
  Site, 
  Incident, 
  Shift, 
  SOSAlert, 
  Vehicle, 
  Visitor, 
  Patrol, 
  PayrollRecord, 
  Applicant, 
  Message, 
  Invoice, 
  FormDefinition,
  User,
  Client,
  Subcontractor,
  AssignedGuard
} from './types';
import { addDays, subHours, subMinutes, subDays, set, format, startOfYear, endOfYear, eachDayOfInterval, getMonth, getYear } from 'date-fns';

const now = new Date();

export const users: User[] = [
  { id: 'USR-001', name: 'Alex Thompson', email: 'admin@secureguard.com', role: 'Super Admin', status: 'Active', password: 'password123' },
  { id: 'USR-002', name: 'Sarah Miller', email: 'ops@secureguard.com', role: 'Operations Manager', status: 'Active', password: 'password123' },
  { id: 'USR-003', name: 'James Wilson', email: 'dispatcher@secureguard.com', role: 'Dispatcher', status: 'Active', password: 'password123' },
  { id: 'USR-004', name: 'Emma Davis', email: 'hr@secureguard.com', role: 'HR / Recruitment', status: 'Active', password: 'password123' },
  { id: 'USR-005', name: 'Client X', email: 'client@secureguard.com', role: 'Client Admin', status: 'Active', password: 'password123' },
  { id: 'USR-006', name: 'Marcus Thorne', email: 'm.thorne@security.com', role: 'Guard', status: 'Active', password: 'password123' },
];

export const clients: Client[] = [
  { id: 'CL-001', name: 'Global Tech Corp', contactPerson: 'John Hammond', email: 'j.hammond@globaltech.com', phone: '+1 (555) 123-4567', status: 'Active', industry: 'Technology' },
  { id: 'CL-002', name: 'Eastside Properties', contactPerson: 'Linda Vance', email: 'vance@eastside.com', phone: '+1 (555) 987-6543', status: 'Active', industry: 'Real Estate' },
  { id: 'CL-003', name: 'Springfield Retail', contactPerson: 'Milton Bradley', email: 'mbradley@sretail.com', phone: '+1 (555) 456-7890', status: 'Inactive', industry: 'Retail' },
  { id: 'CL-004', name: 'Prestige Hospitality', contactPerson: 'Sophie Chen', email: 'schen@prestige.com', phone: '+1 (555) 222-3333', status: 'Active', industry: 'Hospitality' },
  { id: 'CL-005', name: 'National Energy', contactPerson: 'Ray Arnold', email: 'arnold@natenergy.gov', phone: '+1 (555) 111-0000', status: 'Active', industry: 'Infrastructure' },
];

export const subcontractors: Subcontractor[] = [
  { id: 'SUB-001', name: 'Peak Security Services', companyReg: 'REG-992211', contactEmail: 'ops@peaksec.com', contactPhone: '+44 7700 900001', status: 'Approved', guardCount: 15, rating: 4.8 },
  { id: 'SUB-002', name: 'Night Watchers Ltd', companyReg: 'REG-883344', contactEmail: 'info@nightwatch.co.uk', contactPhone: '+44 7700 900002', status: 'Pending', guardCount: 8, rating: 4.2 },
  { id: 'SUB-003', name: 'Rapid Response Inc', companyReg: 'REG-774455', contactEmail: 'support@rapidresponse.com', contactPhone: '+44 7700 900003', status: 'Suspended', guardCount: 0, rating: 2.5 },
];

export const guards: Guard[] = [
  { id: 'GRD-001', name: 'Marcus Thorne', email: 'm.thorne@security.com', status: 'Active', complianceStatus: 'Compliant', currentSiteId: 'SITE-001', currentSiteName: 'Tech Hub HQ', lastLocationUpdate: subMinutes(now, 2).toISOString(), licenceExpiry: addDays(now, 240).toISOString(), docsMissing: 0, performanceScore: 94, weeklyHours: 38, isAvailable: true },
  { id: 'GRD-002', name: 'Sarah Jenkins', email: 's.jenkins@security.com', status: 'On Break', complianceStatus: 'Expiring Soon', currentSiteId: 'SITE-002', currentSiteName: 'Retail Park East', lastLocationUpdate: subMinutes(now, 15).toISOString(), licenceExpiry: addDays(now, 15).toISOString(), docsMissing: 1, performanceScore: 88, weeklyHours: 42, isAvailable: false },
  { id: 'GRD-003', name: 'Leo Varga', email: 'l.varga@security.com', status: 'Active', complianceStatus: 'Compliant', currentSiteId: 'SITE-001', currentSiteName: 'Tech Hub HQ', lastLocationUpdate: subMinutes(now, 5).toISOString(), licenceExpiry: addDays(now, 180).toISOString(), docsMissing: 0, performanceScore: 91, weeklyHours: 24, isAvailable: true },
  { id: 'GRD-004', name: 'Elena Rossi', email: 'e.rossi@security.com', status: 'Off Duty', complianceStatus: 'Non-Compliant', lastLocationUpdate: subHours(now, 2).toISOString(), licenceExpiry: now.toISOString(), docsMissing: 3, performanceScore: 72, weeklyHours: 12, isAvailable: true },
  { id: 'GRD-005', name: 'David Chen', email: 'd.chen@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 400).toISOString(), docsMissing: 0, performanceScore: 96, weeklyHours: 32, isAvailable: true },
  { id: 'GRD-006', name: 'Aisha Khan', email: 'a.khan@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 320).toISOString(), docsMissing: 0, performanceScore: 89, weeklyHours: 18, isAvailable: true },
  { id: 'GRD-007', name: 'Robert Fox', email: 'r.fox@security.com', status: 'Off Duty', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 150).toISOString(), docsMissing: 0, performanceScore: 85, weeklyHours: 40, isAvailable: true },
  { id: 'GRD-008', name: 'Julia Song', email: 'j.song@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 210).toISOString(), docsMissing: 0, performanceScore: 92, weeklyHours: 10, isAvailable: true },
  { id: 'GRD-009', name: 'Kevin Peters', email: 'k.peters@security.com', status: 'Suspended', complianceStatus: 'Non-Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: subDays(now, 5).toISOString(), docsMissing: 2, performanceScore: 45, weeklyHours: 0, isAvailable: false },
  { id: 'GRD-010', name: 'Chloe Adams', email: 'c.adams@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 290).toISOString(), docsMissing: 0, performanceScore: 90, weeklyHours: 20, isAvailable: true },
  { id: 'GRD-011', name: 'Thomas Miller', email: 't.miller@security.com', status: 'Off Duty', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 500).toISOString(), docsMissing: 0, performanceScore: 88, weeklyHours: 0, isAvailable: true },
  { id: 'GRD-012', name: 'Sofia Rodriguez', email: 's.rodriguez@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 410).toISOString(), docsMissing: 0, performanceScore: 95, weeklyHours: 35, isAvailable: true },
  { id: 'GRD-013', name: 'Liam Wilson', email: 'l.wilson@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 380).toISOString(), docsMissing: 0, performanceScore: 82, weeklyHours: 40, isAvailable: true },
  { id: 'GRD-014', name: 'Zoe Barnes', email: 'z.barnes@security.com', status: 'On Break', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 120).toISOString(), docsMissing: 0, performanceScore: 97, weeklyHours: 22, isAvailable: true },
  { id: 'GRD-015', name: 'Omar Hassan', email: 'o.hassan@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 600).toISOString(), docsMissing: 0, performanceScore: 91, weeklyHours: 30, isAvailable: true },
  { id: 'GRD-016', name: 'Mia Wong', email: 'm.wong@security.com', status: 'Off Duty', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 440).toISOString(), docsMissing: 0, performanceScore: 89, weeklyHours: 0, isAvailable: true },
  { id: 'GRD-017', name: 'James Carter', email: 'j.carter@security.com', status: 'Active', complianceStatus: 'Expiring Soon', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 28).toISOString(), docsMissing: 1, performanceScore: 84, weeklyHours: 15, isAvailable: true },
  { id: 'GRD-018', name: 'Isabella Garcia', email: 'i.garcia@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 720).toISOString(), docsMissing: 0, performanceScore: 93, weeklyHours: 28, isAvailable: true },
  { id: 'GRD-019', name: 'Noah Smith', email: 'n.smith@security.com', status: 'Off Duty', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 330).toISOString(), docsMissing: 0, performanceScore: 86, weeklyHours: 12, isAvailable: true },
  { id: 'GRD-020', name: 'Emma Johnson', email: 'e.johnson@security.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 510).toISOString(), docsMissing: 0, performanceScore: 94, weeklyHours: 36, isAvailable: true },
  { id: 'GRD-021', name: 'Sarah Connor', email: 's.connor@resistance.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 800).toISOString(), docsMissing: 0, performanceScore: 99, weeklyHours: 40, isAvailable: true },
  { id: 'GRD-022', name: 'Kyle Reese', email: 'k.reese@resistance.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 150).toISOString(), docsMissing: 0, performanceScore: 92, weeklyHours: 32, isAvailable: true },
  { id: 'GRD-023', name: 'Ellen Ripley', email: 'ripley@weyland.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 900).toISOString(), docsMissing: 0, performanceScore: 98, weeklyHours: 20, isAvailable: true },
  { id: 'GRD-024', name: 'Arthur Dent', email: 'arthur@hitchhiker.com', status: 'Off Duty', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 45).toISOString(), docsMissing: 1, performanceScore: 65, weeklyHours: 0, isAvailable: true },
  { id: 'GRD-025', name: 'Ford Prefect', email: 'ford@hitchhiker.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 300).toISOString(), docsMissing: 0, performanceScore: 88, weeklyHours: 15, isAvailable: true },
  { id: 'GRD-026', name: 'Michael Scott', email: 'm.scott@dundermifflin.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 200).toISOString(), docsMissing: 0, performanceScore: 40, weeklyHours: 45, isAvailable: true },
  { id: 'GRD-027', name: 'Dwight Schrute', email: 'd.schrute@dundermifflin.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 1000).toISOString(), docsMissing: 0, performanceScore: 100, weeklyHours: 60, isAvailable: true },
  { id: 'GRD-028', name: 'Jim Halpert', email: 'j.halpert@dundermifflin.com', status: 'On Break', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 400).toISOString(), docsMissing: 0, performanceScore: 85, weeklyHours: 25, isAvailable: true },
  { id: 'GRD-029', name: 'Pam Beesly', email: 'p.beesly@dundermifflin.com', status: 'Active', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 350).toISOString(), docsMissing: 0, performanceScore: 90, weeklyHours: 30, isAvailable: true },
  { id: 'GRD-030', name: 'Stanley Hudson', email: 's.hudson@dundermifflin.com', status: 'Off Duty', complianceStatus: 'Compliant', lastLocationUpdate: now.toISOString(), licenceExpiry: addDays(now, 50).toISOString(), docsMissing: 0, performanceScore: 70, weeklyHours: 10, isAvailable: true },
];

export const sites: Site[] = [
  { id: 'SITE-001', name: 'Tech Hub HQ', clientId: 'CL-001', clientName: 'Global Tech Corp', address: '123 Innovation Way, Silicon Valley', riskLevel: 'High', activeGuardsCount: 5, openShifts: 2, healthScore: 92, revenuePerMonth: 45000 },
  { id: 'SITE-002', name: 'Retail Park East', clientId: 'CL-002', clientName: 'Eastside Properties', address: '45 Commerce Blvd, Springfield', riskLevel: 'Medium', activeGuardsCount: 2, openShifts: 0, healthScore: 78, revenuePerMonth: 12000 },
  { id: 'SITE-003', name: 'Data Center Alpha', clientId: 'CL-001', clientName: 'Global Tech Corp', address: 'Secret Location, Nevada', riskLevel: 'Critical', activeGuardsCount: 12, openShifts: 5, healthScore: 98, revenuePerMonth: 85000 },
  { id: 'SITE-004', name: 'Grand Plaza Hotel', clientId: 'CL-004', clientName: 'Prestige Hospitality', address: '777 Luxury Row, Las Vegas', riskLevel: 'High', activeGuardsCount: 4, openShifts: 1, healthScore: 88, revenuePerMonth: 32000 },
  { id: 'SITE-005', name: 'Riverside Warehouse', clientId: 'CL-002', clientName: 'Eastside Properties', address: '200 Logistics Lane, Riverside', riskLevel: 'Low', activeGuardsCount: 1, openShifts: 0, healthScore: 95, revenuePerMonth: 8000 },
  { id: 'SITE-006', name: 'Metro Construction', clientId: 'CL-002', clientName: 'Eastside Properties', address: 'Downtown Hub, Sector 4', riskLevel: 'Medium', activeGuardsCount: 3, openShifts: 4, healthScore: 65, revenuePerMonth: 15000 },
  { id: 'SITE-007', name: 'Grid Substation Delta', clientId: 'CL-005', clientName: 'National Energy', address: 'North Ridge, Sector 9', riskLevel: 'Critical', activeGuardsCount: 2, openShifts: 1, healthScore: 96, revenuePerMonth: 25000 },
  { id: 'SITE-008', name: 'Port Terminal 7', clientId: 'CL-005', clientName: 'National Energy', address: 'Bay View Harbor, Pier 7', riskLevel: 'High', activeGuardsCount: 6, openShifts: 3, healthScore: 84, revenuePerMonth: 55000 },
  { id: 'SITE-009', name: 'Greenwood Park', clientId: 'CL-002', clientName: 'Eastside Properties', address: '99 Corporate Plaza, Suburbia', riskLevel: 'Low', activeGuardsCount: 1, openShifts: 0, healthScore: 91, revenuePerMonth: 10000 },
  { id: 'SITE-010', name: 'City Hospital South', clientId: 'CL-004', clientName: 'Prestige Hospitality', address: '101 Health Ave, Downtown', riskLevel: 'Medium', activeGuardsCount: 4, openShifts: 2, healthScore: 87, revenuePerMonth: 28000 },
  { id: 'SITE-011', name: 'Wayne Enterprises HQ', clientId: 'CL-001', clientName: 'Global Tech Corp', address: '1007 Mountain Drive, Gotham', riskLevel: 'Critical', activeGuardsCount: 8, openShifts: 4, healthScore: 99, revenuePerMonth: 120000 },
  { id: 'SITE-012', name: 'Nakatomi Plaza', clientId: 'CL-002', clientName: 'Eastside Properties', address: '2121 Avenue of the Stars, LA', riskLevel: 'High', activeGuardsCount: 6, openShifts: 10, healthScore: 45, revenuePerMonth: 95000 },
  { id: 'SITE-013', name: 'Stark Industries Fab', clientId: 'CL-001', clientName: 'Global Tech Corp', address: 'Industrial Sector 4, Malibu', riskLevel: 'Critical', activeGuardsCount: 15, openShifts: 2, healthScore: 95, revenuePerMonth: 200000 },
  { id: 'SITE-014', name: 'Dunder Mifflin Scranton', clientId: 'CL-003', clientName: 'Springfield Retail', address: '1725 Slough Avenue, Scranton', riskLevel: 'Low', activeGuardsCount: 1, openShifts: 0, healthScore: 80, revenuePerMonth: 5000 },
  { id: 'SITE-015', name: 'Cyberdyne Systems', clientId: 'CL-001', clientName: 'Global Tech Corp', address: 'Silicon Valley South, CA', riskLevel: 'Critical', activeGuardsCount: 20, openShifts: 15, healthScore: 92, revenuePerMonth: 350000 },
];

const generate2026Shifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const roles = ['Static Guard', 'Patrol Officer', 'Site Supervisor', 'Access Controller', 'CCTV Monitor', 'Canine Handler', 'Armed Response', 'Executive Protection'];
  const priorities: ('Routine' | 'Urgent' | 'STAT')[] = ['Routine', 'Urgent', 'STAT'];
  const guardPool = guards.filter(g => g.complianceStatus === 'Compliant' && g.status !== 'Suspended');

  const days = eachDayOfInterval({
    start: new Date(2026, 0, 1),
    end: new Date(2026, 11, 31)
  });

  days.forEach((day, dIdx) => {
    const isSept = getMonth(day) === 8;
    const sitesToPopulate = isSept ? sites : sites.slice(0, 8); 

    sitesToPopulate.forEach((site, sIdx) => {
      for (let s = 0; s < 2; s++) {
        const isDayShift = s === 0;
        const startHour = isDayShift ? 8 : 20;
        const endHour = isDayShift ? 16 : 4;
        
        const startTime = set(day, { hours: startHour, minutes: 0, seconds: 0 });
        const endTime = set(addDays(day, isDayShift ? 0 : 1), { hours: endHour, minutes: 0, seconds: 0 });

        const unassignedProbability = isSept ? 0.30 : 0.15;
        const unassigned = Math.random() < unassignedProbability;
        
        const assignedGuards: AssignedGuard[] = [];
        if (!unassigned) {
          // Multi-guard simulation logic for large sites
          const numGuards = site.riskLevel === 'Critical' ? 3 : site.riskLevel === 'High' ? 2 : 1;
          for (let i = 0; i < numGuards; i++) {
            const g = guardPool[(dIdx + sIdx + s + i) % guardPool.length];
            assignedGuards.push({ id: g.id, name: g.name });
          }
        }

        shifts.push({
          id: `SHF-2026-${dIdx}-${site.id}-${s}`,
          siteId: site.id,
          siteName: site.name,
          assignedGuards,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: unassigned ? 'Open' : (getMonth(day) < getMonth(now) ? 'Completed' : 'Claimed'),
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          role: roles[Math.floor(Math.random() * roles.length)]
        });
      }
    });
  });

  return shifts;
};

export const shifts: Shift[] = [
  { id: 'SHF-001', siteId: 'SITE-001', siteName: 'Tech Hub HQ', assignedGuards: [{ id: 'GRD-001', name: 'Marcus Thorne' }], startTime: subHours(now, 2).toISOString(), endTime: subHours(now, -6).toISOString(), status: 'In Progress', priority: 'Urgent', role: 'Armed Static Guard' },
  ...generate2026Shifts()
];

export const incidents: Incident[] = [
  { id: 'INC-2024-001', siteId: 'SITE-001', siteName: 'Tech Hub HQ', guardId: 'GRD-001', guardName: 'Marcus Thorne', type: 'Intrusion', severity: 'High', status: 'Open', description: 'Unauthorized access detected at Perimeter Fence B. Person scaled fence and headed towards Server Room 1.', timestamp: subHours(now, 1).toISOString() },
  { id: 'INC-2024-002', siteId: 'SITE-002', siteName: 'Retail Park East', guardId: 'GRD-002', guardName: 'Sarah Jenkins', type: 'Observation', severity: 'Low', status: 'Resolved', description: 'Minor water leak discovered in the parking garage ceiling. Maintenance notified.', timestamp: subHours(now, 4).toISOString() }
];

export const sosAlerts: SOSAlert[] = [
  { id: 'SOS-001', guardId: 'GRD-001', guardName: 'Marcus Thorne', siteName: 'Tech Hub HQ', timestamp: subMinutes(now, 2).toISOString(), status: 'Active', location: { lat: 37.7749, lng: -122.4194 } }
];

export const vehicles: Vehicle[] = [
  { id: 'VH-101', model: 'Toyota Hilux 4x4', plate: 'SEC-001-HQ', status: 'Active', location: 'Sector A-12', fuelLevel: 65, nextService: addDays(now, 45).toISOString() },
  { id: 'VH-102', model: 'Ford Ranger', plate: 'SEC-002-HQ', status: 'Maintenance', location: 'Main Depot', fuelLevel: 12, nextService: subDays(now, 2).toISOString() }
];

export const visitors: Visitor[] = [
  { id: 'VIS-001', name: 'Robert Miller', company: 'Otis Elevators', siteName: 'Tech Hub HQ', checkIn: subHours(now, 2).toISOString(), hostName: 'Admin Team', status: 'Checked In' },
  { id: 'VIS-002', name: 'Alice Wong', company: 'CleanCo Services', siteName: 'Retail Park East', checkIn: subHours(now, 1).toISOString(), hostName: 'Site Supervisor', status: 'Checked In' }
];

export const patrols: Patrol[] = [
  { id: 'PAT-001', siteName: 'Tech Hub HQ', guardName: 'Marcus Thorne', startTime: subMinutes(now, 45).toISOString(), completion: 85, status: 'In Progress', checkpoints: 12 },
  { id: 'PAT-002', siteName: 'Data Center Alpha', guardName: 'Leo Varga', startTime: subHours(now, 2).toISOString(), completion: 100, status: 'Completed', checkpoints: 24 }
];

export const payrollRecords: PayrollRecord[] = [
  { id: 'PAY-001', guardName: 'Marcus Thorne', period: 'Feb 01 - Feb 15', hours: 84, amount: 3250.50, status: 'Paid' },
  { id: 'PAY-002', guardName: 'Sarah Jenkins', period: 'Feb 01 - Feb 15', hours: 76, amount: 2850.00, status: 'Pending' }
];

export const applicants: Applicant[] = [
  { id: 'APP-001', name: 'John Doe', role: 'Static Guard', appliedDate: subDays(now, 2).toISOString(), status: 'Applied', experience: '5 years' },
  { id: 'APP-002', name: 'Jane Smith', role: 'Patrol Officer', appliedDate: subDays(now, 5).toISOString(), status: 'Interview', experience: '3 years' },
];

export const messages: Message[] = [
  { id: 'MSG-001', senderName: 'Marcus Thorne', preview: 'I have arrived at Checkpoint B. All secure.', timestamp: subMinutes(now, 5).toISOString(), status: 'unread', type: 'WhatsApp' },
];

export const invoices: Invoice[] = [
  { id: 'INV-2024-001', clientName: 'Global Tech Corp', amount: 45000.00, date: subDays(now, 2).toISOString(), status: 'Pending', siteName: 'Tech Hub HQ' },
];

export const forms: FormDefinition[] = [
  { id: 'FRM-001', name: 'Incident Report v2', fields: 12, lastModified: subDays(now, 1).toISOString(), status: 'Active' },
];
