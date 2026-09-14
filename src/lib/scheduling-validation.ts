/**
 * @fileOverview Centralized Scheduling Validation Service (Rule Engine)
 * Implements hard constraints for Overlaps, Daily Limits (Cross-Midnight), Role Qualifications, and Compliance.
 */

import { Shift, Guard, LeaveRecord, Site, ValidationResult } from './types';
import { parseISO, areIntervalsOverlapping, differenceInMinutes, startOfDay, endOfDay, isWithinInterval, isPast, format } from 'date-fns';

export const MAX_DAILY_HOURS = 16;
export const MANDATORY_REST_MINUTES = 480; // 8 Hours

/**
 * Calculates hours worked by a guard on a specific calendar day.
 * Note: Still used for reporting daily totals, but sequence accumulation 
 * is now authoritative for the 16h/8h rest hard block.
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
 * Core validation for guard assignments. Enforces all Phase 2 business rules.
 */
export function validateGuardAssignment(
  guard: Guard,
  targetShift: Shift,
  allShifts: Shift[],
  leaveRecords: LeaveRecord[],
  targetRole?: string,
  site?: Site
): ValidationResult {
  
  // RULE 13: Compliance Blocker (Expired/Missing Licence)
  if (guard.complianceStatus === 'Non-Compliant' || isPast(parseISO(guard.licenceExpiry))) {
    return {
      isValid: false,
      code: 'COMPLIANCE_BLOCK',
      message: `Guard's licence has expired or mandatory documents are missing.`
    };
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

  // RULE: Approved Leave Check (Authoritative HR Records)
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
      message: `Guard is on approved ${overlappingLeave.type} from ${format(parseISO(overlappingLeave.startDate), 'MMM dd')} to ${format(parseISO(overlappingLeave.endDate), 'MMM dd')}.`
    };
  }

  // RULE 6: Availability Check (Ad-hoc unavailability)
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
  const targetInterval = {
    start: shiftStart,
    end: shiftEnd
  };

  const overlappingShift = allShifts.find(s => {
    if (s.id === targetShift.id || s.status === 'Cancelled') return false;
    return s.assignments?.some(a => a.guardId === guard.id && ['Assigned', 'Confirmed', 'In Transit', 'On Site', 'Pending'].includes(a.status)) && areIntervalsOverlapping(targetInterval, {
      start: parseISO(s.startTime),
      end: parseISO(s.endTime)
    });
  });

  if (overlappingShift) {
    return {
      isValid: false,
      code: 'SHIFT_OVERLAP',
      message: `Overlap Error: Guard already assigned to another shift during this window at ${overlappingShift.siteName}.`
    };
  }

  // RULE: 16-Hour Accumulated Duty & 8-Hour Rest Period
  // We identify duty sequences (shifts separated by less than 8 hours)
  const activeAssignments = allShifts.filter(s => 
    s.id !== targetShift.id &&
    s.status !== 'Cancelled' && 
    s.assignments?.some(a => 
      a.guardId === guard.id && 
      ['Assigned', 'Confirmed', 'In Transit', 'On Site', 'Pending'].includes(a.status)
    )
  );

  // Group current assignments and proposed shift chronologically
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
      
      // If gap is less than 8 hours, it's one continuous duty sequence
      if (gap < MANDATORY_REST_MINUTES) {
        currentSeq.push(curr);
      } else {
        dutySequences.push(currentSeq);
        currentSeq = [curr];
      }
    }
    dutySequences.push(currentSeq);
  }

  // Find the sequence containing the target shift and check its total duration
  for (const seq of dutySequences) {
    const totalMinutes = seq.reduce((sum, s) => sum + differenceInMinutes(parseISO(s.endTime), parseISO(s.startTime)), 0);
    
    if (totalMinutes > 960) { // 960 mins = 16 hours
      if (seq.some(s => s.id === targetShift.id)) {
        const hours = (totalMinutes / 60).toFixed(1);
        return {
          isValid: false,
          code: 'REST_PERIOD_VIOLATION',
          message: `Rest Period Violation: Accumulated duty reaches ${hours}h. A mandatory 8-hour rest is required after 16h of duty.`
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
