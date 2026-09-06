
'use client';
import { Search, Bell, UserCircle, LogOut, Settings, ShieldAlert } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export function Header() {
  const store = useJsonStore();
  const router = useRouter();
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

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent/10" />
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search Intelligence..."
            className="w-[300px] lg:w-[400px] rounded-full bg-slate-50 border-none pl-10 focus-visible:ring-1 focus-visible:ring-primary h-9 font-medium"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Simulator / Role Switcher */}
        <div className="hidden lg:flex items-center bg-slate-50 rounded-full px-1 py-1 mr-2 border border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-black h-7 px-3 bg-white shadow-sm border border-slate-200">
                CONTEXT: <span className="text-primary ml-1 uppercase italic">{currentUser.role.replace(/_/g, ' ')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-none bg-white">
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest pb-2 flex items-center gap-2">
                <ShieldAlert className="h-3 w-3" /> User Simulation
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {initialUsers.map(user => (
                  <DropdownMenuItem key={user.id} onClick={() => switchRole(user)} className="flex flex-col items-start gap-0.5 rounded-xl py-2 px-3 hover:bg-slate-50 cursor-pointer">
                    <span className="font-black text-xs text-slate-800 uppercase italic tracking-tight">{user.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-primary font-bold uppercase">{user.role}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">Org: {user.organizationId.split('-')[1]}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-slate-50">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white animate-pulse"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start text-left leading-tight">
                <span className="text-xs font-black text-slate-700 uppercase italic">{currentUser.name}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {currentUser.id}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-none">
            <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400">Account Access</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl py-2 font-bold text-xs"><UserCircle className="mr-2 h-4 w-4 text-primary" /> Profile Control</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl py-2 font-bold text-xs"><Settings className="mr-2 h-4 w-4 text-primary" /> Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive rounded-xl py-2 font-black text-xs uppercase" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
