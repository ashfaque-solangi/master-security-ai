
/**
 * @fileOverview Centralized Access Control Service
 * Responsible for RBAC and Data Scope enforcement across the platform.
 */

import { User, UserRole, PermissionAction } from './types';
import { rolePermissions } from './permissions';

export class AccessControlService {
  /**
   * Core permission check based on user role and extra overrides.
   */
  static can(user: User, action: PermissionAction): boolean {
    if (!user || user.status !== 'Active') return false;
    if (user.role === 'SUPER_ADMIN') return true;

    const basePermissions = rolePermissions[user.role] || [];
    const extraPermissions = user.extraPermissions || [];
    
    return basePermissions.includes(action) || extraPermissions.includes(action);
  }

  /**
   * Detailed record-level authorization check.
   * Ensures cross-tenant isolation and granular site/client scoping.
   */
  static canAccessRecord(user: User, entityType: string, record: any): boolean {
    if (!user || !record) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    // RULE 1: Organization Isolation (Cross-Tenant Protection)
    if (record.organizationId && record.organizationId !== user.organizationId) {
      return false;
    }

    // ROLE-SPECIFIC SCOPE ENFORCEMENT
    switch (user.role) {
      case 'GUARD':
        // Guards only see their own records
        if (entityType === 'guard') return record.id === user.guardId;
        if (entityType === 'shift' || entityType === 'shift_assignment') {
            return record.assignments?.some((a: any) => a.guardId === user.guardId);
        }
        return false;

      case 'CLIENT_ADMIN':
      case 'CLIENT_VIEWER':
        // Clients only see their own organization data
        if (entityType === 'client') return record.id === user.clientId;
        if (entityType === 'site' || entityType === 'incident' || entityType === 'shift') {
          return record.clientId === user.clientId || record.siteId?.startsWith(user.clientId);
        }
        return false;

      case 'SUBCONTRACTOR_ADMIN':
        // Subcontractors limited to their organization
        if (entityType === 'subcontractor') return record.id === user.subcontractorId;
        if (entityType === 'guard') return record.subcontractorId === user.subcontractorId;
        return false;

      case 'SITE_MANAGER':
      case 'DISPATCHER':
      case 'SCHEDULER':
        // Site-specific scope if defined
        if (user.siteIds && user.siteIds.length > 0) {
          const siteId = record.siteId || (entityType === 'site' ? record.id : null);
          if (siteId && !user.siteIds.includes(siteId)) return false;
        }
        return true;

      default:
        return true;
    }
  }

  /**
   * Filters an array of records based on the user's authorized scope.
   */
  static filterByScope<T>(user: User, entityType: string, records: T[]): T[] {
    if (user.role === 'SUPER_ADMIN') return records;
    return records.filter(record => this.canAccessRecord(user, entityType, record));
  }

  /**
   * Mutation guard. Throws or returns false if action not permitted on specific target.
   */
  static assertMutation(user: User, action: PermissionAction, entityType: string, targetRecord?: any): boolean {
    if (!this.can(user, action)) return false;
    if (targetRecord && !this.canAccessRecord(user, entityType, targetRecord)) return false;
    return true;
  }
}
