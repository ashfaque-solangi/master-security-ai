import { User, UserRole, PermissionAction } from './types';

export const ALL_PERMISSIONS: PermissionAction[] = [
  'view', 
  'manage', 
  'finance', 
  'hr', 
  'client', 
  'guard', 
  'schedule', 
  'schedule.publish', 
  'audit', 
  'location', 
  'ai', 
  'compliance.manage', 
  'compliance.override',
  'patrol.view',
  'patrol.manage',
  'patrol.assign',
  'patrol.monitor'
];

/**
 * Mapping of Platform Roles to their allowed Permission Actions.
 */
export const rolePermissions: Record<UserRole, PermissionAction[]> = {
  'SUPER_ADMIN': ALL_PERMISSIONS,
  'COMPANY_ADMIN': ['view', 'manage', 'finance', 'hr', 'schedule', 'schedule.publish', 'audit', 'location', 'compliance.manage', 'patrol.view', 'patrol.manage', 'patrol.assign', 'patrol.monitor'],
  'OPERATIONS_MANAGER': ['view', 'manage', 'schedule', 'schedule.publish', 'audit', 'location', 'patrol.view', 'patrol.manage', 'patrol.assign', 'patrol.monitor'],
  'DISPATCHER': ['view', 'schedule', 'schedule.publish', 'location', 'patrol.view', 'patrol.assign', 'patrol.monitor'],
  'SCHEDULER': ['view', 'schedule', 'schedule.publish'],
  'SITE_MANAGER': ['view', 'manage', 'location', 'patrol.view', 'patrol.monitor'],
  'HR_MANAGER': ['view', 'hr', 'compliance.manage'],
  'COMPLIANCE_MANAGER': ['view', 'hr', 'compliance.manage', 'compliance.override'],
  'FINANCE_MANAGER': ['view', 'finance'],
  'GUARD': ['guard', 'patrol.view'],
  'CLIENT_ADMIN': ['client', 'view', 'location', 'patrol.view'],
  'CLIENT_VIEWER': ['view', 'location', 'patrol.view'],
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
  '/patrols': 'patrol.view',
  '/incidents': 'view',
  '/forms': 'manage',
  '/visitors': 'view',
  '/inbox': 'view',
  '/workforce': 'hr',
  '/compliance': 'view',
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
