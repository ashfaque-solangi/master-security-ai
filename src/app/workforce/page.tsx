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
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useJsonStore } from '@/lib/store';
import { Guard, GuardStatus, ComplianceStatus } from '@/lib/types';

export default function WorkforcePage() {
  const store = useJsonStore();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<GuardStatus>('Active');
  const [compliance, setCompliance] = useState<ComplianceStatus>('Compliant');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    setGuards(store.getGuards());
  }, []);

  const handleAdd = () => {
    if (!name) return;
    const guard: Guard = {
      id: `GRD-${Math.floor(Math.random() * 1000)}`,
      name: name,
      email: email || `${name.toLowerCase().replace(' ', '.')}@security.com`,
      status: status,
      complianceStatus: compliance,
      lastLocationUpdate: new Date().toISOString(),
      licenceExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      docsMissing: 0,
      performanceScore: 100,
      weeklyHours: 0,
      isAvailable: isAvailable
    };
    const updated = store.addGuard(guard);
    setGuards(updated);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedGuard || !name) return;
    const updatedGuard: Guard = {
      ...selectedGuard,
      name,
      email,
      status,
      complianceStatus: compliance,
      isAvailable
    };
    const updated = store.updateGuard(updatedGuard);
    setGuards(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const toggleAvailability = (guard: Guard) => {
    const updatedGuard = { ...guard, isAvailable: !guard.isAvailable };
    const updated = store.updateGuard(updatedGuard);
    setGuards(updated);
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteGuard(id);
    setGuards(updated);
  };

  const openEdit = (guard: Guard) => {
    setSelectedGuard(guard);
    setName(guard.name);
    setEmail(guard.email);
    setStatus(guard.status);
    setCompliance(guard.complianceStatus);
    setIsAvailable(guard.isAvailable);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setStatus('Active');
    setCompliance('Compliant');
    setIsAvailable(true);
    setSelectedGuard(null);
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

        <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Wick" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@security.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Initial Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as GuardStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Break">On Break</SelectItem>
                      <SelectItem value="Off Duty">Off Duty</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Compliance Status</label>
                  <Select value={compliance} onValueChange={(v) => setCompliance(v as ComplianceStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compliant">Compliant</SelectItem>
                      <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                      <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold">Ready for Deployment</label>
                  <p className="text-xs text-muted-foreground">Officer is active in the scheduling pool.</p>
                </div>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Officer Details</DialogTitle>
            <DialogDescription>Update the information for {selectedGuard?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Email Address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as GuardStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Break">On Break</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Compliance Status</label>
                <Select value={compliance} onValueChange={(v) => setCompliance(v as ComplianceStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compliant">Compliant</SelectItem>
                    <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                    <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
              <div className="space-y-0.5">
                <label className="text-sm font-bold">Ready for Deployment</label>
                <p className="text-xs text-muted-foreground">Available for AI-suggested shift filling.</p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback>{guard.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{guard.name}</CardTitle>
                <CardDescription className="text-xs font-mono uppercase font-bold text-primary">{guard.id}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(guard)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </DropdownMenuItem>
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

              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{guard.weeklyHours}h / week</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Ready</span>
                    <Switch 
                      className="scale-75"
                      checked={guard.isAvailable} 
                      onCheckedChange={() => toggleAvailability(guard)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="truncate">{guard.currentSiteName || 'No Active Shift'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
