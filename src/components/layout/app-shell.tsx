'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useJsonStore } from '@/lib/store';
import { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useJsonStore();
  const { toast } = useToast();
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

  // SECURE CONCURRENT SESSION HEARTBEAT
  useEffect(() => {
    if (pathname === '/login' || !isMounted) return;

    const interval = setInterval(() => {
      const isValid = store.heartbeat();
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has been revoked or signed out from another device."
        });
        router.push('/login');
      }
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [pathname, isMounted, store, router, toast]);

  if (!isMounted) return null;
  if (pathname === '/login') return <>{children}</>;
  
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8f9fc]">
        <Sidebar />
        <SidebarInset className="flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-12">
            <div className="mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
