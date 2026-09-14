
'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Clock, TrendingUp, Search, Plus, 
  Filter, MoreHorizontal, Receipt, Building, Calendar, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJsonStore } from '@/lib/store';
import { Contract } from '@/lib/types';
import { format } from 'date-fns';

export default function ContractsLedger() {
  const store = useJsonStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setContracts(store.getContracts());
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Contract Ledger</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Registry & Service Level Agreements</p>
        </div>
        <Button className="bg-primary text-white rounded-xl h-10 px-6 font-black text-xs uppercase italic shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> NEW AGREEMENT
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><ShieldCheck className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Agreements</p>
              <p className="text-3xl font-black text-slate-800 italic">{contracts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100"><Clock className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expiring 60d</p>
              <p className="text-3xl font-black text-slate-800 italic">02</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100"><TrendingUp className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Annual Value</p>
              <p className="text-3xl font-black text-slate-800 italic">$4.2M</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100"><AlertCircle className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SLA Breaches</p>
              <p className="text-3xl font-black text-slate-800 italic">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 px-8 py-6 flex flex-row items-center justify-between">
           <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Master Contracts List</CardTitle>
           <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ref or client..." className="pl-10 border-none bg-white text-xs h-9 shadow-sm" />
           </div>
        </CardHeader>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Agreement Reference</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Billing Rate</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Pay Rate</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Period</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map(contract => (
              <TableRow key={contract.id} className="hover:bg-slate-50 transition-colors group">
                <TableCell className="px-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><FileText className="h-5 w-5 text-slate-400" /></div>
                    <div>
                      <p className="text-sm font-black text-slate-800 italic">{contract.contractNumber}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SLA: {contract.sla}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm font-black text-slate-600">${contract.billingRate}/hr</TableCell>
                <TableCell className="font-mono text-sm font-black text-slate-600">${contract.guardRate}/hr</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-800">{format(new Date(contract.startDate), 'MMM dd, yyyy')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black">UNTIL {format(new Date(contract.endDate), 'MMM dd, yyyy')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-600 border-none font-black text-[9px] h-5 rounded-full">{contract.status}</Badge>
                </TableCell>
                <TableCell className="px-8 text-right">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-primary"><MoreHorizontal className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
