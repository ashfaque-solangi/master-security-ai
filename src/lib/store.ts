'use client';

/**
 * @fileOverview SecureGuard Command Storage Service
 */

import { 
  guards as initialGuards, 
  sites as initialSites,
  users as initialUsers,
  clients as initialClients,
  subcontractors as initialSubcontractors,
  shifts as initialShifts,
  incidents as initialIncidents,
  visitors as initialVisitors,
  invoices as initialInvoices,
  applicants as initialApplicants,
  patrols as initialPatrols,
  payrollRecords as initialPayroll,
  forms as initialForms,
  sosAlerts as initialSOS,
  alarms as initialAlarms,
  vehicles as initialVehicles,
  documents as initialDocs,
  contracts as initialContracts,
  leaveRecords as initialLeave
} from './data';
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PatrolCheckpoint, PatrolRoute, PatrolEvent,
  PayrollRecord, FormDefinition,
  AuditRecord, AuditAction, 
  SOSAlert, Alarm, Vehicle, Contract, 
  UserSession, MockDocument, LeaveRecord, ShiftAssignment,
  PermissionAction,
  ComplianceStatus,
  GuardLocation,
  LiveGuardContext,
  TrackingStatus,
  ScanValidationStatus
} from './types';
import { validateGuardAssignment } from './scheduling-validation';
import { AccessControlService } from './access-control';
import { isPast, parseISO, addDays, isBefore, differenceInSeconds } from 'date-fns';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p10_v2',
  SITES: 'sg_sites_p10_v2',
  USERS: 'sg_users_p10_v2',
  CLIENTS: 'sg_clients_p10_v2',
  SUBS: 'sg_subs_p10_v2',
  SHIFTS: 'sg_shifts_p10_v2',
  INCIDENTS: 'sg_incidents_p10_v2',
  VISITORS: 'sg_visitors_p10_v2',
  INVOICES: 'sg_invoices_p10_v2',
  APPLICANTS: 'sg_applicants_p10_v2',
  PATROLS: 'sg_patrols_p10_v2',
  CHECKPOINTS: 'sg_checkpoints_p10_v2',
  ROUTES: 'sg_routes_p10_v2',
  PATROL_EVENTS: 'sg_patrol_events_p10_v2',
  PAYROLL: 'sg_payroll_p10_v2',
  FORMS: 'sg_forms_p10_v2',
  AUDITS: 'sg_audits_p10_v2',
  CURRENT_USER: 'sg_current_user_p10_v2',
  CURRENT_SESSION_ID: 'sg_current_session_id_p10_v2',
  SESSIONS: 'sg_sessions_p10_v2',
  SOS: 'sg_sos_p10_v2',
  ALARMS: 'sg_alarms_p10_v2',
  VEHICLES: 'sg_vehicles_p10_v2',
  CONTRACTS: 'sg_contracts_p10_v2',
  DOCUMENTS: 'sg_docs_p10_v2',
  LEAVE: 'sg_leave_p10_v2',
  LOCATIONS: 'sg_locations_p10_v2'
};

const isBrowser = typeof window !== 'undefined';
const MAX_CONCURRENT_DEVICES = 2;
export const STALE_THRESHOLD_SECONDS = 30;

function getStored<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  const stored = localStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, data: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
}

