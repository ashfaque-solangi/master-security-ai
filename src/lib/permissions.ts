
import { User, UserRole, PermissionAction } from './types';

export const ALL_PERMISSIONS: PermissionAction[] = ['view', 'manage', 'finance', 'hr', 'client', 'guard'];

const rolePermissions: Record<UserRole, PermissionAction[]> = {
  'Super Admin': ['view', 'manage', 'finance', 'hr', 'client', 'guard'],
  'Company Admin': ['view', 'manage', 'finance', 'hr'],
  'Operations Manager': ['view', 'manage'],
  'Dispatcher': ['view'],
  'HR / Recruitment': ['view', 'hr'],
  'Compliance Manager': ['view', 'hr'],
  'Payroll / Finance': ['view', 'finance'],
  'Client Admin': ['client'],
  'Guard': ['guard'],
};

export function hasPermission(user: User, action: PermissionAction): boolean {
  // Check base role
  const roleHasIt = rolePermissions[user.role]?.includes(action);
  // Check extra overrides
  const userHasIt = user.extraPermissions?.includes(action);
  return !!(roleHasIt || userHasIt);
}

export const navItemPermissions: Record<string, PermissionAction> = {
  '/dashboard': 'view',
  '/guard-portal': 'guard',
  '/recruitment': 'hr',
  '/analytics': 'manage',
  '/client-portal': 'client',
  '/scheduling': 'view',
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
  '/security': 'manage',
};
