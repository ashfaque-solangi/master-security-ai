'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  Pencil,
  AlertTriangle,
  UserCheck,
  Timer,
  Zap,
  CheckCircle2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Info,
  ShieldAlert,
  User,
  ExternalLink
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useJsonStore } from '@/lib/store';
import { Shift, Severity, Guard, Site } from '@/lib/types';
import { format, addHours, isFuture, startOfWeek, addDays, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SchedulingPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [suggestions, setSuggestions] = useState<Guard[]>([]);

  // Form State
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [role, setRole] = useState('Security Officer');
  const [priority, setPriority] = useState<Severity>('Low');

  useEffect(() => {
    setIsMounted(true);
    setShifts(store.getShifts());
    setGuards(store.getGuards());
    setSites(store.getSites());
  }, []);

  if (!isMounted) return null;

  const handleAdd = () => {
    const site = sites.find(s => s.id === selectedSiteId);
    const shift: Shift = {
      id: `SHF-${Date.now()}`,
      siteId: selectedSiteId,
      siteName: site?.name || 'Unknown Site',
      startTime: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      endTime: format(addHours(currentDate, 8), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      status: 'Open',
      priority: priority === 'Critical' ? 'STAT' : priority === 'High' ? 'Urgent' : 'Routine',
      role
    };
    const updated = store.addShift(shift);
    setShifts(updated);
    setIsCreateOpen(false);
    resetForm();
    toast({ title: "Shift Created", description: "Deployment added to the master roster." });
  };

  const openSuggest = (shift: Shift) => {
    setSelectedShift(shift);
    const suggested = store.suggestReplacement(shift);
    setSuggestions(suggested);
    setIsSuggestOpen(true);
  };

  const openDetail = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDetailOpen(true);
  };

  const assignGuard = (guard: Guard) => {
    if (!selectedShift) return;
    
    if (guard.weeklyHours >= 40) {
      toast({
        variant: "destructive",
        title: "Fatigue Alert",
        description: `${guard.name} is at maximum capacity (40h+). Assigning this shift will trigger overtime.`
      });
    }

    const updatedShift: Shift = {
      ...selectedShift,
      guardId: guard.id,
      guardName: guard.name,
      status: 'Claimed'
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setIsSuggestOpen(false);
    setIsDetailOpen(false);
    toast({ title: "Officer Assigned", description: `${guard.name} has been deployed to ${selectedShift.siteName}.` });
  };

  const deleteShift = (id: string) => {
    const updated = store.deleteShift(id);
    setShifts(updated);
    setIsDetailOpen(false);
  };

  const resetForm = () => {
    setSelectedSiteId('');
    setRole('Security Officer');
    setPriority('Low');
    setSelectedShift(null);
  };

  // Calendar Helpers
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(s => isSameDay(parseISO(s.startTime), day));
  };

  const moveShiftToDate = (shift: Shift, targetDate: Date) => {
    const currentStart = parseISO(shift.startTime);
    const currentEnd = parseISO(shift.endTime);
    const dayDiff = differenceInDays(targetDate, currentStart);
    
    const newStart = addDays(currentStart, dayDiff).toISOString();
    const newEnd = addDays(currentEnd, dayDiff).toISOString();
    
    const updated = store.updateShift({ ...shift, startTime: newStart, endTime: newEnd });
    setShifts(updated);
    toast({ title: "Deployment Rescheduled", description: `Shift for ${shift.siteName} moved to ${format(targetDate, 'EEEE, MMM dd')}.` });
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, shift: Shift) => {
    e.dataTransfer.setData('shiftId', shift.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary/5');
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/5');
  };

  const onDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/5');
    const shiftId = e.dataTransfer.getData('shiftId');
    const shiftToMove = shifts.find(s => s.id === shiftId);
    if (shiftToMove) {
      moveShiftToDate(shiftToMove, targetDate);
    }
  };

  const openShiftsCount = shifts.filter(s => s.status === 'Open').length;

  // Helpers for Detail Modal
  const getSelectedSite = () => sites.find(s => s.id === selectedShift?.siteId);
  const getSelectedGuard = () => guards.find(g => g.id === selectedShift?.guardId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Operational Scheduling</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Global Site Coverage Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-full px-6">
            <Zap className="mr-2 h-4 w-4" /> AI Auto-Fill
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white rounded-full px-6 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Deployment</DialogTitle>
                <DialogDescription>Define a new operational requirement for a site.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Target Site</label>
                  <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                    <SelectTrigger><SelectValue placeholder="Select a site..." /></SelectTrigger>
                    <SelectContent>
                      {sites.map(site => (
                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Operational Role</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Armed Guard" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Severity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Routine</SelectItem>
                      <SelectItem value="High">Urgent</SelectItem>
                      <SelectItem value="Critical">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary">Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-12 w-fit">
            <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Calendar Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold flex items-center gap-2">
              <List className="w-4 h-4" /> Master Roster
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 self-center">
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-50" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="text-xs font-black text-slate-700 min-w-44 text-center uppercase tracking-widest">
               {format(startDate, 'MMM dd')} - {format(addDays(startDate, 6), 'MMM dd, yyyy')}
             </span>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-50" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
               <ChevronRight className="h-4 w-4" />
             </Button>
          </div>

          <div className="flex items-center gap-4 ml-auto">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
               <AlertTriangle className="w-3.5 h-3.5" />
               <span className="text-[10px] font-black uppercase tracking-tighter">{openShiftsCount} Gaps Detected</span>
             </div>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-slate-200 border rounded-2xl overflow-hidden shadow-inner">
            {weekDays.map((day, idx) => {
              const dayShifts = getShiftsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col min-h-[700px] bg-white transition-colors duration-300`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, day)}
                >
                  <div className={`p-4 text-center border-b sticky top-0 z-10 bg-white/95 backdrop-blur-sm ${isToday ? 'bg-primary/5 border-b-primary/20' : ''}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                      {format(day, 'EEEE')}
                    </p>
                    <div className={`mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-black ${isToday ? 'bg-primary text-white shadow-md' : 'text-slate-800'}`}>
                      {format(day, 'dd')}
                    </div>
                  </div>

                  <div className="flex-1 p-2 space-y-3 bg-[#fdfdfd]">
                    {dayShifts.map(shift => (
                      <Card 
                        key={shift.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, shift)}
                        onClick={() => openDetail(shift)}
                        className={`group relative border-none shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing overflow-hidden rounded-xl ${shift.status === 'Open' ? 'ring-1 ring-red-200 bg-red-50/50' : 'bg-white'}`}
                      >
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                          shift.priority === 'STAT' ? 'bg-red-600' : 
                          shift.priority === 'Urgent' ? 'bg-orange-500' : 'bg-primary'
                        }`} />
                        <CardContent className="p-3 pt-4 space-y-3">
                          <div className="flex justify-between items-start">
                             <div className="space-y-0.5">
                               <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{shift.siteName}</p>
                               <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold italic">
                                 <Clock className="w-2.5 h-2.5" />
                                 {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                               </div>
                             </div>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={(e) => { e.stopPropagation(); deleteShift(shift.id); }} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                             </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {shift.guardName ? (
                              <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary">
                                  {shift.guardName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-black text-slate-700 truncate leading-none">{shift.guardName}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{shift.role}</p>
                                </div>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                className="h-8 w-full text-[9px] font-black bg-red-100 text-red-600 hover:bg-red-200 border-none rounded-lg"
                                onClick={(e) => { e.stopPropagation(); openSuggest(shift); }}
                              >
                                <Zap className="w-2.5 h-2.5 mr-1" /> ASSIGN AI
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="h-20 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center group/drop transition-all hover:border-primary/20">
                      <Button variant="ghost" className="w-full h-full text-slate-300 hover:text-primary transition-colors flex flex-col gap-1" onClick={() => { setCurrentDate(day); setIsCreateOpen(true); }}>
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/drop:opacity-100">Schedule</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* STATIC ROSTER VIEW */}
        <TabsContent value="list" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4 px-6">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Master Roster Logs</CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  Detailed view of all scheduled operations
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." className="pl-9 h-10 rounded-xl bg-slate-50 border-none" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b">
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Officer & Role</th>
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Site Location</th>
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interval</th>
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(shift => (
                      <tr key={shift.id} onClick={() => openDetail(shift)} className="border-b last:border-0 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                              {shift.guardName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{shift.guardName || 'UNASSIGNED'}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">{shift.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-bold text-slate-700">{shift.siteName}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-mono text-xs font-bold text-slate-600">
                              {format(parseISO(shift.startTime), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <Badge variant="outline" className={`text-[9px] font-black uppercase rounded-full ${
                            shift.status === 'In Progress' ? 'bg-green-50 text-green-600 border-green-200' : 
                            shift.status === 'Claimed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            shift.status === 'Open' ? 'bg-red-50 text-red-600 border-red-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {shift.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Suggestion Dialog */}
      <Dialog open={isSuggestOpen} onOpenChange={setIsSuggestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <Zap className="h-5 w-5 text-primary" />
              AI Deployment Suggester
            </DialogTitle>
            <DialogDescription>
              Finding the optimal candidate for **{selectedShift?.siteName}**.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <Timer className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-tight">
                AI is prioritizing officers with the lowest current weekly hours to minimize overtime spend and fatigue risk.
              </p>
            </div>
            <div className="space-y-3 mt-4">
              {suggestions.length > 0 ? (
                suggestions.map(guard => (
                  <div key={guard.id} className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary transition-all cursor-pointer group bg-white shadow-sm" onClick={() => assignGuard(guard)}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {guard.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{guard.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> SIA Compliant
                          </span>
                          <span className={`text-[9px] font-bold uppercase ${guard.weeklyHours >= 40 ? 'text-red-500' : 'text-slate-400'}`}>
                            {guard.weeklyHours}h/40h
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-white font-black text-[10px]">DEPLOY</Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground italic border border-dashed rounded-2xl bg-slate-50">
                  No compliant officers currently available.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full rounded-full" onClick={() => setIsSuggestOpen(false)}>Cancel AI Search</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SHIFT DETAIL MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
          {selectedShift && (
            <div className="flex flex-col">
              {/* Header Banner */}
              <div className={`p-8 text-white relative overflow-hidden ${
                selectedShift.priority === 'STAT' ? 'bg-red-600' : 
                selectedShift.priority === 'Urgent' ? 'bg-orange-500' : 'bg-slate-900'
              }`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldAlert className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest px-3">
                      {selectedShift.priority} DEPLOYMENT
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/30 text-[10px] uppercase font-bold">
                      {selectedShift.status}
                    </Badge>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter pt-2">
                    {selectedShift.siteName}
                  </h2>
                  <p className="text-white/60 font-medium text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Shift ID: {selectedShift.id}
                  </p>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-8 bg-white">
                {/* Deployment Intel */}
                <div className="space-y-6">
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <Info className="w-3 h-3" /> Operational Intel
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                           <div className="bg-slate-50 p-2.5 rounded-xl border">
                              <Timer className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Deployment Window</p>
                              <p className="text-sm font-black text-slate-800">
                                {format(parseISO(selectedShift.startTime), 'EEEE, MMM dd')}
                              </p>
                              <p className="text-lg font-black text-primary">
                                {format(parseISO(selectedShift.startTime), 'HH:mm')} - {format(parseISO(selectedShift.endTime), 'HH:mm')}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="bg-slate-50 p-2.5 rounded-xl border">
                              <MapPin className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Site Location</p>
                              <p className="text-sm font-black text-slate-700 leading-tight">
                                {getSelectedSite()?.address || 'Site records unavailable'}
                              </p>
                              <Button variant="link" className="p-0 h-auto text-[10px] font-black text-primary uppercase flex items-center gap-1">
                                View Maps <ExternalLink className="w-2.5 h-2.5" />
                              </Button>
                           </div>
                        </div>
                      </div>
                   </div>

                   <Separator />

                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Post Role</p>
                      <p className="text-xl font-black text-slate-800 italic">{selectedShift.role}</p>
                   </div>
                </div>

                {/* Personnel Tracking */}
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                   <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <User className="w-3 h-3" /> Personnel Assigned
                   </h3>

                   {selectedShift.guardName ? (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border-2 border-primary/20 flex items-center justify-center text-2xl font-black text-primary">
                              {selectedShift.guardName.charAt(0)}
                           </div>
                           <div>
                              <p className="text-xl font-black text-slate-800 leading-none">{selectedShift.guardName}</p>
                              <div className="flex items-center gap-2 mt-2">
                                 <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[9px] font-black uppercase">
                                   <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> SIA Compliant
                                 </Badge>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between text-[10px] font-black uppercase">
                              <span className="text-slate-500">Fatigue Counter</span>
                              <span className={getSelectedGuard()?.weeklyHours! >= 40 ? 'text-red-500' : 'text-primary'}>
                                {getSelectedGuard()?.weeklyHours}h / 40h
                              </span>
                           </div>
                           <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${getSelectedGuard()?.weeklyHours! >= 40 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min((getSelectedGuard()?.weeklyHours! / 40) * 100, 100)}%` }}
                              />
                           </div>
                           {getSelectedGuard()?.weeklyHours! >= 40 && (
                             <p className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                               <AlertTriangle className="w-3 h-3" /> Overtime triggered for this officer
                             </p>
                           )}
                        </div>

                        <Button className="w-full bg-slate-900 text-white rounded-xl font-black text-xs h-10" onClick={() => openSuggest(selectedShift)}>
                          SWAP OFFICER
                        </Button>
                     </div>
                   ) : (
                     <div className="text-center py-8 space-y-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                           <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Post Unfilled</p>
                           <p className="text-[10px] text-muted-foreground font-medium">No personnel currently deployed to this slot.</p>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs h-12 shadow-lg shadow-primary/20" onClick={() => openSuggest(selectedShift)}>
                           <Zap className="w-4 h-4 mr-2" /> AUTO-ASSIGN NOW
                        </Button>
                     </div>
                   )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 px-8 border-t bg-slate-50/80 flex items-center justify-between">
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-black text-[10px] uppercase" onClick={() => deleteShift(selectedShift.id)}>
                   <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Record
                </Button>
                <div className="flex gap-2">
                   <Button variant="outline" className="rounded-full px-6 font-black text-[10px] uppercase h-9" onClick={() => setIsDetailOpen(false)}>
                      Dismiss
                   </Button>
                   <Button className="bg-slate-900 text-white rounded-full px-6 font-black text-[10px] uppercase h-9 hover:bg-slate-800">
                      Print Job Card
                   </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

