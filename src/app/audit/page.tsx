
'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldAlert
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { AuditRecord } from '@/lib/types';
import { format } from 'date-fns';

export default function AuditTrailPage() {
  const store = useJsonStore();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<AuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const data = store.getAudits();
    setAudits(data);
    setFilteredAudits(data);
  }, []);

  useEffect(() => {
    let result = audits;
    if (searchTerm) {
      result = result.filter(a => 
        a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.entityId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (actionFilter !== 'ALL') {
      result = result.filter(a => a.action === actionFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.status === statusFilter);
    }
    setFilteredAudits(result);
  }, [searchTerm, actionFilter, statusFilter, audits]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            AUDIT TRAIL
          </h1>
          <p className="text-muted-foreground font-medium">Immutable log of system activities and administrative changes.</p>
        </div>
        <Button variant="outline" className="rounded-full font-bold">
          <Download className="mr-2 h-4 w-4" /> EXPORT LOGS
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-2xl">
        <CardHeader className="border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search actor or description..." 
                className="pl-10 rounded-xl bg-slate-50 border-none h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="rounded-xl bg-slate-50 border-none h-10">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="SHIFT_CREATED">Shift Creations</SelectItem>
                <SelectItem value="GUARD_ASSIGNED">Guard Assignments</SelectItem>
                <SelectItem value="USER_UPDATED">User Profile Changes</SelectItem>
                <SelectItem value="AI_SCHEDULING_RUN">AI Engine Runs</SelectItem>
                <SelectItem value="CONFLICT_DETECTED">Conflict Logs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl bg-slate-50 border-none h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest">
              <Filter className="mr-2 h-3 w-3" /> Advanced Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest px-6 w-[180px]">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Actor</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Entity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right px-6 text-[10px] font-black uppercase tracking-widest">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map((record) => (
                <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedAudit(record)}>
                  <TableCell className="px-6 font-mono text-[11px] text-muted-foreground">
                    {format(new Date(record.timestamp), 'MMM dd, HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{record.userName.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{record.userName}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">{record.userRole}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase py-0 border-none bg-slate-50 text-slate-600">
                      {record.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-primary uppercase">{record.entityType}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{record.entityId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(record.status)}
                      <span className="text-[10px] font-bold uppercase text-slate-500">{record.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAudits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <History className="h-12 w-12" />
                      <p className="font-black italic uppercase text-xl">No Audit Records Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAudit} onOpenChange={(val) => !val && setSelectedAudit(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none">
          <DialogHeader className="p-8 pb-4 bg-slate-900 text-white relative">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              AUDIT LOG DETAIL
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Record ID: {selectedAudit?.id}</DialogDescription>
          </DialogHeader>

          {selectedAudit && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock className="h-3 w-3" /> Event Info</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Action</span>
                      <Badge className="bg-primary">{selectedAudit.action}</Badge>
                    </div>
                    <p className="text-sm font-black text-slate-800">{selectedAudit.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(selectedAudit.timestamp), 'EEEE, MMMM dd yyyy @ HH:mm:ss')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><User className="h-3 w-3" /> Actor context</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border">
                    <p className="text-sm font-black text-slate-800">{selectedAudit.userName}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{selectedAudit.userRole}</p>
                    <p className="text-[9px] text-muted-foreground mt-2 font-mono italic">ID: {selectedAudit.userId}</p>
                  </div>
                </div>
              </div>

              {(selectedAudit.oldValues || selectedAudit.newValues) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Change tracking (Snapshot)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-red-500 ml-1">Previous state</p>
                      <pre className="p-4 bg-slate-100 rounded-xl text-[10px] font-mono overflow-auto max-h-[200px]">
                        {selectedAudit.oldValues ? JSON.stringify(selectedAudit.oldValues, null, 2) : 'N/A'}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-green-500 ml-1">New state</p>
                      <pre className="p-4 bg-slate-100 rounded-xl text-[10px] font-mono overflow-auto max-h-[200px]">
                        {selectedAudit.newValues ? JSON.stringify(selectedAudit.newValues, null, 2) : 'N/A'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedAudit.metadata && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">System Metadata</h3>
                  <pre className="p-4 bg-slate-900 text-green-400 rounded-xl text-[10px] font-mono">
                    {JSON.stringify(selectedAudit.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
