
import { User, UserRole, PermissionAction } from './types';

export const ALL_PERMISSIONS: PermissionAction[] = ['view', 'manage', 'finance', 'hr', 'client', 'guard', 'schedule', 'audit'];

const rolePermissions: Record<UserRole, PermissionAction[]> = {
  'Super Admin': ['view', 'manage', 'finance', 'hr', 'client', 'guard', 'schedule', 'audit'],
  'Company Admin': ['view', 'manage', 'finance', 'hr', 'schedule', 'audit'],
  'Operations Manager': ['view', 'manage', 'schedule', 'audit'],
  'Dispatcher': ['view', 'schedule'],
  'HR / Recruitment': ['view', 'hr'],
  'Compliance Manager': ['view', 'hr'],
  'Payroll / Finance': ['view', 'finance'],
  'Client Admin': ['client'],
  'Guard': ['guard'],
  'Admin': ['view', 'manage', 'schedule', 'audit'],
  'Scheduler': ['view', 'schedule'],
  'Site Manager': ['view', 'manage'],
  'Client': ['client'],
  'Subcontractor': ['view'],
  'HR/Compliance': ['hr']
};

export function hasPermission(user: User, action: PermissionAction): boolean {
  const roleHasIt = rolePermissions[user.role]?.includes(action);
  const userHasIt = user.extraPermissions?.includes(action);
  return !!(roleHasIt || userHasIt);
}

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
};
