
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
  AuditRecord, AuditAction
} from './types';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p2_v3',
  SITES: 'sg_sites_p2_v3',
  USERS: 'sg_users_p2_v3',
  CLIENTS: 'sg_clients_p2_v3',
  SUBS: 'sg_subs_p2_v3',
  SHIFTS: 'sg_shifts_p2_v3',
  INCIDENTS: 'sg_incidents_p2_v3',
  VISITORS: 'sg_visitors_p2_v3',
  INVOICES: 'sg_invoices_p2_v3',
  APPLICANTS: 'sg_applicants_p2_v3',
  PATROLS: 'sg_patrols_p2_v3',
  PAYROLL: 'sg_payroll_p2_v3',
  FORMS: 'sg_forms_p2_v3',
  AUDITS: 'sg_audits_p2_v3',
  CURRENT_USER: 'sg_current_user_p2_v3',
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
    const user = getCurrentUser() || { id: 'SYSTEM', name: 'System Engine', role: 'Super Admin' as any };
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
        logAudit({ action: 'ROLE_ASSIGNED', entityType: 'user', entityId: user.id, description: `User logged in: ${user.name}` });
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    logout: () => {
      const user = getCurrentUser();
      if (user) logAudit({ action: 'ROLE_ASSIGNED', entityType: 'user', entityId: user.id, description: `User logged out: ${user.name}` });
      setStored(STORAGE_KEYS.CURRENT_USER, null);
    },

    getGuards,
    addGuard: (g: Guard) => { 
      const updated = [g, ...getGuards()]; 
      setStored(STORAGE_KEYS.GUARDS, updated); 
      logAudit({ action: 'GUARD_CREATED', entityType: 'guard', entityId: g.id, description: `New officer registered: ${g.name}`, newValues: g });
      return updated; 
    },
    updateGuard: (g: Guard) => { 
      const old = getGuards().find(o => o.id === g.id);
      const updated = getGuards().map(old => old.id === g.id ? g : old); 
      setStored(STORAGE_KEYS.GUARDS, updated); 
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: g.id, description: `Officer details updated: ${g.name}`, oldValues: old, newValues: g });
      return updated; 
    },
    deleteGuard: (id: string) => { 
      const old = getGuards().find(o => o.id === id);
      const updated = getGuards().filter(g => g.id !== id); 
      setStored(STORAGE_KEYS.GUARDS, updated); 
      logAudit({ action: 'GUARD_UPDATED', entityType: 'guard', entityId: id, description: `Officer record archived: ${old?.name}`, status: 'warning' });
      return updated; 
    },

    getSites: () => getStored<Site[]>(STORAGE_KEYS.SITES, initialSites),
    addSite: (s: Site) => { 
      const updated = [s, ...getStored<Site[]>(STORAGE_KEYS.SITES, initialSites)]; 
      setStored(STORAGE_KEYS.SITES, updated); 
      logAudit({ action: 'SITE_CREATED', entityType: 'site', entityId: s.id, description: `New operational site registered: ${s.name}`, newValues: s });
      return updated; 
    },
    updateSite: (s: Site) => { 
      const old = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).find(o => o.id === s.id);
      const updated = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).map(old => old.id === s.id ? s : old); 
      setStored(STORAGE_KEYS.SITES, updated); 
      logAudit({ action: 'SITE_UPDATED', entityType: 'site', entityId: s.id, description: `Site configuration changed: ${s.name}`, oldValues: old, newValues: s });
      return updated; 
    },
    deleteSite: (id: string) => { 
      const updated = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).filter(s => s.id !== id); 
      setStored(STORAGE_KEYS.SITES, updated); 
      logAudit({ action: 'SITE_UPDATED', entityType: 'site', entityId: id, description: `Site removed from platform`, status: 'warning' });
      return updated; 
    },

    getShifts,
    addShift: (s: Shift) => { 
      const updated = [s, ...getShifts()]; 
      setStored(STORAGE_KEYS.SHIFTS, updated); 
      logAudit({ action: 'SHIFT_CREATED', entityType: 'shift', entityId: s.id, description: `New deployment requirement created for ${s.siteName}`, newValues: s });
      return updated; 
    },
    updateShift: (s: Shift) => { 
      const old = getShifts().find(o => o.id === s.id);
      const updated = getShifts().map(old => old.id === s.id ? s : old); 
      setStored(STORAGE_KEYS.SHIFTS, updated); 
      logAudit({ action: 'SHIFT_UPDATED', entityType: 'shift', entityId: s.id, description: `Shift parameters modified for ${s.siteName}`, oldValues: old, newValues: s });
      return updated; 
    },
    deleteShift: (id: string) => { 
      const updated = getShifts().filter(s => s.id !== id); 
      setStored(STORAGE_KEYS.SHIFTS, updated); 
      logAudit({ action: 'SHIFT_DELETED', entityType: 'shift', entityId: id, description: `Deployment record cancelled`, status: 'warning' });
      return updated; 
    },

    getAudits,
    logAudit,

    getUsers: () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (u: User) => { 
      const updated = [u, ...getStored<User[]>(STORAGE_KEYS.USERS, initialUsers)]; 
      setStored(STORAGE_KEYS.USERS, updated); 
      logAudit({ action: 'USER_CREATED', entityType: 'user', entityId: u.id, description: `New administrative user created: ${u.name}`, newValues: u });
      return updated; 
    },
    updateUser: (u: User) => { 
      const old = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).find(o => o.id === u.id);
      const updated = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).map(old => old.id === u.id ? u : old); 
      setStored(STORAGE_KEYS.USERS, updated); 
      logAudit({ action: 'USER_UPDATED', entityType: 'user', entityId: u.id, description: `User permissions or profile modified: ${u.name}`, oldValues: old, newValues: u });
      return updated; 
    },
    deleteUser: (id: string) => { 
      const updated = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).filter(u => u.id !== id); 
      setStored(STORAGE_KEYS.USERS, updated); 
      logAudit({ action: 'USER_DELETED', entityType: 'user', entityId: id, description: `User access revoked`, status: 'warning' });
      return updated; 
    },

    getClients: () => getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients),
    getSubcontractors: () => getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors),
    getIncidents: () => getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    getVisitors: () => getStored<Visitor[]>(STORAGE_KEYS.VISITORS, initialVisitors),
    getInvoices: () => getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices),
    getApplicants: () => getStored<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    getForms: () => getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms),
    
    autoFillAllShifts: () => {
      const allShifts = getShifts();
      const allGuards = getGuards();
      let filledCount = 0;
      
      logAudit({ action: 'AI_SCHEDULING_RUN', entityType: 'system', entityId: 'GLOBAL_AUTOFILL', description: `AI Auto-Fill triggered for ${allShifts.filter(s => s.status === 'Open').length} vacancies.` });

      const updated = allShifts.map(s => {
        if (s.status !== 'Open') return s;
        const newAssignments = [...(s.assignments || [])];
        s.requirements?.forEach(req => {
          const currentCount = newAssignments.filter(a => a.role === req.role).length;
          for (let i = currentCount; i < req.count; i++) {
            const candidate = allGuards.find(g => {
              const check = allShifts.some(existing => {
                if (existing.id === s.id) return false;
                return existing.assignments.some(a => a.guardId === g.id);
              });
              return g.status === 'Active' && !check && g.qualifiedRoles.includes(req.role);
            });

            if (candidate) {
              newAssignments.push({ guardId: candidate.id, guardName: candidate.name, role: req.role });
              filledCount++;
              logAudit({ 
                action: 'AI_ASSIGNMENT_PROPOSED', 
                entityType: 'shift_assignment', 
                entityId: s.id, 
                description: `AI assigned ${candidate.name} to ${req.role} at ${s.siteName}`,
                newValues: { guard: candidate.name, role: req.role }
              });
            }
          }
        });
        return { ...s, assignments: newAssignments, status: newAssignments.length > 0 ? 'Claimed' : 'Open' };
      });
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    suggestReplacement: (shift: Shift, role: string) => {
      const allGuards = getGuards();
      const allShifts = getShifts();
      return allGuards
        .filter(g => g.status === 'Active' && g.qualifiedRoles.includes(role))
        .sort((a, b) => a.weeklyHours - b.weeklyHours);
    }
  };
};
