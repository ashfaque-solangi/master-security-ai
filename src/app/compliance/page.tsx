
'use client';

import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Search, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download
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
import { guards } from '@/lib/data';
import { format, isPast, isBefore, addDays } from 'date-fns';

export default function CompliancePage() {
  const expiredCount = guards.filter(g => isPast(new Date(g.licenceExpiry))).length;
  const expiringCount = guards.filter(g => {
    const date = new Date(g.licenceExpiry);
    return !isPast(date) && isBefore(date, addDays(new Date(), 30));
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Licensing</h1>
          <p className="text-muted-foreground text-lg">
            Track guard certifications, RTW documents, and scheduling blockers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Audit Report</Button>
          <Button className="bg-accent text-accent-foreground">Configure Standards</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Overall Health</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.8%</div>
            <Progress value={92.8} className="h-1.5 mt-2 bg-muted [&>div]:bg-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Expiring (30 Days)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringCount} Guards</div>
            <p className="text-xs text-muted-foreground mt-1">Automatic reminders sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Expired / Blocked</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredCount} Blocked</div>
            <p className="text-xs text-muted-foreground mt-1">Action required for scheduling</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Certification Registry</CardTitle>
              <CardDescription>Real-time status of all guard operational documents.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search registry..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guard Name</TableHead>
                <TableHead>Licence ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Docs Missing</TableHead>
                <TableHead>Scheduling Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guards.map((guard) => {
                const expiry = new Date(guard.licenceExpiry);
                const isExpired = isPast(expiry);
                const isExpiringSoon = !isExpired && isBefore(expiry, addDays(new Date(), 30));

                return (
                  <TableRow key={guard.id}>
                    <TableCell className="font-medium">{guard.name}</TableCell>
                    <TableCell className="font-mono text-xs">{guard.id}</TableCell>
                    <TableCell>
                      <Badge variant={guard.complianceStatus === 'Compliant' ? 'secondary' : 'destructive'}>
                        {guard.complianceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className={isExpired ? 'text-destructive font-bold' : isExpiringSoon ? 'text-yellow-600' : ''}>
                      {format(expiry, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {guard.docsMissing > 0 ? (
                        <span className="flex items-center text-destructive text-sm gap-1">
                          <AlertTriangle className="h-3 w-3" /> {guard.docsMissing} missing
                        </span>
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isExpired || guard.docsMissing > 0 ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" /> Hard Blocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 w-fit">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Eligible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Review</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
