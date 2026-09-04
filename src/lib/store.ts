
'use client';

/**
 * @fileOverview A simple JSON-based local storage manager to handle CRUD operations
 * for the prototype without a real backend, simulating a JSON database.
 */

import { guards as initialGuards, incidents as initialIncidents, messages as initialMessages } from './data';
import { Guard, Incident, Message } from './types';

const STORAGE_KEYS = {
  GUARDS: 'secureguard_guards',
  INCIDENTS: 'secureguard_incidents',
  MESSAGES: 'secureguard_messages',
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
    // Incidents CRUD
    getIncidents: () => getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents),
    addIncident: (incident: Incident) => {
      const data = getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = [incident, ...data];
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },
    deleteIncident: (id: string) => {
      const data = getStored<Incident>(STORAGE_KEYS.INCIDENTS, initialIncidents);
      const updated = data.filter(i => i.id !== id);
      setStored(STORAGE_KEYS.INCIDENTS, updated);
      return updated;
    },

    // Guards CRUD
    getGuards: () => getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards),
    addGuard: (guard: Guard) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = [guard, ...data];
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },
    deleteGuard: (id: string) => {
      const data = getStored<Guard>(STORAGE_KEYS.GUARDS, initialGuards);
      const updated = data.filter(g => g.id !== id);
      setStored(STORAGE_KEYS.GUARDS, updated);
      return updated;
    },

    // Messages CRUD
    getMessages: () => getStored<Message>(STORAGE_KEYS.MESSAGES, initialMessages),
    addMessage: (message: Message) => {
      const data = getStored<Message>(STORAGE_KEYS.MESSAGES, initialMessages);
      const updated = [message, ...data];
      setStored(STORAGE_KEYS.MESSAGES, updated);
      return updated;
    }
  };
};
