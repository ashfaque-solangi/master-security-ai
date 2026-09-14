'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Sparkles, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Users,
  Coffee,
  Loader2,
  History,
  Info,
  XCircle,
  CheckCircle2,
  GripVertical,
  RefreshCw,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useJsonStore } from '@/lib/store';
import { Shift, Guard, ShiftAssignment, AuditRecord } from '@/lib/types';
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
  addMonths,
  differenceInHours
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { validateGuardAssignment, getFatigueScore } from '@/lib/scheduling-validation';

type ViewMode = 'month' | 'week' | 'day';

export default function SchedulingPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  // Modals
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [targetAssignment, setTargetAssignment] = useState<ShiftAssignment | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [suggestions, setSuggestions] = useState<{guard: Guard, validation: any}[]>([]);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setShifts(store.getShifts());
    setGuards(store.getGuards());
    setAudits(store.getAudits());
  };

  if (!isMounted) return null;

  const handleDrop = (e: React.DragEvent, targetDay: Date) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('shiftId');
    const shift = shifts.find(s => s.id === id);
    if (!shift) return;

    const oldStart = parseISO(shift.startTime);
    const oldEnd = parseISO(shift.endTime);
    const duration = differenceInHours(oldEnd, oldStart);

    const newStart = new Date(targetDay);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes());
    const newEnd = new Date(newStart);
    newEnd.setHours(newStart.getHours() + duration);

    // Multi-Guard Team Validation (Hard Rule 17)
    if (shift.assignments?.length > 0) {
      for (const asg of shift.assignments) {
        const guard = guards.find(g => g.id === asg.guardId);
        if (guard) {
          const validation = validateGuardAssignment(
            guard, 
            { ...shift, startTime: newStart.toISOString(), endTime: newEnd.toISOString() }, 
            shifts, 
            asg.rolePerformed
          );
          if (!validation.isValid) {
            toast({
              variant: "destructive",
              title: "Move Blocked",
              description: `Conflict for ${guard.name}: ${validation.message}`
            });
            return;
          }
        }
      }
    }

    const updatedShift: Shift = { ...shift, startTime: newStart.toISOString(), endTime: newEnd.toISOString() };
    store.updateShift(updatedShift);
    refreshData();
    toast({ title: "Shift Rescheduled", description: "Entire team successfully moved." });
  };

  const openSwap = (shift: Shift, asg: ShiftAssignment) => {
    setSelectedShift(shift);
    setTargetAssignment(asg);
    setTargetRole(asg.rolePerformed);
    
    // Evaluate candidate pool (Hard Rule 11/13)
    const pool = guards.map(g => ({
      guard: g,
      validation: validateGuardAssignment(g, shift, shifts, asg.rolePerformed)
    })).sort((a, b) => (a.validation.isValid === b.validation.isValid ? 0 : a.validation.isValid ? -1 : 1));

    setSuggestions(pool);
    setIsSwapOpen(true);
  };

  const handleSwap = (replacementGuard: Guard) => {
    if (!selectedShift || !targetAssignment) return;
    
    const updated = store.swapShiftAssignment(selectedShift.id, targetAssignment.id, replacementGuard);
    setShifts(updated);
    setIsSwapOpen(false);
    toast({ title: "Guard Swapped", description: `${replacementGuard.name} now assigned as ${targetAssignment.rolePerformed}.` });
  };

  const removeAssignment = (asg: ShiftAssignment) => {
    if (!selectedShift) return;
    const updated = store.removeShiftAssignment(selectedShift.id, asg.id);
    setShifts(updated);
    if (selectedShift.id) {
       setSelectedShift(updated.find(s => s.id === selectedShift.id) || null);
    }
    toast({ title: "Personnel Removed", description: "Assignment released to open board." });
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Scheduling Command</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> Team-Based Deployment Hub
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-full px-6 h-11" onClick={() => { setIsAutoFilling(true); setTimeout(() => { store.autoFillAllShifts(); refreshData(); setIsAutoFilling(false); }, 1000); }}>
            {isAutoFilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            AI AUTO-OPTIMIZE
          </Button>
          <Button className="bg-primary text-white rounded-full px-6 shadow-lg h-11">
            <Plus className="mr-2 h-4 w-4" /> Create Shift
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-px bg-slate-200 border rounded-2xl overflow-hidden ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
        {daysToRender.map((day, idx) => {
          const dayShifts = shifts.filter(s => isSameDay(parseISO(s.startTime), day));
          return (
            <div 
              key={idx} 
              className="flex flex-col min-h-[200px] bg-white"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="p-3 text-center border-b bg-slate-50/50">
                <p className="text-[10px] font-black uppercase text-slate-400">{format(day, 'EEE')}</p>
                <div className="text-sm font-black text-slate-800">{format(day, 'dd')}</div>
              </div>

              <div className="flex-1 p-2 space-y-2">
                {dayShifts.map(shift => (
                  <Card 
                    key={shift.id} 
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('shiftId', shift.id)}
                    onClick={() => { setSelectedShift(shift); setIsDetailOpen(true); }} 
                    className="p-3 cursor-grab active:cursor-grabbing border-none shadow-sm hover:shadow-md bg-white relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                    <p className="text-[10px] font-black uppercase truncate text-slate-800">{shift.siteName}</p>
                    <div className="mt-2 space-y-1">
                      {shift.assignments.map(asg => (
                        <div key={asg.id} className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-[8px] font-bold">
                           <Users className="w-2.5 h-2.5 text-primary" /> {asg.guardName}
                        </div>
                      ))}
                      {shift.assignments.length < shift.requirements.reduce((a,b) => a + b.count, 0) && (
                        <Badge variant="outline" className="text-[7px] bg-red-50 text-red-500 border-red-100 uppercase px-1">OPEN POSITION</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shift Detail / Assignment Management */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border-none">
          <DialogHeader className="p-8 bg-slate-900 text-white">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">{selectedShift?.siteName}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing Team Assignments & Requirements</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Shift Window</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border">
                  <p className="text-lg font-black text-slate-800">{selectedShift && format(parseISO(selectedShift.startTime), 'EEEE, MMM dd')}</p>
                  <p className="text-2xl font-black text-primary">
                    {selectedShift && `${format(parseISO(selectedShift.startTime), 'HH:mm')} - ${format(parseISO(selectedShift.endTime), 'HH:mm')}`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users className="w-3 h-3" /> Team Personnel</h3>
                <div className="space-y-2">
                  {selectedShift?.assignments.map(asg => (
                    <div key={asg.id} className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm group">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px]">{asg.guardName.charAt(0)}</div>
                         <div>
                            <p className="text-xs font-black text-slate-800">{asg.guardName}</p>
                            <p className="text-[9px] font-bold text-primary uppercase">{asg.rolePerformed}</p>
                         </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openSwap(selectedShift, asg)}><RefreshCw className="h-3 w-3" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeAssignment(asg)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  {selectedShift && selectedShift.assignments.length < selectedShift.requirements.reduce((a,b) => a + b.count, 0) && (
                    <Button variant="outline" className="w-full border-dashed rounded-xl h-12 text-[10px] font-black uppercase">
                       <UserPlus className="h-4 w-4 mr-2" /> Fill Vacant Position
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SWAP / REPLACEMENT MODAL */}
      <Dialog open={isSwapOpen} onOpenChange={setIsSwapOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" /> Swap Assignment
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase">Replacing {targetAssignment?.guardName} as {targetRole}</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
            {suggestions.map(({ guard, validation }) => (
              <div 
                key={guard.id} 
                onClick={() => validation.isValid && handleSwap(guard)} 
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
                  <Button size="sm" variant="ghost" className="rounded-full font-black text-[10px] group-hover:bg-primary group-hover:text-white">SELECT</Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
