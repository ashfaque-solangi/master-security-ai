
'use client';
import { Search, Bell, UserCircle, LogOut, Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const store = useJsonStore();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
  }, []);

  const switchRole = (user: User) => {
    store.setCurrentUser(user);
    setCurrentUser(user);
    // Reload to apply permission changes to shell
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
            placeholder="Search here..."
            className="w-[300px] lg:w-[400px] rounded-full bg-slate-50 border-none pl-10 focus-visible:ring-1 focus-visible:ring-primary h-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Role Switcher (Demo Only) */}
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-1 py-1 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-bold h-7 px-3 bg-white shadow-sm border">
                Switch Context: <span className="text-primary ml-1">{currentUser.role}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Simulate User Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {initialUsers.map(user => (
                <DropdownMenuItem key={user.id} onClick={() => switchRole(user)} className="flex flex-col items-start gap-0.5">
                  <span className="font-bold">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{user.role}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-white"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-slate-50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start text-left leading-tight">
                <span className="text-sm font-bold text-slate-700">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{currentUser.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><UserCircle className="mr-2 h-4 w-4" /> My Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
