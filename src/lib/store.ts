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
  visitors as initialVisitors
} from './data';
import { Guard, Incident, Message, FormDefinition, Shift, Vehicle, Applicant, Visitor } from './types';

const STORAGE_KEYS = {
  GUARDS: 'sg_guards',
  INCIDENTS: 'sg_incidents',
  MESSAGES: 'sg_messages',
  FORMS: 'sg_forms',
  SHIFTS: 'sg_shifts',
  VEHICLES: 'sg_vehicles',
  APPLICANTS: 'sg_applicants',
  VISITORS: 'sg_visitors',
};

const isBrowser = typeof window !== 'undefined';

function getStored<T>(key: string, initialData: T[]): T[] {
  if (!isBrowser) return initialData;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialData;
}

function setStored<T>(key: string, data: T[]) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const useJsonStore = () => {
  return {
    // Incidents
    getIncidents: () => getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    addIncident: (item: Incident) => {
      const data = getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = [item, ...data];
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
    deleteGuard: (id: string) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = data.filter(g => g.id !== id);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },

    // Form Definitions (Dynamic Form Builder)
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

    // Shifts (Scheduling)
    getShifts: () => getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts),
    addShift: (item: Shift) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },
    deleteShift: (id: string) => {
      const data = getStored<Shift>(STORAGE_KEYS.SHIFTS, initialShifts);
      const updated = data.filter(s => s.id !== id);
      setStored(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    },

    // Vehicles (Fleet)
    getVehicles: () => getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles),
    addVehicle: (item: Vehicle) => {
      const data = getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },
    deleteVehicle: (id: string) => {
      const data = getStored<Vehicle>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const updated = data.filter(v => v.id !== id);
      setStored(STORAGE_KEYS.VEHICLES, updated);
      return updated;
    },

    // Applicants (Recruitment)
    getApplicants: () => getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants),
    addApplicant: (item: Applicant) => {
      const data = getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updated = [item, ...data];
      setStored(STORAGE_KEYS.APPLICANTS, updated);
      return updated;
    },
    deleteApplicant: (id: string) => {
      const data = getStored<Applicant>(STORAGE_KEYS.APPLICANTS, initialApplicants);
      const updated = data.filter(a => a.id !== id);
      setStored(STORAGE_KEYS.APPLICANTS, updated);
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
