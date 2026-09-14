/**
 * @fileOverview Centralized Scheduling Validation Service (Rule Engine)
 * Implements hard constraints for Overlaps, Daily Limits (Continuous Duty), Role Qualifications, and Compliance.
 */

import { Shift, Guard, LeaveRecord, Site, ValidationResult } from './types';
import { parseISO, areIntervalsOverlapping, differenceInMinutes, startOfDay, endOfDay, isWithinInterval, isPast, format, addDays, isBefore } from 'date-fns';

export const MAX_DAILY_HOURS = 16;
export const MANDATORY_REST_MINUTES = 480; // 8 Hours

/**
 * Calculates hours worked by a guard on a specific calendar day.
 */
export function calculateDailyHours(guardId: string, day: Date, allShifts: Shift[]): number {
  const startOfTargetDay = startOfDay(day);
  const endOfTargetDay = endOfDay(day);
  let totalMinutes = 0;

  const relevantShifts = allShifts.filter(s => 
    s.assignments?.some(a => a.guardId === guardId && ['Assigned', 'Confirmed', 'In Transit', 'On Site', 'Pending'].includes(a.status)) &&
    s.status !== 'Cancelled'
  );

  relevantShifts.forEach(shift => {
    const shiftStart = parseISO(shift.startTime);
    const shiftEnd = parseISO(shift.endTime);

    const intersectionStart = shiftStart < startOfTargetDay ? startOfTargetDay : shiftStart;
    const intersectionEnd = shiftEnd > endOfTargetDay ? endOfTargetDay : shiftEnd;

    if (intersectionStart < intersectionEnd) {
      totalMinutes += differenceInMinutes(intersectionEnd, intersectionStart);
    }
  });

  return totalMinutes / 60;
}

/**
 * Core validation for guard assignments. Enforces all Phase 2 & Phase 6 business rules.
 */
