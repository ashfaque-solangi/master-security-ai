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
  Loader2,
  XCircle,
  RefreshCw,
  Trash2,
  UserPlus,
  ShieldCheck,
  Building2,
  Send,
  Timer,
  Hash,
  AlertTriangle
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJsonStore } from '@/lib/store';
import { Shift, Guard, ShiftAssignment, LeaveRecord, Site } from '@/lib/types';
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
  const [sites, setSites] = useState<Site[]>([]);
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
    setSites(store.getSites());
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
    const duration = oldEnd.getTime() - oldStart.getTime();

    const newStart = new Date(targetDay);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes());
    const newEnd = new Date(newStart.getTime() + duration);

    const updatedShift: Shift = { ...shift, startTime: newStart.toISOString(), endTime: newEnd.toISOString() };
    
    try {
      store.updateShift(updatedShift);
      refreshData();
      toast({ title: "Shift Rescheduled", description: "Team deployment interval updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Conflict Blocked", description: error.message });
    }
  };

  const openAddGuard = (shift: Shift, role: string) => {
    setSelectedShift(shift);
    setTargetRole(role);
    const site = sites.find(s => s.id === shift.siteId);
    const pool = guards.map(g => ({
      guard: g,
      validation: validateGuardAssignment(g, shift, shifts, leaveRecords, role, site)
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
    const updated = store.addShiftAssignment(selectedShift.id, newAssignment);
    setShifts(updated);
    setIsAddGuardOpen(false);
    const newSelected = updated.find(s => s.id === selectedShift.id);
    if (newSelected) setSelectedShift(newSelected);
    toast({ title: "Guard Assigned", description: `${guard.name} is now operational as ${targetRole}.` });
  };

  const handleRemoveAssignment = (asg: ShiftAssignment) => {
    if (!selectedShift) return;
    const updated = store.removeShiftAssignment(selectedShift.id, asg.id);
    setShifts(updated);
    const newSelected = updated.find(s => s.id === selectedShift.id);
    if (newSelected) setSelectedShift(newSelected);
    toast({ title: "Assignment Revoked", description: "Personnel removed from roster." });
  };

  const handleApproveClaim = (asg: ShiftAssignment) => {
    if (!selectedShift) return;
    try {
      const updated = store.approveClaim(selectedShift.id, asg.id);
      setShifts(updated);
      const newSelected = updated.find(s => s.id === selectedShift.id);
      if (newSelected) setSelectedShift(newSelected);
      toast({ title: "Claim Approved", description: `${asg.guardName} is now confirmed.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Approval Failed", description: e.message });
    }
  };

  const handleRejectClaim = (asg: ShiftAssignment) => {
    if (!selectedShift) return;
    const updated = store.rejectClaim(selectedShift.id, asg.id, "Operational adjustments.");
    setShifts(updated);
    const newSelected = updated.find(s => s.id === selectedShift.id);
    if (newSelected) setSelectedShift(newSelected);
    toast({ title: "Claim Rejected", description: "Candidate notified of rejection." });
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
      const matchingAssignments = shift.assignments.filter(a => a.rolePerformed === req.role && ['Assigned', 'Confirmed', 'In Transit', 'On Site'].includes(a.status));
      for (let i = 0; i < req.count; i++) {
        slots.push({ role: req.role, assignment: matchingAssignments[i] || null });
      }
    });
    return slots;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Scheduling Command</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Multi-Guard Sequence Optimization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-full px-6 h-11 shadow-sm" onClick={() => { setIsAutoFilling(true); setTimeout(() => { store.autoFillAllShifts(); refreshData(); setIsAutoFilling(false); }, 800); }}>
              {isAutoFilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              AI AUTO-FILL
            </Button>
            <Button className="bg-primary text-white rounded-full px-6 shadow-xl h-11">
              <Plus className="mr-2 h-4 w-4" /> New Sequence
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
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

        <div className={`grid gap-px bg-slate-200 border rounded-[2.5rem] overflow-hidden ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1 shadow-2xl'}`}>
          {daysToRender.map((day, idx) => {
            const dayShifts = shifts.filter(s => isSameDay(parseISO(s.startTime), day));
            return (
              <div 
                key={idx} 
                className="flex flex-col min-h-[400px] bg-white group/day relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className="p-4 text-center border-b bg-slate-50/50">
                  <p className="text-[10px] font-black uppercase text-slate-400">{format(day, 'EEE')}</p>
                  <div className="text-xl font-black text-slate-800 italic">{format(day, 'dd')}</div>
                </div>
                <div className="flex-1 p-3 space-y-4">
                  {dayShifts.map(shift => {
                    const required = shift.requirements.reduce((a, b) => a + b.count, 0);
                    const activeAssignments = shift.assignments.filter(a => ['Assigned', 'Confirmed', 'In Transit', 'On Site'].includes(a.status));
                    const assignedCount = activeAssignments.length;
                    const pendingCount = shift.assignments.filter(a => a.status === 'Pending').length;
                    
                    const isUnderstaffed = assignedCount < required;
                    const isOverstaffed = assignedCount > required;
                    const isPerfectlyStaffed = assignedCount === required;

                    // Group level conflict check
                    const conflicts = activeAssignments.map(asg => {
                      const guard = guards.find(g => g.id === asg.guardId);
                      if (!guard) return null;
                      const validation = validateGuardAssignment(guard, shift, shifts, leaveRecords, asg.rolePerformed);
                      return !validation.isValid ? { guard, validation } : null;
                    }).filter(c => c !== null);
                    
                    return (
                      <Card 
                        key={shift.id} 
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('shiftId', shift.id)}
                        onClick={() => { setSelectedShift(shift); setIsDetailOpen(true); }} 
                        className={`p-4 cursor-grab active:cursor-grabbing border-none shadow-sm hover:shadow-xl relative overflow-hidden group/shift transition-all hover:-translate-y-1 ${shift.status === 'Draft' ? 'opacity-60 bg-slate-50 border-dashed border' : 'bg-white'}`}
                      >
                        <div className={`absolute left-0 top-0 w-1 h-full ${
                          shift.status === 'Draft' ? 'bg-slate-300' : 
                          isUnderstaffed ? 'bg-red-500' : 
                          isOverstaffed ? 'bg-amber-500' : 
                          'bg-primary'
                        }`} />
                        
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[7px] font-black text-slate-400 uppercase font-mono">{shift.code}</span>
                           <div className="flex items-center gap-1.5">
                              {conflicts.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center text-red-500">
                                      <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-3 bg-red-900 text-white rounded-xl border-none shadow-2xl">
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Scheduling Conflicts</p>
                                      {conflicts.map((c, i) => (
                                        <div key={i} className="space-y-0.5">
                                          <p className="text-[9px] font-black italic uppercase">{c?.guard.name}</p>
                                          <p className="text-[8px] font-bold text-red-200">• {c?.validation.message}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <Badge variant="outline" className={`text-[7px] font-black px-1.5 h-4 border-none shadow-sm ${
                                isUnderstaffed ? 'bg-red-50 text-red-600' : 
                                isOverstaffed ? 'bg-amber-50 text-amber-600' : 
                                'bg-green-50 text-green-600'
                              }`}>
                                {assignedCount}/{required} POSTS
                              </Badge>
                           </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-[10px] font-black uppercase truncate text-slate-800 italic leading-none">{shift.name}</p>
                          <p className="text-[8px] font-bold text-primary uppercase truncate mt-1">{shift.siteName}</p>
                        </div>

                        <div className="space-y-1.5">
                          {activeAssignments.slice(0, 3).map(asg => {
                             const guard = guards.find(g => g.id === asg.guardId);
                             const fatigue = guard ? getFatigueScore(guard) : 'LOW';
                             return (
                               <div key={asg.id} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[8px] font-bold relative group/guard">
                                  <div className={`h-3 w-3 rounded-full flex items-center justify-center text-[6px] text-white ${
                                    fatigue === 'CRITICAL' ? 'bg-red-600' :
                                    fatigue === 'HIGH' ? 'bg-amber-500' :
                                    'bg-primary'
                                  }`}>
                                    {asg.guardName.charAt(0)}
                                  </div>
                                  <span className="truncate flex-1">{asg.guardName}</span>
                               </div>
                             );
                          })}
                          
                          {assignedCount > 3 && (
                            <div className="text-center">
                               <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">+ {assignedCount - 3} More Assigned</p>
                            </div>
                          )}

                          {pendingCount > 0 && (
                            <div className="flex items-center gap-1 text-[7px] text-amber-600 font-black uppercase mt-1 justify-center bg-amber-50 rounded-md py-0.5">
                               <Timer className="w-2.5 h-2.5" /> {pendingCount} PENDING BID{pendingCount > 1 ? 'S' : ''}
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

        {/* Shift Detail / Site Roster Management */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
            <DialogHeader className="p-10 bg-slate-900 text-white relative">
               <div className="absolute top-10 right-10 flex gap-6">
                  <div className="text-right">
                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Site Code</p>
                     <p className="text-xl font-black italic text-primary uppercase">{selectedShift?.code.split('-').pop()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                     <Building2 className="text-primary w-6 h-6" />
                  </div>
               </div>
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                    <Hash className="w-3 h-3" /> {selectedShift?.code}
                 </div>
                 <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">{selectedShift?.name}</DialogTitle>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{selectedShift?.siteName}</p>
               </div>
            </DialogHeader>
            
            <div className="p-10 space-y-10 bg-white max-h-[75vh] overflow-y-auto">
              <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-1 space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b pb-3"><Clock className="w-3.5 h-3.5 text-primary" /> Deployment Window</h3>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-dashed space-y-5 shadow-inner">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Operational Date</p>
                        <p className="text-sm font-black text-slate-800 italic uppercase">{selectedShift && format(parseISO(selectedShift.startTime), 'EEEE, MMMM dd')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Shift Duration</p>
                        <p className="text-2xl font-black text-primary italic">
                          {selectedShift && `${format(parseISO(selectedShift.startTime), 'HH:mm')} - ${format(parseISO(selectedShift.endTime), 'HH:mm')}`}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Total Duty: 8.0 Hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2 border-b pb-3 border-amber-100"><Zap className="w-3.5 h-3.5" /> Pending Claims</h3>
                     <div className="space-y-3">
                        {selectedShift?.assignments.filter(a => a.status === 'Pending').map(claim => (
                          <div key={claim.id} className="p-5 border border-amber-100 bg-amber-50/30 rounded-2xl space-y-3">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-xs font-black text-slate-800 italic">{claim.guardName}</p>
                                   <p className="text-[8px] font-bold text-amber-600 uppercase mt-0.5">{claim.rolePerformed.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center border text-[8px] font-black">?</div>
                             </div>
                             <div className="flex gap-2">
                                <Button size="sm" className="flex-1 bg-green-600 text-white font-black text-[9px] h-8 rounded-xl" onClick={() => handleApproveClaim(claim)}>APPROVE</Button>
                                <Button size="sm" variant="ghost" className="flex-1 text-red-600 font-black text-[9px] h-8 rounded-xl" onClick={() => handleRejectClaim(claim)}>REJECT</Button>
                             </div>
                          </div>
                        ))}
                        {selectedShift?.assignments.filter(a => a.status === 'Pending').length === 0 && (
                          <p className="text-center text-[9px] font-black uppercase text-slate-300 py-6 italic border border-dashed rounded-3xl">No pending requests</p>
                        )}
                     </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b pb-3"><Users className="w-3.5 h-3.5 text-primary" /> Active Personnel Roster</h3>
                  <div className="space-y-3">
                    {selectedShift && getPositionSlots(selectedShift).map((slot, idx) => {
                      let validationResult = { isValid: true, message: '' };
                      let fatigue = 'LOW';
                      if (slot.assignment) {
                        const guard = guards.find(g => g.id === slot.assignment!.guardId);
                        if (guard) {
                          validationResult = validateGuardAssignment(guard, selectedShift, shifts, leaveRecords, slot.assignment.rolePerformed);
                          fatigue = getFatigueScore(guard);
                        }
                      }
                      return (
                        <div key={idx} className={`flex items-center justify-between p-5 border rounded-[2rem] bg-white shadow-sm transition-all group ${slot.assignment ? 'hover:border-primary' : 'border-dashed border-slate-200 bg-slate-50/30'}`}>
                          <div className="flex items-center gap-4">
                            {slot.assignment ? (
                              <>
                                <div className="h-10 w-10 rounded-2xl bg-slate-50 border flex items-center justify-center font-black text-[11px] text-slate-400 group-hover:text-primary transition-colors shadow-inner">
                                  {slot.assignment.guardName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-black text-slate-800 uppercase italic">{slot.assignment.guardName}</p>
                                    {!validationResult.isValid && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="bg-red-600 text-white border-none font-bold text-[10px]">
                                          {validationResult.message}
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {fatigue !== 'LOW' && (
                                      <Badge className={fatigue === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}>FATIGUE: {fatigue}</Badge>
                                    )}
                                  </div>
                                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">{slot.role.replace(/_/g, ' ')}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-10 w-10 rounded-2xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-300 uppercase italic">UNFILLED POST</p>
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">REQUIRED: {slot.role.replace(/_/g, ' ')}</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {slot.assignment ? (
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-destructive rounded-xl" onClick={() => handleRemoveAssignment(slot.assignment!)}><Trash2 className="h-4 w-4" /></Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-9 px-6 rounded-xl border-primary text-primary font-black text-[9px] uppercase italic tracking-tighter" onClick={() => openAddGuard(selectedShift, slot.role)}>
                                <UserPlus className="h-3.5 h-3.5 mr-2" /> ASSIGN PERSONNEL
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* POOL SELECTION MODAL */}
        <Dialog open={isAddGuardOpen} onOpenChange={setIsAddGuardOpen}>
          <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-slate-900 text-white">
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-primary" />
                Select Candidate
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Filling position: <span className="text-primary italic">{targetRole.replace(/_/g, ' ')}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
              {suggestions.map(({ guard, validation }) => (
                <div 
                  key={guard.id} 
                  onClick={() => validation.isValid && handleAddAssignment(guard)} 
                  className={`flex items-center justify-between p-5 border rounded-[2rem] bg-white shadow-sm transition-all ${validation.isValid ? 'hover:border-primary cursor-pointer group' : 'opacity-40 grayscale cursor-not-allowed border-dashed'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200 group-hover:bg-primary/5 group-hover:text-primary transition-colors">{guard.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase italic">{guard.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <Badge variant="outline" className={`text-[7px] font-black h-4 px-2 border-none ${validation.isValid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                           {validation.isValid ? 'QUALIFIED' : validation.code.replace(/_/g, ' ')}
                         </Badge>
                      </div>
                    </div>
                  </div>
                  {validation.isValid && <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary" />}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
