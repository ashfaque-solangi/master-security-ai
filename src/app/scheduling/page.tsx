'use client';

import { useState, useEffect } from 'react';
import { 
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
  ShieldAlert,
  Users,
  Lock,
  Coffee,
  Loader2,
  History,
  Info,
  XCircle,
  TrendingDown
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
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJsonStore } from '@/lib/store';
import { Shift, Severity, Guard, Site, AuditRecord } from '@/lib/types';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO, 
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { validateGuardAssignment, getFatigueScore } from '@/lib/scheduling-validation';

type ViewMode = 'month' | 'week' | 'day';

export default function SchedulingPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [suggestions, setSuggestions] = useState<{guard: Guard, validation: any}[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setShifts(store.getShifts());
    setGuards(store.getGuards());
    setSites(store.getSites());
    setAudits(store.getAudits());
  }, []);

  if (!isMounted) return null;

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    setTimeout(() => {
      const updated = store.autoFillAllShifts();
      setShifts(updated);
      setIsAutoFilling(false);
      setAudits(store.getAudits());
      toast({ title: "AI Optimization Complete", description: "Global deployment plan optimized." });
    }, 1200);
  };

  const openSuggest = (shift: Shift, role: string) => {
    if (shift.status === 'Completed') return;
    setSelectedShift(shift);
    setTargetRole(role);
    
    // Propose candidates with validation status
    const allGuards = store.getGuards();
    const candidatePool = allGuards.map(g => ({
      guard: g,
      validation: validateGuardAssignment(g, shift, shifts, role)
    })).sort((a, b) => {
      // Sort valid ones to the top, then by fatigue
      if (a.validation.isValid && !b.validation.isValid) return -1;
      if (!a.validation.isValid && b.validation.isValid) return 1;
      return a.guard.weeklyHours - b.guard.weeklyHours;
    });

    setSuggestions(candidatePool);
    setIsSuggestOpen(true);
  };

  const assignGuard = (guard: Guard) => {
    if (!selectedShift || !targetRole) return;
    const validation = validateGuardAssignment(guard, selectedShift, shifts, targetRole);
    
    if (!validation.isValid) {
      store.logAudit({ 
        action: 'ASSIGNMENT_REJECTED', 
        entityType: 'shift_assignment', 
        entityId: selectedShift.id, 
        description: `Manual override rejected: ${validation.message}`,
        status: 'error',
        metadata: { guard: guard.name, reason: validation.code }
      });
      toast({ variant: "destructive", title: "Assignment Blocked", description: validation.message });
      return;
    }

    const updatedShift: Shift = {
      ...selectedShift,
      assignments: [...(selectedShift.assignments || []), { 
        id: `ASG-${Date.now()}`,
        guardId: guard.id, 
        guardName: guard.name, 
        rolePerformed: targetRole,
        status: 'Assigned',
        assignedAt: new Date().toISOString(),
        assignedBy: store.getCurrentUser()?.id || 'SYSTEM'
      }],
      status: 'Claimed'
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setAudits(store.getAudits());
    setIsSuggestOpen(false);
    toast({ title: "Officer Deployed", description: `${guard.name} assigned as ${targetRole}.` });
  };

  const navigate = (direction: 'prev' | 'next') => {
    const amount = direction === 'next' ? 1 : -1;
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, amount));
    else if (viewMode === 'week') setCurrentDate(addDays(currentDate, amount * 7));
    else setCurrentDate(addDays(currentDate, amount));
  };

  const daysToRender = (() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else return [currentDate];
  })();

  const getEntityHistory = (id: string) => {
    return audits.filter(a => a.entityId === id).slice(0, 5);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Scheduling Command</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> Multi-Guard Deployment Engine
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-full px-6 h-11" onClick={handleAutoFill} disabled={isAutoFilling}>
            {isAutoFilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            AI AUTO-FILL
          </Button>
          <Button className="bg-primary text-white rounded-full px-6 shadow-lg h-11">
            <Plus className="mr-2 h-4 w-4" /> Create Shift
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-xl h-10">
          <Button variant={viewMode === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('month')} className="rounded-lg px-4 font-bold">Month</Button>
          <Button variant={viewMode === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('week')} className="rounded-lg px-4 font-bold">Week</Button>
          <Button variant={viewMode === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('day')} className="rounded-lg px-4 font-bold">Day</Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')}><ChevronLeft /></Button>
          <span className="text-sm font-black uppercase tracking-widest min-w-[200px] text-center">
            {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM dd, yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigate('next')}><ChevronRight /></Button>
        </div>
      </div>

      <div className={`grid gap-px bg-slate-200 border rounded-2xl overflow-hidden shadow-inner ${viewMode === 'month' ? 'grid-cols-7' : viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
        {daysToRender.map((day, idx) => {
          const dayShifts = shifts.filter(s => isSameDay(parseISO(s.startTime), day));
          const isToday = isSameDay(day, new Date());
          const isOtherMonth = viewMode === 'month' && !isSameMonth(day, currentDate);

          return (
            <div key={idx} className={`flex flex-col min-h-[160px] bg-white transition-colors ${isOtherMonth ? 'bg-slate-50/50' : ''}`}>
              <div className={`p-2 text-center border-b sticky top-0 z-10 bg-white/95 backdrop-blur-sm ${isToday ? 'bg-primary/5' : ''}`}>
                <p className={`text-[9px] font-black uppercase ${isToday ? 'text-primary' : 'text-slate-400'}`}>{format(day, 'EEE')}</p>
                <div className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${isToday ? 'bg-primary text-white shadow-md' : 'text-slate-800'}`}>{format(day, 'dd')}</div>
              </div>

              <div className="flex-1 p-2 space-y-2">
                {dayShifts.map(shift => (
                  <Card key={shift.id} onClick={() => { setSelectedShift(shift); setIsDetailOpen(true); }} className={`group relative border-none shadow-sm hover:shadow-md cursor-pointer overflow-hidden rounded-xl p-2 ${shift.status === 'Open' ? 'ring-1 ring-red-200 bg-red-50/50' : 'bg-white'}`}>
                    <div className={`absolute left-0 top-0 w-1 h-full ${shift.status === 'Completed' ? 'bg-slate-400' : shift.priority === 'STAT' ? 'bg-red-600' : 'bg-primary'}`} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase truncate text-slate-800">{shift.siteName}</p>
                      <div className="flex flex-wrap gap-1">
                        {shift.assignments?.map(a => (
                          <div key={a.guardId} className="bg-slate-100 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[80px]">
                            {a.guardName}
                          </div>
                        ))}
                        {(shift.status === 'Open' || !shift.assignments?.length) && <Badge variant="outline" className="text-[7px] bg-red-50 text-red-500 border-red-100 uppercase py-0 px-1">VACANT</Badge>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none">
          <DialogHeader className="p-8 pb-4 bg-slate-900 text-white relative">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">{selectedShift?.siteName}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Deployment Detail • ID: {selectedShift?.id}</DialogDescription>
            <div className="absolute top-8 right-8">
              <Badge className="bg-primary text-white font-black">{selectedShift?.priority} PRIORITY</Badge>
            </div>
          </DialogHeader>
          
          {selectedShift && (
            <div className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Shift Window</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border">
                    <p className="text-lg font-black text-slate-800">{format(parseISO(selectedShift.startTime), 'EEEE, MMM dd')}</p>
                    <p className="text-2xl font-black text-primary">{format(parseISO(selectedShift.startTime), 'HH:mm')} - {format(parseISO(selectedShift.endTime), 'HH:mm')}</p>
                    {selectedShift.breakStartTime && (
                      <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-2 text-xs font-bold text-orange-600">
                        <Coffee className="h-3.5 w-3.5" /> Break: {format(parseISO(selectedShift.breakStartTime), 'HH:mm')} - {format(parseISO(selectedShift.breakEndTime!), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users className="w-3 h-3" /> Team Capacity</h3>
                  <div className="space-y-2">
                    {selectedShift.requirements?.map(req => {
                      const assigned = selectedShift.assignments?.filter(a => a.rolePerformed === req.role) || [];
                      const missing = req.count - assigned.length;
                      return (
                        <div key={req.role} className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm">
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800">{req.role}</p>
                            <p className="text-[10px] text-muted-foreground font-bold">{assigned.length} / {req.count} Filled</p>
                          </div>
                          {missing > 0 && selectedShift.status !== 'Completed' ? (
                            <Button size="sm" variant="ghost" className="text-red-500 font-black text-[10px] bg-red-50 hover:bg-red-100" onClick={() => openSuggest(selectedShift, req.role)}>
                              <Zap className="w-3 h-3 mr-1" /> FILL GAP
                            </Button>
                          ) : assigned.length >= req.count ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><History className="h-3 w-3" /> Recent Activity</h3>
                <div className="space-y-3">
                  {getEntityHistory(selectedShift.id).map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-dashed">
                      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[8px] font-black border">{log.userName.charAt(0)}</div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800">{log.description}</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-black">{format(new Date(log.timestamp), 'MMM dd @ HH:mm')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="p-4 bg-slate-50 border-t">
            <Button variant="ghost" className="text-red-600 font-black text-[10px] uppercase" onClick={() => setIsDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuggestOpen} onOpenChange={setIsSuggestOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Candidate Pool
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase">Proposing qualified {targetRole}s</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
            {suggestions.map(({ guard, validation }) => (
              <div 
                key={guard.id} 
                onClick={() => validation.isValid && assignGuard(guard)} 
                className={`flex items-center justify-between p-4 border rounded-2xl bg-white shadow-sm transition-all ${
                  validation.isValid 
                    ? 'hover:border-primary cursor-pointer group' 
                    : 'opacity-50 grayscale cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500">{guard.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{guard.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {validation.isValid ? (
                        <>
                          <Badge variant="outline" className={`text-[8px] font-black ${getFatigueScore(guard) === 'LOW' ? 'text-green-500' : 'text-orange-500'}`}>
                            {getFatigueScore(guard)} FATIGUE
                          </Badge>
                          <p className="text-[9px] text-muted-foreground font-bold">{guard.weeklyHours}h week</p>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase">
                          <XCircle className="w-2.5 h-2.5" /> {validation.code.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {validation.isValid && (
                  <Button size="sm" variant="ghost" className="rounded-full font-black text-[10px] group-hover:bg-primary group-hover:text-white">DEPLOY</Button>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-white border-t text-center">
             <p className="text-[10px] text-muted-foreground font-bold flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> Non-compliant candidates are automatically filtered.
             </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