export const useJsonStore = () => {
  const getCurrentUser = (): User | null => getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  const getCurrentSessionId = (): string | null => getStored<string | null>(STORAGE_KEYS.CURRENT_SESSION_ID, null);
  
  const logAudit = (params: {
    action: AuditAction;
    entityType: AuditRecord['entityType'];
    entityId: string;
    description: string;
    oldValues?: any;
    newValues?: any;
    metadata?: Record<string, any>;
    status?: AuditRecord['status'];
  }) => {
    const user = getCurrentUser() || { id: 'SYSTEM', name: 'System', role: 'SUPER_ADMIN' as any, organizationId: 'SYSTEM' };
    const newRecord: AuditRecord = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      oldValues: params.oldValues || null,
      newValues: params.newValues || null,
      metadata: params.metadata,
      status: params.status || 'success',
      organizationId: user.organizationId
    };
    const updated = [newRecord, ...getStored<AuditRecord[]>(STORAGE_KEYS.AUDITS, [])];
    setStored(STORAGE_KEYS.AUDITS, updated);
  };

  const getProtectedData = <T>(key: string, defaultValue: T, entityType: string): T => {
    const user = getCurrentUser();
    if (!user) return [] as any;
    const data = getStored<T[]>(key, defaultValue as any[]);
    return AccessControlService.filterByScope(user, entityType, data) as any;
  };

  const assertWrite = (action: PermissionAction, entityType: string, record?: any): boolean => {
    const user = getCurrentUser();
    if (!user) return false;
    if (!AccessControlService.assertMutation(user, action, entityType, record)) {
      logAudit({
        action: 'ACCESS_DENIED',
        entityType: entityType as any,
        entityId: record?.id || 'NEW',
        description: `Unauthorized ${action} attempt on ${entityType}`,
        status: 'REJECTED',
        metadata: { role: user.role }
      });
      return false;
    }
    return true;
  };

  const calculateComplianceStatus = (guard: Guard): ComplianceStatus => {
    if (guard.isComplianceOverridden) return 'Compliant';
    
    const expiries = [
      guard.licenceExpiry ? parseISO(guard.licenceExpiry) : null,
      guard.dbsExpiry ? parseISO(guard.dbsExpiry) : null,
      guard.rtwExpiry ? parseISO(guard.rtwExpiry) : null
    ].filter(Boolean) as Date[];

    if (expiries.length === 0) return 'Missing';
    
    const now = new Date();
    if (expiries.some(e => isPast(e))) return 'Expired';
    if (expiries.some(e => isBefore(e, addDays(now, 30)))) return 'Expiring Soon';
    
    return 'Compliant';
  };

  const heartbeat = (): boolean => {
    const sessionId = getCurrentSessionId();
    if (!sessionId) return false;
    const sessions = getStored<UserSession[]>(STORAGE_KEYS.SESSIONS, []);
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.status !== 'Active') {
      logout();
      return false;
    }
    const updated = sessions.map(s => s.id === sessionId ? { ...s, lastActiveAt: new Date().toISOString() } : s);
    setStored(STORAGE_KEYS.SESSIONS, updated);
    return true;
  };

  const logout = () => {
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      const all = getStored<UserSession[]>(STORAGE_KEYS.SESSIONS, []);
      setStored(STORAGE_KEYS.SESSIONS, all.map(s => s.id === sessionId ? { ...s, status: 'LoggedOut' as const } : s));
    }
    setStored(STORAGE_KEYS.CURRENT_USER, null);
    setStored(STORAGE_KEYS.CURRENT_SESSION_ID, null);
  };

  const updateShiftStatus = (shift: Shift): Shift => {
    const required = shift.requirements?.reduce((a, b) => a + b.count, 0) || 1;
    const assigned = shift.assignments?.filter(a => ['Assigned', 'Confirmed', 'In Transit', 'On Site'].includes(a.status)).length || 0;
    
    if (shift.status === 'Draft') return shift;
    
    return {
      ...shift,
      status: assigned >= required ? 'Claimed' : 'Open'
    };
  };

  const generateShiftCode = (existingShifts: Shift[]): string => {
    const year = new Date().getFullYear();
    const prefix = `SH-${year}-`;
    const nums = existingShifts
      .filter(s => s.code && s.code.startsWith(prefix))
      .map(s => {
        const parts = s.code.split('-');
        return parts.length === 3 ? parseInt(parts[2]) : 0;
      })
      .filter(n => !isNaN(n));
      
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  };

  return {
    getCurrentUser,
    getCurrentSessionId,
    setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),
    heartbeat,
    
    login: (email: string, password: string, deviceId: string) => {
      const usersList = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const user = usersList.find(u => u.email === email && u.password === (password || 'password123'));
      
      if (!user) {
        logAudit({ action: 'LOGIN_FAILED', entityType: 'user', entityId: email, description: `Failed login attempt for ${email}`, status: 'error' });
        return { success: false, error: 'Invalid credentials' };
      }

      const allSessions = getStored<UserSession[]>(STORAGE_KEYS.SESSIONS, []);
      const activeSessions = allSessions.filter(s => s.userId === user.id && s.status === 'Active');
      const existingDeviceSession = activeSessions.find(s => s.deviceId === deviceId);
      
      if (!existingDeviceSession) {
        const distinctActiveDevices = Array.from(new Set(activeSessions.map(s => s.deviceId)));
        if (distinctActiveDevices.length >= MAX_CONCURRENT_DEVICES) {
          logAudit({ action: 'LOGIN_BLOCKED_DEVICE_LIMIT', entityType: 'session', entityId: user.id, description: `Login blocked: Max device limit reached`, status: 'REJECTED' });
          return { success: false, error: 'Maximum devices reached.' };
        }
      }

      const sessionId = existingDeviceSession?.id || `SES-${Date.now()}`;
      const newSession: UserSession = {
        id: sessionId,
        userId: user.id,
        userName: user.name,
        organizationId: user.organizationId,
        deviceId: deviceId,
        userAgent: isBrowser ? navigator.userAgent : 'Unknown',
        ipAddress: '127.0.0.1',
        createdAt: existingDeviceSession?.createdAt || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        status: 'Active'
      };

      setStored(STORAGE_KEYS.SESSIONS, [newSession, ...allSessions.filter(s => s.id !== sessionId)]);
      setStored(STORAGE_KEYS.CURRENT_USER, user);
      setStored(STORAGE_KEYS.CURRENT_SESSION_ID, sessionId);
      logAudit({ action: 'USER_LOGIN', entityType: 'user', entityId: user.id, description: `Login successful` });
      return { success: true, user };
    },

    logout,

    revokeSession: (sessionId: string) => {
      const sessions = getStored<UserSession[]>(STORAGE_KEYS.SESSIONS, []);
      const updated = sessions.map(s => s.id === sessionId ? { ...s, status: 'Revoked' as const } : s);
      setStored(STORAGE_KEYS.SESSIONS, updated);
      logAudit({ action: 'SESSION_REVOKED', entityType: 'session', entityId: sessionId, description: `Session revoked by administrator` });
    },

    getGuards: () => getProtectedData<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards, 'guard'),
    getSites: () => getProtectedData<Site[]>(STORAGE_KEYS.SITES, initialSites, 'site'),
    getClients: () => getProtectedData<Client[]>(STORAGE_KEYS.CLIENTS, initialClients, 'client'),
    getShifts: () => {
      const user = getCurrentUser();
      if (!user) return [];
      const rawData = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const validatedData = rawData.map(s => {
        if (!s.code || !s.name) {
          const shiftYear = s.startTime ? new Date(s.startTime).getFullYear() : new Date().getFullYear();
          const safeId = (s.id || 'REF').slice(-6);
          return {
            ...s,
            code: s.code || `SH-${shiftYear}-${safeId}`,
            name: s.name || s.role || 'Security Shift'
          };
        }
        return s;
      });
      return AccessControlService.filterByScope(user, 'shift', validatedData);
    },
    getIncidents: () => getProtectedData<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents, 'incident'),
    getAudits: () => getProtectedData<AuditRecord[]>(STORAGE_KEYS.AUDITS, [], 'audit'),
    getSessions: () => getStored<UserSession[]>(STORAGE_KEYS.SESSIONS, []),
    getSubcontractors: () => getProtectedData<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors, 'subcontractor'),
    getPatrols: () => getProtectedData<Patrol[]>(STORAGE_KEYS.PATROLS, initialPatrols, 'patrol'),
    getCheckpoints: () => getProtectedData<PatrolCheckpoint[]>(STORAGE_KEYS.CHECKPOINTS, [], 'patrol'),
    getRoutes: () => getProtectedData<PatrolRoute[]>(STORAGE_KEYS.ROUTES, [], 'patrol'),
    getPatrolEvents: () => getProtectedData<PatrolEvent[]>(STORAGE_KEYS.PATROL_EVENTS, [], 'patrol'),
    getPayroll: () => getProtectedData<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, initialPayroll, 'finance'),
    getVisitors: () => getProtectedData<Visitor[]>(STORAGE_KEYS.VISITORS, initialVisitors, 'view'),
    getDocuments: () => getProtectedData<MockDocument[]>(STORAGE_KEYS.DOCUMENTS, initialDocs, 'document'),
    getContracts: () => getProtectedData<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts, 'contract'),
    getForms: () => getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms),
    getApplicants: () => getProtectedData<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants, 'hr'),
    getSOS: () => getProtectedData<SOSAlert[]>(STORAGE_KEYS.SOS, initialSOS, 'view'),
    getAlarms: () => getProtectedData<Alarm[]>(STORAGE_KEYS.ALARMS, initialAlarms, 'view'),
    getVehicles: () => getProtectedData<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles, 'view'),
    getLeave: () => getProtectedData<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave, 'hr'),
    getGuardLocations: () => getProtectedData<GuardLocation[]>(STORAGE_KEYS.LOCATIONS, [], 'location'),

    getLiveGuardContexts: (): LiveGuardContext[] => {
      const user = getCurrentUser();
      if (!user) return [];

      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const activeShifts = shifts.filter(s => s.status === 'In Progress');
      const allGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const allSites = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const allLocations = getStored<GuardLocation[]>(STORAGE_KEYS.LOCATIONS, []);

      const contexts: LiveGuardContext[] = [];
      const now = new Date();

      activeShifts.forEach(shift => {
        const site = allSites.find(s => s.id === shift.siteId);
        if (!site) return;

        shift.assignments?.forEach(asg => {
          const guard = allGuards.find(g => g.id === asg.guardId);
          if (!guard) return;

          const location = allLocations.find(l => l.guardId === asg.guardId);
          
          let status: TrackingStatus = 'Offline';
          if (location) {
            const secondsAgo = differenceInSeconds(now, parseISO(location.timestamp));
            status = secondsAgo > STALE_THRESHOLD_SECONDS ? 'Stale' : 'Active';
          }

          contexts.push({
            guard,
            assignment: asg,
            shift,
            site,
            location,
            status,
            rolePerformed: asg.rolePerformed
          });
        });
      });

      return AccessControlService.filterByScope(user, 'location', contexts);
    },

    updateGuardLocation: (loc: GuardLocation) => {
      const all = getStored<GuardLocation[]>(STORAGE_KEYS.LOCATIONS, []);
      const updated = [loc, ...all.filter(l => l.guardId !== loc.guardId)].slice(0, 500); // Keep last 500 per org
      setStored(STORAGE_KEYS.LOCATIONS, updated);
      return updated;
    },

    addGuard: (g: Guard) => {
      if (!assertWrite('hr', 'guard')) return [];
      const updated = [g, ...getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards)];
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'GUARD_CREATED', entityType: 'guard', entityId: g.id, description: `Guard profile created for ${g.name}.`, newValues: g });
      return updated;
    },
    updateGuard: (g: Guard) => {
      if (!assertWrite('hr', 'guard', g)) return [];
      const all = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const compliance = calculateComplianceStatus(g);
      const updatedGuard = { ...g, complianceStatus: compliance };
      const updated = all.map(o => o.id === g.id ? updatedGuard : o);
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: g.id, description: `Guard profile updated for ${g.name}.`, newValues: updatedGuard });
      return updated;
    },
    deleteGuard: (id: string) => {
      if (!assertWrite('hr', 'guard')) return [];
      const all = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'USER_DELETED', entityType: 'guard', entityId: id, description: `Guard profile deleted.` });
      return updated;
    },

    overrideCompliance: (guardId: string, reason: string) => {
      if (!assertWrite('compliance.override', 'guard')) return;
      const all = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const guard = all.find(g => g.id === guardId);
      if (!guard) return;
      const updatedGuard = { ...guard, isComplianceOverridden: true, overrideReason: reason, overrideBy: getCurrentUser()?.name || 'ADMIN' };
      const updated = all.map(g => g.id === guardId ? updatedGuard : g);
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'COMPLIANCE_OVERRIDE', entityType: 'guard', entityId: guardId, description: `Compliance manually overridden: ${reason}` });
    },

    addShift: (s: Shift) => {
      if (!assertWrite('schedule', 'shift')) return [];
      const allShifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const code = generateShiftCode(allShifts);
      const newShift = { ...s, code, version: 1 };
      const updated = [newShift, ...allShifts];
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_CREATED', entityType: 'shift', entityId: newShift.id, description: `Shift [${code}] ${newShift.name} created.`, newValues: newShift });
      return updated;
    },
    updateShift: (s: Shift) => {
      if (!assertWrite('schedule', 'shift', s)) return [];
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const existing = all.find(x => x.id === s.id);
      if (existing && existing.version !== s.version) throw new Error('STALE_VERSION');
      const updatedShift = { ...s, code: existing?.code || s.code, version: (s.version || 0) + 1 };
      const updated = all.map(o => o.id === s.id ? updatedShift : o);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_UPDATED', entityType: 'shift', entityId: s.id, description: `Shift [${updatedShift.code}] updated.`, newValues: updatedShift });
      return updated;
    },
    publishShift: (shiftId: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule.publish', 'shift', shift)) return all;
      const updatedShift: Shift = updateShiftStatus({ ...shift, status: 'Open', version: (shift.version || 0) + 1 });
      const updated = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_PUBLISHED', entityType: 'shift', entityId: shiftId, description: `Shift [${shift.code}] published.`, newValues: updatedShift });
      return updated;
    },
    deleteShift: (id: string) => {
      if (!assertWrite('schedule', 'shift')) return [];
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_DELETED', entityType: 'shift', entityId: id, description: `Shift deleted.` });
      return updated;
    },

    deployShift: (shiftId: string, siteId: string) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const sites = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const shift = shifts.find(s => s.id === shiftId);
      const site = sites.find(s => s.id === siteId);
      if (!shift || !site || !assertWrite('schedule', 'shift', shift)) return shifts;

      const allShifts = shifts;
      const allLeave = getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave);
      for (const asg of (shift.assignments || [])) {
        const guard = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards).find(g => g.id === asg.guardId);
        if (guard) {
          const v = validateGuardAssignment(guard, shift, allShifts, allLeave, asg.rolePerformed, site);
          if (!v.isValid) throw new Error(`Guard ${guard.name} ineligible for site ${site.name}: ${v.message}`);
        }
      }

      const updatedShift: Shift = { ...shift, siteId, siteName: site.name, version: (shift.version || 0) + 1 };
      const updated = shifts.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_DEPLOYED', entityType: 'shift', entityId: shiftId, description: `Shift [${shift.code}] deployed to ${site.name}`, newValues: { siteId, siteName: site.name } });
      return updated;
    },

    moveShift: (shiftId: string, newSiteId: string) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const sites = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const shift = shifts.find(s => s.id === shiftId);
      const newSite = sites.find(s => s.id === newSiteId);
      if (!shift || !newSite || !assertWrite('schedule', 'shift', shift)) return shifts;

      const oldSiteName = shift.siteName;
      const allLeave = getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave);
      for (const asg of (shift.assignments || [])) {
        const guard = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards).find(g => g.id === asg.guardId);
        if (guard) {
          const v = validateGuardAssignment(guard, shift, shifts, allLeave, asg.rolePerformed, newSite);
          if (!v.isValid) throw new Error(`Deployment Blocked: ${guard.name} is ineligible for ${newSite.name} (${v.message})`);
        }
      }

      const updatedShift: Shift = { ...shift, siteId: newSiteId, siteName: newSite.name, version: (shift.version || 0) + 1 };
      const updated = shifts.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_DEPLOYMENT_CHANGED', entityType: 'shift', entityId: shiftId, description: `Shift [${shift.code}] moved from ${oldSiteName} to ${newSite.name}`, newValues: { from: oldSiteName, to: newSite.name } });
      return updated;
    },

    undeployShift: (shiftId: string) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return shifts;

      const updatedShift: Shift = { ...shift, siteId: '', siteName: 'Not Deployed', version: (shift.version || 0) + 1 };
      const updated = shifts.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_UNDEPLOYED', entityType: 'shift', entityId: shiftId, description: `Shift [${shift.code}] undeployed.` });
      return updated;
    },

    // WEB-07 Patrol System Storage Methods
    addCheckpoint: (cp: PatrolCheckpoint) => {
      if (!assertWrite('patrol.manage', 'patrol')) return [];
      const updated = [cp, ...getStored<PatrolCheckpoint[]>(STORAGE_KEYS.CHECKPOINTS, [])];
      setStored(STORAGE_KEYS.CHECKPOINTS, updated);
      logAudit({ action: 'PATROL_CHECKPOINT_CREATED', entityType: 'patrol', entityId: cp.id, description: `Checkpoint ${cp.name} added to site ${cp.siteId}` });
      return updated;
    },

    addRoute: (route: PatrolRoute) => {
      if (!assertWrite('patrol.manage', 'patrol')) return [];
      const updated = [route, ...getStored<PatrolRoute[]>(STORAGE_KEYS.ROUTES, [])];
      setStored(STORAGE_KEYS.ROUTES, updated);
      logAudit({ action: 'PATROL_ROUTE_CREATED', entityType: 'patrol', entityId: route.id, description: `Route ${route.name} created for site ${route.siteId}` });
      return updated;
    },

    recordPatrolScan: (params: { 
      shiftId: string, 
      routeId: string, 
      checkpointId: string, 
      guardId: string,
      isSimulated: boolean 
    }) => {
      const user = getCurrentUser();
      if (!user) return;

      const routes = getStored<PatrolRoute[]>(STORAGE_KEYS.ROUTES, []);
      const route = routes.find(r => r.id === params.routeId);
      if (!route) throw new Error("Route not found");

      const existingEvents = getStored<PatrolEvent[]>(STORAGE_KEYS.PATROL_EVENTS, []);
      const shiftEvents = existingEvents.filter(e => e.shiftId === params.shiftId && e.routeId === params.routeId);
      
      // Validation Logic: Out of Sequence detection
      const lastScannedIndex = shiftEvents.length > 0 
        ? route.checkpointIds.indexOf(shiftEvents[shiftEvents.length - 1].checkpointId)
        : -1;
      
      const currentTargetIndex = route.checkpointIds.indexOf(params.checkpointId);
      
      let validation: ScanValidationStatus = 'Valid';
      if (currentTargetIndex === -1) {
        validation = 'Unexpected';
      } else if (currentTargetIndex !== lastScannedIndex + 1) {
        validation = 'Out of Sequence';
      }

      const newEvent: PatrolEvent = {
        id: `EVT-${Date.now()}`,
        organizationId: user.organizationId,
        shiftId: params.shiftId,
        routeId: params.routeId,
        checkpointId: params.checkpointId,
        guardId: params.guardId,
        timestamp: new Date().toISOString(),
        scanType: 'QR',
        sequenceNumber: shiftEvents.length + 1,
        validationStatus: validation,
        isSimulated: params.isSimulated
      };

      const updatedEvents = [...existingEvents, newEvent];
      setStored(STORAGE_KEYS.PATROL_EVENTS, updatedEvents);

      // Log to Audit
      logAudit({ 
        action: 'PATROL_SCAN', 
        entityType: 'patrol', 
        entityId: params.shiftId, 
        description: `Officer scanned checkpoint ${params.checkpointId}. Status: ${validation}` 
      });

      // Update Live Patrol Status
      const activePatrols = getStored<Patrol[]>(STORAGE_KEYS.PATROLS, initialPatrols);
      const site = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).find(s => s.id === route.siteId);
      
      const patrolIdx = activePatrols.findIndex(p => p.shiftId === params.shiftId && p.routeId === params.routeId);
      if (patrolIdx > -1) {
        const p = activePatrols[patrolIdx];
        const newCompleted = new Set(updatedEvents.filter(e => e.shiftId === params.shiftId).map(e => e.checkpointId)).size;
        activePatrols[patrolIdx] = {
          ...p,
          status: 'Active',
          checkpoints: newCompleted,
          completion: Math.round((newCompleted / p.totalCheckpoints) * 100)
        };
        if (newCompleted >= p.totalCheckpoints) {
          activePatrols[patrolIdx].status = 'Completed';
          activePatrols[patrolIdx].endTime = new Date().toISOString();
        }
        setStored(STORAGE_KEYS.PATROLS, activePatrols);
      }

      return updatedEvents;
    },

    submitClaim: (shiftId: string, guardId: string, role: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('guard', 'shift', shift)) return all;
      const guard = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards).find(g => g.id === guardId);
      if (!guard) return all;
      const validation = validateGuardAssignment(guard, shift, all, getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave), role);
      if (!validation.isValid) throw new Error(validation.message);
      if ((shift.assignments || []).find(a => a.guardId === guardId && a.status === 'Pending')) return all;
      const newAssignment: ShiftAssignment = { id: `ASG-${Date.now()}`, guardId, guardName: guard.name, rolePerformed: role, status: 'Pending', assignedAt: new Date().toISOString(), assignedBy: 'GUARD_CLAIM' };
      const updatedShift: Shift = { ...shift, assignments: [...(shift.assignments || []), newAssignment], version: (shift.version || 0) + 1 };
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'CLAIM_REQUESTED', entityType: 'shift_assignment', entityId: newAssignment.id, description: `Claim for ${role} on ${shift.code}` });
      return finalShifts;
    },
    approveClaim: (shiftId: string, assignmentId: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;
      const assignment = (shift.assignments || []).find(a => a.id === assignmentId);
      if (!assignment || assignment.status !== 'Pending') return all;
      const guard = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards).find(g => g.id === assignment.guardId);
      if (!guard) return all;
      const validation = validateGuardAssignment(guard, shift, all, getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave), assignment.rolePerformed);
      if (!validation.isValid) throw new Error(validation.message);
      const updatedAssignments = shift.assignments.map(a => a.id === assignmentId ? { ...a, status: 'Assigned' as const } : a);
      const updatedShift: Shift = updateShiftStatus({ ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 });
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'CLAIM_APPROVED', entityType: 'shift_assignment', entityId: assignmentId, description: `Approved ${assignment.guardName} for ${shift.code}` });
      return finalShifts;
    },
    rejectClaim: (shiftId: string, assignmentId: string, reason?: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;
      const updatedAssignments = (shift.assignments || []).map(a => a.id === assignmentId ? { ...a, status: 'Rejected' as const, rejectionReason: reason } : a);
      const updatedShift: Shift = { ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 };
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'CLAIM_REJECTED', entityType: 'shift_assignment', entityId: assignmentId, description: `Rejected claim for ${shift.code}` });
      return finalShifts;
    },
    withdrawClaim: (shiftId: string, assignmentId: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift) return all;
      const assignment = (shift.assignments || []).find(a => a.id === assignmentId);
      if (!assignment || assignment.guardId !== getCurrentUser()?.guardId) return all;
      const updatedAssignments = shift.assignments.map(a => a.id === assignmentId ? { ...a, status: 'Withdrawn' as const } : a);
      const updatedShift: Shift = { ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 };
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'CLAIM_WITHDRAWN', entityType: 'shift_assignment', entityId: assignmentId, description: `Withdrew claim for ${shift.code}` });
      return finalShifts;
    },

    addShiftAssignment: (shiftId: string, assignment: ShiftAssignment) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;
      const updatedShift: Shift = updateShiftStatus({ ...shift, assignments: [...(shift.assignments || []), assignment], version: (shift.version || 0) + 1 });
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'GUARD_ASSIGNED', entityType: 'shift_assignment', entityId: assignment.id, description: `Assigned ${assignment.guardName} to ${shift.code}` });
      return finalShifts;
    },
    swapShiftAssignment: (shiftId: string, assignmentId: string, newGuard: Guard) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;
      const updatedAssignments = (shift.assignments || []).map(a => a.id === assignmentId ? { ...a, guardId: newGuard.id, guardName: newGuard.name, assignedAt: new Date().toISOString(), assignedBy: getCurrentUser()?.id || 'SYSTEM' } : a);
      const updatedShift: Shift = { ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 };
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'SHIFT_GUARD_SWAPPED', entityType: 'shift_assignment', entityId: assignmentId, description: `Swapped to ${newGuard.name} on ${shift.code}` });
      return finalShifts;
    },
    removeShiftAssignment: (shiftId: string, assignmentId: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;
      const updatedAssignments = (shift.assignments || []).filter(a => a.id !== assignmentId);
      const updatedShift: Shift = updateShiftStatus({ ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 });
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      logAudit({ action: 'GUARD_REMOVED', entityType: 'shift_assignment', entityId: assignmentId, description: `Removed guard from ${shift.code}` });
      return finalShifts;
    },

    changeAssignmentRole: (shiftId: string, assignmentId: string, newRole: string) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return shifts;

      const assignment = (shift.assignments || []).find(a => a.id === assignmentId);
      if (!assignment) return shifts;

      const guard = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards).find(g => g.id === assignment.guardId);
      if (guard) {
        const v = validateGuardAssignment(guard, shift, shifts, getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave), newRole);
        if (!v.isValid) throw new Error(`Role Change Blocked: ${v.message}`);
      }

      const updatedAssignments = shift.assignments.map(a => a.id === assignmentId ? { ...a, rolePerformed: newRole } : a);
      const updatedShift: Shift = { ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 };
      const updated = shifts.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'ROLE_CHANGED', entityType: 'shift_assignment', entityId: assignmentId, description: `Changed role for ${assignment.guardName} to ${newRole}` });
      return updated;
    },

    replaceGuard: (shiftId: string, oldAssignmentId: string, newGuard: Guard) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return shifts;

      const oldAsg = (shift.assignments || []).find(a => a.id === oldAssignmentId);
      if (!oldAsg) return shifts;

      const v = validateGuardAssignment(newGuard, shift, shifts, getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave), oldAsg.rolePerformed);
      if (!v.isValid) throw new Error(`Replacement Blocked: ${v.message}`);

      const updatedAssignments = shift.assignments.map(a => a.id === oldAssignmentId ? { ...a, guardId: newGuard.id, guardName: newGuard.name, assignedAt: new Date().toISOString(), status: 'Assigned' as const } : a);
      const updatedShift: Shift = { ...shift, assignments: updatedAssignments, version: (shift.version || 0) + 1 };
      const updated = shifts.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'GUARD_REPLACED', entityType: 'shift_assignment', entityId: oldAssignmentId, description: `Replaced personnel with ${newGuard.name} on ${shift.code}` });
      return updated;
    },

    autoFillAllShifts: () => {
      const user = getCurrentUser();
      if (!user || !AccessControlService.can(user, 'schedule')) return [];
      const allShifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const allGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const allLeave = getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave);
      const updatedShifts = allShifts.map(s => {
        if (s.status === 'Completed' || s.status === 'Cancelled') return s;
        const assignments = [...(s.assignments || [])];
        let changed = false;
        s.requirements?.forEach(req => {
          const filledCount = assignments.filter(a => a.rolePerformed === req.role && ['Assigned', 'Confirmed', 'On Site'].includes(a.status)).length;
          for (let i = 0; i < (req.count - filledCount); i++) {
            const candidate = allGuards.find(g => g.status === 'Active' && g.complianceStatus === 'Compliant' && validateGuardAssignment(g, s, allShifts, allLeave, req.role).isValid && !assignments.some(a => a.guardId === g.id));
            if (candidate) {
              assignments.push({ id: `ASG-${Date.now()}-${Math.random()}`, guardId: candidate.id, guardName: candidate.name, rolePerformed: req.role, status: 'Assigned', assignedAt: new Date().toISOString(), assignedBy: 'AI_AUTO' });
              changed = true;
            }
          }
        });
        return updateShiftStatus({ ...s, assignments, version: changed ? (s.version || 0) + 1 : s.version });
      });
      setStored(STORAGE_KEYS.SHIFTS, updatedShifts);
      logAudit({ action: 'AI_SCHEDULING_RUN', entityType: 'system', entityId: 'GLOBAL', description: 'AI Roster Optimization executed.' });
      return updatedShifts;
    },

    getUsers: () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (u: User) => {
      if (!assertWrite('manage', 'user')) return [];
      const updated = [u, ...getStored<User[]>(STORAGE_KEYS.USERS, initialUsers)];
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_CREATED', entityType: 'user', entityId: u.id, description: `New user ${u.name} created.` });
      return updated;
    },
    updateUser: (u: User) => {
      if (!assertWrite('manage', 'user')) return [];
      const all = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = all.map(o => o.id === u.id ? u : o);
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_UPDATED', entityType: 'user', entityId: u.id, description: `User ${u.name} updated.` });
      return updated;
    },
    deleteUser: (id: string) => {
      if (!assertWrite('manage', 'user')) return [];
      const all = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_DELETED', entityType: 'user', entityId: id, description: `User removed.` });
      return updated;
    },

    addClient: (c: Client) => {
      if (!assertWrite('manage', 'client')) return [];
      const updated = [c, ...getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients)];
      setStored(STORAGE_KEYS.CLIENTS, updated);
      logAudit({ action: 'CLIENT_CREATED', entityType: 'client', entityId: c.id, description: `Client ${c.name} registered.` });
      return updated;
    },
    updateClient: (c: Client) => {
      if (!assertWrite('manage', 'client', c)) return [];
      const all = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = all.map(o => o.id === c.id ? c : o);
      setStored(STORAGE_KEYS.CLIENTS, updated);
      logAudit({ action: 'CLIENT_UPDATED', entityType: 'client', entityId: c.id, description: `Client ${c.name} updated.` });
      return updated;
    },
    deleteClient: (id: string) => {
      if (!assertWrite('manage', 'client')) return [];
      const all = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.CLIENTS, updated);
      logAudit({ action: 'CLIENT_STATUS_CHANGED', entityType: 'client', entityId: id, description: `Client archived.` });
      return updated;
    },

    addSite: (s: Site) => {
      if (!assertWrite('manage', 'site')) return [];
      const all = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      if (all.some(x => x.code === s.code && x.organizationId === s.organizationId)) throw new Error('Duplicate Site Code');
      const updated = [s, ...all];
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_CREATED', entityType: 'site', entityId: s.id, description: `Site ${s.name} (${s.code}) created.` });
      return updated;
    },
    updateSite: (s: Site) => {
      if (!assertWrite('manage', 'site', s)) return [];
      const all = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = all.map(o => o.id === s.id ? s : o);
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_UPDATED', entityType: 'site', entityId: s.id, description: `Site ${s.name} updated.` });
      return updated;
    },
    deleteSite: (id: string) => {
      if (!assertWrite('manage', 'site')) return [];
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      if (shifts.some(s => s.siteId === id)) throw new Error('Cannot delete site with active shifts');
      const all = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_STATUS_CHANGED', entityType: 'site', entityId: id, description: `Site archived.` });
      return updated;
    },

    addIncident: (i: Incident) => {
      const updated = [i, ...getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents)];
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      logAudit({ action: 'INCIDENT_CREATED', entityType: 'incident', entityId: i.id, description: `Incident at ${i.siteName}` });
      return updated;
    },
    updateIncident: (i: Incident) => {
      const all = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = all.map(o => o.id === i.id ? i : o);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    deleteIncident: (id: string) => {
      const all = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },

    addSubcontractor: (s: Subcontractor) => {
      if (!assertWrite('manage', 'subcontractor')) return [];
      const updated = [s, ...getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors)];
      setStored(STORAGE_KEYS.SUBS, updated);
      return updated;
    },
    updateSubcontractor: (s: Subcontractor) => {
      if (!assertWrite('manage', 'subcontractor', s)) return [];
      const all = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors);
      const updated = all.map(o => o.id === s.id ? s : o);
      setStored(STORAGE_KEYS.SUBS, updated);
      return updated;
    },
    deleteSubcontractor: (id: string) => {
      if (!assertWrite('manage', 'subcontractor')) return [];
      const all = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.SUBS, updated);
      return updated;
    },

    addVehicle: (v: Vehicle) => {
      if (!assertWrite('manage', 'system')) return [];
      const updated = [v, ...getStored<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles)];
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },
    deleteVehicle: (id: string) => {
      if (!assertWrite('manage', 'system')) return [];
      const all = getStored<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },

    addForm: (f: FormDefinition) => {
      const updated = [f, ...getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms)];
      setStored(STORAGE_KEYS.FORMS, updated);
      return updated;
    },
    deleteForm: (id: string) => {
      const all = getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.FORMS, updated);
      return updated;
    },

    addContract: (c: Contract) => {
      if (!assertWrite('finance', 'contract')) return [];
      const updated = [c, ...getStored<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts)];
      setStored(STORAGE_KEYS.CONTRACTS, updated);
      logAudit({ action: 'CONTRACT_CREATED', entityType: 'contract', entityId: c.id, description: `Contract ${c.contractNumber} created.` });
      return updated;
    },
    updateContract: (c: Contract) => {
      if (!assertWrite('finance', 'contract', c)) return [];
      const all = getStored<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts);
      const updated = all.map(o => o.id === c.id ? c : o);
      setStored(STORAGE_KEYS.CONTRACTS, updated);
      logAudit({ action: 'CONTRACT_UPDATED', entityType: 'contract', entityId: c.id, description: `Contract ${c.contractNumber} updated.` });
      return updated;
    },

    addDocument: (doc: MockDocument) => {
      if (!assertWrite('manage', 'document')) return [];
      const all = getStored<MockDocument[]>(STORAGE_KEYS.DOCUMENTS, initialDocs);
      const updated = [doc, ...all.map(d => (d.name === doc.name && d.guardId === doc.guardId && d.siteId === doc.siteId && d.status === 'Current') ? { ...d, status: 'Archived' as const } : d)];
      setStored(STORAGE_KEYS.DOCUMENTS, updated);
      logAudit({ action: 'DOCUMENT_CREATED', entityType: 'document', entityId: doc.id, description: `Doc ${doc.name} version ${doc.version} uploaded.` });
      return updated;
    },

    logAudit,
    resetToDemo: () => {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      window.location.reload();
    },
    loadDemoDataset: () => {
      setStored(STORAGE_KEYS.GUARDS, initialGuards);
      setStored(STORAGE_KEYS.SITES, initialSites);
      setStored(STORAGE_KEYS.SHIFTS, initialShifts);
      setStored(STORAGE_KEYS.CLIENTS, initialClients);
      setStored(STORAGE_KEYS.SUBS, initialSubcontractors);
      setStored(STORAGE_KEYS.APPLICANTS, initialApplicants);
      setStored(STORAGE_KEYS.INCIDENTS, initialIncidents);
      setStored(STORAGE_KEYS.VISITORS, initialVisitors);
      setStored(STORAGE_KEYS.INVOICES, initialInvoices);
      setStored(STORAGE_KEYS.PATROLS, initialPatrols);
      setStored(STORAGE_KEYS.PAYROLL, initialPayroll);
      setStored(STORAGE_KEYS.VEHICLES, initialVehicles);
      setStored(STORAGE_KEYS.CONTRACTS, initialContracts);
      setStored(STORAGE_KEYS.DOCUMENTS, initialDocs);
      setStored(STORAGE_KEYS.LEAVE, initialLeave);
      logAudit({ action: 'SYSTEM_UPDATED', entityType: 'system', entityId: 'DEMO', description: 'High-fidelity demo data loaded.' });
      window.location.reload();
    }
  };
};