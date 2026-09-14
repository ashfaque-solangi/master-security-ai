'use client';

import { Search, Bell, UserCircle, LogOut, Settings, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useJsonStore } from '@/lib/store';
import { User } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const store = useJsonStore();
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
  }, []);

  const switchRole = (user: User) => {
    store.setCurrentUser(user);
    setCurrentUser(user);
    window.location.reload();
  };

  const handleLogout = () => {
    store.logout();
    router.push('/login');
  };

  if (!currentUser) return null;

  // Breadcrumb logic
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'Dashboard';

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 lg:px-10 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-slate-100 text-slate-400" />
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Pages</span>
            <span className="text-slate-200">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 italic">{breadcrumb}</span>
          </div>
        </div>

        <div className="hidden md:flex relative group ml-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search Intelligence Records..."
            className="w-[300px] lg:w-[450px] rounded-2xl bg-slate-50 border-none pl-12 focus-visible:ring-1 focus-visible:ring-primary/20 h-11 font-bold text-xs"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-2xl relative hover:bg-slate-50 text-slate-400 h-11 w-11 border border-transparent hover:border-slate-100 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-5 h-14 rounded-[1.25rem] hover:bg-slate-50 border border-slate-100 transition-all shadow-sm">
              <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black italic">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start text-left leading-none">
                <span className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">{currentUser.name}</span>
                <Badge variant="outline" className="mt-1.5 text-[7px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 h-4">
                  {currentUser.role}
                </Badge>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-3xl shadow-2xl border-none p-2 bg-white">
            <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400 px-4 py-3">Account Security</DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="rounded-2xl py-3 px-4 font-black text-[11px] uppercase italic tracking-tight cursor-pointer hover:bg-slate-50">
              <UserCircle className="mr-3 h-4 w-4 text-primary" /> Profile Identity
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-2xl py-3 px-4 font-black text-[11px] uppercase italic tracking-tight cursor-pointer hover:bg-slate-50">
              <Settings className="mr-3 h-4 w-4 text-primary" /> System Prefs
            </DropdownMenuItem>
            
            {/* Quick Simulation Access */}
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4 py-3 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" /> Role Switcher
            </DropdownMenuLabel>
            <div className="max-h-[200px] overflow-y-auto px-2 pb-2">
              {initialUsers.slice(0, 4).map(user => (
                <DropdownMenuItem 
                  key={user.id} 
                  onClick={() => switchRole(user)} 
                  className="flex flex-col items-start gap-1 rounded-2xl py-2 px-3 hover:bg-slate-50 cursor-pointer mb-1 border border-transparent hover:border-slate-100"
                >
                  <span className="font-black text-[10px] text-slate-800 uppercase italic tracking-tighter">{user.name}</span>
                  <span className="text-[7px] text-primary font-black uppercase tracking-widest">{user.role}</span>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="text-red-500 rounded-2xl py-3 px-4 font-black text-[11px] uppercase italic tracking-tight cursor-pointer hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="mr-3 h-4 w-4" /> Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
