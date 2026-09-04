'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  Lock, 
  UserPlus, 
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Pencil,
  MoreVertical
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';

const roles: UserRole[] = [
  'Super Admin',
  'Company Admin',
  'Operations Manager',
  'Dispatcher',
  'HR / Recruitment',
  'Compliance Manager',
  'Payroll / Finance',
  'Client Admin'
];

export default function SettingsPage() {
  const store = useJsonStore();
  const [users, setUsers] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Dispatcher');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    setMounted(true);
    setUsers(store.getUsers());
  }, []);

  const handleAddUser = () => {
    if (!name || !email) return;
    const newUser: User = {
      id: `USR-${Math.floor(Math.random() * 1000)}`,
      name,
      email,
      role,
      status
    };
    const updated = store.addUser(newUser);
    setUsers(updated);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!selectedUser || !name || !email) return;
    const updatedUser: User = {
      ...selectedUser,
      name,
      email,
      role,
      status
    };
    const updated = store.updateUser(updatedUser);
    setUsers(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteUser = (id: string) => {
    const updated = store.deleteUser(id);
    setUsers(updated);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('Dispatcher');
    setStatus('Active');
    setSelectedUser(null);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">System Settings</h1>
          <p className="text-muted-foreground">Manage platform users, security protocols, and enterprise branding.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Access & Roles
                </CardTitle>
                <CardDescription>Control who can access the SecureGuard Command centre.</CardDescription>
              </div>
              
              <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-white">
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Portal User</DialogTitle>
                    <DialogDescription>Assign a role and email for portal access.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Full Name</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robert Fox" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Email</label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="robert@company.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Assigned Role</label>
                        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Status</label>
                        <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser}>Create User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-none">
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest px-6">User</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Role</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest text-right px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 bg-primary/5">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                          {user.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Lock className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                SECURITY HARDENING
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">2FA Enforcement</p>
                  <p className="text-[10px] text-slate-400">Require multi-factor for all Admins.</p>
                </div>
                <Badge className="bg-primary">ON</Badge>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">SSO (Single Sign-On)</p>
                  <p className="text-[10px] text-slate-400">Azure AD / Okta integration.</p>
                </div>
                <Badge variant="outline" className="border-white/20 text-slate-400">DISABLED</Badge>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-xs mt-2">Manage Auth Policy</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">API Latency</span>
                <span className="font-bold text-green-600">24ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Storage Usage</span>
                <span className="font-bold">12.4 GB / 100 GB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Profile</DialogTitle>
            <DialogDescription>Modify access permissions and role for {selectedUser?.name}.</DialogDescription>
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
                <label className="text-sm font-bold">Assigned Role</label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Access Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
