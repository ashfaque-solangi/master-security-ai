
'use client';

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
  jobPosts as initialJobPosts,
  interviews as initialInterviews,
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
  AuditRecord, AuditAction, ShiftAssignment, JobPost, Interview, 
  SOSAlert, Alarm, Vehicle, MockDocument, Contract, LeaveRecord, OperationalEvent
} from './types';
import { validateGuardAssignment } from './scheduling-validation';
import { AccessControlService } from './access-control';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p5_v1',
  SITES: 'sg_sites_p5_v1',
  USERS: 'sg_users_p5_v1',
  CLIENTS: 'sg_clients_p5_v1',
  SUBS: 'sg_subs_p5_v1',
  SHIFTS: 'sg_shifts_p5_v1',
  INCIDENTS: 'sg_incidents_p5_v1',
  VISITORS: 'sg_visitors_p5_v1',
  INVOICES: 'sg_invoices_p5_v1',
  APPLICANTS: 'sg_applicants_p5_v1',
  PATROLS: 'sg_patrols_p5_v1',
  PAYROLL: 'sg_payroll_p5_v1',
  FORMS: 'sg_forms_p5_v1',
  AUDITS: 'sg_audits_p5_v1',
  CURRENT_USER: 'sg_current_user_p5_v1',
  JOB_POSTS: 'sg_jobs_p5_v1',
  INTERVIEWS: 'sg_interviews_p5_v1',
  SOS: 'sg_sos_p5_v1',
  ALARMS: 'sg_alarms_p5_v1',
  VEHICLES: 'sg_vehicles_p5_v1',
  DOCS: 'sg_docs_p5_v1',
  CONTRACTS: 'sg_contracts_p5_v1',
  LEAVE: 'sg_leave_p5_v1',
  EVENTS: 'sg_events_p5_v1'
};

