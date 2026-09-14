'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Clock, TrendingUp, Search, Plus, 
  Filter, MoreHorizontal, Receipt, Building, Calendar, AlertCircle,
  ChevronRight, DollarSign, Target, Scale, Zap, Info,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJsonStore } from '@/lib/store';
import { Contract, Client, Site } from '@/lib/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function ContractsLedger() {
  const store = useJsonStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setContracts(store.getContracts());
    setClients(store.getClients());
    setSites(store.getSites());
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 italic uppercase italic">Contract Ledger</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Service Level Agreements & Billing Protocols</p>
        </div>
        <Button className="bg-primary text-white rounded-2xl h-12 px-8 font-black text-xs uppercase italic shadow-xl shadow-primary/20 tracking-tighter">
          <Plus className="mr-2 h-5 w-5" /> Execute New Agreement
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><ShieldCheck className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active SLAS</p>
              <p className="text-3xl font-black text-slate-800 italic">{contracts.filter(c => c.status === 'Active').length}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform"><Clock className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Expiring 60d</p>
              <p className="text-3xl font-black text-slate-800 italic">02</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Annual Value</p>
              <p className="text-3xl font-black text-slate-800 italic">$4.2M</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform"><AlertCircle className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">SLA Breaches</p>
              <p className="text-3xl font-black text-slate-800 italic">0</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between border-b">
           <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search references..." className="pl-10 h-10 w-64 rounded-xl border-none bg-white shadow-sm font-bold text-xs" />
              </div>
              <Button variant="outline" className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border-slate-200">
                <Filter className="mr-2 h-3.5 w-3.5" /> TYPE
              </Button>
           </div>
        </CardHeader>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest h-14">Agreement Reference</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Billing</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Labor Cost</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Effective Period</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map(contract => {
              const client = clients.find(c => c.id === contract.clientId);
              return (
                <TableRow key={contract.id} onClick={() => setSelectedContract(contract)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer h-24">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 italic uppercase italic tracking-tight">{contract.contractNumber}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{client?.name || 'Private Client'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs font-black text-green-600 italic">${contract.billingRate}/hr</TableCell>
                  <TableCell className="text-center font-mono text-xs font-black text-slate-600 italic">${contract.guardRate}/hr</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tighter">{format(new Date(contract.startDate), 'MMM dd, yyyy')}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">UNTIL {format(new Date(contract.endDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-[8px] font-black h-5 px-3 rounded-full border-none shadow-sm ${
                        contract.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {contract.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 text-right">
                     <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-primary rounded-xl transition-all"><ChevronRight className="h-5 w-5" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={(val) => !val && setSelectedContract(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-10 relative">
            <div className="absolute top-10 right-10 flex gap-4">
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">SLA Protocol</p>
                  <p className="text-xl font-black italic text-primary uppercase">{selectedContract?.sla}</p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                  <Scale className="w-6 h-6" />
               </div>
            </div>
            <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter">{selectedContract?.title}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Agreement Ref: {selectedContract?.contractNumber}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="rates" className="bg-white">
            <TabsList className="bg-slate-50 w-full justify-start h-16 px-10 border-b rounded-none gap-8">
              <TabsTrigger value="rates" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Financial Matrix</TabsTrigger>
              <TabsTrigger value="sla" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">SLA & Penalties</TabsTrigger>
              <TabsTrigger value="kpis" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">KPI Targets</TabsTrigger>
              <TabsTrigger value="terms" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Legal Terms</TabsTrigger>
            </TabsList>

            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <TabsContent value="rates" className="m-0 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><DollarSign className="h-3 w-3 text-primary" /> Master Charge Rates</h4>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-dashed flex items-center justify-between">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Standard Hourly Charge</p>
                            <p className="text-3xl font-black italic text-slate-800">${selectedContract?.billingRate}/HR</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Overtime Multiplier</p>
                            <p className="text-xl font-black italic text-primary">1.5X</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Zap className="h-3 w-3 text-primary" /> Guard Labor Protocol</h4>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-dashed flex items-center justify-between">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Standard Pay Rate</p>
                            <p className="text-3xl font-black italic text-slate-800">${selectedContract?.guardRate}/HR</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Gross Margin</p>
                            <p className="text-xl font-black italic text-green-600">32%</p>
                         </div>
                      </div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="sla" className="m-0 space-y-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <BadgeCheck className="h-5 w-5 text-primary" />
                       <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Contractual Service Obligations</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed space-y-2">
                          <p className="text-[9px] font-black text-primary uppercase italic tracking-widest">SLA PROTOCOL</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed italic">{selectedContract?.sla}</p>
                       </div>
                       <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 border-dashed space-y-2">
                          <p className="text-[9px] font-black text-red-600 uppercase italic tracking-widest flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> PENALTY CLAUSES</p>
                          <p className="text-sm font-bold text-red-800 leading-relaxed italic">{selectedContract?.penalties || 'No automatic financial penalties configured.'}</p>
                       </div>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="kpis" className="m-0 space-y-6">
                 <div className="grid md:grid-cols-2 gap-4">
                    {selectedContract?.kpis.map((kpi, idx) => (
                      <div key={idx} className="p-5 border rounded-2xl flex items-center justify-between group hover:border-primary transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-xl bg-slate-50 border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"><Target className="h-4 w-4" /></div>
                            <span className="text-xs font-black uppercase italic tracking-tight text-slate-700">{kpi}</span>
                         </div>
                         <Badge className="bg-green-100 text-green-600 border-none font-black text-[8px] h-4">TARGET: 98%</Badge>
                      </div>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="terms" className="m-0">
                 <div className="p-8 bg-slate-50 rounded-[2rem] border border-dashed text-xs font-medium text-slate-500 leading-relaxed italic">
                    {selectedContract?.terms || 'Standard legal terms and conditions apply as per the executed master service agreement. Refer to physical documentation for detailed liabilities and insurance protocols.'}
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
