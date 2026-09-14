
import { User, UserRole, PermissionAction } from './types';

export const ALL_PERMISSIONS: PermissionAction[] = ['view', 'manage', 'finance', 'hr', 'client', 'guard', 'schedule', 'audit', 'location'];

/**
 * Mapping of Platform Roles to their allowed Permission Actions.
 */
export const rolePermissions: Record<UserRole, PermissionAction[]> = {
  'SUPER_ADMIN': ['view', 'manage', 'finance', 'hr', 'client', 'guard', 'schedule', 'audit', 'location'],
  'COMPANY_ADMIN': ['view', 'manage', 'finance', 'hr', 'schedule', 'audit', 'location'],
  'OPERATIONS_MANAGER': ['view', 'manage', 'schedule', 'audit', 'location'],
  'DISPATCHER': ['view', 'schedule', 'location'],
  'SCHEDULER': ['view', 'schedule'],
  'SITE_MANAGER': ['view', 'manage', 'location'],
  'HR_MANAGER': ['view', 'hr'],
  'COMPLIANCE_MANAGER': ['view', 'hr'],
  'FINANCE_MANAGER': ['view', 'finance'],
  'GUARD': ['guard'],
  'CLIENT_ADMIN': ['client', 'view', 'location'],
  'CLIENT_VIEWER': ['view', 'location'],
  'SUBCONTRACTOR_ADMIN': ['view', 'manage']
};

export const navItemPermissions: Record<string, PermissionAction> = {
  '/dashboard': 'view',
  '/guard-portal': 'guard',
  '/recruitment': 'hr',
  '/analytics': 'manage',
  '/client-portal': 'client',
  '/scheduling': 'schedule',
  '/shifts': 'schedule',
  '/patrols': 'view',
  '/incidents': 'view',
  '/forms': 'manage',
  '/visitors': 'view',
  '/inbox': 'view',
  '/workforce': 'hr',
  '/compliance': 'hr',
  '/performance': 'view',
  '/sites': 'manage',
  '/clients': 'manage',
  '/subcontractors': 'manage',
  '/fleet': 'manage',
  '/payroll': 'finance',
  '/invoices': 'finance',
  '/settings': 'manage',
  '/security': 'audit',
  '/audit': 'audit',
  '/users': 'manage',
  '/roles': 'manage',
};

export function hasPermission(user: User, action: PermissionAction): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  const roleHasIt = rolePermissions[user.role]?.includes(action);
  const userHasIt = user.extraPermissions?.includes(action);
  return !!(roleHasIt || userHasIt);
}
