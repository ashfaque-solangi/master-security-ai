'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Radio,
  Calendar,
  Clock3,
  Map,
  AlertTriangle,
  Users,
  Briefcase,
  Sparkles,
  Star,
  Building,
  FileText,
  Truck,
  CreditCard,
  Receipt,
  Settings,
  Lock,
  History,
  MessageSquare,
  UserCheck,
  User as UserIcon,
  Users2,
  ShieldCheck
} from 'lucide-react';
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useJsonStore } from '@/lib/store';
import { AccessControlService } from '@/lib/access-control';
import { navItemPermissions } from '@/lib/permissions';
import { User } from '@/lib/types';
import { useEffect, useState } from 'react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard?id=command-centre', label: 'Command Centre', icon: Radio },
      { href: '/guard-portal', label: 'My Workspace', icon: UserIcon },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/scheduling', label: 'Scheduling', icon: Calendar },
      { href: '/shifts', label: 'Shift Registry', icon: Clock3 },
      { href: '/patrols', label: 'Patrol Monitoring', icon: Map },
      { href: '/incidents', label: 'Incident Logs', icon: AlertTriangle },
      { href: '/visitors', label: 'Visitor Logs', icon: UserCheck },
      { href: '/inbox', label: 'Unified Inbox', icon: MessageSquare },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { href: '/workforce', label: 'Officer List', icon: Users },
      { href: '/recruitment', label: 'Recruitment Hub', icon: Briefcase },
      { href: '/compliance', label: 'Compliance & SIA', icon: Sparkles },
      { href: '/performance', label: 'Performance KPIs', icon: Star },
    ],
  },
  {
    label: 'Corporate',
    items: [
      { href: '/clients', label: 'Client Accounts', icon: Building },
      { href: '/sites', label: 'Site Blueprint', icon: FileText },
      { href: '/subcontractors', label: 'External Partners', icon: Users2 },
      { href: '/fleet', label: 'Fleet & Assets', icon: Truck },
      { href: '/payroll', label: 'Payroll & Costs', icon: CreditCard },
      { href: '/invoices', label: 'Billing Engine', icon: Receipt },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/users', label: 'System Users', icon: Users },
      { href: '/audit', label: 'Audit Logs', icon: History },
      { href: '/security', label: 'Network Security', icon: Lock },
      { href: '/settings', label: 'Global Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const store = useJsonStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
  }, []);

  if (!currentUser) return null;

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const permissionNeeded = navItemPermissions[item.href.split('?')[0]];
      return permissionNeeded ? AccessControlService.can(currentUser, permissionNeeded) : true;
    })
  })).filter(group => group.items.length > 0);

  return (
    <ShadSidebar collapsible="icon" className="border-r border-slate-100 bg-white">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-slate-50 px-6">
        <Link href="/dashboard" className="flex items-center gap-3 w-full">
          <div className="bg-primary p-2 rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="text-lg font-black tracking-tighter uppercase italic text-slate-800 leading-none">
              SecureGuard
            </span>
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">Command Centre</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-6">
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-4">
            <SidebarGroupLabel className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] px-4 mb-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (pathname === '/dashboard' && item.href.includes('dashboard'))}
                      tooltip={item.label}
                      className="px-4 py-6 hover:bg-slate-50 data-[active=true]:bg-primary/5 data-[active=true]:text-primary transition-all rounded-2xl mb-1 group"
                    >
                      <Link href={item.href} className="flex items-center gap-4">
                        <item.icon className={`w-5 h-5 transition-colors ${pathname === item.href ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                        <span className="font-black text-xs uppercase italic tracking-tight">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-50 p-4">
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 group-data-[collapsible=icon]:p-2 transition-all">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
            <AvatarFallback className="text-xs font-black bg-primary text-white uppercase italic">
              {currentUser?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="font-black text-xs text-slate-800 truncate uppercase italic tracking-tight leading-none">
              {currentUser?.name}
            </span>
            <span className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
               <ShieldCheck className="h-2 w-2" /> Verified
            </span>
          </div>
        </div>
      </SidebarFooter>
    </ShadSidebar>
  );
}
