'use client';

/**
 * @fileOverview SecureGuard Command Storage Service
 * PERSISTENCE ARCHITECTURE NOTE:
 * Scheduling and operational data currently persists locally via localStorage.
 * For shared backend persistence, the getStored and setStored methods below 
 * serve as the primary abstraction boundary for Firebase/Firestore integration.
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
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  AuditRecord, AuditAction, 
  SOSAlert, Alarm, Vehicle, Contract, 
  RecruitmentStage, UserSession, MockDocument, LeaveRecord, ShiftAssignment,
  PermissionAction
} from './types';
import { validateGuardAssignment } from './scheduling-validation';
import { AccessControlService } from './access-control';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p6_v1',
  SITES: 'sg_sites_p6_v1',
  USERS: 'sg_users_p6_v1',
  CLIENTS: 'sg_clients_p6_v1',
  SUBS: 'sg_subs_p6_v1',
  SHIFTS: 'sg_shifts_p6_v1',
  INCIDENTS: 'sg_incidents_p6_v1',
  VISITORS: 'sg_visitors_p6_v1',
  INVOICES: 'sg_invoices_p6_v1',
  APPLICANTS: 'sg_applicants_p6_v1',
  PATROLS: 'sg_patrols_p6_v1',
  PAYROLL: 'sg_payroll_p6_v1',
  FORMS: 'sg_forms_p6_v1',
  AUDITS: 'sg_audits_p6_v1',
  CURRENT_USER: 'sg_current_user_p6_v1',
  CURRENT_SESSION_ID: 'sg_current_session_id_p6_v1',
  SESSIONS: 'sg_sessions_p6_v1',
  SOS: 'sg_sos_p6_v1',
  ALARMS: 'sg_alarms_p6_v1',
  VEHICLES: 'sg_vehicles_p6_v1',
  CONTRACTS: 'sg_contracts_p6_v1',
  DOCUMENTS: 'sg_docs_p6_v1',
  LEAVE: 'sg_leave_p6_v1'
};

const isBrowser = typeof window !== 'undefined';
const MAX_CONCURRENT_DEVICES = 2;

function getStored<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
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
    getShifts: () => getProtectedData<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts, 'shift'),
    getIncidents: () => getProtectedData<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents, 'incident'),
    getAudits: () => getProtectedData<AuditRecord[]>(STORAGE_KEYS.AUDITS, [], 'audit'),
    getSessions: () => getStored<UserSession[]>(STORAGE_KEYS.SESSIONS, []),
    getSubcontractors: () => getProtectedData<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors, 'subcontractor'),
    getPatrols: () => getProtectedData<Patrol[]>(STORAGE_KEYS.PATROLS, initialPatrols, 'view'),
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
      const updated = all.map(o => o.id === g.id ? g : o);
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: g.id, description: `Guard profile updated for ${g.name}.`, newValues: g });
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

    addShift: (s: Shift) => {
      if (!assertWrite('schedule', 'shift')) return [];
      const updated = [{ ...s, version: 1 }, ...getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts)];
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_CREATED', entityType: 'shift', entityId: s.id, description: `Shift requirement created for ${s.siteName}.`, newValues: s });
      return updated;
    },

    updateShift: (s: Shift) => {
      if (!assertWrite('schedule', 'shift', s)) return [];
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const existing = all.find(x => x.id === s.id);
      
      // OPTIMISTIC CONCURRENCY PROTECTION
      if (existing && existing.version !== s.version) {
        logAudit({ 
          action: 'CONCURRENT_UPDATE_REJECTED', 
          entityType: 'shift', 
          entityId: s.id, 
          description: `Conflict: Stale version (Expected ${existing.version}, Got ${s.version})`,
          metadata: { attempted: s, current: existing },
          status: 'error'
        });
        throw new Error('STALE_VERSION');
      }

      const updated = all.map(o => o.id === s.id ? { ...s, version: (s.version || 0) + 1 } : o);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_UPDATED', entityType: 'shift', entityId: s.id, description: `Shift at ${s.siteName} updated.`, newValues: s });
      return updated;
    },

    publishShift: (shiftId: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      
      if (!shift) throw new Error('Shift not found');
      
      // WEB-05: Publish permission check
      if (!assertWrite('schedule.publish', 'shift', shift)) return all;

      const updatedShift: Shift = {
        ...shift,
        status: shift.assignments.length > 0 ? 'Claimed' : 'Open',
        version: (shift.version || 0) + 1
      };

      const updated = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      
      logAudit({ 
        action: 'SHIFT_PUBLISHED', 
        entityType: 'shift', 
        entityId: shiftId, 
        description: `Shift at ${shift.siteName} published and is now operational.`,
        newValues: updatedShift 
      });

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

    addShiftAssignment: (shiftId: string, assignment: ShiftAssignment) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;

      const updatedShift: Shift = {
        ...shift,
        assignments: [...shift.assignments, assignment],
        // Preserve status logic: only move from Open to Claimed if it was already published
        status: shift.status === 'Open' ? 'Claimed' : shift.status,
        version: (shift.version || 0) + 1
      };
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      
      logAudit({ 
        action: 'GUARD_ASSIGNED', 
        entityType: 'shift_assignment', 
        entityId: assignment.id, 
        description: `Assigned ${assignment.guardName} to ${shift.siteName} as ${assignment.rolePerformed}`,
        newValues: assignment
      });

      return finalShifts;
    },

    swapShiftAssignment: (shiftId: string, assignmentId: string, newGuard: Guard) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;

      const assignment = shift.assignments.find(a => a.id === assignmentId);
      if (!assignment) return all;

      const oldGuardName = assignment.guardName;
      const updatedAssignments = shift.assignments.map(a => 
        a.id === assignmentId ? {
          ...a,
          guardId: newGuard.id,
          guardName: newGuard.name,
          assignedAt: new Date().toISOString(),
          assignedBy: getCurrentUser()?.id || 'SYSTEM'
        } : a
      );

      const updatedShift: Shift = { 
        ...shift, 
        assignments: updatedAssignments,
        version: (shift.version || 0) + 1 
      };
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);
      
      logAudit({ 
        action: 'SHIFT_GUARD_SWAPPED', 
        entityType: 'shift_assignment', 
        entityId: assignmentId, 
        description: `Swapped ${oldGuardName} with ${newGuard.name} as ${assignment.rolePerformed}`,
        metadata: { previous: oldGuardName, replacement: newGuard.name, role: assignment.rolePerformed }
      });

      return finalShifts;
    },

    removeShiftAssignment: (shiftId: string, assignmentId: string) => {
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const shift = all.find(s => s.id === shiftId);
      if (!shift || !assertWrite('schedule', 'shift', shift)) return all;

      const assignment = shift.assignments.find(a => a.id === assignmentId);
      const updatedAssignments = shift.assignments.filter(a => a.id !== assignmentId);
      
      // If the shift was claimed and now has no assignments, return to Open if it was already published
      const newStatus = (shift.status === 'Claimed' && updatedAssignments.length === 0) ? 'Open' : shift.status;

      const updatedShift: Shift = { 
        ...shift, 
        assignments: updatedAssignments, 
        status: newStatus,
        version: (shift.version || 0) + 1
      };
      
      const finalShifts = all.map(s => s.id === shiftId ? updatedShift : s);
      setStored(STORAGE_KEYS.SHIFTS, finalShifts);

      logAudit({ 
        action: 'GUARD_REMOVED', 
        entityType: 'shift_assignment', 
        entityId: assignmentId, 
        description: `Removed ${assignment?.guardName} from ${shift.siteName}` 
      });

      return finalShifts;
    },

    autoFillAllShifts: () => {
      const user = getCurrentUser();
      if (!user || !AccessControlService.can(user, 'schedule')) return [];
      const allShifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const allGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const allLeave = getStored<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave);

      const updatedShifts = allShifts.map(s => {
        // AI optimization typically works on Draft or Open shifts
        if (s.status === 'Completed' || s.status === 'Cancelled') return s;
        const assignments = [...s.assignments];
        let changed = false;
        s.requirements.forEach(req => {
          const filledCount = assignments.filter(a => a.rolePerformed === req.role).length;
          for (let i = 0; i < (req.count - filledCount); i++) {
            const candidate = allGuards.find(g => 
              g.status === 'Active' && 
              g.complianceStatus === 'Compliant' &&
              validateGuardAssignment(g, s, allShifts, allLeave, req.role).isValid
            );
            if (candidate) {
              assignments.push({
                id: `ASG-${Date.now()}-${Math.random()}`,
                guardId: candidate.id,
                guardName: candidate.name,
                rolePerformed: req.role,
                status: 'Assigned',
                assignedAt: new Date().toISOString(),
                assignedBy: 'AI_AUTO'
              });
              changed = true;
            }
          }
        });
        
        const newStatus = (s.status === 'Open' || s.status === 'Draft') && assignments.length > 0 && s.status !== 'Draft' 
          ? 'Claimed' 
          : s.status;

        return { 
          ...s, 
          assignments, 
          status: newStatus,
          version: changed ? (s.version || 0) + 1 : s.version
        };
      });

      setStored(STORAGE_KEYS.SHIFTS, updatedShifts);
      logAudit({ action: 'AI_SCHEDULING_RUN', entityType: 'system', entityId: 'GLOBAL', description: 'AI Roster Optimization executed.' });
      return updatedShifts;
    },

    updateRecruitmentStage: (applicantId: string, nextStage: RecruitmentStage) => {
      if (!assertWrite('hr', 'guard')) return [];
      const all = getStored<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const applicant = all.find(a => a.id === applicantId);
      if (!applicant) return all;

      const updatedApplicants = all.map(a => a.id === applicantId ? { ...a, currentStage: nextStage } : a);
      setStored(STORAGE_KEYS.APPLICANTS, updatedApplicants);

      if (nextStage === 'ACTIVE') {
        const newGuard: Guard = {
          id: `GRD-${Date.now()}`,
          organizationId: applicant.organizationId,
          name: applicant.name,
          email: applicant.email,
          status: 'Active',
          complianceStatus: 'Compliant',
          licenceExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
          docsMissing: 0,
          performanceScore: 100,
          weeklyHours: 0,
          isAvailable: true,
          qualifiedRoles: ['SECURITY_GUARD'],
          skills: [],
          primaryRole: 'SECURITY_GUARD'
        };
        const currentGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
        setStored(STORAGE_KEYS.GUARDS, [newGuard, ...currentGuards]);
        logAudit({ action: 'GUARD_CREATED', entityType: 'guard', entityId: newGuard.id, description: `Provisioned guard profile from active applicant ${applicant.name}` });
      }

      return updatedApplicants;
    },

    getUsers: () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (u: User) => {
      if (!assertWrite('manage', 'user')) return [];
      const updated = [u, ...getStored<User[]>(STORAGE_KEYS.USERS, initialUsers)];
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_CREATED', entityType: 'user', entityId: u.id, description: `New platform user ${u.name} created.` });
      return updated;
    },
    updateUser: (u: User) => {
      if (!assertWrite('manage', 'user')) return [];
      const all = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = all.map(o => o.id === u.id ? u : o);
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_UPDATED', entityType: 'user', entityId: u.id, description: `User profile updated for ${u.name}.` });
      return updated;
    },
    deleteUser: (id: string) => {
      if (!assertWrite('manage', 'user')) return [];
      const all = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_DELETED', entityType: 'user', entityId: id, description: `User removed from platform.` });
      return updated;
    },

    addClient: (c: Client) => {
      if (!assertWrite('manage', 'client')) return [];
      const updated = [c, ...getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients)];
      setStored(STORAGE_KEYS.CLIENTS, updated);
      logAudit({ action: 'CLIENT_CREATED', entityType: 'client', entityId: c.id, description: `New client account ${c.name} registered.` });
      return updated;
    },
    updateClient: (c: Client) => {
      if (!assertWrite('manage', 'client', c)) return [];
      const all = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = all.map(o => o.id === c.id ? c : o);
      setStored(STORAGE_KEYS.CLIENTS, updated);
      logAudit({ action: 'CLIENT_UPDATED', entityType: 'client', entityId: c.id, description: `Client profile updated for ${c.name}.` });
      return updated;
    },
    deleteClient: (id: string) => {
      if (!assertWrite('manage', 'client')) return [];
      const all = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.CLIENTS, updated);
      logAudit({ action: 'CLIENT_STATUS_CHANGED', entityType: 'client', entityId: id, description: `Client account archived.` });
      return updated;
    },

    addSite: (s: Site) => {
      if (!assertWrite('manage', 'site')) return [];
      const updated = [s, ...getStored<Site[]>(STORAGE_KEYS.SITES, initialSites)];
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_CREATED', entityType: 'site', entityId: s.id, description: `New operational site ${s.name} created.` });
      return updated;
    },
    updateSite: (s: Site) => {
      if (!assertWrite('manage', 'site', s)) return [];
      const all = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = all.map(o => o.id === s.id ? s : o);
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_UPDATED', entityType: 'site', entityId: s.id, description: `Site parameters updated for ${s.name}.` });
      return updated;
    },
    deleteSite: (id: string) => {
      if (!assertWrite('manage', 'site')) return [];
      const all = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = all.filter(o => o.id !== id);
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_STATUS_CHANGED', entityType: 'site', entityId: id, description: `Operational site archived.` });
      return updated;
    },

    addIncident: (i: Incident) => {
      const updated = [i, ...getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents)];
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      logAudit({ action: 'INCIDENT_CREATED', entityType: 'incident', entityId: i.id, description: `Incident reported at ${i.siteName}` });
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
      logAudit({ action: 'CONTRACT_CREATED', entityType: 'contract', entityId: c.id, description: `New service agreement ${c.contractNumber} registered.` });
      return updated;
    },
    updateContract: (c: Contract) => {
      if (!assertWrite('finance', 'contract', c)) return [];
      const all = getStored<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts);
      const updated = all.map(o => o.id === c.id ? c : o);
      setStored(STORAGE_KEYS.CONTRACTS, updated);
      logAudit({ action: 'CONTRACT_UPDATED', entityType: 'contract', entityId: c.id, description: `Contract terms updated for ${c.contractNumber}.` });
      return updated;
    },

    addDocument: (doc: MockDocument) => {
      if (!assertWrite('manage', 'document')) return [];
      const all = getStored<MockDocument[]>(STORAGE_KEYS.DOCUMENTS, initialDocs);
      
      // Automatic versioning: if document with same name/site exists, archive previous
      const updated = [doc, ...all.map(d => 
        (d.name === doc.name && d.siteId === doc.siteId && d.status === 'Current') 
        ? { ...d, status: 'Archived' as const } 
        : d
      )];
      
      setStored(STORAGE_KEYS.DOCUMENTS, updated);
      logAudit({ 
        action: doc.version === '1.0' ? 'DOCUMENT_CREATED' : 'DOCUMENT_VERSION_CREATED', 
        entityType: 'document', 
        entityId: doc.id, 
        description: `Version ${doc.version} of ${doc.name} uploaded.` 
      });
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
      logAudit({ action: 'SYSTEM_UPDATED', entityType: 'system', entityId: 'DEMO', description: 'Seeded high-fidelity deterministic records.' });
      window.location.reload();
    }
  };
};
