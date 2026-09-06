
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Map,
  Calendar,
  AlertTriangle,
  FileText,
  CreditCard,
  Truck,
  UserCheck,
  Star,
  Sparkles,
  PieChart,
  Lock,
  Briefcase,
  Settings,
  Building,
  MessageSquare,
  ClipboardList,
  Receipt,
  User as UserIcon,
  Users2,
  Clock3,
  History
} from 'lucide-react';
import type { ReactNode } from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useJsonStore } from '@/lib/store';
import { AccessControlService } from '@/lib/access-control';
import { navItemPermissions } from '@/lib/permissions';
import { User } from '@/lib/types';

const navGroups = [
  {
    label: 'Command Centre',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/guard-portal', label: 'My Hub', icon: UserIcon },
      { href: '/recruitment', label: 'HR Pipeline', icon: Briefcase },
      { href: '/analytics', label: 'Executive Intelligence', icon: PieChart },
      { href: '/client-portal', label: 'Partner Portal', icon: Building },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/scheduling', label: 'Roster Engine', icon: Calendar },
      { href: '/shifts', label: 'Shift Registry', icon: Clock3 },
      { href: '/patrols', label: 'Live Patrols', icon: Map },
      { href: '/incidents', label: 'Incident Log', icon: AlertTriangle },
      { href: '/forms', label: 'Forms & SOPs', icon: ClipboardList },
      { href: '/visitors', label: 'Access Log', icon: UserCheck },
      { href: '/inbox', label: 'Communications', icon: MessageSquare },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { href: '/workforce', label: 'Officer List', icon: Users },
      { href: '/compliance', label: 'SIA & RTW', icon: Sparkles },
      { href: '/performance', label: 'KPIs & Ranks', icon: Star },
    ],
  },
  {
    label: 'Corporate',
    items: [
      { href: '/clients', label: 'Client Accounts', icon: Building },
      { href: '/sites', label: 'Sites & Assets', icon: FileText },
      { href: '/subcontractors', label: 'External Partners', icon: Users2 },
      { href: '/fleet', label: 'Fleet Ops', icon: Truck },
      { href: '/payroll', label: 'Compensation', icon: CreditCard },
      { href: '/invoices', label: 'Billing Engine', icon: Receipt },
    ],
  },
  {
    label: 'Security',
    items: [
      { href: '/settings', label: 'System Parameters', icon: Settings },
      { href: '/security', label: 'Network Security', icon: Lock },
      { href: '/audit', label: 'Forensic Audit', icon: History },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useJsonStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = store.getCurrentUser();
    if (!user && pathname !== '/login') {
      router.push('/login');
    } else if (user) {
      setCurrentUser(user);
    }
  }, [pathname, router]);

  if (!isMounted) return null;
  if (pathname === '/login') return <>{children}</>;
  if (!currentUser) return null;

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const permissionNeeded = navItemPermissions[item.href];
      return permissionNeeded ? AccessControlService.can(currentUser, permissionNeeded) : true;
    })
  })).filter(group => group.items.length > 0);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0 sidebar-gradient">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/30">
          <Link href="/dashboard" className="flex items-center gap-3 w-full px-4">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              SecureGuard
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          {filteredGroups.map((group) => (
            <SidebarGroup key={group.label} className="mb-4">
              <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] uppercase font-black tracking-[0.2em] px-4 mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                        className="px-4 py-6 hover:bg-sidebar-accent/50 data-[active=true]:bg-primary data-[active=true]:text-white transition-all rounded-2xl mb-1"
                      >
                        <Link href={item.href}>
                          <item.icon className={`w-4 h-4 ${pathname === item.href ? 'text-white' : 'text-primary'}`} />
                          <span className="font-bold text-xs uppercase italic tracking-tight">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/30 p-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-sidebar-accent/30 border border-white/5">
            <Avatar className="h-8 w-8 border border-primary/20">
              <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary uppercase">
                {currentUser?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="font-black text-xs truncate uppercase italic tracking-tighter text-white">
                {currentUser?.name}
              </span>
              <span className="text-[8px] text-primary font-black uppercase tracking-widest mt-0.5">
                {currentUser?.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-[#f8f9fc]">
        <Header />
        <main className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
