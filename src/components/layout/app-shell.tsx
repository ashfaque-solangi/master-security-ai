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
  MessageSquare,
  Zap,
  Clock,
  CreditCard,
  Truck,
  UserCheck,
  Star,
  Sparkles,
  PieChart,
  Video,
  Link2,
  Lock,
  Briefcase,
  Settings,
  Bell,
  Search,
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
    label: 'Command & Control',
    items: [
      { href: '/dashboard', label: 'Command Centre', icon: LayoutDashboard },
      { href: '/patrols', label: 'Live Tracking', icon: Map },
      { href: '/scheduling', label: 'Scheduling', icon: Calendar },
      { href: '/incidents', label: 'Incidents & SOS', icon: AlertTriangle },
    ],
  },
  {
    label: 'Workforce & HR',
    items: [
      { href: '/workforce', label: 'Guard Registry', icon: Users },
      { href: '/recruitment', label: 'Recruitment', icon: Briefcase },
      { href: '/compliance', label: 'Compliance', icon: Zap },
      { href: '/performance', label: 'Performance', icon: Star },
    ],
  },
  {
    label: 'Assets & Logistics',
    items: [
      { href: '/sites', label: 'Sites & Contracts', icon: FileText },
      { href: '/fleet', label: 'Fleet & Equipment', icon: Truck },
      { href: '/visitors', label: 'Visitor Management', icon: UserCheck },
      { href: '/cctv', label: 'CCTV & Evidence', icon: Video },
    ],
  },
  {
    label: 'Finance & BI',
    items: [
      { href: '/attendance', label: 'Attendance', icon: Clock },
      { href: '/payroll', label: 'Payroll', icon: CreditCard },
      { href: '/analytics', label: 'CEO Dashboard', icon: PieChart },
      { href: '/ai-ops', label: 'AI Operations', icon: Sparkles },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/inbox', label: 'Unified Inbox', icon: MessageSquare },
      { href: '/integrations', label: 'Integrations', icon: Link2 },
      { href: '/security', label: 'Security & Audit', icon: Lock },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50 bg-sidebar">
          <Link href="/dashboard" className="flex items-center gap-3 w-full px-4">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              SecureGuard
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="bg-sidebar">
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
                        className="px-4 py-6 hover:bg-sidebar-accent/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors"
                      >
                        <Link href={item.href}>
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="bg-sidebar border-t border-sidebar-border/50 p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/20 border border-sidebar-border/30">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              {userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt="Dispatcher"
                />
              )}
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm tracking-tight">Alex Dispatch</span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase font-bold">
                Control Room
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <Header />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
