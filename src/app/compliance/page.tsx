'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Search, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Calendar,
  Clock,
  MoreVertical,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  ShieldQuestion
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
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { Guard, ComplianceStatus } from '@/lib/types';
import { format, isPast, isBefore, addDays, parseISO, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function ComplianceHub() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Override Modal
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setGuards(store.getGuards());
  }, []);

  if (!isMounted) return null;

  const now = new Date();
  const expiredCount = guards.filter(g => g.complianceStatus === 'Expired' || g.complianceStatus === 'Non-Compliant').length;
  const expiring30Count = guards.filter(g => {
    const dates = [g.licenceExpiry, g.dbsExpiry, g.rtwExpiry].map(d => d ? parseISO(d) : null).filter(Boolean) as Date[];
    return dates.some(d => !isPast(d) && isBefore(d, addDays(now, 30)));
  }).length;
  const missingCount = guards.filter(g => g.complianceStatus === 'Missing').length;
  const healthPercent = ((guards.length - expiredCount - missingCount) / (guards.length || 1)) * 100;

  const handleOverride = () => {
    if (!selectedGuard || !overrideReason) return;
    store.overrideCompliance(selectedGuard.id, overrideReason);
    setGuards(store.getGuards());
    setIsOverrideOpen(false);
    setOverrideReason('');
    toast({ title: "Compliance Overridden", description: `Mandatory blockers cleared for ${selectedGuard.name}.` });
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'Compliant': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 font-black h-5 px-3 rounded-full italic uppercase">Compliant</Badge>;
      case 'Expiring Soon': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-black h-5 px-3 rounded-full italic uppercase">Action Needed</Badge>;
      case 'Expired': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 font-black h-5 px-3 rounded-full italic uppercase">Expired</Badge>;
      case 'Missing': return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-black h-5 px-3 rounded-full italic uppercase">Documents Missing</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredGuards = guards.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Compliance Command</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3 text-primary" /> Authoritative Workforce Eligibility & Licensing
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold uppercase text-[10px] h-12 px-6">
            <Download className="mr-2 h-4 w-4" /> Audit Report
          </Button>
          <Button className="bg-primary text-white rounded-2xl px-8 font-black uppercase italic shadow-xl shadow-primary/20 h-12 tracking-tighter">
            <ShieldCheck className="mr-2 h-5 w-5" /> Policy Config
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100"><ShieldCheck className="h-6 w-6" /></div>
             <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] uppercase italic">System Healthy</Badge>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Health</p>
          <p className="text-4xl font-black text-slate-800 italic mt-1">{healthPercent.toFixed(1)}%</p>
          <Progress value={healthPercent} className="h-1 mt-4 bg-slate-100 [&>div]:bg-green-500" />
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100"><Clock className="h-6 w-6" /></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expiring 30 Days</p>
          <p className="text-4xl font-black text-slate-800 italic mt-1">{expiring30Count}</p>
          <p className="text-[9px] font-bold text-amber-600 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Auto-reminders active</p>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100"><XCircle className="h-6 w-6" /></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Blocked / Expired</p>
          <p className="text-4xl font-black text-red-600 italic mt-1">{expiredCount}</p>
          <p className="text-[9px] font-bold text-red-500 mt-2 uppercase tracking-widest">Hard scheduling block applied</p>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-white/5 text-primary rounded-2xl border border-white/10"><FileText className="h-6 w-6" /></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Missing Records</p>
          <p className="text-4xl font-black text-white italic mt-1">{missingCount}</p>
          <p className="text-[9px] font-bold text-primary mt-2 uppercase tracking-widest">Immediate verification required</p>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
        <Search className="ml-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Search personnel by name or identity ref..." 
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
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Personnel Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">SIA License</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">DBS Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">RTW Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Overall Compliance</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Scheduling</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuards.map((guard) => {
              const siaDays = guard.licenceExpiry ? differenceInDays(parseISO(guard.licenceExpiry), now) : -1;
              const dbsDays = guard.dbsExpiry ? differenceInDays(parseISO(guard.dbsExpiry), now) : -1;
              const isBlocked = (siaDays < 0 || !guard.siaNumber || dbsDays < 0) && !guard.isComplianceOverridden;

              return (
                <TableRow key={guard.id} className="hover:bg-slate-50/50 transition-colors h-24 group">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-colors italic">
                        {guard.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 italic uppercase tracking-tight">{guard.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{guard.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] font-black uppercase italic ${siaDays < 30 ? (siaDays < 0 ? 'text-red-600' : 'text-amber-600') : 'text-slate-600'}`}>
                        {guard.siaNumber || 'MISSING'}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {siaDays >= 0 ? `${siaDays}d Left` : 'EXPIRED'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[8px] font-black border-none uppercase ${dbsDays < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {dbsDays >= 0 ? 'Verified' : 'Invalid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[8px] font-black bg-slate-50 text-slate-500 border-none uppercase italic">
                      {guard.rtwType || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(guard.complianceStatus)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {isBlocked ? (
                        <div className="flex items-center text-red-600 gap-1.5 animate-pulse">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase italic">Blocked</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600 gap-1.5">
                          <Unlock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase italic">Eligible</span>
                        </div>
                      )}
                      {guard.isComplianceOverridden && <span className="text-[7px] font-black text-primary uppercase italic">Manual Override</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-primary rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-3xl shadow-2xl p-2 border-none">
                        <DropdownMenuItem className="rounded-2xl py-3 px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                           <FileText className="h-4 w-4 text-primary" />
                           <span className="text-[11px] font-black uppercase italic tracking-tight">Manage Documents</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedGuard(guard); setIsOverrideOpen(true); }} className="rounded-2xl py-3 px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                           <ShieldAlert className="h-4 w-4 text-primary" />
                           <span className="text-[11px] font-black uppercase italic tracking-tight">Perform Override</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-2xl py-3 px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                           <Calendar className="h-4 w-4 text-primary" />
                           <span className="text-[11px] font-black uppercase italic tracking-tight">View Roster Impact</span>
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

      {/* Compliance Override Dialog */}
      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-8">
            <div className="flex items-center gap-3 mb-2">
               <ShieldAlert className="h-7 w-7 text-primary" />
               <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Security Override</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              Bypassing mandatory scheduling blocks for: {selectedGuard?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-slate-50">
             <div className="p-5 bg-white rounded-3xl border border-dashed text-center shadow-inner space-y-2">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Violation</p>
                <p className="text-sm font-black text-slate-800 uppercase italic">SIA LICENSE EXPIRED OR MISSING</p>
             </div>
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest italic">Authoritative Reason for Override</label>
               <Textarea 
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Required for audit compliance..." 
                className="rounded-2xl border-none shadow-sm min-h-[100px] font-bold text-xs"
               />
             </div>
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 font-black uppercase leading-relaxed italic">Critical: This action will be logged globally. Overriding compliance does not legalise the duty, it only enables scheduling.</p>
             </div>
          </div>
          <DialogFooter className="p-8 bg-slate-100 flex justify-end gap-3">
             <Button variant="outline" onClick={() => setIsOverrideOpen(false)} className="rounded-xl font-bold uppercase text-xs">Cancel</Button>
             <Button onClick={handleOverride} className="bg-primary text-white rounded-xl font-black italic uppercase text-xs px-8 shadow-lg shadow-primary/20">Authorize Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
