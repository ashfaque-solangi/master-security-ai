
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
  ArrowLeftRight
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Shift, Severity, Guard } from '@/lib/types';
import { format, addHours, isFuture } from 'date-fns';

export default function SchedulingPage() {
  const store = useJsonStore();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [suggestions, setSuggestions] = useState<Guard[]>([]);

  // Form State
  const [siteName, setSiteName] = useState('Tech Hub HQ');
  const [role, setRole] = useState('Security Officer');
  const [priority, setPriority] = useState<Severity>('Low');

  useEffect(() => {
    setIsMounted(true);
    setShifts(store.getShifts());
    setGuards(store.getGuards());
  }, []);

  const handleAdd = () => {
    const shift: Shift = {
      id: `SHF-${Date.now()}`,
      siteId: 'SITE-001',
      siteName,
      startTime: new Date().toISOString(),
      endTime: addHours(new Date(), 8).toISOString(),
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
    const updatedShift: Shift = {
      ...selectedShift,
      siteName,
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

  const resetForm = () => {
    setSiteName('Tech Hub HQ');
    setRole('Security Officer');
    setPriority('Low');
    setSelectedShift(null);
  };

  if (!isMounted) return null;

  const overtimeGuards = guards.filter(g => g.weeklyHours > 40);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Smart Scheduling</h1>
          <p className="text-muted-foreground font-medium">AI-optimized deployment & fatigue monitoring.</p>
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
                <DialogTitle>Schedule New Shift</DialogTitle>
                <DialogDescription>Add a new operational shift to the roster.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Site Location</label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Role Required</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} />
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
                <Button onClick={handleAdd} className="bg-primary">Publish Shift</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Open Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{shifts.filter(s => s.status === 'Open').length}</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Awaiting Coverage</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fatigue Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">{overtimeGuards.length}</div>
            <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">Exceeding 40hrs / Week</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Swap Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">0</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Pending Approval</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-white/50 tracking-widest">Target Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">94.2%</div>
            <p className="text-[10px] text-primary font-bold mt-1 uppercase">+2.1% than avg</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Coverage Blocker
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {shifts.filter(s => s.status === 'Open').map(shift => (
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

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4 px-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ArrowLeftRight className="h-4 w-4" /></Button>
                <div>
                  <CardTitle className="text-lg font-black text-slate-800">Master Deployment Roster</CardTitle>
                  <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    Week of {format(new Date(), 'MMM dd, yyyy')}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search site..." className="pl-8 text-xs h-9 bg-slate-50 border-none rounded-full" />
                </div>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9"><CalendarIcon className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b">
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Officer & Role</th>
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deployment Site</th>
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shift Interval</th>
                      <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="text-right p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.filter(s => s.status !== 'Open').map(shift => (
                      <tr key={shift.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                              {shift.guardName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{shift.guardName}</p>
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
                              {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <Badge variant="outline" className={`text-[9px] font-black uppercase rounded-full ${
                            shift.status === 'In Progress' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {shift.status}
                          </Badge>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
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
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{guard.weeklyHours}h this week</span>
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
