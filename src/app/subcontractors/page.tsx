
'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Pencil,
  ShieldCheck,
  Users,
  Star,
  Download
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Subcontractor } from '@/lib/types';

export default function SubcontractorManagement() {
  const store = useJsonStore();
  const [subs, setSubs] = useState<Subcontractor[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subcontractor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [reg, setReg] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Approved' | 'Pending' | 'Suspended'>('Pending');
  const [guardCount, setGuardCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setSubs(store.getSubcontractors());
  }, []);

  const handleAdd = () => {
    if (!name || !email) return;
    const sub: Subcontractor = {
      id: `SUB-${Math.floor(Math.random() * 1000)}`,
      name,
      companyReg: reg,
      contactEmail: email,
      contactPhone: phone,
      status,
      guardCount,
      rating: 5.0
    };
    const updated = store.addSubcontractor(sub);
    setSubs(updated);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedSub || !name) return;
    const updatedSub: Subcontractor = {
      ...selectedSub,
      name,
      companyReg: reg,
      contactEmail: email,
      contactPhone: phone,
      status,
      guardCount
    };
    const updated = store.updateSubcontractor(updatedSub);
    setSubs(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteSubcontractor(id);
    setSubs(updated);
  };

  const openEdit = (sub: Subcontractor) => {
    setSelectedSub(sub);
    setName(sub.name);
    setReg(sub.companyReg);
    setEmail(sub.contactEmail);
    setPhone(sub.contactPhone);
    setStatus(sub.status);
    setGuardCount(sub.guardCount);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setReg('');
    setEmail('');
    setPhone('');
    setStatus('Pending');
    setGuardCount(0);
    setSelectedSub(null);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Subcontractor Management</h1>
          <p className="text-muted-foreground">Monitor 3rd party security providers, SLAs, and external deployment.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> SLA Templates</Button>
          <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white">
                <Plus className="mr-2 h-4 w-4" /> Onboard Subcontractor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>External Provider Onboarding</DialogTitle>
                <DialogDescription>Register a new subcontractor to support workforce overflow.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Company Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Apex Protection Ltd" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Company Registration</label>
                    <Input value={reg} onChange={(e) => setReg(e.target.value)} placeholder="REG-123456" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Initial Guard Pool</label>
                    <Input type="number" value={guardCount} onChange={(e) => setGuardCount(parseInt(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Ops Contact Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ops@subcontractor.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 ..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Verification Status</label>
                    <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Pending">Pending Audit</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Begin Onboarding</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Approved Partners</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{subs.filter(s => s.status === 'Approved').length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">External Guard Pool</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{subs.reduce((acc, s) => acc + s.guardCount, 0)} Officers</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg. Partner Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">4.5/5.0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Supply Chain Registry</CardTitle>
              <CardDescription>Verified status of all 3rd party workforce providers.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search partners..." className="pl-8 text-xs h-9" />
              </div>
              <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-none">
                <TableHead className="px-6 text-[10px] uppercase font-bold tracking-widest">Company</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Reg #</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Capacity</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Compliance</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Rating</TableHead>
                <TableHead className="text-right px-6 text-[10px] uppercase font-bold tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map(sub => (
                <TableRow key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border font-bold text-slate-600">
                        {sub.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-800">{sub.name}</span>
                        <span className="text-[10px] text-muted-foreground">{sub.contactEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{sub.companyReg}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{sub.guardCount} Active</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      sub.status === 'Approved' ? 'secondary' :
                      sub.status === 'Pending' ? 'outline' :
                      'destructive'
                    } className="text-[10px] uppercase tracking-tighter">
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-bold text-slate-700">{sub.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(sub)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(sub.id)}>
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

      {/* Edit Subcontractor Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Provider Configuration</DialogTitle>
            <DialogDescription>Modify parameters for {selectedSub?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Company Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Company Registration</label>
                <Input value={reg} onChange={(e) => setReg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Verified Guard Capacity</label>
                <Input type="number" value={guardCount} onChange={(e) => setGuardCount(parseInt(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Ops Contact Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Contact Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Audit Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending Audit</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Audit Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
