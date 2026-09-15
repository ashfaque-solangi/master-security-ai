'use client';

import { useEffect, useRef } from 'react';
import { useJsonStore } from '@/lib/store';
import { GuardLocation, Shift } from '@/lib/types';

/**
 * CONFIGURATION
 */
const TRACKING_SIMULATION_INTERVAL_MS = 5000;
const MOVEMENT_GRANULARITY = 0.0005; // ~50 meters approx per tick

/**
 * @fileOverview Simulated GPS Tracking Hook
 * 
 * Provides a development/demo simulation of guard movement.
 * Abstraction ready for replacement by real GPS provider.
 */
export function useTrackingSimulation() {
  const store = useJsonStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const user = store.getCurrentUser();
    if (!user || user.role === 'GUARD') return; // Simulation runs for dispatchers/managers

    const runSimulationTick = () => {
      const activeShifts = store.getShifts().filter(s => s.status === 'In Progress');
      const allSites = store.getSites();
      const currentLocations = store.getGuardLocations();

      activeShifts.forEach(shift => {
        shift.assignments?.forEach(asg => {
          if (!asg.guardId) return;

          const site = allSites.find(s => s.id === shift.siteId);
          const existingLoc = currentLocations.find(l => l.guardId === asg.guardId);

          // Deterministic starting point: Site coords or a spread from a pivot
          const baseLat = site?.latitude || 51.5074; // London pivot
          const baseLng = site?.longitude || -0.1278;

          let newLat = existingLoc ? existingLoc.latitude : baseLat + (Math.random() - 0.5) * 0.01;
          let newLng = existingLoc ? existingLoc.longitude : baseLng + (Math.random() - 0.5) * 0.01;

          // Gradual movement logic
          newLat += (Math.random() - 0.5) * MOVEMENT_GRANULARITY;
          newLng += (Math.random() - 0.5) * MOVEMENT_GRANULARITY;

          const newLocation: GuardLocation = {
            id: `LOC-${Date.now()}-${asg.guardId}`,
            organizationId: user.organizationId,
            guardId: asg.guardId,
            siteId: shift.siteId,
            shiftId: shift.id,
            latitude: newLat,
            longitude: newLng,
            accuracyMeters: 5 + Math.random() * 10,
            timestamp: new Date().toISOString(),
            source: 'SIMULATED',
            status: 'Active'
          };

          store.updateGuardLocation(newLocation);
        });
      });
    };

    // Initial tick
    runSimulationTick();

    // Start interval
    timerRef.current = setInterval(runSimulationTick, TRACKING_SIMULATION_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return null;
}