'use client';

/**
 * @fileOverview A persistent JSON-based local storage manager for the Security Workforce Platform.
 * Enhanced for Phase 2: Smart Scheduling logic.
 */

import { 
  guards as initialGuards, 
  incidents as initialIncidents, 
  messages as initialMessages,
  forms as initialForms,
  shifts as initialShifts,
  vehicles as initialVehicles,
  applicants as initialApplicants,
  visitors as initialVisitors,
  sites as initialSites,
  users as initialUsers,
  clients as initialClients,
  subcontractors as initialSubcontractors
} from './data';
import { Guard, Incident, Message, FormDefinition, Shift, Vehicle, Applicant, Visitor, Site, User, Client, Subcontractor } from './types';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards',
  INCIDENTS: 'sg_incidents',
  MESSAGES: 'sg_messages',
  FORMS: 'sg_forms',
  SHIFTS: 'sg_shifts',
  VEHICLES: 'sg_vehicles',
  APPLICANTS: 'sg_applicants',
  VISITORS: 'sg_visitors',
  SITES: 'sg_sites',
  USERS: 'sg_users',
  CLIENTS: 'sg_clients',
  SUBCONTRACTORS: 'sg_subcontractors',
  CURRENT_USER: 'sg_current_user',
};

const isBrowser = typeof window !== 'undefined';

function getStored<T>(key: string, initialData: T[] | T | null): any {
  if (!isBrowser) return initialData;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialData;
}

function setStored<T>(key: string, data: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
}

export const useJsonStore = () => {
  return {
    // AI & Smart Logic Helpers
    suggestReplacement: (shift: Shift): Guard[] => {
      const allGuards = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      // Logic: Filter available guards with < 40 hours and compliant SIA
      return allGuards.filter((g: Guard) => 
        g.isAvailable && 
        g.weeklyHours < 40 && 
        g.complianceStatus === 'Compliant'
      ).sort((a, b) => a.weeklyHours - b.weeklyHours);
    },

    // Authentication
    getCurrentUser: (): User | null => getStored<User>(STORAGE_KEYS.CURRENT_USER, null),
    setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),
    login: (email: string, password: string) => {
      const allUsers = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const foundUser = allUsers.find((u: User) => u.email === email && u.password === password);
      if (foundUser) {
        setStored(STORAGE_KEYS.CURRENT_USER, foundUser);
        return { success: true, user: foundUser };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    logout: () => setStored(STORAGE_KEYS.CURRENT_USER, null),

    // Standard CRUD
    getGuards: () => getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards),
    addGuard: (item: Guard) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    updateGuard: (item: Guard) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = data.map((g: Guard) => g.id === item.id ? item : g);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    deleteGuard: (id: string) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = data.filter((g: Guard) => g.id !== id);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },

    getShifts: () => getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts),
    addShift: (item: Shift) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    updateShift: (item: Shift) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = data.map((s: Shift) => s.id === item.id ? item : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    deleteShift: (id: string) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = data.filter((s: Shift) => s.id !== id);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    getSites: () => getStored<Site>(STORAGE_KEYS.SITES, initialSites),
    getUsers: () => getStored<User>(STORAGE_KEYS.USERS, initialUsers),
    getClients: () => getStored<Client>(STORAGE_KEYS.CLIENTS, initialClients),
    getSubcontractors: () => getStored<Subcontractor>(STORAGE_KEYS.SUBCONTRACTORS, initialSubcontractors),
    getIncidents: () => getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    getForms: () => getStored<FormDefinition>(STORAGE_KEYS.FORMS, initialForms),
    getVehicles: () => getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles),
    getApplicants: () => getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    getVisitors: () => getStored<Visitor>(STORAGE_KEYS.VISITORS, initialVisitors),
    getMessages: () => getStored<Message>(STORAGE_KEYS.MESSAGES, initialMessages),

    // Advanced Permission Management
    addUser: (item: User) => {
      const data = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },
    updateUser: (item: User) => {
      const data = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const updated = data.map((u: User) => u.id === item.id ? item : u);
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },
    deleteUser: (id: string) => {
      const data = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const updated = data.filter((u: User) => u.id !== id);
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    }
  };
};
