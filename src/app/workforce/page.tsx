
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus,
  MoreVertical,
  ShieldCheck,
  Mail,
  Trash2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useJsonStore } from '@/lib/store';
import { Guard } from '@/lib/types';

export default function WorkforcePage() {
  const store = useJsonStore();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Guard State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setGuards(store.getGuards());
  }, []);

  const handleAdd = () => {
    if (!newName) return;
    const guard: Guard = {
      id: `GRD-${Math.floor(Math.random() * 1000)}`,
      name: newName,
      email: newEmail || `${newName.toLowerCase().replace(' ', '.')}@security.com`,
      status: 'Active',
      complianceStatus: 'Compliant',
      lastLocationUpdate: new Date().toISOString(),
      licenceExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      docsMissing: 0,
      performanceScore: 100,
    };
    const updated = store.addGuard(guard);
    setGuards(updated);
    setIsDialogOpen(false);
    setNewName('');
    setNewEmail('');
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteGuard(id);
    setGuards(updated);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workforce Management</h1>
          <p className="text-muted-foreground">
            Manage your security officers, track compliance, and view real-time status.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Add Officer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Officer</DialogTitle>
              <DialogDescription>Create a new profile for a security guard.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Full Name</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. John Wick" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Email Address</label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@security.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search officers..." className="pl-8" />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Status</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {guards.map((guard) => (
          <Card key={guard.id} className="relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              guard.status === 'Active' ? 'bg-green-500' :
              guard.status === 'On Break' ? 'bg-yellow-500' :
              'bg-gray-400'
            }`} />
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback>{guard.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{guard.name}</CardTitle>
                <CardDescription className="text-xs">{guard.id}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Assign Shift</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(guard.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                  <Badge variant="outline" className="text-[10px] w-full justify-center">{guard.status}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Compliance</p>
                  <Badge 
                    variant={guard.complianceStatus === 'Compliant' ? 'secondary' : 'destructive'} 
                    className="text-[10px] w-full justify-center"
                  >
                    {guard.complianceStatus}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="truncate">{guard.currentSiteName || 'No Active Shift'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate text-xs">{guard.email}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="flex-1 text-xs">Profile</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs text-primary">Message</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
