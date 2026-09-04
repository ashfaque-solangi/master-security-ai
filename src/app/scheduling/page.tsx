
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
  ArrowLeftRight,
  RefreshCcw,
  CheckCircle2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
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
import { useJsonStore } from '@/lib/store';
import { Shift, Severity, Guard, Site } from '@/lib/types';
import { format, addHours, isFuture, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

export default function SchedulingPage() {
  const store = useJsonStore();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
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
  };

  const handleUpdate = () => {
    if (!selectedShift) return;
    const site = sites.find(s => s.id === selectedSiteId);
    const updatedShift: Shift = {
      ...selectedShift,
      siteId: selectedSiteId,
      siteName: site?.name || selectedShift.siteName,
      role,
      priority: priority === 'Critical' ? 'STAT' : priority === 'High' ? 'Urgent' : 'Routine'
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const openSuggest = (shift: Shift) => {
    setSelectedShift(shift);
    const suggested = store.suggestReplacement(shift);
    setSuggestions(suggested);
    setIsSuggestOpen(true);
  };

  const assignGuard = (guard: Guard) => {
    if (!selectedShift) return;
    const updatedShift: Shift = {
      ...selectedShift,
      guardId: guard.id,
      guardName: guard.name,
      status: 'Claimed'
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setIsSuggestOpen(false);
  };

  const deleteShift = (id: string) => {
    const updated = store.deleteShift(id);
    setShifts(updated);
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

  const moveShift = (shift: Shift, days: number) => {
    const newStart = addDays(parseISO(shift.startTime), days).toISOString();
    const newEnd = addDays(parseISO(shift.endTime), days).toISOString();
    const updated = store.updateShift({ ...shift, startTime: newStart, endTime: newEnd });
    setShifts(updated);
  };

  const openShifts = shifts.filter(s => s.status === 'Open');
  const overtimeGuards = guards.filter(g => g.weeklyHours > 40);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Operational Scheduling</h1>
          <p className="text-muted-foreground font-medium">Visual deployment, site coverage, and fatigue control.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-full px-6">
            <Zap className="mr-2 h-4 w-4" /> AI Auto-Schedule
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
                <DialogDescription>Define a new operational shift for a contracted site.</DialogDescription>
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
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Lead Supervisor" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Shift Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Severity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Routine</SelectItem>
                      <SelectItem value="High">Urgent</SelectItem>
                      <SelectItem value="Critical">STAT (Immediate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary">Publish to Roster</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-10">
            <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 font-bold">
              <LayoutGrid className="w-4 h-4 mr-2" /> Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 font-bold">
              <List className="w-4 h-4 mr-2" /> Master Roster
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="text-sm font-bold text-slate-700 min-w-32 text-center">
               {format(startDate, 'MMM dd')} - {format(addDays(startDate, 6), 'MMM dd, yyyy')}
             </span>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
               <ChevronRight className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, idx) => {
              const dayShifts = getShiftsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div key={idx} className="flex flex-col gap-4">
                  <div className={`text-center p-3 rounded-2xl border ${isToday ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-white/80' : 'text-slate-400'}`}>
                      {format(day, 'EEEE')}
                    </p>
                    <p className="text-xl font-black">{format(day, 'dd')}</p>
                  </div>

                  <div className="space-y-3 min-h-[400px] p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    {dayShifts.map(shift => (
                      <Card key={shift.id} className={`group relative border-none shadow-sm hover:shadow-md transition-all overflow-hidden ${shift.status === 'Open' ? 'ring-1 ring-red-200 bg-red-50/30' : 'bg-white'}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          shift.priority === 'STAT' ? 'bg-red-600' : 
                          shift.priority === 'Urgent' ? 'bg-orange-500' : 'bg-primary'
                        }`} />
                        <CardContent className="p-3 space-y-2">
                          <div className="flex justify-between items-start">
                             <p className="text-[10px] font-black text-slate-800 uppercase truncate pr-4">{shift.siteName}</p>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => deleteShift(shift.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold italic">
                            <Clock className="w-2.5 h-2.5" />
                            {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                          </div>

                          <div className="pt-2 border-t border-slate-50">
                            {shift.guardName ? (
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary border border-primary/20">
                                  {shift.guardName.charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 truncate">{shift.guardName}</span>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                className="h-6 w-full text-[9px] font-black bg-red-100 text-red-600 hover:bg-red-200 border-none rounded-lg"
                                onClick={() => openSuggest(shift)}
                              >
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" /> UNASSIGNED
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="outline" size="sm" className="h-5 text-[8px] px-1" onClick={() => moveShift(shift, -1)}>
                               Prev Day
                             </Button>
                             <Button variant="outline" size="sm" className="h-5 text-[8px] px-1" onClick={() => moveShift(shift, 1)}>
                               Next Day
                             </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="ghost" className="w-full h-10 border-2 border-dashed border-slate-200 rounded-xl hover:bg-white hover:border-primary/30 transition-all text-slate-400" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* LIST VIEW (Previous Master Roster) */}
        <TabsContent value="list" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Coverage Blockers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {openShifts.map(shift => (
                    <div key={shift.id} className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group relative">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-black text-slate-800">{shift.siteName}</p>
                        <Badge variant={shift.priority === 'STAT' ? 'destructive' : 'outline'} className="text-[9px] uppercase font-black">
                          {shift.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mb-4">{shift.role}</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-slate-900 text-white rounded-lg h-8 text-[10px] font-bold"
                        onClick={() => openSuggest(shift)}
                      >
                        <Zap className="h-3 w-3 mr-1 text-primary" /> Suggest Replacement
                      </Button>
                    </div>
                  ))}
                  {openShifts.length === 0 && <p className="text-xs text-center text-muted-foreground italic py-4">No critical blockers.</p>}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-sm font-bold">Fatigue Monitor</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {guards.slice(0, 4).map(guard => (
                    <div key={guard.id} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>{guard.name}</span>
                        <span className={guard.weeklyHours > 40 ? 'text-red-500' : 'text-slate-500'}>{guard.weeklyHours}h</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${guard.weeklyHours > 40 ? 'bg-red-500' : 'bg-primary'}`} 
                          style={{ width: `${Math.min((guard.weeklyHours / 40) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4 px-6">
                  <div>
                    <CardTitle className="text-lg font-black text-slate-800">Master Deployment Roster</CardTitle>
                    <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                      Full view of all operational intervals
                    </CardDescription>
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search records..." className="pl-8 text-xs h-9 bg-slate-50 border-none rounded-full" />
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
                          <tr key={shift.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                                  {shift.guardName?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="font-black text-slate-800">{shift.guardName || 'Awaiting Guard'}</p>
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
            </div>
          </div>
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
              Finding the optimal candidate for **{selectedShift?.siteName}** ({selectedShift?.role}).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-6">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Recommended Officers:</p>
            {suggestions.length > 0 ? (
              suggestions.map(guard => (
                <div key={guard.id} className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary transition-all cursor-pointer group" onClick={() => assignGuard(guard)}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {guard.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{guard.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Available
                        </span>
                        <span className={`text-[9px] font-bold uppercase ${guard.weeklyHours >= 40 ? 'text-red-500' : 'text-slate-400'}`}>
                          {guard.weeklyHours}h this week
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-white font-black text-[10px]">ASSIGN</Button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground italic border border-dashed rounded-2xl">
                No compliant officers currently available within fatigue limits.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="w-full rounded-full" onClick={() => setIsSuggestOpen(false)}>Close AI Suggester</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
