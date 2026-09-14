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
  Lock,
  Coffee,
  Send,
  Hash,
  Activity,
  UserCheck,
  Calendar
} from 'lucide-react';
import {
  Card,
  CardContent,
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
import { Shift, Site, Guard } from '@/lib/types';
import { format, parseISO, set } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ShiftsRegistry() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Form States
  const [shiftName, setShiftName] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [role, setRole] = useState('SECURITY_GUARD');
  const [status, setStatus] = useState<Shift['status']>('Draft');
  const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'08:00"));
  const [endTime, setEndTime] = useState(format(new Date(), "yyyy-MM-dd'T'16:00"));

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setShifts(store.getShifts());
    setSites(store.getSites());
  };

  const handleAdd = () => {
    if (!selectedSiteId || !shiftName.trim()) {
      toast({ title: "Validation Error", description: "Shift Name and Site are required.", variant: "destructive" });
      return;
    }
    const site = sites.find(s => s.id === selectedSiteId);
    const newShift: Shift = {
      id: `SHF-${Date.now()}`,
      organizationId: store.getCurrentUser()?.organizationId || 'ORG-001',
      siteId: selectedSiteId,
      siteName: site?.name || 'Unknown Site',
      name: shiftName,
      code: '',
      assignments: [],
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status: 'Draft',
      priority: 'Routine',
      requirements: [{ role: role, count: site?.requiredGuardCount || 1 }],
      role: role,
      version: 1
    };
    try {
      store.addShift(newShift);
      refreshData();
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Draft Created", description: "Operational shift initialized." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdate = () => {
    if (!selectedShift || !shiftName.trim()) return;
    const site = sites.find(s => s.id === selectedSiteId);
    const updatedShift: Shift = {
      ...selectedShift,
      name: shiftName,
      siteId: selectedSiteId,
      siteName: site?.name || selectedShift.siteName,
      role,
      status,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };
    try {
      store.updateShift(updatedShift);
      refreshData();
      setIsEditOpen(false);
      resetForm();
      toast({ title: "Shift Updated", description: "Record successfully modified." });
    } catch (e: any) {
      toast({ title: "Update Error", description: e.message, variant: "destructive" });
    }
  };

  const handlePublish = (id: string) => {
    try {
      store.publishShift(id);
      refreshData();
      toast({ title: "Shift Published", description: "Shift is now operational and visible to guards." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDelete = (id: string) => {
    const shift = shifts.find(s => s.id === id);
    if (shift?.status === 'Completed') {
      toast({ title: "Action Restricted", description: "Cannot delete completed shifts.", variant: "destructive" });
      return;
    }
    store.deleteShift(id);
    refreshData();
    toast({ title: "Shift Deleted", description: "Record removed from registry." });
  };

  const resetForm = () => {
    setShiftName('');
    setSelectedSiteId('');
    setRole('SECURITY_GUARD');
    setStatus('Draft');
    setStartTime(format(new Date(), "yyyy-MM-dd'T'08:00"));
    setEndTime(format(new Date(), "yyyy-MM-dd'T'16:00"));
    setSelectedShift(null);
  };

  if (!isMounted) return null;

  const filteredShifts = shifts.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Shift Registry</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Comprehensive Deployment Inventory & Lifecycle Control</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl h-12 shadow-inner">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-xl px-6 font-black uppercase text-[10px] italic h-10">
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-xl px-6 font-black uppercase text-[10px] italic h-10">
              <List className="w-4 h-4 mr-2" /> Table
            </Button>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white rounded-2xl px-8 font-black uppercase italic shadow-xl shadow-primary/20 h-12 tracking-tighter">
                <Plus className="mr-2 h-5 w-5" /> Initialize Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-slate-900 text-white p-8">
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">New Shift Entry</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Configure parameters for a new workforce deployment requirement.</DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descriptive Name</label>
                  <Input value={shiftName} onChange={(e) => setShiftName(e.target.value)} placeholder="e.g. Night Gate Patrol" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Site</label>
                  <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select site..." /></SelectTrigger>
                    <SelectContent>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Interval</label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Interval</label>
                    <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl h-11" />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-8 bg-slate-50">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl px-8 font-bold">CANCEL</Button>
                <Button onClick={handleAdd} className="bg-primary text-white rounded-xl px-12 font-black italic shadow-lg shadow-primary/10">CREATE DRAFT</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
        <Search className="ml-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Search by code, name or site..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Calendar className="h-4 w-4" /></Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredShifts.map((shift) => (
            <Card key={shift.id} className="group border-none shadow-sm hover:shadow-2xl transition-all relative overflow-hidden bg-white rounded-[2rem]">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${
                shift.status === 'Draft' ? 'bg-slate-300' :
                shift.status === 'Completed' ? 'bg-slate-400' :
                shift.status === 'In Progress' ? 'bg-green-500' :
                shift.status === 'Open' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-50 rounded-2xl border shadow-inner">
                    <Clock3 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[8px] font-black uppercase rounded-full px-3 h-5 border-none shadow-sm bg-slate-50">
                      {shift.status}
                    </Badge>
                    <span className="text-[8px] font-black text-slate-400 font-mono tracking-widest uppercase">{shift.code}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg font-black text-slate-800 italic uppercase">{shift.name}</CardTitle>
                  <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {shift.siteName}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 shadow-inner border border-slate-100">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                    <span>Timing</span>
                    <span className="text-slate-700">
                      {format(parseISO(shift.startTime), 'MMM dd, HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Deployed Team</span>
                      <div className="flex -space-x-2 mt-1">
                         {shift.assignments.length > 0 ? shift.assignments.map(a => (
                           <div key={a.id} className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-500">
                             {a.guardName.charAt(0)}
                           </div>
                         )) : <span className="text-[10px] text-red-500 font-black italic">UNASSIGNED</span>}
                      </div>
                   </div>
                   <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary"><Activity className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Shift Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Site Location</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Deployment Period</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map(shift => (
                <TableRow key={shift.id} className="hover:bg-slate-50/50 transition-colors h-20">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border shadow-inner flex items-center justify-center text-slate-400">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 italic uppercase italic tracking-tight">{shift.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">{shift.code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-600 text-xs italic uppercase">
                    {shift.siteName}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-700 uppercase italic">{format(parseISO(shift.startTime), 'EEEE, MMM dd')}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[8px] font-black uppercase rounded-full px-3 h-5 border-none shadow-sm ${
                      shift.status === 'Draft' ? 'bg-slate-100 text-slate-500' :
                      shift.status === 'In Progress' ? 'bg-green-50 text-green-600' :
                      shift.status === 'Open' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {shift.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                       {shift.status === 'Draft' && (
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handlePublish(shift.id)}><Send className="h-4 w-4" /></Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => handleDelete(shift.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
