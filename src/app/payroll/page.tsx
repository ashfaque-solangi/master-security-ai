'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Download,
  Filter,
  CheckCircle2,
  FileText
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
import { payrollRecords } from '@/lib/data';

export default function PayrollPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Payroll & Compensation</h1>
          <p className="text-muted-foreground text-lg">
            Manage timesheet approvals, gross pay calculations, and bank transfers.
          </p>
        </div>
        <Button className="bg-primary text-white">
          <Download className="mr-2 h-4 w-4" /> Export for Xero
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="command-gradient text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Total Payroll (Period)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">$242,500.00</div>
            <div className="flex items-center gap-1 text-xs mt-2 text-white/60">
              <Clock className="h-3 w-3" /> Due in 4 days
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">12 Guards</div>
            <p className="text-xs text-muted-foreground mt-1">Requires supervisor review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Operational Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-600">32.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Avg. charge vs pay rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roster-to-Payroll Summary</CardTitle>
              <CardDescription>Verified hours from field attendance logs.</CardDescription>
            </div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Period</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guard Name</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-bold">{record.guardName}</TableCell>
                  <TableCell>{record.period}</TableCell>
                  <TableCell className="font-mono">{record.hours}h</TableCell>
                  <TableCell className="font-bold text-slate-800">${record.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Paid' ? 'secondary' : 'outline'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View Payslip</Button>
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