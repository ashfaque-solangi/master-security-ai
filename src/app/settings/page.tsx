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
  ShieldAlert,
  Database,
  RefreshCw,
  Zap,
  Info,
  Monitor,
  Smartphone,
  Globe,
  Trash
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { User, UserRole, PermissionAction, UserSession } from '@/lib/types';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const roles: UserRole[] = [
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'OPERATIONS_MANAGER',
  'DISPATCHER',
  'HR_MANAGER',
  'COMPLIANCE_MANAGER',
  'FINANCE_MANAGER',
  'CLIENT_ADMIN'
];

export default function SettingsPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DISPATCHER');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [extraPermissions, setExtraPermissions] = useState<PermissionAction[]>([]);

  useEffect(() => {
    setMounted(true);
    setUsers(store.getUsers());
    setSessions(store.getSessions());
  }, []);

  const handleAddUser = () => {
    if (!name || !email) return;
    const newUser: User = {
      id: `USR-${Math.floor(Math.random() * 1000)}`,
      organizationId: store.getCurrentUser()?.organizationId || 'ORG-001',
      name,
      email,
      role,
      status,
      extraPermissions
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
      status,
      extraPermissions
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
    setExtraPermissions(user.extraPermissions || []);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('DISPATCHER');
    setStatus('Active');
    setExtraPermissions([]);
    setSelectedUser(null);
  };

  const togglePermission = (perm: PermissionAction) => {
    setExtraPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleRevokeSession = (sessionId: string) => {
    store.revokeSession(sessionId);
    setSessions(store.getSessions());
    toast({ title: "Session Revoked", description: "Access for that device has been immediately terminated." });
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">System Configuration</h1>
          <p className="text-muted-foreground">Manage platform users, security hardening, and active device sessions.</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="bg-white border p-1 rounded-2xl shadow-sm h-14">
          <TabsTrigger value="users" className="rounded-xl px-8 font-black uppercase text-xs italic tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white">User Registry</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-xl px-8 font-black uppercase text-xs italic tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white">Active Sessions</TabsTrigger>
          <TabsTrigger value="maintenance" className="rounded-xl px-8 font-black uppercase text-xs italic tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Access Control
                    </CardTitle>
                    <CardDescription>Provision system access and granular permission overrides.</CardDescription>
                  </div>
                  
                  <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary text-white font-bold px-4 rounded-xl">
                        <UserPlus className="mr-2 h-4 w-4" /> Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Add Personnel</DialogTitle>
                        <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Initialize a new secure platform account.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robert Fox" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Terminal</label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="robert@company.com" className="rounded-xl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Assigned Role</label>
                            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {roles.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Access Status</label>
                            <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
                              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleAddUser} className="bg-primary text-white rounded-xl font-black italic px-8">Create User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50 border-none">
                      <TableRow>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest px-6">Personnel</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest">System Role</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">Status</TableHead>
                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-right px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                          <TableCell className="px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border shadow-inner">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-xs text-slate-800 uppercase italic tracking-tight">{user.name}</p>
                                <p className="text-[9px] text-muted-foreground font-bold">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[8px] font-black text-primary border-primary/20 bg-primary/5 uppercase px-3 h-5">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${user.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(user)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4" /></Button>
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
              <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative rounded-[2rem]">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Lock className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-black flex items-center gap-2 italic uppercase italic tracking-tighter">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    SECURITY OVERRIDE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">2FA Mandatory</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Admin Enforcement Active</p>
                    </div>
                    <Badge className="bg-primary text-white font-black italic px-4">ON</Badge>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Device Limit (2)</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Concurrent Blocking</p>
                    </div>
                    <Badge className="bg-primary text-white font-black italic px-4">ENFORCED</Badge>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase italic tracking-tighter h-12 shadow-xl shadow-primary/20">MANAGE PROTOCOLS</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
           <Card className="border-none shadow-sm overflow-hidden rounded-3xl bg-white">
             <CardHeader className="bg-slate-50/50 p-8 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Live Session Registry</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Monitoring real-time concurrent device connections.</CardDescription>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Load</p>
                        <p className="text-xl font-black italic text-slate-800">{sessions.filter(s => s.status === 'Active').length} Active</p>
                     </div>
                     <Monitor className="h-8 w-8 text-primary opacity-50" />
                  </div>
                </div>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-slate-50/50">
                   <TableRow>
                     <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Authorized Personnel</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest">Platform / Agent</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest">Login Time</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest">Last Activity</TableHead>
                     <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                     <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Control</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                    {sessions.map(session => (
                      <TableRow key={session.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] border shadow-inner">{session.userName.charAt(0)}</div>
                              <div>
                                 <p className="text-xs font-black text-slate-800 uppercase italic tracking-tight">{session.userName}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{session.ipAddress}</p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              {session.userAgent.includes('Mobile') ? <Smartphone className="h-3.5 w-3.5 text-slate-400" /> : <Monitor className="h-3.5 w-3.5 text-slate-400" />}
                              <span className="text-[10px] font-bold text-slate-600 truncate max-w-[200px]">{session.userAgent}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(session.createdAt), 'MMM dd, HH:mm')}</TableCell>
                        <TableCell className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(session.lastActiveAt), 'HH:mm:ss')}</TableCell>
                        <TableCell>
                           <Badge className={`text-[8px] font-black h-5 px-3 rounded-full border-none ${
                             session.status === 'Active' ? 'bg-green-100 text-green-600' :
                             session.status === 'Revoked' ? 'bg-red-100 text-red-600' :
                             'bg-slate-100 text-slate-500'
                           }`}>
                             {session.status.toUpperCase()}
                           </Badge>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                           {session.status === 'Active' && (
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 rounded-xl"
                              onClick={() => handleRevokeSession(session.id)}
                            >
                               <Trash className="h-3 w-3 mr-1.5" /> REVOKE
                             </Button>
                           )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic font-black uppercase text-xs">No active sessions detected.</TableCell>
                      </TableRow>
                    )}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b pb-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-black flex items-center gap-2 italic uppercase">
                    <Database className="h-5 w-5 text-primary" />
                    DEMO DATA OVERRIDE
                  </CardTitle>
                  <CardDescription>Reset local testing data and re-initialize high-fidelity deterministic records.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => store.resetToDemo()} className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase text-[10px]">
                    <RefreshCw className="mr-2 h-4 w-4" /> RESET SYSTEM
                  </Button>
                  <Button size="sm" onClick={() => store.loadDemoDataset()} className="bg-primary text-white rounded-xl shadow-lg shadow-primary/20 font-black italic uppercase text-[10px] px-6">
                    <Zap className="mr-2 h-4 w-4" /> LOAD DATASET
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Modify Identity</DialogTitle>
            <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Modify access parameters for {selectedUser?.name || 'Authorized User'}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Reference</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Access Tier</label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleUpdateUser} className="bg-primary text-white rounded-xl font-black italic px-8 shadow-lg shadow-primary/20">Update Personnel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
