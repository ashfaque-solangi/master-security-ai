
/**
 * @fileOverview Centralized Scheduling Validation Service (Rule Engine)
 * Implements hard constraints for Overlaps, Daily Limits (Cross-Midnight), and Role Qualifications.
 */

import { Shift, Guard, Site } from './types';
import { parseISO, areIntervalsOverlapping, differenceInMinutes, startOfDay, endOfDay, isWithinInterval, isPast, isBefore, addDays } from 'date-fns';

export type ValidationResult = {
  isValid: boolean;
  code: string;
  message: string;
};

export const MAX_DAILY_HOURS = 16;

/**
 * Calculates hours worked by a guard on a specific calendar day,
 * correctly splitting cross-midnight shifts.
 */
export function calculateDailyHours(guardId: string, day: Date, allShifts: Shift[]): number {
  const startOfTargetDay = startOfDay(day);
  const endOfTargetDay = endOfDay(day);
  let totalMinutes = 0;

  const relevantShifts = allShifts.filter(s => 
    s.assignments.some(a => a.guardId === guardId) &&
    s.status !== 'Cancelled'
  );

  relevantShifts.forEach(shift => {
    const shiftStart = parseISO(shift.startTime);
    const shiftEnd = parseISO(shift.endTime);

    // Calculate intersection with the target day
    const intersectionStart = shiftStart < startOfTargetDay ? startOfTargetDay : shiftStart;
    const intersectionEnd = shiftEnd > endOfTargetDay ? endOfTargetDay : shiftEnd;

    if (intersectionStart < intersectionEnd) {
      totalMinutes += differenceInMinutes(intersectionEnd, intersectionStart);
    }
  });

  return totalMinutes / 60;
}

/**
 * Validates if a guard can be assigned to a specific role in a shift.
 * Enforces Rules 1, 3, 4, 5, 6, and 13.
 */
export function validateGuardAssignment(
  guard: Guard,
  targetShift: Shift,
  allShifts: Shift[],
  targetRole?: string,
  site?: Site
): ValidationResult {
  
  // RULE 13: Compliance Blocker (Expired/Missing Licence)
  if (guard.complianceStatus === 'Non-Compliant' || isPast(parseISO(guard.licenceExpiry))) {
    return {
      isValid: false,
      code: 'COMPLIANCE_BLOCK',
      message: `Hard Block: ${guard.name}'s licence has expired or mandatory documents are missing.`
    };
  }

  if (guard.status === 'Suspended' || guard.status === 'Inactive') {
    return {
      isValid: false,
      code: 'GUARD_INACTIVE',
      message: `Guard status is ${guard.status}.`
    };
  }

  // RULE 3: Role Qualification
  if (targetRole && !guard.qualifiedRoles.includes(targetRole)) {
    return {
      isValid: false,
      code: 'ROLE_NOT_QUALIFIED',
      message: `${guard.name} is not qualified for the role: ${targetRole}.`
    };
  }

  // RULE 6: Availability Check
  if (guard.unavailableDates?.some(d => isWithinInterval(parseISO(d), { 
    start: parseISO(targetShift.startTime), 
    end: parseISO(targetShift.endTime) 
  }))) {
    return {
      isValid: false,
      code: 'GUARD_UNAVAILABLE',
      message: `${guard.name} is marked as unavailable during this period.`
    };
  }

  // RULE 1: No Overlapping Shifts
  const targetInterval = {
    start: parseISO(targetShift.startTime),
    end: parseISO(targetShift.endTime)
  };

  const hasOverlap = allShifts.some(s => {
    if (s.id === targetShift.id || s.status === 'Cancelled') return false;
    return s.assignments.some(a => a.guardId === guard.id) && areIntervalsOverlapping(targetInterval, {
      start: parseISO(s.startTime),
      end: parseISO(s.endTime)
    });
  });

  if (hasOverlap) {
    return {
      isValid: false,
      code: 'SHIFT_OVERLAP',
      message: `Overlap Error: ${guard.name} is already assigned to another shift during this window.`
    };
  }

  // RULE 4 & 5: 16-Hour Limit & Cross-Midnight Calculation
  const targetDays = [startOfDay(targetInterval.start), startOfDay(targetInterval.end)];
  const uniqueDays = Array.from(new Set(targetDays.map(d => d.toISOString()))).map(s => parseISO(s));

  for (const day of uniqueDays) {
    // Existing hours on this day (excluding current target shift)
    const existingHours = calculateDailyHours(guard.id, day, allShifts.filter(s => s.id !== targetShift.id));
    
    // New hours contributed by this shift on this specific day
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const contributionStart = targetInterval.start < dayStart ? dayStart : targetInterval.start;
    const contributionEnd = targetInterval.end > dayEnd ? dayEnd : targetInterval.end;
    const contributionHours = contributionStart < contributionEnd ? differenceInMinutes(contributionEnd, contributionStart) / 60 : 0;

    if (existingHours + contributionHours > MAX_DAILY_HOURS) {
      return {
        isValid: false,
        code: 'DAILY_HOURS_EXCEEDED',
        message: `${guard.name} would exceed the 16-hour hard limit on ${day.toLocaleDateString()}. (Current: ${existingHours.toFixed(1)}h, Adding: ${contributionHours.toFixed(1)}h)`
      };
    }
  }

  return { isValid: true, code: 'VALID', message: 'Assignment compliant.' };
}

/**
 * Rule 7: Fatigue Risk Scoring
 */
export function getFatigueScore(guard: Guard, allShifts: Shift[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const weeklyHours = guard.weeklyHours || 0;
  if (weeklyHours > 60) return 'CRITICAL';
  if (weeklyHours > 48) return 'HIGH';
  if (weeklyHours > 40) return 'MEDIUM';
  return 'LOW';
}
