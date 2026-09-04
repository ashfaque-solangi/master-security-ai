
'use client';

import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Download, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Plus
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
import { Progress } from '@/components/ui/progress';
import { invoices } from '@/lib/data';
import { format } from 'date-fns';

export default function Invoicing() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Invoicing & Billing</h1>
          <p className="text-muted-foreground">Reconcile approved timesheets with client charge rates.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full shadow-sm"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md px-6">
            <Plus className="mr-2 h-4 w-4" /> Generate Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-extrabold text-slate-800">$124,500</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={75} className="h-1.5 [&>div]:bg-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-orange-100 p-3 rounded-full text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-extrabold text-slate-800">$45,200</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={40} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overdue</p>
                <p className="text-2xl font-extrabold text-slate-800">$12,800</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={15} className="h-1.5 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">MRR Forecast</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-3xl font-black">$242k</div>
            <div className="flex items-center gap-1 text-[10px] mt-2 text-white/80 font-bold">
              <TrendingUp className="h-3 w-3" /> +12% vs last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Invoice Ledger</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search ledger..." className="pl-8 text-xs h-9 bg-slate-50 border-none" />
              </div>
              <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Invoice ID</th>
                  <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Client / Site</th>
                  <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Issue Date</th>
                  <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Amount</th>
                  <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="text-right p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs">{inv.id}</td>
                    <td className="p-4">
                      <div className="font-bold">{inv.clientName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{inv.siteName}</div>
                    </td>
                    <td className="p-4 text-xs">
                      {mounted ? format(new Date(inv.date), 'MMM dd, yyyy') : '...'}
                    </td>
                    <td className="p-4 font-bold">${inv.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={inv.status === 'Paid' ? 'secondary' : inv.status === 'Overdue' ? 'destructive' : 'outline'} className="rounded-full text-[10px]">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">
                        Details <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
