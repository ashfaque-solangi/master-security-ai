
/**
 * @fileOverview Centralized Scheduling Validation Service (Rule Engine)
 * Implements hard constraints for Rule 1 (Overlaps) and Rule 4 (16h Limit).
 */

import { Shift, Guard } from './types';
import { parseISO, areIntervalsOverlapping, differenceInMinutes, startOfDay, endOfDay } from 'date-fns';

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const MAX_DAILY_HOURS = 16;

/**
 * Calculates hours worked by a guard on a specific calendar day.
 * Correctly handles cross-midnight shifts (Rule 5).
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

    // Get the intersection of the shift and the target day
    const intersectionStart = shiftStart < start ? start : shiftStart;
    const intersectionEnd = shiftEnd > end ? end : shiftEnd;

    if (intersectionStart < intersectionEnd) {
      totalMinutes += differenceInMinutes(intersectionEnd, intersectionStart);
    }
  });

  return totalMinutes / 60;
}

/**
 * Validates if a guard can be assigned to a shift.
 */
export function validateGuardAssignment(
  guard: Guard,
  targetShift: Shift,
  allShifts: Shift[]
): ValidationResult {
  const errors: string[] = [];
  
  if (guard.status !== 'Active') {
    errors.push(`Guard ${guard.name} is not active (Status: ${guard.status}).`);
  }

  // Rule 1: No Overlapping Shifts
  const targetInterval = {
    start: parseISO(targetShift.startTime),
    end: parseISO(targetShift.endTime)
  };

  const hasOverlap = allShifts.some(s => {
    if (s.id === targetShift.id || s.status === 'Cancelled') return false;
    const isAssigned = s.assignments.some(a => a.guardId === guard.id);
    if (!isAssigned) return false;

    return areIntervalsOverlapping(targetInterval, {
      start: parseISO(s.startTime),
      end: parseISO(s.endTime)
    });
  });

  if (hasOverlap) {
    errors.push(`Scheduling conflict: ${guard.name} already has an overlapping shift.`);
  }

  // Rule 4: Maximum 16 Hours Per Calendar Day
  // Check both days if shift crosses midnight
  const targetDays = [
    startOfDay(targetInterval.start),
    startOfDay(targetInterval.end)
  ];
  
  // Unique dates only
  const uniqueTargetDays = Array.from(new Set(targetDays.map(d => d.toISOString()))).map(s => parseISO(s));

  uniqueTargetDays.forEach(day => {
    const existingHours = calculateDailyHours(guard.id, day, allShifts.filter(s => s.id !== targetShift.id));
    
    // Calculate contribution of THIS shift to THIS day
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const contributionStart = targetInterval.start < dayStart ? dayStart : targetInterval.start;
    const contributionEnd = targetInterval.end > dayEnd ? dayEnd : targetInterval.end;
    const contributionHours = contributionStart < contributionEnd ? differenceInMinutes(contributionEnd, contributionStart) / 60 : 0;

    if (existingHours + contributionHours > MAX_DAILY_HOURS) {
      errors.push(`${guard.name} would exceed the 16-hour daily limit on ${day.toLocaleDateString()}.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
