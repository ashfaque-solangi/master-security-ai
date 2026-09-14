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
  Calendar,
  Building2,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Settings
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
import { Shift, Site, Guard, ShiftAssignment } from '@/lib/types';
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

  // Form States
  const [shiftName, setShiftName] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [role, setRole] = useState('SECURITY_GUARD');
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
      toast({ title: "Draft Created", description: "Operational shift initialized in registry." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeploy = (siteId: string) => {
    if (!selectedShift) return;
    try {
      if (selectedShift.siteId) {
        store.moveShift(selectedShift.id, siteId);
        toast({ title: "Deployment Changed", description: "Shift successfully moved to new operational unit." });
      } else {
        store.deployShift(selectedShift.id, siteId);
        toast({ title: "Shift Deployed", description: "Unit is now active at selected site." });
      }
      refreshData();
      setIsDeployOpen(false);
      setSelectedShift(null);
    } catch (e: any) {
      toast({ title: "Validation Block", description: e.message, variant: "destructive" });
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

  const resetForm = () => {
    setShiftName('');
    setSelectedSiteId('');
    setRole('SECURITY_GUARD');
    setStartTime(format(new Date(), "yyyy-MM-dd'T'08:00"));
    setEndTime(format(new Date(), "yyyy-MM-dd'T'16:00"));
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
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Inventory of all operational work periods across organization</p>
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
                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Configure global parameters for a new work period.</DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Human-Readable Name</label>
                  <Input value={shiftName} onChange={(e) => setShiftName(e.target.value)} placeholder="e.g. Night Gate Security" className="rounded-xl h-11" />
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
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
          placeholder="Filter registry by code, name or location..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Calendar className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Shift Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Deployment / Site</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Timing</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Staffing</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.map(shift => {
              const duration = differenceInHours(parseISO(shift.endTime), parseISO(shift.startTime));
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
                        <Building2 className="w-3.5 h-3.5 text-primary" /> {shift.siteName}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Org Scope: Global</span>
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
                       <span className="text-lg font-black italic text-slate-800">{shift.assignments.length}</span>
                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">PERSONNEL</span>
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
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/5 rounded-xl" onClick={() => { setSelectedShift(shift); setIsDeployOpen(true); }}><ArrowRightLeft className="h-4 w-4" /></Button>
                       {shift.status === 'Draft' && (
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600 hover:bg-green-50 rounded-xl" onClick={() => handlePublish(shift.id)}><Send className="h-4 w-4" /></Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Deployment / Move Dialog */}
      <Dialog open={isDeployOpen} onOpenChange={setIsDeployOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-8">
             <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
               <ArrowRightLeft className="h-6 w-6 text-primary" />
               Change Site Deployment
             </DialogTitle>
             <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Shift: {selectedShift?.name} ({selectedShift?.code})</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-slate-50">
             <div className="p-4 bg-white rounded-2xl border border-dashed text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Operational Unit</p>
                <p className="text-sm font-black text-slate-800 uppercase italic">{selectedShift?.siteName}</p>
             </div>
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Select Destination Site</label>
               <Select onValueChange={handleDeploy}>
                 <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm"><SelectValue placeholder="Target Site..." /></SelectTrigger>
                 <SelectContent>
                   {sites.filter(s => s.id !== selectedShift?.siteId).map(site => (
                     <SelectItem key={site.id} value={site.id}>{site.name} ({site.code})</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <p className="text-[9px] text-slate-400 font-bold italic leading-relaxed text-center">Caution: All currently assigned personnel will be revalidated against destination site requirements.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
