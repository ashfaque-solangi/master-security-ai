
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Receipt
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

const navGroups = [
  {
    label: 'Command Centre',
    items: [
      { href: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      { href: '/recruitment', label: 'HR Dashboard', icon: Briefcase },
      { href: '/analytics', label: 'Executive AI', icon: PieChart },
      { href: '/client-portal', label: 'Client Portal', icon: Building },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/scheduling', label: 'Scheduling', icon: Calendar },
      { href: '/patrols', label: 'Live Tracking', icon: Map },
      { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
      { href: '/forms', label: 'Form Builder', icon: ClipboardList },
      { href: '/visitors', label: 'Visitors', icon: UserCheck },
      { href: '/inbox', label: 'Unified Inbox', icon: MessageSquare },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { href: '/workforce', label: 'Guard Registry', icon: Users },
      { href: '/compliance', label: 'Compliance', icon: Sparkles },
      { href: '/performance', label: 'Performance', icon: Star },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/sites', label: 'Sites & Contracts', icon: FileText },
      { href: '/fleet', label: 'Fleet & Assets', icon: Truck },
      { href: '/payroll', label: 'Payroll', icon: CreditCard },
      { href: '/invoices', label: 'Invoicing', icon: Receipt },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/security', label: 'System Audit', icon: Lock },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0 sidebar-gradient">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/30">
          <Link href="/dashboard" className="flex items-center gap-3 w-full px-4">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              SecureGuard
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase font-bold tracking-wider px-4 mb-2">
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
                        className="px-4 py-5 hover:bg-sidebar-accent/50 data-[active=true]:bg-primary data-[active=true]:text-white transition-all rounded-none border-l-4 border-transparent data-[active=true]:border-l-primary"
                      >
                        <Link href={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{item.label}</span>
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
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/30">
            <Avatar className="h-8 w-8 border border-primary/20">
              {userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt="Admin"
                />
              )}
              <AvatarFallback className="text-[10px]">AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="font-bold text-xs truncate">Admin Dashboard</span>
              <span className="text-[9px] text-sidebar-foreground/50 uppercase font-bold">
                Operations
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-[#f7f7f7]">
        <Header />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto max-w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
