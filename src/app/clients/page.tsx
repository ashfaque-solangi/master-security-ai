'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Pencil,
  Mail,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  MoreVertical,
  Briefcase,
  FileText,
  BadgeCheck
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Client, Site, Contract } from '@/lib/types';
import { format } from 'date-fns';

export default function ClientManagement() {
  const store = useJsonStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setClients(store.getClients());
    setSites(store.getSites());
    setContracts(store.getContracts());
  };

  const handleAdd = () => {
    if (!name || !email) return;
    const client: Client = {
      id: `CL-${Date.now()}`,
      organizationId: store.getCurrentUser()?.organizationId || 'ORG-001',
      name,
      contactPerson,
      email,
      phone,
      status: 'Active',
      industry,
      address,
      clientCode: `C-${Math.floor(Math.random() * 900) + 100}`
    };
    store.addClient(client);
    refreshData();
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setIndustry('');
    setAddress('');
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Enterprise Accounts</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Master Client Registry & Contractual Relationship Management</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white rounded-2xl px-8 font-black uppercase italic shadow-xl shadow-primary/20 h-12 tracking-tighter">
              <Plus className="mr-2 h-5 w-5" /> Register Client
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="bg-slate-900 text-white p-8">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Onboard Enterprise Partner</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Initialize a new master client relationship.</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Company Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" className="rounded-xl h-11 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Industry Sector</label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Finance" className="rounded-xl h-11 border-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Liaison</label>
                  <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full Name" className="rounded-xl h-11 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Terminal</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@acme.com" className="rounded-xl h-11 border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Corporate Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Headquarters Location" className="rounded-xl h-11 border-slate-200" />
              </div>
            </div>
            <DialogFooter className="p-8 bg-slate-50">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl px-8 font-bold">CANCEL</Button>
              <Button onClick={handleAdd} className="bg-primary text-white rounded-xl px-12 font-black italic shadow-lg shadow-primary/10">BEGIN ONBOARDING</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white p-6 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Building2 className="h-6 w-6" /></div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Accounts</p>
            <p className="text-3xl font-black text-slate-800 italic">{clients.filter(c => c.status === 'Active').length}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white p-6 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform"><ShieldCheck className="h-6 w-6" /></div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Client Sites</p>
            <p className="text-3xl font-black text-slate-800 italic">{sites.length}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white p-6 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><Briefcase className="h-6 w-6" /></div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Contracts</p>
            <p className="text-3xl font-black text-slate-800 italic">{contracts.filter(c => c.status === 'Active').length}</p>
          </div>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white p-6 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:scale-110 transition-transform"><BadgeCheck className="h-6 w-6" /></div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Service Health</p>
            <p className="text-3xl font-black text-green-600 italic">98.4%</p>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
        <CardHeader className="bg-slate-50/50 p-8 border-b flex flex-row items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Filter registry..." className="pl-10 h-10 w-64 rounded-xl border-none bg-white shadow-sm font-bold text-xs" />
              </div>
              <Button variant="outline" className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border-slate-200">
                <Filter className="mr-2 h-3.5 w-3.5" /> STATUS
              </Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-8 h-14 text-[10px] font-black uppercase tracking-widest">Corporate Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Industry</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Communications</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Managed Sites</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(client => {
                const clientSites = sites.filter(s => s.clientId === client.id);
                return (
                  <TableRow key={client.id} onClick={() => setSelectedClient(client)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group h-24">
                    <TableCell className="px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center font-black text-slate-400 text-sm shadow-sm group-hover:text-primary transition-colors">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 italic uppercase italic tracking-tight">{client.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {client.clientCode}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-black text-[8px] h-5 px-3 rounded-full italic uppercase">
                        {client.industry}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                          <Mail className="h-3 w-3 text-primary" /> {client.email}
                        </span>
                        <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                          <Phone className="h-3 w-3 text-slate-300" /> {client.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-slate-800 text-lg italic">{clientSites.length}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[8px] font-black h-5 px-3 rounded-full border-none shadow-sm ${
                        client.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {client.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                       <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-primary rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(val) => !val && setSelectedClient(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-10 relative">
            <div className="absolute top-10 right-10">
                <Badge className="bg-primary text-white font-black italic px-6 py-1 rounded-full uppercase text-[10px]">{selectedClient?.industry}</Badge>
            </div>
            <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter">{selectedClient?.name}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" /> {selectedClient?.address}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="sites" className="bg-white">
            <TabsList className="bg-slate-50 w-full justify-start h-16 px-10 border-b rounded-none gap-8">
              <TabsTrigger value="sites" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Managed Sites</TabsTrigger>
              <TabsTrigger value="contracts" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Service Agreements</TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Account Intelligence</TabsTrigger>
            </TabsList>

            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <TabsContent value="sites" className="m-0 space-y-4">
                 {sites.filter(s => s.clientId === selectedClient?.id).map(site => (
                    <div key={site.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                       <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                             <Building className="h-6 w-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{site.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{site.address}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                             <Badge variant="outline" className="bg-green-50 text-green-600 border-none text-[8px] h-4">ACTIVE</Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary"><ArrowUpRight className="h-5 w-5" /></Button>
                       </div>
                    </div>
                 ))}
              </TabsContent>

              <TabsContent value="contracts" className="m-0 space-y-4">
                 {contracts.filter(c => c.clientId === selectedClient?.id).map(contract => (
                    <div key={contract.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center text-slate-400">
                             <FileText className="h-6 w-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{contract.contractNumber}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expires: {format(new Date(contract.endDate), 'MMM yyyy')}</p>
                          </div>
                       </div>
                       <Badge className="bg-primary text-white font-black italic uppercase text-[9px] h-6 px-4">{contract.status}</Badge>
                    </div>
                 ))}
              </TabsContent>

              <TabsContent value="intelligence" className="m-0 space-y-8">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Primary Point of Contact</p>
                       <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-2">
                          <p className="text-lg font-black italic text-slate-800 uppercase tracking-tighter">{selectedClient?.contactPerson}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedClient?.email}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedClient?.phone}</p>
                       </Card>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Account Notes</p>
                       <div className="p-6 bg-slate-50 rounded-3xl text-xs font-medium text-slate-500 leading-relaxed italic">
                          {selectedClient?.notes || 'No administrative notes recorded for this entity.'}
                       </div>
                    </div>
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
