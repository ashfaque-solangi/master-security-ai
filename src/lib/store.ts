
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
  forms as initialForms
} from './data';
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  AuditRecord, AuditAction, ShiftAssignment
} from './types';
import { validateGuardAssignment } from './scheduling-validation';
import { AccessControlService } from './access-control';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p4_v1',
  SITES: 'sg_sites_p4_v1',
  USERS: 'sg_users_p4_v1',
  CLIENTS: 'sg_clients_p4_v1',
  SUBS: 'sg_subs_p4_v1',
  SHIFTS: 'sg_shifts_p4_v1',
  INCIDENTS: 'sg_incidents_p4_v1',
  VISITORS: 'sg_visitors_p4_v1',
  INVOICES: 'sg_invoices_p4_v1',
  APPLICANTS: 'sg_applicants_p4_v1',
  PATROLS: 'sg_patrols_p4_v1',
  PAYROLL: 'sg_payroll_p4_v1',
  FORMS: 'sg_forms_p4_v1',
  AUDITS: 'sg_audits_p4_v1',
  CURRENT_USER: 'sg_current_user_p4_v1',
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
    const user = getCurrentUser() || { id: 'SYSTEM', name: 'AI Planner', role: 'SUPER_ADMIN' as any, organizationId: 'SYSTEM' };
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

  /**
   * Protected Data Access with Scope Enforcement
   */
  const getProtectedData = <T>(key: string, defaultValue: T, entityType: string): T => {
    const user = getCurrentUser();
    const data = getStored<T[]>(key, defaultValue as any[]);
    if (!user) return [] as any;
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
        status: 'REJECTED'
      });
      return false;
    }
    return true;
  };

  return {
    resetToDemo: () => {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      window.location.reload();
    },

    getCurrentUser,
    setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),
    login: (email: string, password: string) => {
      const usersList = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const user = usersList.find(u => u.email === email && u.password === (password || 'password123'));
      if (user) {
        setStored(STORAGE_KEYS.CURRENT_USER, user);
        logAudit({ action: 'USER_LOGIN', entityType: 'user', entityId: user.id, description: `Login successful for ${user.name}` });
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    logout: () => {
      const user = getCurrentUser();
      if (user) logAudit({ action: 'USER_LOGOUT', entityType: 'user', entityId: user.id, description: `User session terminated` });
      setStored(STORAGE_KEYS.CURRENT_USER, null);
    },

    getGuards: () => getProtectedData<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards, 'guard'),
    addGuard: (g: Guard) => {
      if (!assertWrite('manage', 'guard')) return [];
      const user = getCurrentUser()!;
      const record = { ...g, organizationId: user.organizationId };
      const updated = [record, ...getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards)];
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'GUARD_CREATED', entityType: 'guard', entityId: record.id, description: `New officer profile: ${record.name}`, newValues: record });
      return updated;
    },
    updateGuard: (g: Guard) => {
      if (!assertWrite('manage', 'guard', g)) return [];
      const all = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const old = all.find(o => o.id === g.id);
      const updated = all.map(o => o.id === g.id ? g : o);
      setStored(STORAGE_KEYS.GUARDS, updated);
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: g.id, description: `Profile modified: ${g.name}`, oldValues: old, newValues: g });
      return updated;
    },

    getSites: () => getProtectedData<Site[]>(STORAGE_KEYS.SITES, initialSites, 'site'),
    addSite: (s: Site) => {
      if (!assertWrite('manage', 'site')) return [];
      const user = getCurrentUser()!;
      const record = { ...s, organizationId: user.organizationId };
      const updated = [record, ...getStored<Site[]>(STORAGE_KEYS.SITES, initialSites)];
      setStored(STORAGE_KEYS.SITES, updated);
      logAudit({ action: 'SITE_CREATED', entityType: 'site', entityId: record.id, description: `New site: ${record.name}`, newValues: record });
      return updated;
    },

    getShifts: () => getProtectedData<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts, 'shift'),
    updateShift: (s: Shift) => {
      if (!assertWrite('schedule', 'shift', s)) return [];
      const all = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const old = all.find(o => o.id === s.id);
      const updated = all.map(o => o.id === s.id ? s : o);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      logAudit({ action: 'SHIFT_UPDATED', entityType: 'shift', entityId: s.id, description: `Deployment updated at ${s.siteName}`, oldValues: old, newValues: s });
      return updated;
    },

    getIncidents: () => getProtectedData<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents, 'incident'),
    getInvoices: () => getProtectedData<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices, 'finance'),
    getPayroll: () => getProtectedData<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, initialPayroll, 'finance'),
    getAudits: () => getProtectedData<AuditRecord[]>(STORAGE_KEYS.AUDITS, [], 'audit'),
    getUsers: () => getProtectedData<User[]>(STORAGE_KEYS.USERS, initialUsers, 'user'),
    getClients: () => getProtectedData<Client[]>(STORAGE_KEYS.CLIENTS, initialClients, 'client'),
    getSubcontractors: () => getProtectedData<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors, 'subcontractor'),

    logAudit,
    autoFillAllShifts: () => {
      const user = getCurrentUser();
      if (!user) return [];
      const allShifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const myShifts = AccessControlService.filterByScope(user, 'shift', allShifts);
      const allGuards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const myGuards = AccessControlService.filterByScope(user, 'guard', allGuards);

      logAudit({ action: 'AI_SCHEDULING_RUN', entityType: 'system', entityId: 'GLOBAL_PLAN', description: `AI optimization Pass` });

      const updatedShifts = allShifts.map(s => {
        if (!myShifts.some(ms => ms.id === s.id)) return s; // Skip shifts outside user's scope
        if (s.status === 'Completed' || s.status === 'In Progress') return s;
        
        const updatedAssignments: ShiftAssignment[] = [...(s.assignments || [])];
        s.requirements?.forEach(req => {
          const filledCount = updatedAssignments.filter(a => a.rolePerformed === req.role).length;
          const needed = req.count - filledCount;
          for (let i = 0; i < needed; i++) {
            const bestCandidate = myGuards.find(g => {
              if (g.status !== 'Active' || g.complianceStatus !== 'Compliant') return false;
              const validation = validateGuardAssignment(g, s, allShifts, req.role);
              return validation.isValid;
            });
            if (bestCandidate) {
              updatedAssignments.push({ 
                id: `ASG-${Date.now()}-${Math.random()}`, 
                guardId: bestCandidate.id, guardName: bestCandidate.name, 
                rolePerformed: req.role, status: 'Assigned', 
                assignedAt: new Date().toISOString(), assignedBy: 'AI_PLANNER' 
              });
            }
          }
        });
        return { ...s, assignments: updatedAssignments, status: updatedAssignments.length > 0 ? 'Claimed' : 'Open' };
      });

      setStored(STORAGE_KEYS.SHIFTS, updatedShifts);
      return AccessControlService.filterByScope(user, 'shift', updatedShifts);
    }
  };
};
