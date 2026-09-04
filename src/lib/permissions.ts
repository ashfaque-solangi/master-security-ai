
import { UserRole } from './types';

export type PermissionAction = 'view' | 'manage' | 'finance' | 'hr' | 'client';

const rolePermissions: Record<UserRole, PermissionAction[]> = {
  'Super Admin': ['view', 'manage', 'finance', 'hr', 'client'],
  'Company Admin': ['view', 'manage', 'finance', 'hr'],
  'Operations Manager': ['view', 'manage'],
  'Dispatcher': ['view'],
  'HR / Recruitment': ['view', 'hr'],
  'Compliance Manager': ['view', 'hr'],
  'Payroll / Finance': ['view', 'finance'],
  'Client Admin': ['client'],
};

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  return rolePermissions[role]?.includes(action) || false;
}

export const navItemPermissions: Record<string, PermissionAction> = {
  '/dashboard': 'view',
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
  '/fleet': 'manage',
  '/payroll': 'finance',
  '/invoices': 'finance',
  '/settings': 'manage',
  '/security': 'manage',
};
