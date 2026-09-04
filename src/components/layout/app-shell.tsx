
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
  BarChart3,
  Settings,
  Briefcase,
  Zap,
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
    label: 'Operations',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/tracking', label: 'Live Tracking', icon: Map },
      { href: '/scheduling', label: 'Scheduling', icon: Calendar },
      { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { href: '/workforce', label: 'Guard Registry', icon: Users },
      { href: '/recruitment', label: 'Recruitment', icon: Briefcase },
      { href: '/compliance', label: 'Compliance', icon: Zap },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/sites', label: 'Sites & Clients', icon: Shield },
      { href: '/reports', label: 'Reports', icon: FileText },
      { href: '/finance', label: 'Finance', icon: BarChart3 },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/inbox', label: 'Unified Inbox', icon: MessageSquare },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent" />
            <span className="text-lg font-bold tracking-tight text-white group-data-[collapsible=icon]:hidden">
              SecureGuard
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-sidebar-foreground/50">
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
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-accent/10">
            <Avatar className="h-10 w-10 border border-sidebar-border">
              {userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt="Dispatcher"
                  width={40}
                  height={40}
                />
              )}
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm">Alex Dispatch</span>
              <span className="text-xs text-sidebar-foreground/50">
                Control Room
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 lg:p-6 bg-background min-h-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
