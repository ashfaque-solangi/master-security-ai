
'use client';

/**
 * @fileOverview StorageService abstraction with advanced AI logic stubs for Swapping and Replacements.
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
import { validateGuardAssignment } from './scheduling-validation';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards_p2_final',
  SITES: 'sg_sites_p2_final',
  USERS: 'sg_users_p2_final',
  CLIENTS: 'sg_clients_p2_final',
  SUBS: 'sg_subs_p2_final',
  SHIFTS: 'sg_shifts_p2_final',
  INCIDENTS: 'sg_incidents_p2_final',
  VISITORS: 'sg_visitors_p2_final',
  INVOICES: 'sg_invoices_p2_final',
  APPLICANTS: 'sg_applicants_p2_final',
  PATROLS: 'sg_patrols_p2_final',
  PAYROLL: 'sg_payroll_p2_final',
  FORMS: 'sg_forms_p2_final',
  CURRENT_USER: 'sg_current_user_p2_final',
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

  return {
    resetToDemo: () => {
      Object.keys(STORAGE_KEYS).forEach(k => localStorage.removeItem(STORAGE_KEYS[k as keyof typeof STORAGE_KEYS]));
      window.location.reload();
    },

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

    // Standard Entities CRUD
    getGuards,
    addGuard: (g: Guard) => { const updated = [g, ...getGuards()]; setStored(STORAGE_KEYS.GUARDS, updated); return updated; },
    updateGuard: (g: Guard) => { const updated = getGuards().map(old => old.id === g.id ? g : old); setStored(STORAGE_KEYS.GUARDS, updated); return updated; },
    deleteGuard: (id: string) => { const updated = getGuards().filter(g => g.id !== id); setStored(STORAGE_KEYS.GUARDS, updated); return updated; },

    getSites: () => getStored<Site[]>(STORAGE_KEYS.SITES, initialSites),
    addSite: (s: Site) => { const updated = [s, ...getStored<Site[]>(STORAGE_KEYS.SITES, initialSites)]; setStored(STORAGE_KEYS.SITES, updated); return updated; },
    updateSite: (s: Site) => { const updated = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).map(old => old.id === s.id ? s : old); setStored(STORAGE_KEYS.SITES, updated); return updated; },
    deleteSite: (id: string) => { const updated = getStored<Site[]>(STORAGE_KEYS.SITES, initialSites).filter(s => s.id !== id); setStored(STORAGE_KEYS.SITES, updated); return updated; },

    getShifts,
    addShift: (s: Shift) => { const updated = [s, ...getShifts()]; setStored(STORAGE_KEYS.SHIFTS, updated); return updated; },
    updateShift: (s: Shift) => { const updated = getShifts().map(old => old.id === s.id ? s : old); setStored(STORAGE_KEYS.SHIFTS, updated); return updated; },
    deleteShift: (id: string) => { const updated = getShifts().filter(s => s.id !== id); setStored(STORAGE_KEYS.SHIFTS, updated); return updated; },

    getUsers: () => getStored<User[]>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (u: User) => { const updated = [u, ...getStored<User[]>(STORAGE_KEYS.USERS, initialUsers)]; setStored(STORAGE_KEYS.USERS, updated); return updated; },
    updateUser: (u: User) => { const updated = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).map(old => old.id === u.id ? u : old); setStored(STORAGE_KEYS.USERS, updated); return updated; },
    deleteUser: (id: string) => { const updated = getStored<User[]>(STORAGE_KEYS.USERS, initialUsers).filter(u => u.id !== id); setStored(STORAGE_KEYS.USERS, updated); return updated; },

    getClients: () => getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients),
    addClient: (c: Client) => { const updated = [c, ...getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients)]; setStored(STORAGE_KEYS.CLIENTS, updated); return updated; },
    updateClient: (c: Client) => { const updated = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients).map(old => old.id === c.id ? c : old); setStored(STORAGE_KEYS.CLIENTS, updated); return updated; },
    deleteClient: (id: string) => { const updated = getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients).filter(c => c.id !== id); setStored(STORAGE_KEYS.CLIENTS, updated); return updated; },

    getSubcontractors: () => getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors),
    addSubcontractor: (s: Subcontractor) => { const updated = [s, ...getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors)]; setStored(STORAGE_KEYS.SUBS, updated); return updated; },
    updateSubcontractor: (s: Subcontractor) => { const updated = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors).map(old => old.id === s.id ? s : old); setStored(STORAGE_KEYS.SUBS, updated); return updated; },
    deleteSubcontractor: (id: string) => { const updated = getStored<Subcontractor[]>(STORAGE_KEYS.SUBS, initialSubcontractors).filter(s => s.id !== id); setStored(STORAGE_KEYS.SUBS, updated); return updated; },

    getIncidents: () => getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    addIncident: (i: Incident) => { const updated = [i, ...getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents)]; setStored(STORAGE_KEYS.INCIDENTS, updated); return updated; },
    updateIncident: (i: Incident) => { const updated = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents).map(old => old.id === i.id ? i : old); setStored(STORAGE_KEYS.INCIDENTS, updated); return updated; },
    deleteIncident: (id: string) => { const updated = getStored<Incident[]>(STORAGE_KEYS.INCIDENTS, initialIncidents).filter(i => i.id !== id); setStored(STORAGE_KEYS.INCIDENTS, updated); return updated; },

    getVisitors: () => getStored<Visitor[]>(STORAGE_KEYS.VISITORS, initialVisitors),
    getInvoices: () => getStored<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices),
    getApplicants: () => getStored<Applicant[]>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    getMessages: () => getStored<any[]>(STORAGE_KEYS.USERS, []), 
    getForms: () => getStored<FormDefinition[]>(STORAGE_KEYS.FORMS, initialForms),
    
    // Phase 2: AI Auto-Scheduling Engine
    autoFillAllShifts: () => {
      const allShifts = getShifts();
      const allGuards = getGuards();
      
      const updated = allShifts.map(s => {
        if (s.status !== 'Open') return s;
        // Find candidate for each requirement
        const newAssignments = [...(s.assignments || [])];
        s.requirements?.forEach(req => {
          const currentCount = newAssignments.filter(a => a.role === req.role).length;
          for (let i = currentCount; i < req.count; i++) {
            const candidate = allGuards.find(g => validateGuardAssignment(g, s, allShifts, req.role).isValid);
            if (candidate) {
              newAssignments.push({ guardId: candidate.id, guardName: candidate.name, role: req.role });
            }
          }
        });
        return { ...s, assignments: newAssignments, status: newAssignments.length > 0 ? 'Claimed' : 'Open' };
      });
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    // Phase 2: Replacement Engine
    suggestReplacement: (shift: Shift, role: string) => {
      const allGuards = getGuards();
      const allShifts = getShifts();
      return allGuards
        .filter(g => validateGuardAssignment(g, shift, allShifts, role).isValid)
        .sort((a, b) => a.weeklyHours - b.weeklyHours); // Rank by least hours (low fatigue)
    }
  };
};