const isBrowser = typeof window !== 'undefined';

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

  const assertWrite = (action: any, entityType: string, record?: any): boolean => {
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

  return {
    getCurrentUser,
    setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),
    
    login: (email: string, password: string) => {
      const usersList = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const user = usersList.find(u => u.email === email && u.password === (password || 'password123'));
      if (user) {
        setStored(STORAGE_KEYS.CURRENT_USER, user);
        logAudit({ action: 'USER_LOGIN', entityType: 'user', entityId: user.id, description: `Login successful: ${user.name}` });
        return { success: true, user };
      }
      logAudit({ action: 'LOGIN_FAILED', entityType: 'user', entityId: email, description: `Failed login attempt for ${email}`, status: 'error' });
      return { success: false, error: 'Invalid credentials' };
    },

    logout: () => {
      const user = getCurrentUser();
      if (user) logAudit({ action: 'USER_LOGOUT', entityType: 'user', entityId: user.id, description: `Session ended` });
      setStored(STORAGE_KEYS.CURRENT_USER, null);
    },

    // Protected Entity Handlers
    getGuards: () => getProtectedData<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards, 'guard'),
    getSites: () => getProtectedData<Site[]>(STORAGE_KEYS.SITES, initialSites, 'site'),
    getClients: () => getProtectedData<Client[]>(STORAGE_KEYS.CLIENTS, initialClients, 'client'),
    getShifts: () => getProtectedData<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts, 'shift'),
    getIncidents: () => getProtectedData<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents, 'incident'),
    getSOS: () => getProtectedData<SOSAlert[]>(STORAGE_KEYS.SOS, initialSOS, 'incident'),
    getAlarms: () => getProtectedData<Alarm[]>(STORAGE_KEYS.ALARMS, initialAlarms, 'incident'),
    getVehicles: () => getProtectedData<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles, 'site'),
    getUsers: () => getProtectedData<User[]>(STORAGE_KEYS.USERS, initialUsers, 'user'),
    getAuditLogs: () => getProtectedData<AuditRecord[]>(STORAGE_KEYS.AUDITS, [], 'audit'),
    getApplicants: () => getProtectedData<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants, 'guard'),
    getJobPosts: () => getProtectedData<JobPost[]>(STORAGE_KEYS.JOB_POSTS, initialJobPosts, 'guard'),
    getDocs: () => getProtectedData<MockDocument[]>(STORAGE_KEYS.DOCS, initialDocs, 'document'),
    getContracts: () => getProtectedData<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts, 'contract'),
    getLeave: () => getProtectedData<LeaveRecord[]>(STORAGE_KEYS.LEAVE, initialLeave, 'guard'),
    getLiveEvents: () => getStored<OperationalEvent[]>(STORAGE_KEYS.EVENTS, []),

    // Scoped Mutations
    addSite: (s: Site) => {
      if (!assertWrite('manage', 'site')) return [];
      const user = getCurrentUser()!;
      const record = { ...s, organizationId: user.organizationId };
      const updated = [record, ...getStored<Site[]>(STORAGE_KEYS.SITES, initialSites)];
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_CREATED', entityType: 'site', entityId: record.id, description: `Site created: ${record.name}`, newValues: record });
      return updated;
    },

    updateGuard: (g: Guard) => {
      if (!assertWrite('hr', 'guard', g)) return [];
      const all = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const old = all.find(o => o.id === g.id);
      const updated = all.map(o => o.id === g.id ? g : o);
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: g.id, description: `Guard profile updated: ${g.name}`, oldValues: old, newValues: g });
      return updated;
    },

    updateRecruitmentStage: (applicantId: string, stage: RecruitmentStage) => {
      const all = getStored<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const applicant = all.find(a => a.id === applicantId);
      if (!applicant || !assertWrite('hr', 'guard', applicant)) return all;
      
      const oldStage = applicant.currentStage;
      const updated = all.map(a => a.id === applicantId ? { ...a, currentStage: stage } : a);
      setStored(STORAGE_KEYS.APPLICANTS, updated);
      logAudit({ action: 'SCOPE_CHANGED', entityType: 'guard', entityId: applicantId, description: `Applicant ${applicant.name} moved: ${oldStage} -> ${stage}`, metadata: { stage } });
      
      // If Active, create Guard Record
      if (stage === 'ACTIVE') {
        const guard: Guard = {
          id: `GRD-${applicantId.split('-')[1]}`,
          organizationId: applicant.organizationId,
          name: applicant.name,
          email: applicant.email,
          status: 'Active',
          complianceStatus: 'Compliant',
          licenceExpiry: new Date(Date.now() + 31536000000).toISOString(),
          docsMissing: 0,
          performanceScore: 100,
          weeklyHours: 0,
          isAvailable: true,
          qualifiedRoles: ['Security Guard'],
          skills: []
        };
        const allGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
        setStored(STORAGE_KEYS.GUARDS, [guard, ...allGuards]);
      }
      return updated;
    },

    addLiveEvent: (event: OperationalEvent) => {
      const events = getStored<OperationalEvent[]>(STORAGE_KEYS.EVENTS, []);
      const updated = [event, ...events].slice(0, 50);
      setStored(STORAGE_KEYS.EVENTS, updated);
      return updated;
    },

    autoFillAllShifts: () => {
      const user = getCurrentUser();
      if (!user || !AccessControlService.can(user, 'schedule')) return [];
      const allShifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const myShifts = AccessControlService.filterByScope(user, 'shift', allShifts);
      const allGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const myGuards = AccessControlService.filterByScope(user, 'guard', allGuards);

      const updatedShifts = allShifts.map(s => {
        if (!myShifts.some(ms => ms.id === s.id)) return s;
        if (s.status !== 'Open') return s;
        
        const assignments = [...s.assignments];
        s.requirements.forEach(req => {
          const filled = assignments.filter(a => a.rolePerformed === req.role).length;
          for (let i = 0; i < (req.count - filled); i++) {
            const best = myGuards.find(g => {
              if (g.status !== 'Active' || g.complianceStatus !== 'Compliant') return false;
              return validateGuardAssignment(g, s, allShifts, req.role).isValid;
            });
            if (best) {
              assignments.push({
                id: `ASG-${Date.now()}-${Math.random()}`,
                guardId: best.id, guardName: best.name, rolePerformed: req.role,
                status: 'Assigned', assignedAt: new Date().toISOString(), assignedBy: 'AI_AUTO'
              });
            }
          }
        });
        return { ...s, assignments, status: assignments.length > 0 ? 'Claimed' : 'Open' };
      });

      setStored(STORAGE_KEYS.SHIFTS, updatedShifts);
      logAudit({ action: 'AI_SCHEDULING_RUN', entityType: 'system', entityId: 'GLOBAL', description: 'AI Auto-Fill executed' });
      return AccessControlService.filterByScope(user, 'shift', updatedShifts);
    },

    resetToDemo: () => {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      window.location.reload();
    },
    
    logAudit
  };
};
