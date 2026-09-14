'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  Trash2, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar,
  Hash,
  Activity,
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Shift, Guard, ShiftAssignment, Site } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { validateGuardAssignment, getFatigueScore } from '@/lib/scheduling-validation';

export default function AssignmentHub() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialogs
  const [selectedAsg, setSelectedAsg] = useState<{ shift: Shift, asg: ShiftAssignment } | null>(null);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setShifts(store.getShifts() || []);
    setGuards(store.getGuards() || []);
    setSites(store.getSites() || []);
  };

  const handleRemove = (shiftId: string, asgId: string) => {
    store.removeShiftAssignment(shiftId, asgId);
    refreshData();
    toast({ title: "Personnel Removed", description: "Guard assignment successfully revoked." });
  };

  const handleRoleChange = (newRole: string) => {
    if (!selectedAsg) return;
    try {
      store.changeAssignmentRole(selectedAsg.shift.id, selectedAsg.asg.id, newRole);
      refreshData();
      setIsRoleOpen(false);
      setSelectedAsg(null);
      toast({ title: "Role Modified", description: "Assignment role successfully updated." });
    } catch (e: any) {
      toast({ title: "Validation Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReplace = (newGuardId: string) => {
    if (!selectedAsg) return;
    const newGuard = guards.find(g => g.id === newGuardId);
    if (!newGuard) return;
    try {
      store.replaceGuard(selectedAsg.shift.id, selectedAsg.asg.id, newGuard);
      refreshData();
      setIsReplaceOpen(false);
      setSelectedAsg(null);
      toast({ title: "Personnel Replaced", description: "Operational continuity preserved." });
    } catch (e: any) {
      toast({ title: "Replacement Blocked", description: e.message, variant: "destructive" });
    }
  };

  if (!isMounted) return null;

  const allAssignments = shifts.flatMap(s => (s.assignments || []).map(asg => ({ shift: s, asg })));
  const filtered = allAssignments.filter(item => {
    const gName = (item.asg?.guardName || '').toLowerCase();
    const sName = (item.shift?.name || '').toLowerCase();
    const sCode = (item.shift?.code || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return gName.includes(search) || sName.includes(search) || sCode.includes(search);
  });

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Personnel Assignments</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Workforce Distribution & Deployment Control</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Personnel</p>
              <p className="text-2xl font-black italic text-slate-800">{allAssignments.filter(a => a.asg.status === 'Assigned').length}</p>
           </div>
           <Button className="bg-primary text-white rounded-2xl px-8 font-black uppercase italic shadow-xl shadow-primary/20 h-12 tracking-tighter">
             <UserPlus className="mr-2 h-5 w-5" /> Manual Assignment
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
        <Search className="ml-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Filter by guard name, shift name or code..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Security Personnel</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Assigned Role</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Shift Context</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Site / Unit</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, idx) => {
              const guard = guards.find(g => g.id === item.asg.guardId);
              const validation = guard ? validateGuardAssignment(guard, item.shift, shifts, [], item.asg.rolePerformed) : { isValid: true };
              const fatigue = guard ? getFatigueScore(guard) : 'LOW';
              
              return (
                <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors h-24">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner">
                        {(item.asg?.guardName || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="font-black text-slate-800 italic uppercase tracking-tight">{item.asg?.guardName || 'Unknown Guard'}</p>
                           {!validation.isValid && <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: {item.asg?.guardId || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase px-4 h-6 rounded-xl italic">
                      {(item.asg?.rolePerformed || '').replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-600 uppercase italic truncate max-w-[150px]">{item.shift?.name || 'Security Shift'}</p>
                      <p className="text-[9px] font-bold text-slate-400 font-mono">{item.shift?.code || 'SH-REF'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 italic">
                        <MapPin className="w-3 h-3 text-primary" /> {item.shift?.siteName || 'Unassigned Site'}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">Lahore, PK</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className="bg-green-100 text-green-600 border-none font-black text-[8px] h-5 px-3 rounded-full uppercase italic shadow-sm">{item.asg?.status || 'Assigned'}</Badge>
                      {fatigue !== 'LOW' && <span className="text-[7px] font-black text-amber-600 uppercase italic animate-pulse">FATIGUE: {fatigue}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-primary rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl p-2 border-none">
                        <DropdownMenuItem onClick={() => { setSelectedAsg(item); setIsRoleOpen(true); }} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-[11px] font-black uppercase italic tracking-tight">Change Role</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedAsg(item); setIsReplaceOpen(true); }} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer">
                          <ArrowRightLeft className="h-4 w-4 text-primary" />
                          <span className="text-[11px] font-black uppercase italic tracking-tight">Replace Guard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemove(item.shift.id, item.asg.id)} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                          <span className="text-[11px] font-black uppercase italic tracking-tight">Remove Duty</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="bg-slate-900 text-white p-8">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Modify Assignment Role</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personnel: {selectedAsg?.asg.guardName}</DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6 bg-slate-50">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">New Duty Assignment</label>
                <Select onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm"><SelectValue placeholder="Choose New Role..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SECURITY_GUARD">Security Guard</SelectItem>
                    <SelectItem value="CCTV_OPERATOR">CCTV Operator</SelectItem>
                    <SelectItem value="SITE_LEAD">Site Lead</SelectItem>
                    <SelectItem value="FIRE_MARSHAL">Fire Marshal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* Replace Guard Dialog */}
      <Dialog open={isReplaceOpen} onOpenChange={setIsReplaceOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="bg-slate-900 text-white p-8">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Operational Personnel Replace</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Replacing {selectedAsg?.asg.guardName} in {selectedAsg?.shift.name}</DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6 bg-slate-50 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {guards.filter(g => g.id !== selectedAsg?.asg.guardId).map(candidate => {
                  const v = selectedAsg ? validateGuardAssignment(candidate, selectedAsg.shift, shifts, [], selectedAsg.asg.rolePerformed) : { isValid: true };
                  return (
                    <div 
                      key={candidate.id} 
                      onClick={() => v.isValid && handleReplace(candidate.id)}
                      className={`flex items-center justify-between p-4 rounded-[1.5rem] bg-white shadow-sm border transition-all ${
                        v.isValid ? 'hover:border-primary cursor-pointer' : 'opacity-40 grayscale cursor-not-allowed border-dashed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">{candidate.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase italic">{candidate.name}</p>
                          {!v.isValid && <p className="text-[8px] text-red-500 font-black uppercase mt-0.5">{v.message}</p>}
                        </div>
                      </div>
                      {v.isValid && <ChevronRight className="h-4 w-4 text-slate-300" />}
                    </div>
                  );
                })}
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
