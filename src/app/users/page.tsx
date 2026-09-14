
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, ShieldCheck, Lock, 
  MoreVertical, Mail, Trash2, Pencil, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJsonStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';
import { AccessControlService } from '@/lib/access-control';

export default function UserManagement() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    setUsers(store.getUsers());
    setCurrentUser(store.getCurrentUser());
  }, []);

  if (!mounted || !currentUser) return null;

  // Final check at the UI layer
  if (!AccessControlService.can(currentUser, 'manage')) {
    return <div className="p-20 text-center font-black uppercase text-red-500 italic">Access Denied: Administrative Clearance Required</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Identity Management</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Access, RBAC & Organization Scope</p>
        </div>
        <Button className="bg-primary text-white rounded-xl h-10 px-6 font-black text-xs uppercase italic shadow-lg">
          <UserPlus className="mr-2 h-4 w-4" /> CREATE USER
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search identity records..." className="pl-10 border-none bg-slate-50 text-xs" />
        </div>
        <Button variant="ghost" className="text-slate-500 font-bold"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest">Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Organization</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Access Scope</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="hover:bg-slate-50 transition-colors group">
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] border shadow-inner">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 italic uppercase">{u.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[10px] font-black text-slate-500 uppercase">{u.organizationId}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px] font-black text-primary border-primary/20 bg-primary/5 uppercase">{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {u.clientId ? `Client: ${u.clientId}` : u.siteIds?.length ? `Sites: ${u.siteIds.length}` : 'Full Org'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={u.status === 'Active' ? 'secondary' : 'outline'} className="text-[9px] font-black rounded-full h-5">
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
