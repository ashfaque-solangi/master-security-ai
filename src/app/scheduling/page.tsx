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
  ExternalLink,
  Users,
  Lock,
  Coffee,
  Loader2
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
import { Shift, Severity, Guard, Site, AssignedGuard } from '@/lib/types';
import { 
  format, 
  addHours, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO, 
  differenceInDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'month' | 'week' | 'day';

export default function SchedulingPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
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
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setShifts(store.getShifts());
    setGuards(store.getGuards());
    setSites(store.getSites());
  }, []);

  if (!isMounted) return null;

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    setTimeout(() => {
      const updated = store.autoFillAllShifts();
      setShifts(updated);
      setIsAutoFilling(false);
      toast({
        title: "AI Optimization Complete",
        description: "Unassigned shifts have been filled based on fatigue and compliance rules."
      });
    }, 1500);
  };

  const handleAdd = () => {
    const site = sites.find(s => s.id === selectedSiteId);
    const shift: Shift = {
      id: `SHF-${Date.now()}`,
      siteId: selectedSiteId,
      siteName: site?.name || 'Unknown Site',
      assignedGuards: [],
      startTime: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      endTime: format(addHours(currentDate, 8), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      breakStartTime: breakStart ? new Date(breakStart).toISOString() : undefined,
      breakEndTime: breakEnd ? new Date(breakEnd).toISOString() : undefined,
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
    if (shift.status === 'Completed') {
      toast({ title: "Locked", description: "Cannot reassign a completed shift.", variant: "destructive" });
      return;
    }
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
    const updatedShift: Shift = {
      ...selectedShift,
      assignedGuards: [...(selectedShift.assignedGuards || []), { id: guard.id, name: guard.name }],
      status: 'Claimed'
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setIsSuggestOpen(false);
    setIsDetailOpen(false);
    toast({ title: "Officer Added", description: `${guard.name} has been deployed to the team.` });
  };

  const deleteShift = (id: string) => {
    const shift = shifts.find(s => s.id === id);
    if (shift?.status === 'Completed') {
      toast({ title: "Locked", description: "Audit trail prevents deletion of completed shifts.", variant: "destructive" });
      return;
    }
    const updated = store.deleteShift(id);
    setShifts(updated);
    setIsDetailOpen(false);
  };

  const resetForm = () => {
    setSelectedSiteId('');
    setRole('Security Officer');
    setPriority('Low');
    setBreakStart('');
    setBreakEnd('');
    setSelectedShift(null);
  };

  const navigate = (direction: 'prev' | 'next') => {
    const amount = direction === 'next' ? 1 : -1;
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, amount));
    else if (viewMode === 'week') setCurrentDate(addDays(currentDate, amount * 7));
    else setCurrentDate(addDays(currentDate, amount));
  };

  const getDays = () => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else {
      return [currentDate];
    }
  };

  const daysToRender = getDays();

  const moveShiftToDate = (shift: Shift, targetDate: Date) => {
    if (shift.status === 'Completed') {
      toast({ title: "Restricted", description: "Historical data cannot be moved.", variant: "destructive" });
      return;
    }
    const currentStart = parseISO(shift.startTime);
    const currentEnd = parseISO(shift.endTime);
    const dayDiff = differenceInDays(targetDate, currentStart);
    const updated = store.updateShift({ 
      ...shift, 
      startTime: addDays(currentStart, dayDiff).toISOString(), 
      endTime: addDays(currentEnd, dayDiff).toISOString(),
      breakStartTime: shift.breakStartTime ? addDays(parseISO(shift.breakStartTime), dayDiff).toISOString() : undefined,
      breakEndTime: shift.breakEndTime ? addDays(parseISO(shift.breakEndTime), dayDiff).toISOString() : undefined,
    });
    setShifts(updated);
    toast({ title: "Rescheduled", description: `Moved to ${format(targetDate, 'MMM dd')}` });
  };

  const onDragStart = (e: React.DragEvent, shift: Shift) => {
    if (shift.status === 'Completed') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('shiftId', shift.id);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary/5');
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/5');
  };
  const onDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/5');
    const shiftId = e.dataTransfer.getData('shiftId');
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) moveShiftToDate(shift, targetDate);
  };

  const getSelectedSite = () => sites.find(s => s.id === selectedShift?.siteId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Operational Scheduling</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Team Deployment Intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/5 rounded-full px-6"
            onClick={handleAutoFill}
            disabled={isAutoFilling}
          >
            {isAutoFilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isAutoFilling ? 'OPTIMIZING...' : 'AI AUTO-FILL'}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white rounded-full px-6 shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Deployment</DialogTitle>
                <DialogDescription>Manually create a new shift requirements for a site.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Target Site</label>
                  <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                    <SelectTrigger><SelectValue placeholder="Select a site..." /></SelectTrigger>
                    <SelectContent>
                      {sites.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Role Requirement</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-1"><Coffee className="w-3 h-3" /> Break Start</label>
                    <Input type="time" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-1"><Coffee className="w-3 h-3" /> Break End</label>
                    <Input type="time" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={handleAdd}>Publish Requirement</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-12 w-fit">
            <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-white px-6 font-bold flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white px-6 font-bold flex items-center gap-2">
              <List className="w-4 h-4" /> List
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <Button 
                variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 text-xs font-bold"
                onClick={() => setViewMode('month')}
              >Month</Button>
              <Button 
                variant={viewMode === 'week' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 text-xs font-bold"
                onClick={() => setViewMode('week')}
              >Week</Button>
              <Button 
                variant={viewMode === 'day' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 text-xs font-bold"
                onClick={() => setViewMode('day')}
              >Day</Button>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
               <span className="text-xs font-black text-slate-700 min-w-44 text-center uppercase tracking-widest">
                 {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : 
                  viewMode === 'week' ? `${format(daysToRender[0], 'MMM dd')} - ${format(daysToRender[6], 'MMM dd, yyyy')}` :
                  format(currentDate, 'EEEE, MMM dd, yyyy')}
               </span>
               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <TabsContent value="calendar" className="mt-0">
          <div className={`grid gap-px bg-slate-200 border rounded-2xl overflow-hidden shadow-inner ${
            viewMode === 'month' ? 'grid-cols-7' : 
            viewMode === 'week' ? 'grid-cols-7' : 
            'grid-cols-1'
          }`}>
            {daysToRender.map((day, idx) => {
              const dayShifts = shifts.filter(s => isSameDay(parseISO(s.startTime), day));
              const isToday = isSameDay(day, new Date());
              const isOtherMonth = viewMode === 'month' && !isSameMonth(day, currentDate);

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col min-h-[160px] bg-white transition-colors duration-300 ${isOtherMonth ? 'bg-slate-50/50' : ''}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, day)}
                >
                  <div className={`p-2 text-center border-b sticky top-0 z-10 bg-white/95 backdrop-blur-sm ${isToday ? 'bg-primary/5' : ''}`}>
                    <p className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                      {format(day, 'EEE')}
                    </p>
                    <div className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${isToday ? 'bg-primary text-white shadow-md' : 'text-slate-800'}`}>
                      {format(day, 'dd')}
                    </div>
                  </div>

                  <div className={`flex-1 p-1 space-y-1.5 ${viewMode === 'month' ? 'max-h-[120px] overflow-y-auto' : 'p-2 space-y-3'}`}>
                    {dayShifts.map(shift => (
                      <Card 
                        key={shift.id} 
                        draggable={shift.status !== 'Completed'}
                        onDragStart={(e) => onDragStart(e, shift)}
                        onClick={() => openDetail(shift)}
                        className={`group relative border-none shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing overflow-hidden rounded-lg ${
                          viewMode === 'month' ? 'p-1.5' : 'p-3 pt-4'
                        } ${shift.status === 'Open' ? 'ring-1 ring-red-200 bg-red-50/50' : shift.status === 'Completed' ? 'bg-slate-50 opacity-80' : 'bg-white'}`}
                      >
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          shift.status === 'Completed' ? 'bg-slate-400' :
                          shift.priority === 'STAT' ? 'bg-red-600' : 
                          shift.priority === 'Urgent' ? 'bg-orange-500' : 'bg-primary'
                        }`} />
                        {viewMode === 'month' ? (
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[8px] font-black text-slate-800 uppercase truncate leading-none flex items-center gap-1">
                              {shift.status === 'Completed' && <Lock className="w-2 h-2" />}
                              {shift.siteName}
                            </p>
                            <p className="text-[7px] text-muted-foreground truncate">
                              {(shift.assignedGuards?.length || 0) > 0 ? `${shift.assignedGuards.length} Officers` : 'UNASSIGNED'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                               <div className="space-y-0.5">
                                 <p className="text-[10px] font-black text-slate-800 uppercase leading-none flex items-center gap-1">
                                   {shift.status === 'Completed' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                                   {shift.siteName}
                                 </p>
                                 <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold italic">
                                   <Clock className="w-2.5 h-2.5" />
                                   {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                                 </div>
                               </div>
                               {shift.status !== 'Completed' && (
                                 <button onClick={(e) => { e.stopPropagation(); deleteShift(shift.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                               )}
                            </div>
                            <div className="flex flex-col gap-2">
                              {(shift.assignedGuards?.length || 0) > 0 ? (
                                <div className="space-y-1">
                                  {shift.assignedGuards.slice(0, 2).map(g => (
                                    <div key={g.id} className="flex items-center gap-2 p-1 bg-slate-50 rounded border border-slate-100">
                                      <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center text-[7px] font-black text-primary">{g.name.charAt(0)}</div>
                                      <p className="text-[8px] font-bold text-slate-700 truncate">{g.name}</p>
                                    </div>
                                  ))}
                                  {shift.assignedGuards.length > 2 && (
                                    <p className="text-[7px] text-center font-bold text-muted-foreground">+{shift.assignedGuards.length - 2} more</p>
                                  )}
                                </div>
                              ) : (
                                <Button variant="ghost" className="h-7 w-full text-[8px] font-black bg-red-100 text-red-600 rounded-lg" onClick={(e) => { e.stopPropagation(); openSuggest(shift); }}>
                                  <Zap className="w-2.5 h-2.5 mr-1" /> ASSIGN TEAM
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                    {viewMode !== 'month' && (
                      <div className="h-16 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center hover:border-primary/20 transition-all">
                        <Button variant="ghost" className="w-full h-full text-slate-300 hover:text-primary" onClick={() => { setCurrentDate(day); setIsCreateOpen(true); }}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Master Roster Logs</CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Deployment Registry</CardDescription>
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
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personnel Team</th>
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
                              {(shift.assignedGuards?.length || 0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">
                                {(shift.assignedGuards?.length || 0) > 0 
                                  ? shift.assignedGuards.map(g => g.name).join(', ') 
                                  : 'UNASSIGNED'}
                              </p>
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
                            shift.status === 'Completed' ? 'bg-slate-100 text-slate-500 border-slate-300' :
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

      <Dialog open={isSuggestOpen} onOpenChange={setIsSuggestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black"><Zap className="h-5 w-5 text-primary" /> Team Capacity Builder</DialogTitle>
            <DialogDescription>Assign additional personnel to the team at **{selectedShift?.siteName}**.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <Timer className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-tight">AI is filtering available officers who are not yet assigned to this team and have low weekly hours.</p>
            </div>
            <div className="space-y-3 mt-4">
              {suggestions.length > 0 ? suggestions.map(guard => (
                <div key={guard.id} className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary transition-all cursor-pointer group bg-white shadow-sm" onClick={() => assignGuard(guard)}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{guard.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{guard.name}</p>
                      <p className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1"><UserCheck className="h-3 w-3" /> SIA Compliant</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-white font-black text-[10px]">ADD TO TEAM</Button>
                </div>
              )) : <div className="p-8 text-center text-muted-foreground italic border border-dashed rounded-2xl bg-slate-50">No additional compatible officers found.</div>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Deployment Intelligence</DialogTitle>
            <DialogDescription>Full operational breakdown of the selected shift, site, and personnel team.</DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="flex flex-col">
              <div className={`p-8 text-white relative overflow-hidden ${
                selectedShift.status === 'Completed' ? 'bg-slate-700' :
                selectedShift.priority === 'STAT' ? 'bg-red-600' : 
                selectedShift.priority === 'Urgent' ? 'bg-orange-500' : 'bg-slate-900'
              }`}>
                <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-32 h-32" /></div>
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest px-3">{selectedShift.priority} DEPLOYMENT</Badge>
                    <Badge variant="outline" className="text-white border-white/30 text-[10px] uppercase font-bold">{selectedShift.status}</Badge>
                    {selectedShift.status === 'Completed' && <Badge className="bg-green-500/20 text-green-300 border-none font-black text-[10px] uppercase tracking-widest flex items-center gap-1"><Lock className="w-3 h-3" /> ARCHIVED</Badge>}
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter pt-2">{selectedShift.siteName}</h2>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-8 bg-white">
                <div className="space-y-6">
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"><Info className="w-3 h-3" /> Operational Intel</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                           <div className="bg-slate-50 p-2.5 rounded-xl border"><Timer className="w-5 h-5 text-primary" /></div>
                           <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Deployment Window</p>
                              <p className="text-sm font-black text-slate-800">{format(parseISO(selectedShift.startTime), 'EEEE, MMM dd')}</p>
                              <p className="text-lg font-black text-primary">{format(parseISO(selectedShift.startTime), 'HH:mm')} - {format(parseISO(selectedShift.endTime), 'HH:mm')}</p>
                           </div>
                        </div>
                        {selectedShift.breakStartTime && (
                          <div className="flex items-start gap-4">
                            <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100"><Coffee className="w-5 h-5 text-orange-600" /></div>
                            <div>
                               <p className="text-xs font-bold text-orange-500 uppercase">Scheduled Break</p>
                               <p className="text-sm font-black text-slate-700">
                                 {format(parseISO(selectedShift.breakStartTime), 'HH:mm')} - {format(parseISO(selectedShift.breakEndTime!), 'HH:mm')}
                               </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                           <div className="bg-slate-50 p-2.5 rounded-xl border"><MapPin className="w-5 h-5 text-primary" /></div>
                           <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Site Location</p>
                              <p className="text-sm font-black text-slate-700 leading-tight">{getSelectedSite()?.address || 'Site records unavailable'}</p>
                           </div>
                        </div>
                      </div>
                   </div>
                   <Separator />
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Primary Post Role</p>
                      <p className="text-xl font-black text-slate-800 italic">{selectedShift.role}</p>
                   </div>
                </div>

                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                   <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"><Users className="w-3 h-3" /> Assigned Team</h3>
                   {(selectedShift.assignedGuards?.length || 0) > 0 ? (
                     <div className="space-y-6">
                        <div className="space-y-3">
                          {selectedShift.assignedGuards.map(ag => (
                            <div key={ag.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">{ag.name.charAt(0)}</div>
                              <div className="flex-1">
                                <p className="text-xs font-black text-slate-800">{ag.name}</p>
                                <p className="text-[9px] font-bold text-green-600 uppercase">SIA Compliant</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {selectedShift.status !== 'Completed' && (
                          <Button className="w-full bg-slate-900 text-white rounded-xl font-black text-xs h-10" onClick={() => openSuggest(selectedShift)}>ADD TEAM MEMBER</Button>
                        )}
                     </div>
                   ) : (
                     <div className="text-center py-8 space-y-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Post Unfilled</p>
                        {selectedShift.status !== 'Completed' && (
                          <Button className="w-full bg-primary text-white rounded-xl font-black text-xs h-12" onClick={() => openSuggest(selectedShift)}><Zap className="w-4 h-4 mr-2" /> AUTO-ASSIGN NOW</Button>
                        )}
                     </div>
                   )}
                </div>
              </div>
              <div className="p-4 px-8 border-t bg-slate-50/80 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  className={`font-black text-[10px] uppercase ${selectedShift.status === 'Completed' ? 'text-slate-400' : 'text-red-600'}`} 
                  onClick={() => deleteShift(selectedShift.id)}
                  disabled={selectedShift.status === 'Completed'}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Record
                </Button>
                <Button className="bg-slate-900 text-white rounded-full px-6 font-black text-[10px] uppercase h-9" onClick={() => setIsDetailOpen(false)}>Dismiss</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
