
'use client';

/**
 * @fileOverview StorageService abstraction for LocalStorage & JSON.
 * Manages Phase 1 & 2 persistent state.
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
  forms as initialForms
} from './data';
import { 
  Guard, Site, User, Client, Subcontractor, Shift, Incident,
  Visitor, Invoice, Applicant, Patrol, PayrollRecord, FormDefinition,
  ShiftAssignment
} from './types';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p2',
  SITES: 'sg_sites_p2',
  USERS: 'sg_users_p2',
  CLIENTS: 'sg_clients_p2',
  SUBS: 'sg_subs_p2',
  SHIFTS: 'sg_shifts_p2',
  INCIDENTS: 'sg_incidents_p2',
  VISITORS: 'sg_visitors_p2',
  INVOICES: 'sg_invoices_p2',
  APPLICANTS: 'sg_applicants_p2',
  PATROLS: 'sg_patrols_p2',
  PAYROLL: 'sg_payroll_p2',
  FORMS: 'sg_forms_p2',
  CURRENT_USER: 'sg_current_user_p2',
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
  return {
    // Initializer / Reset
    resetToDemo: () => {
      setStored(STORAGE_KEYS.GUARDS, initialGuards);
      setStored(STORAGE_KEYS.SITES, initialSites);
      setStored(STORAGE_KEYS.USERS, initialUsers);
      setStored(STORAGE_KEYS.CLIENTS, initialClients);
      setStored(STORAGE_KEYS.SUBS, initialSubcontractors);
      setStored(STORAGE_KEYS.SHIFTS, initialShifts);
      setStored(STORAGE_KEYS.INCIDENTS, initialIncidents);
      setStored(STORAGE_KEYS.VISITORS, initialVisitors);
      setStored(STORAGE_KEYS.INVOICES, initialInvoices);
      setStored(STORAGE_KEYS.APPLICANTS, initialApplicants);
      setStored(STORAGE_KEYS.PATROLS, initialPatrols);
      setStored(STORAGE_KEYS.PAYROLL, initialPayroll);
      setStored(STORAGE_KEYS.FORMS, initialForms);
    },

    // Auth
    getCurrentUser: (): User | null => getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null),
    setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),
    login: (email: string, password: string) => {
      const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const user = users.find(u => u.email === email && u.password === (password || 'password123'));
      if (user) {
        setStored(STORAGE_KEYS.CURRENT_USER, user);
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    logout: () => setStored(STORAGE_KEYS.CURRENT_USER, null),

    // Entities
    getGuards: () => getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards),
    addGuard: (guard: Guard) => {
      const guards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = [guard, ...guards];
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    updateGuard: (guard: Guard) => {
      const guards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = guards.map(g => g.id === guard.id ? guard : g);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    deleteGuard: (id: string) => {
      const guards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = guards.filter(g => g.id !== id);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },

    getSites: () => getStored<Site[]>(STORAGE_KEYS.SITES, initialSites),
    addSite: (site: Site) => {
      const sites = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = [site, ...sites];
      setStored(STORAGE_KEYS.SITES, updated);
      return updated;
    },
    updateSite: (site: Site) => {
      const sites = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = sites.map(s => s.id === site.id ? site : s);
      setStored(STORAGE_KEYS.SITES, updated);
      return updated;
    },
    deleteSite: (id: string) => {
      const sites = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites);
      const updated = sites.filter(s => s.id !== id);
      setStored(STORAGE_KEYS.SITES, updated);
      return updated;
    },

    getShifts: () => getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts),
    addShift: (shift: Shift) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = [shift, ...shifts];
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    updateShift: (shift: Shift) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = shifts.map(s => s.id === shift.id ? shift : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    deleteShift: (id: string) => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = shifts.filter(s => s.id !== id);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    getUsers: () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (user: User) => {
      const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = [user, ...users];
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },
    updateUser: (user: User) => {
      const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = users.map(u => u.id === user.id ? user : u);
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },
    deleteUser: (id: string) => {
      const users = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers);
      const updated = users.filter(u => u.id !== id);
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },

    getClients: () => getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients),
    addClient: (client: Client) => {
      const clients = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = [client, ...clients];
      setStored(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    },
    updateClient: (client: Client) => {
      const clients = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = clients.map(c => c.id === client.id ? client : c);
      setStored(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    },
    deleteClient: (id: string) => {
      const clients = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
      const updated = clients.filter(c => c.id !== id);
      setStored(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    },

    getSubcontractors: () => getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors),
    addSubcontractor: (sub: Subcontractor) => {
      const subs = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors);
      const updated = [sub, ...subs];
      setStored(STORAGE_KEYS.SUBS, updated);
      return updated;
    },
    updateSubcontractor: (sub: Subcontractor) => {
      const subs = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors);
      const updated = subs.map(s => s.id === sub.id ? sub : s);
      setStored(STORAGE_KEYS.SUBS, updated);
      return updated;
    },
    deleteSubcontractor: (id: string) => {
      const subs = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors);
      const updated = subs.filter(s => s.id !== id);
      setStored(STORAGE_KEYS.SUBS, updated);
      return updated;
    },

    getIncidents: () => getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    addIncident: (incident: Incident) => {
      const incidents = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = [incident, ...incidents];
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    updateIncident: (incident: Incident) => {
      const incidents = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = incidents.map(i => i.id === incident.id ? incident : i);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    deleteIncident: (id: string) => {
      const incidents = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = incidents.filter(i => i.id !== id);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },

    getVisitors: () => getStored<Visitor[]>(STORAGE_KEYS.VISITORS, initialVisitors),
    getInvoices: () => getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices),
    getApplicants: () => getStored<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    getMessages: () => getStored<any[]>(STORAGE_KEYS.USERS, []), 
    getForms: () => getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms),
    
    // AI Logic Stubs
    autoFillAllShifts: () => {
      const shifts = getStored<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
      const guards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      const activeGuards = guards.filter(g => g.status === 'Active');
      
      const updated = shifts.map(s => {
        if (s.status !== 'Open') return s;
        const candidate = activeGuards.find(g => g.weeklyHours < 40);
        if (candidate) {
          const assignment: ShiftAssignment = {
            guardId: candidate.id,
            guardName: candidate.name,
            role: 'Security Guard'
          };
          return {
            ...s,
            assignments: [assignment],
            status: 'Claimed' as const
          };
        }
        return s;
      });
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    suggestReplacement: (shift: Shift) => {
      const guards = getStored<Guard[]>(STORAGE_KEYS.GUARDS, initialGuards);
      return guards.filter(g => 
        g.status === 'Active' && 
        !shift.assignments.some(a => a.guardId === g.id)
      );
    }
  };
};
