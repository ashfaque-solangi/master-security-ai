import { UserRole, DashboardDefinition } from './types';
import { 
  LayoutDashboard, 
  Radio, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  Building, 
  DollarSign, 
  Sparkles, 
  ShieldAlert,
  User
} from 'lucide-react';

export const DASHBOARDS: DashboardDefinition[] = [
  {
    id: 'executive',
    title: 'Executive Dashboard',
    description: 'High-level operational and financial oversight.',
    allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: LayoutDashboard,
    priority: 1
  },
  {
    id: 'operations',
    title: 'Operations Dashboard',
    description: 'Real-time workforce management and staffing coverage.',
    allowedRoles: ['OPERATIONS_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: Calendar,
    priority: 2
  },
  {
    id: 'command-centre',
    title: 'Live Command Centre',
    description: 'Mission-critical event feed and emergency monitoring.',
    allowedRoles: ['DISPATCHER', 'OPERATIONS_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: Radio,
    priority: 3
  },
  {
    id: 'hr',
    title: 'HR Dashboard',
    description: 'Workforce metrics, onboarding, and leave management.',
    allowedRoles: ['HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: Users,
    priority: 4
  },
  {
    id: 'recruitment',
    title: 'Recruitment Hub',
    description: 'Talent pipeline and candidate verification.',
    allowedRoles: ['HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: Briefcase,
    priority: 5
  },
  {
    id: 'compliance',
    title: 'Compliance Dashboard',
    description: 'SIA licensing and certification health.',
    allowedRoles: ['COMPLIANCE_MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: ShieldCheck,
    priority: 6
  },
  {
    id: 'finance',
    title: 'Finance Dashboard',
    description: 'Revenue, payroll, and site profitability.',
    allowedRoles: ['FINANCE_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'],
    icon: DollarSign,
    priority: 7
  },
  {
    id: 'client',
    title: 'Client Portal',
    description: 'Visibility into contracted sites and performance.',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_VIEWER'],
    icon: Building,
    priority: 8
  },
  {
    id: 'guard',
    title: 'Officer Hub',
    description: 'My schedule, attendance, and compliance.',
    allowedRoles: ['GUARD'],
    icon: User,
    priority: 9
  },
  {
    id: 'ai-insights',
    title: 'AI Center',
    description: 'Predictive analytics and risk detection.',
    allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATIONS_MANAGER'],
    requiredPermissions: ['ai'],
    icon: Sparkles,
    priority: 10
  },
  {
    id: 'system',
    title: 'System Admin',
    description: 'Organization health and audit controls.',
    allowedRoles: ['SUPER_ADMIN'],
    icon: ShieldAlert,
    priority: 11
  }
];

export function getAuthorizedDashboards(role: UserRole, permissions: string[] = []): DashboardDefinition[] {
  return DASHBOARDS.filter(db => {
    const hasRole = db.allowedRoles.includes(role);
    if (!hasRole) return false;
    
    if (db.requiredPermissions) {
      return db.requiredPermissions.every(p => permissions.includes(p as any));
    }
    
    return true;
  }).sort((a, b) => a.priority - b.priority);
}

export function getDefaultDashboard(role: UserRole): string {
  const authorized = getAuthorizedDashboards(role);
  return authorized.length > 0 ? authorized[0].id : 'operations';
}
