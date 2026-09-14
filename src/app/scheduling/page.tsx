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
  UserPlus,
  ShieldCheck,
  Building2
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent as CardContentUI
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
import { Shift, Guard, ShiftAssignment, AuditRecord, LeaveRecord, WorkforceRole } from '@/lib/types';
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
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  // Modals
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isAddGuardOpen, setIsAddGuardOpen] = useState(false);
  
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [targetAssignment, setTargetAssignment] = useState<ShiftAssignment | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  const [suggestions, setSuggestions] = useState<{guard: Guard, validation: any}[]>([]);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setShifts(store.getShifts());
    setGuards(store.getGuards());
    setLeaveRecords(store.getLeave());
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

    const proposedShift = { ...shift, startTime: newStart.toISOString(), endTime: newEnd.toISOString() };

    // Multi-Guard Team Validation
    if (shift.assignments?.length > 0) {
      for (const asg of shift.assignments) {
        const guard = guards.find(g => g.id === asg.guardId);
        if (guard) {
          const validation = validateGuardAssignment(
            guard, 
            proposedShift, 
            shifts, 
            leaveRecords,
            asg.rolePerformed
          );
          if (!validation.isValid) {
            toast({
              variant: "destructive",
              title: "Move Blocked",
              description: `Conflict for ${guard.name} (${asg.rolePerformed}): ${validation.message}`
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

  const openAddGuard = (shift: Shift, role: string) => {
    setSelectedShift(shift);
    setTargetRole(role);
    
    // Evaluate candidate pool for this specific role
    const pool = guards.map(g => ({
      guard: g,
      validation: validateGuardAssignment(g, shift, shifts, leaveRecords, role)
    })).sort((a, b) => (a.validation.isValid === b.validation.isValid ? 0 : a.validation.isValid ? -1 : 1));

    setSuggestions(pool);
    setIsAddGuardOpen(true);
  };

  const handleAddAssignment = (guard: Guard) => {
    if (!selectedShift || !targetRole) return;
    
    const newAssignment: ShiftAssignment = {
      id: `ASG-${Date.now()}`,
      guardId: guard.id,
      guardName: guard.name,
      rolePerformed: targetRole,
      status: 'Assigned',
      assignedAt: new Date().toISOString(),
      assignedBy: store.getCurrentUser()?.name || 'SYSTEM'
    };

    const updatedShifts = store.addShiftAssignment(selectedShift.id, newAssignment);
    setShifts(updatedShifts);
    setIsAddGuardOpen(false);
    
    // Refresh local selected shift
    const updated = updatedShifts.find(s => s.id === selectedShift.id);
    if (updated) setSelectedShift(updated);
    
    toast({ title: "Guard Assigned", description: `${guard.name} assigned as ${targetRole}.` });
  };

  const openSwap = (shift: Shift, asg: ShiftAssignment) => {
    setSelectedShift(shift);
    setTargetAssignment(asg);
    setTargetRole(asg.rolePerformed);
    
    // Evaluate candidate pool
    const pool = guards.map(g => ({
      guard: g,
      validation: validateGuardAssignment(g, shift, shifts, leaveRecords, asg.rolePerformed)
    })).sort((a, b) => (a.validation.isValid === b.validation.isValid ? 0 : a.validation.isValid ? -1 : 1));

    setSuggestions(pool);
    setIsSwapOpen(true);
  };

  const handleSwap = (replacementGuard: Guard) => {
    if (!selectedShift || !targetAssignment) return;
    
    const updated = store.swapShiftAssignment(selectedShift.id, targetAssignment.id, replacementGuard);
    setShifts(updated);
    setIsSwapOpen(false);
    
    const updatedShift = updated.find(s => s.id === selectedShift.id);
    if (updatedShift) setSelectedShift(updatedShift);

    toast({ title: "Guard Swapped", description: `${replacementGuard.name} now assigned as ${targetAssignment.rolePerformed}.` });
  };

  const removeAssignment = (asg: ShiftAssignment) => {
    if (!selectedShift) return;
    const updated = store.removeShiftAssignment(selectedShift.id, asg.id);
    setShifts(updated);
    const updatedShift = updated.find(s => s.id === selectedShift.id);
    if (updatedShift) setSelectedShift(updatedShift);
    
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

  const getPositionSlots = (shift: Shift) => {
    const slots: { role: string, assignment: ShiftAssignment | null }[] = [];
    shift.requirements.forEach(req => {
      const matchingAssignments = shift.assignments.filter(a => a.rolePerformed === req.role);
      for (let i = 0; i < req.count; i++) {
        slots.push({
          role: req.role,
          assignment: matchingAssignments[i] || null
        });
      }
    });
    return slots;
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Scheduling Command</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> Team-Based Position Hub
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

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')} className="rounded-xl"><ChevronLeft /></Button>
          <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-800">
            {format(daysToRender[0], 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate('next')} className="rounded-xl"><ChevronRight /></Button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           {(['month', 'week', 'day'] as ViewMode[]).map(v => (
             <Button key={v} variant={viewMode === v ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode(v)} className="rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest h-8">
               {v}
             </Button>
           ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-px bg-slate-200 border rounded-2xl overflow-hidden ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
        {daysToRender.map((day, idx) => {
          const dayShifts = shifts.filter(s => isSameDay(parseISO(s.startTime), day));
          return (
            <div 
              key={idx} 
              className="flex flex-col min-h-[300px] bg-white group/day"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="p-3 text-center border-b bg-slate-50/50">
                <p className="text-[10px] font-black uppercase text-slate-400">{format(day, 'EEE')}</p>
                <div className="text-sm font-black text-slate-800">{format(day, 'dd')}</div>
              </div>

              <div className="flex-1 p-2 space-y-3">
                {dayShifts.map(shift => {
                  const required = shift.requirements.reduce((a, b) => a + b.count, 0);
                  const assigned = shift.assignments.length;
                  const isUnderstaffed = assigned < required;

                  return (
                    <Card 
                      key={shift.id} 
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('shiftId', shift.id)}
                      onClick={() => { setSelectedShift(shift); setIsDetailOpen(true); }} 
                      className="p-3 cursor-grab active:cursor-grabbing border-none shadow-sm hover:shadow-md bg-white relative overflow-hidden group/shift"
                    >
                      <div className={`absolute left-0 top-0 w-1 h-full ${isUnderstaffed ? 'bg-red-500' : 'bg-primary'}`} />
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-black uppercase truncate text-slate-800 max-w-[80%]">{shift.siteName}</p>
                        <Badge variant="outline" className="text-[7px] px-1 h-3 border-none bg-slate-50 font-bold uppercase">{assigned}/{required}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        {shift.assignments.slice(0, 3).map(asg => (
                          <div key={asg.id} className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[8px] font-bold">
                             <Users className="w-2.5 h-2.5 text-primary" /> 
                             <span className="truncate flex-1">{asg.guardName}</span>
                             <span className="text-[6px] text-slate-400 uppercase">{asg.rolePerformed.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                        {shift.assignments.length > 3 && (
                          <p className="text-[7px] font-black text-slate-400 text-center uppercase tracking-widest mt-1">+{shift.assignments.length - 3} more personnel</p>
                        )}
                        {isUnderstaffed && (
                          <div className="mt-1 flex items-center gap-1 text-[7px] text-red-500 font-black uppercase">
                            <XCircle className="w-2.5 h-2.5" /> MISSING POSITIONS
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shift Detail / Assignment Management */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="p-10 bg-slate-900 text-white relative">
             <div className="absolute top-10 right-10 flex gap-4">
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Site Health</p>
                   <p className="text-xl font-black italic text-green-500">92%</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                   <Building2 className="text-primary w-6 h-6" />
                </div>
             </div>
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">{selectedShift?.siteName}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Managing Granular Position Deployment Hub</DialogDescription>
          </DialogHeader>
          
          <div className="p-10 space-y-10 bg-white max-h-[70vh] overflow-y-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b pb-3"><Clock className="w-3 h-3 text-primary" /> Shift Parameters</h3>
                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed space-y-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-black text-slate-800 italic uppercase">{selectedShift && format(parseISO(selectedShift.startTime), 'EEEE, MMM dd')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Time Window</p>
                    <p className="text-xl font-black text-primary italic">
                      {selectedShift && `${format(parseISO(selectedShift.startTime), 'HH:mm')} - ${format(parseISO(selectedShift.endTime), 'HH:mm')}`}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Coverage</p>
                    <div className="flex items-center justify-between">
                       <p className="text-sm font-black text-slate-800">{selectedShift?.assignments.length} / {selectedShift?.requirements.reduce((a,b) => a + b.count, 0)} Posts</p>
                       <Badge variant="outline" className="bg-white text-[8px] uppercase">{selectedShift?.priority}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b pb-3"><Users className="w-3 h-3 text-primary" /> Site Roster / Position Breakdown</h3>
                <div className="space-y-3">
                  {selectedShift && getPositionSlots(selectedShift).map((slot, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 border rounded-2xl bg-white shadow-sm transition-all group ${slot.assignment ? 'hover:border-primary' : 'border-dashed border-red-200 bg-red-50/20'}`}>
                      <div className="flex items-center gap-4">
                         {slot.assignment ? (
                           <>
                             <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[10px] border shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                               {slot.assignment.guardName.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-800 uppercase italic">{slot.assignment.guardName}</p>
                                <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{slot.role.replace(/_/g, ' ')}</p>
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="h-10 w-10 rounded-2xl bg-white border border-dashed border-red-300 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-red-300" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-red-500 uppercase italic">OPEN POSITION</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REQUIRED: {slot.role.replace(/_/g, ' ')}</p>
                             </div>
                           </>
                         )}
                      </div>
                      <div className="flex gap-1">
                         {slot.assignment ? (
                           <>
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary rounded-xl" onClick={() => openSwap(selectedShift, slot.assignment!)}><RefreshCw className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-destructive rounded-xl" onClick={() => removeAssignment(slot.assignment!)}><Trash2 className="h-4 w-4" /></Button>
                           </>
                         ) : (
                           <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black text-[9px] uppercase italic tracking-tighter" onClick={() => openAddGuard(selectedShift, slot.role)}>
                             <UserPlus className="h-3 w-3 mr-2" /> Assign Personnel
                           </Button>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SWAP / REPLACEMENT / ADD MODAL */}
      <Dialog open={isSwapOpen || isAddGuardOpen} onOpenChange={(val) => { setIsSwapOpen(val); setIsAddGuardOpen(val); }}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-slate-900 text-white">
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              {isSwapOpen ? <RefreshCw className="w-6 h-6 text-primary" /> : <UserPlus className="w-6 h-6 text-primary" />}
              {isSwapOpen ? 'Swap Personnel' : 'Fill Position'}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Position: <span className="text-primary italic">{targetRole.replace(/_/g, ' ')}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
            {suggestions.map(({ guard, validation }) => (
              <div 
                key={guard.id} 
                onClick={() => validation.isValid && (isSwapOpen ? handleSwap(guard) : handleAddAssignment(guard))} 
                className={`flex items-center justify-between p-5 border rounded-[2rem] bg-white shadow-sm transition-all ${
                  validation.isValid 
                    ? 'hover:border-primary cursor-pointer group' 
                    : 'opacity-50 grayscale cursor-not-allowed border-dashed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{guard.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase italic">{guard.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {validation.isValid ? (
                        <>
                          <Badge variant="outline" className={`text-[7px] font-black h-4 px-2 border-none rounded-full ${getFatigueScore(guard) === 'LOW' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            {getFatigueScore(guard)} FATIGUE
                          </Badge>
                          <div className="flex items-center gap-1 text-[7px] text-slate-400 font-bold uppercase">
                             <ShieldCheck className="w-2 h-2 text-green-500" /> Qualified
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-red-500 uppercase leading-none">
                          <XCircle className="w-2.5 h-2.5" /> {validation.code.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {validation.isValid && (
                  <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic font-black uppercase text-xs">No personnel matched search criteria</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
