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
  const getShifts = () => getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
  const getGuards = () => getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
  const getAudits = () => getStored<AuditRecord[]>(STORAGE_KEYS.AUDITS, []);
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
    const user = getCurrentUser() || { id: 'SYSTEM', name: 'AI Planner', role: 'SUPER_ADMIN' as any };
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
      status: params.status || 'success'
    };
    const updated = [newRecord, ...getAudits()];
    setStored(STORAGE_KEYS.AUDITS, updated);
  };

  return {
    resetToDemo: () => {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      window.location.reload();
    },

    getCurrentUser,
    setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),
    login: (email: string, password: string) => {
      const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const user = users.find(u => u.email === email && u.password === (password || 'password123'));
      if (user) {
        setStored(STORAGE_KEYS.CURRENT_USER, user);
        logAudit({ action: 'ROLE_ASSIGNED', entityType: 'user', entityId: user.id, description: `Authentication successful for ${user.name}` });
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    logout: () => {
      const user = getCurrentUser();
      if (user) logAudit({ action: 'ROLE_ASSIGNED', entityType: 'user', entityId: user.id, description: `User session terminated` });
      setStored(STORAGE_KEYS.CURRENT_USER, null);
    },

    getGuards,
    addGuard: (g: Guard) => { 
      const updated = [g, ...getGuards()]; 
      setStored(STORAGE_KEYS.GUARDS, updated); 
      logAudit({ action: 'GUARD_CREATED', entityType: 'guard', entityId: g.id, description: `New officer profile: ${g.name}`, newValues: g });
      return updated; 
    },
    updateGuard: (g: Guard) => { 
      const old = getGuards().find(o => o.id === g.id);
      const updated = getGuards().map(old => old.id === g.id ? g : old); 
      setStored(STORAGE_KEYS.GUARDS, updated); 
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: g.id, description: `Profile modified: ${g.name}`, oldValues: old, newValues: g });
      return updated; 
    },
    deleteGuard: (id: string) => { 
      const updated = getGuards().filter(g => g.id !== id); 
      setStored(STORAGE_KEYS.GUARDS, updated); 
      logAudit({ action: 'GUARD_STATUS_CHANGED', entityType: 'guard', entityId: id, description: `Profile archived`, status: 'warning' });
      return updated; 
    },

    getSites: () => getStored<Site[]>(STORAGE_KEYS.SITES, initialSites),
    addSite: (s: Site) => { 
      const updated = [s, ...getStored<Site[]>(STORAGE_KEYS.SITES, initialSites)]; 
      setStored(STORAGE_KEYS.SITES, updated); 
      logAudit({ action: 'SITE_CREATED', entityType: 'site', entityId: s.id, description: `New operational site registered`, newValues: s });
      return updated; 
    },
    updateSite: (s: Site) => { 
      const old = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).find(o => o.id === s.id);
      const updated = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).map(old => old.id === s.id ? s : old); 
      setStored(STORAGE_KEYS.SITES, updated); 
      logAudit({ action: 'SITE_UPDATED', entityType: 'site', entityId: s.id, description: `Site configuration updated`, oldValues: old, newValues: s });
      return updated; 
    },

    getShifts,
    addShift: (s: Shift) => { 
      const updated = [s, ...getShifts()]; 
      setStored(STORAGE_KEYS.SHIFTS, updated); 
      logAudit({ action: 'SHIFT_CREATED', entityType: 'shift', entityId: s.id, description: `Shift created at ${s.siteName}`, newValues: s });
      return updated; 
    },
    updateShift: (s: Shift) => { 
      const old = getShifts().find(o => o.id === s.id);
      const updated = getShifts().map(old => old.id === s.id ? s : old); 
      setStored(STORAGE_KEYS.SHIFTS, updated); 
      logAudit({ action: 'SHIFT_UPDATED', entityType: 'shift', entityId: s.id, description: `Shift deployment updated`, oldValues: old, newValues: s });
      return updated; 
    },
    deleteShift: (id: string) => { 
      const updated = getShifts().filter(s => s.id !== id); 
      setStored(STORAGE_KEYS.SHIFTS, updated); 
      logAudit({ action: 'SHIFT_DELETED', entityType: 'shift', entityId: id, description: `Shift cancelled`, status: 'warning' });
      return updated; 
    },

    getUsers: () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (u: User) => {
      const updated = [u, ...getStored<User[]>(STORAGE_KEYS.USERS, initialUsers)];
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_CREATED', entityType: 'user', entityId: u.id, description: `New user profile: ${u.name}`, newValues: u });
      return updated;
    },
    updateUser: (u: User) => {
      const old = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).find(o => o.id === u.id);
      const updated = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).map(old => old.id === u.id ? u : old);
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_UPDATED', entityType: 'user', entityId: u.id, description: `User profile modified`, oldValues: old, newValues: u });
      return updated;
    },
    deleteUser: (id: string) => {
      const updated = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).filter(u => u.id !== id);
      setStored(STORAGE_KEYS.USERS, updated);
      logAudit({ action: 'USER_DELETED', entityType: 'user', entityId: id, description: `User removed from platform`, status: 'warning' });
      return updated;
    },

    getClients: () => getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients),
    getSubcontractors: () => getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors),
    getIncidents: () => getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    addIncident: (i: Incident) => {
      const updated = [i, ...getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents)];
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    updateIncident: (i: Incident) => {
      const updated = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents).map(old => old.id === i.id ? i : old);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    deleteIncident: (id: string) => {
      const updated = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents).filter(i => i.id !== id);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },

    getVisitors: () => getStored<Visitor[]>(STORAGE_KEYS.VISITORS, initialVisitors),
    getInvoices: () => getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices),
    getApplicants: () => getStored<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    getForms: () => getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms),
    getAudits,
    logAudit,
    
    autoFillAllShifts: () => {
      const allShifts = getShifts();
      const allGuards = getGuards();
      logAudit({ action: 'AI_SCHEDULING_RUN', entityType: 'system', entityId: 'GLOBAL_PLAN', description: `AI global optimization engine executed.` });

      const updatedShifts = allShifts.map(s => {
        if (s.status === 'Completed' || s.status === 'In Progress') return s;
        
        const currentAssignments = [...(s.assignments || [])];
        const updatedAssignments: ShiftAssignment[] = [...currentAssignments];

        s.requirements?.forEach(req => {
          const filledCount = updatedAssignments.filter(a => a.rolePerformed === req.role).length;
          const needed = req.count - filledCount;

          for (let i = 0; i < needed; i++) {
            // Find best valid candidate using central validation service
            const bestCandidate = allGuards.find(g => {
              // Quick filters first
              if (g.status !== 'Active' || g.complianceStatus !== 'Compliant') return false;
              
              // Rigorous check using central validation
              const validation = validateGuardAssignment(g, s, allShifts, req.role);
              return validation.isValid;
            });

            if (bestCandidate) {
              const assignment: ShiftAssignment = { 
                id: `ASG-${Date.now()}-${Math.random()}`, 
                guardId: bestCandidate.id, 
                guardName: bestCandidate.name, 
                rolePerformed: req.role, 
                status: 'Assigned', 
                assignedAt: new Date().toISOString(), 
                assignedBy: 'AI_PLANNER' 
              };
              updatedAssignments.push(assignment);
              
              // Audit the AI decision
              logAudit({ 
                action: 'AI_ASSIGNMENT_PROPOSED', 
                entityType: 'shift_assignment', 
                entityId: assignment.id, 
                description: `AI assigned ${bestCandidate.name} to ${s.siteName} based on optimal compliance/fatigue score.`,
                newValues: assignment
              });
            }
          }
        });

        return { 
          ...s, 
          assignments: updatedAssignments, 
          status: updatedAssignments.length > 0 ? 'Claimed' : 'Open' 
        };
      });

      setStored(STORAGE_KEYS.SHIFTS, updatedShifts);
      return updatedShifts;
    }
  };
};
