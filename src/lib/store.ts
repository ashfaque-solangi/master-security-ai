
'use client';

/**
 * @fileOverview A persistent JSON-based local storage manager for the Security Workforce Platform.
 * Simulates a real-time database with full CRUD operations for all major entities.
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
  users as initialUsers
} from './data';
import { Guard, Incident, Message, FormDefinition, Shift, Vehicle, Applicant, Visitor, Site, User, UserRole } from './types';

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
}

export const useJsonStore = () => {
  return {
    // Current User Session (Mock)
    getCurrentUser: (): User => getStored<User>(STORAGE_KEYS.CURRENT_USER, initialUsers[0]),
    setCurrentUser: (user: User) => setStored(STORAGE_KEYS.CURRENT_USER, user),

    // Users
    getUsers: () => getStored<User>(STORAGE_KEYS.USERS, initialUsers),
    addUser: (item: User) => {
      const data = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },
    updateUser: (item: User) => {
      const data = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const updated = data.map(u => u.id === item.id ? item : u);
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },
    deleteUser: (id: string) => {
      const data = getStored<User>(STORAGE_KEYS.USERS, initialUsers);
      const updated = data.filter(u => u.id !== id);
      setStored(STORAGE_KEYS.USERS, updated);
      return updated;
    },

    // Incidents
    getIncidents: () => getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    addIncident: (item: Incident) => {
      const data = getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    updateIncident: (item: Incident) => {
      const data = getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = data.map(i => i.id === item.id ? item : i);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    deleteIncident: (id: string) => {
      const data = getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = data.filter(i => i.id !== id);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },

    // Guards
    getGuards: () => getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards),
    addGuard: (item: Guard) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    updateGuard: (item: Guard) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = data.map(g => g.id === item.id ? item : g);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    deleteGuard: (id: string) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = data.filter(g => g.id !== id);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },

    // Sites
    getSites: () => getStored<Site>(STORAGE_KEYS.SITES, initialSites),
    addSite: (item: Site) => {
      const data = getStored<Site>(STORAGE_KEYS.SITES, initialSites);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.SITES, updated);
      return updated;
    },
    updateSite: (item: Site) => {
      const data = getStored<Site>(STORAGE_KEYS.SITES, initialSites);
      const updated = data.map(s => s.id === item.id ? item : s);
      setStored(STORAGE_KEYS.SITES, updated);
      return updated;
    },
    deleteSite: (id: string) => {
      const data = getStored<Site>(STORAGE_KEYS.SITES, initialSites);
      const updated = data.filter(s => s.id !== id);
      setStored(STORAGE_KEYS.SITES, updated);
      return updated;
    },

    // Form Definitions
    getForms: () => getStored<FormDefinition>(STORAGE_KEYS.FORMS, initialForms),
    addForm: (item: FormDefinition) => {
      const data = getStored<FormDefinition>(STORAGE_KEYS.FORMS, initialForms);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.FORMS, updated);
      return updated;
    },
    deleteForm: (id: string) => {
      const data = getStored<FormDefinition>(STORAGE_KEYS.FORMS, initialForms);
      const updated = data.filter(f => f.id !== id);
      setStored(STORAGE_KEYS.FORMS, updated);
      return updated;
    },

    // Shifts
    getShifts: () => getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts),
    addShift: (item: Shift) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    updateShift: (item: Shift) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = data.map(s => s.id === item.id ? item : s);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    deleteShift: (id: string) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = data.filter(s => s.id !== id);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    // Vehicles
    getVehicles: () => getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles),
    addVehicle: (item: Vehicle) => {
      const data = getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },
    updateVehicle: (item: Vehicle) => {
      const data = getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const updated = data.map(v => v.id === item.id ? item : v);
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },
    deleteVehicle: (id: string) => {
      const data = getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const updated = data.filter(v => v.id !== id);
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },

    // Applicants
    getApplicants: () => getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    addApplicant: (item: Applicant) => {
      const data = getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.APPLICANTS, updated);
      return updated;
    },
    updateApplicant: (item: Applicant) => {
      const data = getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updated = data.map(a => a.id === item.id ? item : a);
      setStored(STORAGE_KEYS.APPLICANTS, updated);
      return updated;
    },
    deleteApplicant: (id: string) => {
      const data = getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updated = data.filter(a => a.id !== id);
      setStored(STORAGE_KEYS.APPLICANTS, updated);
      return updated;
    },

    // Visitors
    getVisitors: () => getStored<Visitor>(STORAGE_KEYS.VISITORS, initialVisitors),
    addVisitor: (item: Visitor) => {
      const data = getStored<Visitor>(STORAGE_KEYS.VISITORS, initialVisitors);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.VISITORS, updated);
      return updated;
    },
    updateVisitor: (item: Visitor) => {
      const data = getStored<Visitor>(STORAGE_KEYS.VISITORS, initialVisitors);
      const updated = data.map(v => v.id === item.id ? item : v);
      setStored(STORAGE_KEYS.VISITORS, updated);
      return updated;
    },

    // Messages
    getMessages: () => getStored<Message>(STORAGE_KEYS.MESSAGES, initialMessages),
    addMessage: (item: Message) => {
      const data = getStored<Message>(STORAGE_KEYS.MESSAGES, initialMessages);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.MESSAGES, updated);
      return updated;
    }
  };
};
