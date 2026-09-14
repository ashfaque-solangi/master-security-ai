'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  MapPin, 
  Building2, 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Hash, 
  Activity,
  ShieldCheck,
  Send,
  MoreVertical,
  XCircle,
  Clock
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { Shift, Site } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function DeploymentBoard() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setShifts(store.getShifts() || []);
    setSites(store.getSites() || []);
  };

  const handleUndeploy = (shiftId: string) => {
    try {
      store.undeployShift(shiftId);
      refreshData();
      toast({ title: "Deployment Revoked", description: "Shift is no longer operational at specified site." });
    } catch (e: any) {
      toast({ title: "Action Error", description: e.message, variant: "destructive" });
    }
  };

  if (!isMounted) return null;

  const deployedShifts = shifts.filter(s => !!s.siteId);
  const filtered = deployedShifts.filter(s => {
    const sName = (s.name || '').toLowerCase();
    const siteName = (s.siteName || '').toLowerCase();
    const sCode = (s.code || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return sName.includes(search) || siteName.includes(search) || sCode.includes(search);
  });

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Operational Deployments</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Real-time mapping of Shifts to physical Sites</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Units</p>
              <p className="text-2xl font-black italic text-slate-800">{deployedShifts.length}</p>
           </div>
           <Badge className="bg-primary text-white font-black italic px-6 py-1 rounded-full uppercase text-[10px]">LIVE MONITORING ACTIVE</Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
        <Search className="ml-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Filter by shift or deployment location..." 
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
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Shift Unit</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Current Deployment Site</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Staffing Level</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(shift => (
              <TableRow key={shift.id} className="hover:bg-slate-50/50 transition-colors h-24">
                <TableCell className="px-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border shadow-inner flex items-center justify-center text-slate-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 italic uppercase italic tracking-tight">{shift.name || 'Unnamed Shift'}</p>
                      <p className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">{shift.code || 'SH-REF'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-sm"><MapPin className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase italic">{shift.siteName || 'Unassigned'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPS SECURED</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-black italic text-slate-800">{(shift.assignments?.length || 0)} Guards</span>
                    <Progress value={Math.min(100, ((shift.assignments?.length || 0) / Math.max(1, shift.requirements?.reduce((acc, r) => acc + r.count, 0) || 1)) * 100)} className="h-1 w-16" />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[8px] font-black uppercase italic bg-green-50 text-green-600 border-none shadow-sm h-5 px-3">DEPLOYED</Badge>
                </TableCell>
                <TableCell className="text-right px-8">
                   <div className="flex justify-end gap-2">
                     <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => handleUndeploy(shift.id)}><XCircle className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
