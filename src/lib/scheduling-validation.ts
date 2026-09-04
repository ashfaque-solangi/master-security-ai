
/**
 * @fileOverview Centralized Scheduling Validation Service (Rule Engine)
 * Implements hard constraints for Overlaps, Daily Limits, and Role Qualifications.
 */

import { Shift, Guard } from './types';
import { parseISO, areIntervalsOverlapping, differenceInMinutes, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const MAX_DAILY_HOURS = 16;

/**
 * Calculates hours worked by a guard on a specific calendar day.
 */
export function calculateDailyHours(guardId: string, day: Date, allShifts: Shift[]): number {
  const start = startOfDay(day);
  const end = endOfDay(day);
  let totalMinutes = 0;

  const relevantShifts = allShifts.filter(s => 
    s.assignments.some(a => a.guardId === guardId) &&
    s.status !== 'Cancelled'
  );

  relevantShifts.forEach(shift => {
    const shiftStart = parseISO(shift.startTime);
    const shiftEnd = parseISO(shift.endTime);

    const intersectionStart = shiftStart < start ? start : shiftStart;
    const intersectionEnd = shiftEnd > end ? end : shiftEnd;

    if (intersectionStart < intersectionEnd) {
      totalMinutes += differenceInMinutes(intersectionEnd, intersectionStart);
    }
  });

  return totalMinutes / 60;
}

/**
 * Validates if a guard can be assigned to a specific role in a shift.
 */
export function validateGuardAssignment(
  guard: Guard,
  targetShift: Shift,
  allShifts: Shift[],
  targetRole?: string
): ValidationResult {
  const errors: string[] = [];
  
  if (guard.status !== 'Active') {
    errors.push(`${guard.name} is currently ${guard.status}.`);
  }

  // Rule 3: Role Qualification
  if (targetRole && !guard.qualifiedRoles.includes(targetRole)) {
    errors.push(`${guard.name} is not qualified for the role: ${targetRole}.`);
  }

  // Rule 6: Availability Check
  if (guard.unavailableDates?.some(d => isWithinInterval(parseISO(d), { 
    start: parseISO(targetShift.startTime), 
    end: parseISO(targetShift.endTime) 
  }))) {
    errors.push(`${guard.name} is marked as unavailable during this period.`);
  }

  // Rule 1: No Overlapping Shifts
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
    errors.push(`Overlap: ${guard.name} already assigned to another shift at this time.`);
  }

  // Rule 4: 16-Hour Limit
  const targetDays = [startOfDay(targetInterval.start), startOfDay(targetInterval.end)];
  const uniqueDays = Array.from(new Set(targetDays.map(d => d.toISOString()))).map(s => parseISO(s));

  uniqueDays.forEach(day => {
    const existingHours = calculateDailyHours(guard.id, day, allShifts.filter(s => s.id !== targetShift.id));
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const contributionStart = targetInterval.start < dayStart ? dayStart : targetInterval.start;
    const contributionEnd = targetInterval.end > dayEnd ? dayEnd : targetInterval.end;
    const contributionHours = contributionStart < contributionEnd ? differenceInMinutes(contributionEnd, contributionStart) / 60 : 0;

    if (existingHours + contributionHours > MAX_DAILY_HOURS) {
      errors.push(`${guard.name} would exceed the 16-hour limit on ${day.toLocaleDateString()}.`);
    }
  });

  return { isValid: errors.length === 0, errors };
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
