
export type GuardStatus = 'Active' | 'On Break' | 'Off Duty' | 'Suspended';
export type ComplianceStatus = 'Compliant' | 'Expiring Soon' | 'Non-Compliant';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Archived';
export type IncidentType = 'Intrusion' | 'Fire' | 'Vandalism' | 'Medical' | 'Maintenance' | 'Observation';

export type Guard = {
  id: string;
  name: string;
  email: string;
  status: GuardStatus;
  complianceStatus: ComplianceStatus;
  currentSiteId?: string;
  currentSiteName?: string;
  lastLocationUpdate: string;
  avatarUrl?: string;
  licenceExpiry: string;
  docsMissing: number;
  performanceScore: number;
};

export type Site = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  address: string;
  riskLevel: Severity;
  activeGuardsCount: number;
  openShifts: number;
  healthScore: number;
  revenuePerMonth: number;
};

export type Incident = {
  id: string;
  siteId: string;
  siteName: string;
  guardId: string;
  guardName: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  description: string;
  timestamp: string;
  mediaUrls?: string[];
};

export type SOSAlert = {
  id: string;
  guardId: string;
  guardName: string;
  siteName: string;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  location: { lat: number; lng: number };
};

export type Shift = {
  id: string;
  siteId: string;
  siteName: string;
  guardId?: string;
  guardName?: string;
  startTime: string;
  endTime: string;
  status: 'Published' | 'Open' | 'Claimed' | 'In Progress' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  role: string;
};

export type Vehicle = {
  id: string;
  model: string;
  plate: string;
  status: 'Active' | 'Maintenance' | 'Available';
  location: string;
  fuelLevel: number;
  nextService: string;
};

export type Visitor = {
  id: string;
  name: string;
  company: string;
  siteName: string;
  checkIn: string;
  checkOut?: string;
  hostName: string;
  status: 'Expected' | 'Checked In' | 'Checked Out';
};

export type Patrol = {
  id: string;
  siteName: string;
  guardName: string;
  startTime: string;
  completion: number;
  status: 'Completed' | 'In Progress' | 'Missed';
  checkpoints: number;
};

export type PayrollRecord = {
  id: string;
  guardName: string;
  period: string;
  hours: number;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid';
};

export type Applicant = {
  id: string;
  name: string;
  role: string;
  appliedDate: string;
  status: 'Applied' | 'Interview' | 'Background Check' | 'Hired' | 'Rejected';
  experience: string;
};

export type Message = {
  id: string;
  senderName: string;
  preview: string;
  timestamp: string;
  status: 'unread' | 'read';
  type: 'WhatsApp' | 'SMS' | 'Internal';
};

export type Invoice = {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  siteName: string;
};

export type FormDefinition = {
  id: string;
  name: string;
  fields: number;
  lastModified: string;
  status: 'Active' | 'Draft';
};