export function validateGuardAssignment(
  guard: Guard,
  targetShift: Shift,
  allShifts: Shift[],
  leaveRecords: LeaveRecord[],
  targetRole?: string,
  site?: Site
): ValidationResult {
  
  // RULE: Override Check
  if (guard.isComplianceOverridden) {
    // Overridden guards bypass hard compliance blocks but still show warnings in audit.
  } else {
    // RULE 13: Compliance Blocker (Expired/Missing SIA Licence)
    if (!guard.siaNumber || !guard.licenceExpiry || isPast(parseISO(guard.licenceExpiry))) {
      return {
        isValid: false,
        code: 'COMPLIANCE_BLOCK',
        message: `SIA Blocker: Guard's SIA licence (${guard.siaNumber || 'MISSING'}) is expired or invalid.`
      };
    }

    // RTW Blocker
    if (!guard.rtwType || (guard.rtwExpiry && isPast(parseISO(guard.rtwExpiry)))) {
      return {
        isValid: false,
        code: 'COMPLIANCE_BLOCK',
        message: `RTW Blocker: Right to Work verification is missing or expired.`
      };
    }
  }

  // Guard Inactive Check
  if (guard.status === 'Suspended' || guard.status === 'Inactive') {
    return {
      isValid: false,
      code: 'GUARD_INACTIVE',
      message: `Guard is currently marked as ${guard.status}.`
    };
  }

  // RULE 3: Role Qualification (Hard constraint)
  if (targetRole && !guard.qualifiedRoles.includes(targetRole)) {
    return {
      isValid: false,
      code: 'ROLE_NOT_QUALIFIED',
      message: `Guard is not qualified for the role: ${targetRole}.`
    };
  }

  // WEB-04: Site-Specific Qualification Check
  if (site && site.requiredQualifications && site.requiredQualifications.length > 0) {
    const missingQuals = site.requiredQualifications.filter(q => !guard.qualifiedRoles.includes(q));
    if (missingQuals.length > 0) {
      return {
        isValid: false,
        code: 'CERTIFICATION_REQUIRED',
        message: `Guard is missing site-specific qualifications: ${missingQuals.join(', ')}`
      };
    }
  }

  const shiftStart = parseISO(targetShift.startTime);
  const shiftEnd = parseISO(targetShift.endTime);

  // RULE: Approved Leave Check
  const overlappingLeave = leaveRecords.find(l => 
    l.guardId === guard.id && 
    l.status === 'Approved' &&
    areIntervalsOverlapping(
      { start: shiftStart, end: shiftEnd },
      { start: parseISO(l.startDate), end: parseISO(l.endDate) }
    )
  );

  if (overlappingLeave) {
    return {
      isValid: false,
      code: 'GUARD_ON_LEAVE',
      message: `Guard is on approved ${overlappingLeave.type} during this period.`
    };
  }

  // RULE 6: Availability Check
  if (guard.unavailableDates?.some(d => isWithinInterval(parseISO(d), { 
    start: shiftStart, 
    end: shiftEnd 
  }))) {
    return {
      isValid: false,
      code: 'GUARD_UNAVAILABLE',
      message: `Guard is marked as unavailable during this period.`
    };
  }

  // RULE 1: No Overlapping Shifts
  const overlappingShift = allShifts.find(s => {
    if (s.id === targetShift.id || s.status === 'Cancelled') return false;
    return s.assignments?.some(a => a.guardId === guard.id && ['Assigned', 'Confirmed', 'In Transit', 'On Site', 'Pending'].includes(a.status)) && areIntervalsOverlapping({
      start: shiftStart,
      end: shiftEnd
    }, {
      start: parseISO(s.startTime),
      end: parseISO(s.endTime)
    });
  });

  if (overlappingShift) {
    return {
      isValid: false,
      code: 'SHIFT_OVERLAP',
      message: `Overlap Error: Already assigned to ${overlappingShift.siteName} during this window.`
    };
  }

  // RULE: 16-Hour Accumulated Duty & 8-Hour Rest Period
  const activeAssignments = allShifts.filter(s => 
    s.id !== targetShift.id &&
    s.status !== 'Cancelled' && 
    s.assignments?.some(a => 
      a.guardId === guard.id && 
      ['Assigned', 'Confirmed', 'In Transit', 'On Site', 'Pending'].includes(a.status)
    )
  );

  const chronologicalGuardRoster = [...activeAssignments, targetShift].sort((a, b) => 
    parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
  );

  const dutySequences: Shift[][] = [];
  if (chronologicalGuardRoster.length > 0) {
    let currentSeq: Shift[] = [chronologicalGuardRoster[0]];
    for (let i = 1; i < chronologicalGuardRoster.length; i++) {
      const prev = chronologicalGuardRoster[i - 1];
      const curr = chronologicalGuardRoster[i];
      const gap = differenceInMinutes(parseISO(curr.startTime), parseISO(prev.endTime));
      
      if (gap < MANDATORY_REST_MINUTES) {
        currentSeq.push(curr);
      } else {
        dutySequences.push(currentSeq);
        currentSeq = [curr];
      }
    }
    dutySequences.push(currentSeq);
  }

  for (const seq of dutySequences) {
    const totalMinutes = seq.reduce((sum, s) => sum + differenceInMinutes(parseISO(s.endTime), parseISO(s.startTime)), 0);
    if (totalMinutes > 960) {
      if (seq.some(s => s.id === targetShift.id)) {
        return {
          isValid: false,
          code: 'REST_PERIOD_VIOLATION',
          message: `Rest Period Violation: Accumulated duty reaches ${(totalMinutes / 60).toFixed(1)}h. Mandatory 8h rest required.`
        };
      }
    }
  }

  return { isValid: true, code: 'VALID', message: 'Assignment compliant.' };
}

export function getFatigueScore(guard: Guard): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const weeklyHours = guard.weeklyHours || 0;
  if (weeklyHours > 60) return 'CRITICAL';
  if (weeklyHours > 48) return 'HIGH';
  if (weeklyHours > 40) return 'MEDIUM';
  return 'LOW';
}
