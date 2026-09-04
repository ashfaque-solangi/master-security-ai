
'use client';

import { useState, useEffect } from 'react';
import { 
  Clock3, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Pencil, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Zap,
  Lock
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
import { Shift, Site, Guard, AssignedGuard } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ShiftsManagement() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Form States
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [role, setRole] = useState('Security Officer');
  const [status, setStatus] = useState<Shift['status']>('Open');
  const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'08:00"));
  const [endTime, setEndTime] = useState(format(new Date(), "yyyy-MM-dd'T'16:00"));

  useEffect(() => {
    setIsMounted(true);
    setShifts(store.getShifts());
    setSites(store.getSites());
    setGuards(store.getGuards());
  }, []);

  const handleAdd = () => {
    if (!selectedSiteId) return;
    const site = sites.find(s => s.id === selectedSiteId);
    const newShift: Shift = {
      id: `SHF-${Date.now()}`,
      siteId: selectedSiteId,
      siteName: site?.name || 'Unknown Site',
      assignedGuards: [],
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status: 'Open',
      priority: 'Routine',
      role
    };
    const updated = store.addShift(newShift);
    setShifts(updated);
    setIsCreateOpen(false);
    resetForm();
    toast({ title: "Shift Created", description: "Requirement added to registry." });
  };

  const handleUpdate = () => {
    if (!selectedShift) return;
    const site = sites.find(s => s.id === selectedSiteId);
    const updatedShift: Shift = {
      ...selectedShift,
      siteId: selectedSiteId,
      siteName: site?.name || selectedShift.siteName,
      role,
      status,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setIsEditOpen(false);
    resetForm();
    toast({ title: "Shift Updated", description: "Record successfully modified." });
  };

  const handleDelete = (id: string) => {
    const shift = shifts.find(s => s.id === id);
    if (shift?.status === 'Completed') {
      toast({ title: "Action Restricted", description: "Cannot delete archived/completed shifts.", variant: "destructive" });
      return;
    }
    const updated = store.deleteShift(id);
    setShifts(updated);
    toast({ title: "Shift Deleted", description: "Record removed from registry." });
  };

  const openEdit = (shift: Shift) => {
    if (shift.status === 'Completed') {
      toast({ title: "Read-Only", description: "This shift is finalized for audit purposes.", variant: "default" });
      return;
    }
    setSelectedShift(shift);
    setSelectedSiteId(shift.siteId);
    setRole(shift.role);
    setStatus(shift.status);
    setStartTime(format(parseISO(shift.startTime), "yyyy-MM-dd'T'HH:mm"));
    setEndTime(format(parseISO(shift.endTime), "yyyy-MM-dd'T'HH:mm"));
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setSelectedSiteId('');
    setRole('Security Officer');
    setStatus('Open');
    setStartTime(format(new Date(), "yyyy-MM-dd'T'08:00"));
    setEndTime(format(new Date(), "yyyy-MM-dd'T'16:00"));
    setSelectedShift(null);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Shift Registry</h1>
          <p className="text-muted-foreground font-medium">Manage all past, present, and future deployment records.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl h-10">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-lg px-4 font-bold">
              <LayoutGrid className="w-4 h-4 mr-2" /> Cards
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-lg px-4 font-bold">
              <List className="w-4 h-4 mr-2" /> List
            </Button>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white rounded-full px-6 font-bold shadow-lg shadow-primary/20 h-10">
                <Plus className="mr-2 h-4 w-4" /> Create Requirement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Shift Requirement</DialogTitle>
                <DialogDescription>Define a new operational shift for a site.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Target Site</label>
                  <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                    <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
                    <SelectContent>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Start Time</label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">End Time</label>
                    <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Operational Role</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary text-white">Create Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search shifts by site, guard or role..." className="pl-10 border-none bg-slate-50" />
        </div>
        <Button variant="ghost" className="text-slate-500 font-bold"><Filter className="w-4 h-4 mr-2" /> Advanced Filter</Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shifts.map((shift) => (
            <Card key={shift.id} className="group border-none shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-white rounded-2xl">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${
                shift.status === 'Completed' ? 'bg-slate-400' :
                shift.status === 'In Progress' ? 'bg-green-500' :
                shift.status === 'Open' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-50 rounded-2xl border">
                    <Clock3 className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black uppercase rounded-full">
                    {shift.status}
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg font-black text-slate-800">{shift.siteName}</CardTitle>
                  <p className="text-xs font-bold text-primary mt-1 uppercase tracking-widest">{shift.role}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold uppercase">Timing</span>
                    <span className="font-black text-slate-700">
                      {format(parseISO(shift.startTime), 'MMM dd, HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                    <Users className="h-3 w-3" /> Personnel Team
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shift.assignedGuards?.length ? shift.assignedGuards.map(g => (
                      <Badge key={g.id} variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold text-[10px]">
                        {g.name}
                      </Badge>
                    )) : (
                      <Badge variant="outline" className="border-red-200 text-red-500 bg-red-50 text-[10px] font-black uppercase">UNASSIGNED</Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-primary font-bold h-8" onClick={() => openEdit(shift)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive font-bold h-8" 
                      onClick={() => handleDelete(shift.id)}
                      disabled={shift.status === 'Completed'}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Prune
                    </Button>
                  </div>
                  {shift.status === 'Completed' && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest px-6">Site & Deployment</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Time Window</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Assigned Team</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map(shift => (
                <TableRow key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{shift.siteName}</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{shift.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-700">{format(parseISO(shift.startTime), 'EEEE, MMM dd')}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {shift.assignedGuards?.length ? shift.assignedGuards.map(g => (
                        <div key={g.id} className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded border">{g.name}</div>
                      )) : <span className="text-[10px] text-red-500 font-black italic">Unfilled Post</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[9px] font-black uppercase rounded-full ${
                      shift.status === 'Completed' ? 'bg-slate-100 text-slate-500' :
                      shift.status === 'In Progress' ? 'bg-green-50 text-green-600 border-green-200' :
                      shift.status === 'Open' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {shift.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary" 
                        onClick={() => openEdit(shift)}
                        disabled={shift.status === 'Completed'}
                      >
                        {shift.status === 'Completed' ? <Lock className="w-4 h-4" /> : <Pencil className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive" 
                        onClick={() => handleDelete(shift.id)}
                        disabled={shift.status === 'Completed'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit Shift Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Deployment Record</DialogTitle>
            <DialogDescription>Updating details for deployment ID: {selectedShift?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <label className="text-sm font-bold">Operational Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as Shift['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open (Vacant)</SelectItem>
                    <SelectItem value="Claimed">Claimed (Ready)</SelectItem>
                    <SelectItem value="In Progress">In Progress (Live)</SelectItem>
                    <SelectItem value="Completed">Completed (Finalized)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Target Site</label>
                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Start Window</label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">End Window</label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Guard Role</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-primary text-white">Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
