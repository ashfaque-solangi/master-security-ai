'use client';

import { 
  ShieldAlert, 
  History, 
  Lock, 
  UserCog, 
  Terminal,
  Search,
  Download
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const auditLogs = [
  { id: 'LOG-001', user: 'James Wilson', action: 'Modified Guard Compliance', target: 'GRD-002', timestamp: '2024-02-15 14:22:01', status: 'Success' },
  { id: 'LOG-002', user: 'Alex Thompson', action: 'Changed System Role', target: 'Sarah Miller', timestamp: '2024-02-15 13:45:12', status: 'Success' },
  { id: 'LOG-003', user: 'Sarah Miller', action: 'Deleted Site Record', target: 'SITE-009', timestamp: '2024-02-15 12:10:05', status: 'Warning' },
  { id: 'LOG-004', user: 'Emma Davis', action: 'Added New Platform User', target: 'Robert Fox', timestamp: '2024-02-15 09:30:00', status: 'Success' },
];

export default function SystemAuditPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">System Audit & Security</h1>
          <p className="text-muted-foreground">Immutable logs of platform activity and configuration changes.</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Audit Log</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-900 text-white border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase text-white/50 tracking-widest">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">128</div>
            <p className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Secure SSL v3 Encrypted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Auth Failures (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-500">02</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">IP Range Blocking Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Data Integrity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-500">99.9%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">Daily Backups Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">Operational Audit Trail</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-8 bg-slate-50 border-none h-9 text-xs" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Log ID</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">User</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Action</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Target</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Timestamp</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.id}</TableCell>
                  <TableCell className="font-bold">{log.user}</TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm italic text-muted-foreground">{log.target}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{log.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={log.status === 'Success' ? 'secondary' : 'destructive'} className="text-[10px] px-3">
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
