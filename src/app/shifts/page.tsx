'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Hash, 
  Building2, 
  ChevronRight, 
  ArrowRightLeft, 
  Send,
  Clock,
  MapPin
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
import { Shift, Site } from '@/lib/types';
import { format, parseISO, differenceInHours } from 'date-fns';
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
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Form States (Initialized correctly in useEffect)
  const [shiftName, setShiftName] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [role, setRole] = useState('SECURITY_GUARD');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    setIsMounted(true);
    refreshData();
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setHours(8, 0, 0, 0);
    const defaultEnd = new Date(now);
    defaultEnd.setHours(16, 0, 0, 0);
    
    setStartTime(format(defaultStart, "yyyy-MM-dd'T'HH:mm"));
    setEndTime(format(defaultEnd, "yyyy-MM-dd'T'HH:mm"));
  }, []);

  const refreshData = () => {
    setShifts(store.getShifts() ?? []);
    setSites(store.getSites() ?? []);
  };

  const handleAdd = () => {
    if (!shiftName.trim()) {
      toast({ title: "Validation Error", description: "Shift Name is required.", variant: "destructive" });
      return;
    }
    const site = sites.find(s => s.id === selectedSiteId);
    const newShift: Shift = {
      id: `SHF-${Date.now()}`,
      organizationId: store.getCurrentUser()?.organizationId || 'ORG-001',
      siteId: selectedSiteId || '',
      siteName: site?.name || 'Not Deployed',
      name: shiftName,
      code: '',
      assignments: [],
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status: 'Draft',
      priority: 'Routine',
      requirements: [{ role: role, count: 1 }],
      role: role,
      version: 1
    };
    try {
      store.addShift(newShift);
      refreshData();
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Shift Initialized", description: "Operational unit added to registry as Draft." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeploy = (siteId: string) => {
    if (!selectedShift) return;
    try {
      if (selectedShift.siteId) {
        store.moveShift(selectedShift.id, siteId);
        toast({ title: "Deployment Relocated", description: "Shift successfully moved to new operational site." });
      } else {
        store.deployShift(selectedShift.id, siteId);
        toast({ title: "Shift Deployed", description: "Operational unit is now active at selected site." });
      }
      refreshData();
      setIsDeployOpen(false);
      setSelectedShift(null);
    } catch (e: any) {
      toast({ title: "Validation Warning", description: e.message, variant: "destructive" });
    }
  };

  const handlePublish = (id: string) => {
    try {
      store.publishShift(id);
      refreshData();
      toast({ title: "Shift Published", description: "Unit is now operational and visible to eligible personnel." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const resetForm = () => {
    setShiftName('');
    setSelectedSiteId('');
    setRole('SECURITY_GUARD');
    const now = new Date();
    setStartTime(format(now, "yyyy-MM-dd'T'08:00"));
    setEndTime(format(now, "yyyy-MM-dd'T'16:00"));
  };

  if (!isMounted) return null;

  const filteredShifts = shifts.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.siteName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Operational Shifts</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Authoritative Shift Registry & Deployment Control</p>
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
                <Plus className="mr-2 h-5 w-5" /> New Shift Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-slate-900 text-white p-8">
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Initialize Shift</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Define operational parameters for a new duty window.</DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Human-Readable Name</label>
                  <Input value={shiftName} onChange={(e) => setShiftName(e.target.value)} placeholder="e.g. Night Gate Security" className="rounded-xl h-11 border-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Period</label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl h-11 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Period</label>
                    <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl h-11 border-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Assignment Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="rounded-xl h-11 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECURITY_GUARD">Security Guard</SelectItem>
                      <SelectItem value="CCTV_OPERATOR">CCTV Operator</SelectItem>
                      <SelectItem value="SITE_LEAD">Site Lead</SelectItem>
                    </SelectContent>
                  </Select>
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
          placeholder="Filter registry by Shift Code, Name or Site Location..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Calendar className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Shift Identity / Code</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Current Deployment Site</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Timing</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Assigned / Required</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.map(shift => {
              const duration = differenceInHours(parseISO(shift.endTime), parseISO(shift.startTime));
              const assignedCount = (shift.assignments || []).filter(a => ['Assigned', 'Confirmed', 'In Transit', 'On Site'].includes(a.status))?.length || 0;
              const requiredCount = (shift.requirements || []).reduce((acc, r) => acc + r.count, 0) || 1;
              return (
                <TableRow key={shift.id} className="hover:bg-slate-50/50 transition-colors h-24">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border shadow-inner flex items-center justify-center text-slate-400">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 italic uppercase italic tracking-tight">{shift.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">{shift.code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-black text-slate-600 text-xs italic uppercase flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> {shift.siteName || 'Not Deployed'}
                      </p>
                      <span className="text-[8px] font-black text-slate-400 mt-1 uppercase italic tracking-widest">Organization Unit: Primary</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-700 uppercase italic">{format(parseISO(shift.startTime), 'MMM dd')}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')} ({duration}h)</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                       <span className={`text-lg font-black italic ${assignedCount > requiredCount ? 'text-amber-600' : assignedCount === requiredCount ? 'text-green-600' : 'text-slate-800'}`}>
                         {assignedCount} / {requiredCount}
                       </span>
                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">Personnel Posts</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[8px] font-black uppercase rounded-full px-4 h-5 border-none shadow-sm italic ${
                      shift.status === 'Draft' ? 'bg-slate-100 text-slate-500' :
                      shift.status === 'In Progress' ? 'bg-green-50 text-green-600' :
                      shift.status === 'Open' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {shift.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/5 rounded-xl shadow-sm border border-transparent hover:border-primary/20" onClick={() => { setSelectedShift(shift); setIsDeployOpen(true); }}>
                          <ArrowRightLeft className="h-4 w-4" />
                       </Button>
                       {shift.status === 'Draft' && (
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600 hover:bg-green-50 rounded-xl shadow-sm border border-transparent hover:border-green-200" onClick={() => handlePublish(shift.id)}>
                            <Send className="h-4 w-4" />
                         </Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDeployOpen} onOpenChange={setIsDeployOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-8">
             <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
               <ArrowRightLeft className="h-7 w-7 text-primary" />
               Relocate Shift Unit
             </DialogTitle>
             <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Shift Identity: {selectedShift?.name} ({selectedShift?.code})</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-slate-50">
             <div className="p-5 bg-white rounded-3xl border border-dashed text-center shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Active Deployment Site</p>
                <p className="text-sm font-black text-slate-800 uppercase italic">{selectedShift?.siteName || 'Not Deployed'}</p>
             </div>
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Select Destination Operational Site</label>
               <Select onValueChange={handleDeploy}>
                 <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold"><SelectValue placeholder="Move to Site..." /></SelectTrigger>
                 <SelectContent className="rounded-2xl border-none shadow-2xl">
                   {sites.filter(s => s.id !== selectedShift?.siteId).map(site => (
                     <SelectItem key={site.id} value={site.id} className="rounded-xl py-3 px-4 font-bold text-xs">{site.name} ({site.code})</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 font-black uppercase leading-relaxed italic">Authoritative Rule: All assigned personnel will be revalidated against destination site requirements before deployment.</p>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
