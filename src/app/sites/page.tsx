'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Building2, 
  Users, 
  Activity,
  Plus,
  Trash2,
  Pencil,
  LayoutGrid,
  List,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Site, Severity, Shift, Client, MockDocument } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SitesPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [documents, setDocuments] = useState<MockDocument[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Form States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const [risk, setRisk] = useState<Severity>('Low');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setSites(store.getSites());
    setShifts(store.getShifts());
    setClients(store.getClients());
    setDocuments(store.getDocuments());
  };

  const handleAdd = () => {
    if (!name || !clientId || !code) {
      toast({ title: 'Missing Info', description: 'Name, Client and Code are required.', variant: 'destructive' });
      return;
    }
    const client = clients.find(c => c.id === clientId);
    const site: Site = {
      id: `SITE-${Date.now()}`,
      organizationId: store.getCurrentUser()?.organizationId || 'ORG-001',
      name,
      clientId,
      clientName: client?.name || 'Private Client',
      address,
      riskLevel: risk,
      activeGuardsCount: 0,
      openShifts: 0,
      healthScore: 100,
      revenuePerMonth: 5000,
      code,
      contactInfo: '',
      status: 'Active',
      operatingHours: '24/7',
      requiredGuardCount: 1,
      requiredRoles: ['SECURITY_GUARD'],
      requiredQualifications: [],
      requiredSkills: []
    };
    try {
      store.addSite(site);
      refreshData();
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Site Created', description: `${name} has been operationalized.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = (id: string) => {
    try {
      store.deleteSite(id);
      refreshData();
      toast({ title: 'Site Archived', description: 'Site has been removed from active deployment.' });
    } catch (e: any) {
      toast({ title: 'Deletion Blocked', description: e.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setCode('');
    setRisk('Low');
    setClientId('');
  };

  if (!isMounted) return null;

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSiteStats = (siteId: string) => {
    const siteShifts = shifts.filter(s => s.siteId === siteId);
    const active = siteShifts.filter(s => s.status === 'In Progress').length;
    const guards = siteShifts.flatMap(s => s.assignments?.filter(a => a.status === 'On Site').map(a => a.guardName) || []);
    return { active, guards: Array.from(new Set(guards)) };
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Operational Blueprint</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Site Configurations, Post Orders & Site Health</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl h-12 shadow-inner">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-xl px-6 font-black uppercase text-[10px] italic h-10"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-xl px-6 font-black uppercase text-[10px] italic h-10"
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4 mr-2" /> Table
            </Button>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white rounded-2xl px-8 font-black uppercase italic shadow-xl shadow-primary/20 h-12 tracking-tighter">
                <Plus className="mr-2 h-5 w-5" /> Deploy New Site
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-slate-900 text-white p-8">
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Initialize Site</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Register a new operational location in the platform.</DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Site Title</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Delta Warehouse" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Parent Client</label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select Client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Site Code (Unique)</label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SITE-LHR-001" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Risk Profile</label>
                    <Select value={risk} onValueChange={(v) => setRisk(v as Severity)}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Risk</SelectItem>
                        <SelectItem value="Medium">Medium Risk</SelectItem>
                        <SelectItem value="High">High Risk</SelectItem>
                        <SelectItem value="Critical">Critical Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Physical Deployment Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Command Way, HQ" className="rounded-xl h-11" />
                </div>
              </div>
              <DialogFooter className="p-8 bg-slate-50">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl px-8 font-bold">CANCEL</Button>
                <Button onClick={handleAdd} className="bg-primary text-white rounded-xl px-12 font-black italic shadow-lg shadow-primary/10">CREATE SITE</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
        <Search className="ml-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Filter operational units by name, code or client..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Filter className="h-4 w-4" /></Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSites.map((site) => {
            const stats = getSiteStats(site.id);
            return (
              <Card key={site.id} onClick={() => setSelectedSite(site)} className="group border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden bg-white rounded-[2rem]">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                  site.riskLevel === 'Critical' ? 'bg-red-600' :
                  site.riskLevel === 'High' ? 'bg-orange-500' :
                  'bg-primary'
                }`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className={`text-[8px] font-black uppercase rounded-full px-3 h-5 border-none shadow-sm ${
                      site.riskLevel === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {site.riskLevel} RISK
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-xl font-black italic tracking-tighter text-slate-800 uppercase">{site.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="truncate">{site.address}</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Assigned Client</p>
                      <p className="text-xs font-black text-slate-700 truncate italic uppercase">{site.clientName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Operational Health</p>
                      <div className="flex items-center gap-1.5">
                        <Activity className={`h-3 w-3 ${site.healthScore > 90 ? 'text-green-500' : 'text-amber-500'}`} />
                        <p className={`text-xs font-black italic ${site.healthScore > 90 ? 'text-green-600' : 'text-amber-600'}`}>
                          {site.healthScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Posting</span>
                      <span className="text-sm font-black text-slate-800 italic">{stats.active} ACTIVE</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 h-14">Operational Unit</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Client Partner</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Risk Level</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Health</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map(site => (
                <TableRow key={site.id} onClick={() => setSelectedSite(site)} className="hover:bg-slate-50/50 transition-colors cursor-pointer h-20">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 italic uppercase italic tracking-tight">{site.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{site.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-600 text-xs italic uppercase">{site.clientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[8px] font-black uppercase rounded-full px-3 h-5 border-none shadow-sm ${
                      site.riskLevel === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {site.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-black italic ${site.healthScore > 90 ? 'text-green-600' : 'text-amber-600'}`}>
                      {site.healthScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-8">
                     <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(site.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedSite} onOpenChange={(val) => !val && setSelectedSite(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-10 relative">
            <div className="absolute top-10 right-10 flex gap-6">
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Site Code</p>
                    <p className="text-xl font-black italic text-primary uppercase">{selectedSite?.code}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ShieldCheck className="text-primary w-6 h-6" />
                </div>
            </div>
            <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter">{selectedSite?.name}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" /> {selectedSite?.address}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="bg-white">
            <TabsList className="bg-slate-50 w-full justify-start h-16 px-10 border-b rounded-none gap-8">
              <TabsTrigger value="overview" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Site Intelligence</TabsTrigger>
              <TabsTrigger value="shifts" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Post Shifts</TabsTrigger>
              <TabsTrigger value="requirements" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Qualifications</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">SOP & Orders</TabsTrigger>
            </TabsList>

            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <TabsContent value="overview" className="m-0 space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-4 shadow-inner">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> Operating Window</p>
                     <p className="text-2xl font-black italic text-slate-800">{selectedSite?.operatingHours}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Contractual Deployment Coverage</p>
                  </Card>
                  <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-4 shadow-inner">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Shield className="h-3 w-3 text-primary" /> Security Profile</p>
                     <p className="text-2xl font-black italic text-slate-800 uppercase">{selectedSite?.riskLevel} RISK</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Authoritative Threat Assessment</p>
                  </Card>
                  <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-4 shadow-inner">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><ClipboardList className="h-3 w-3 text-primary" /> Guard Quota</p>
                     <p className="text-2xl font-black italic text-slate-800">{selectedSite?.requiredGuardCount} OFFICERS</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Base Personnel Requirement</p>
                  </Card>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-3">Operational Instructions</h4>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-dashed text-sm font-medium text-slate-600 leading-relaxed italic">
                    {selectedSite?.instructions}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shifts" className="m-0 space-y-4">
                 {shifts.filter(s => s.siteId === selectedSite?.id).map(shift => (
                    <div key={shift.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                       <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm">
                             <Clock className="h-6 w-6" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{shift.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                               {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')} • {shift.code}
                             </p>
                          </div>
                       </div>
                       <Badge className="bg-slate-200 text-slate-600 font-black h-6 px-4 rounded-full text-[10px] uppercase">{shift.status}</Badge>
                    </div>
                 ))}
              </TabsContent>

              <TabsContent value="requirements" className="m-0 space-y-8">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users className="h-3 w-3 text-primary" /> Authorized Roles</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedSite?.requiredRoles.map(r => (
                            <Badge key={r} className="bg-slate-900 text-white font-black italic px-4 py-1.5 rounded-xl uppercase text-[9px]">{r.replace(/_/g, ' ')}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-primary" /> Mandatory Qualifications</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedSite?.requiredQualifications.map(q => (
                            <Badge key={q} variant="outline" className="border-primary text-primary font-black italic px-4 py-1.5 rounded-xl uppercase text-[9px]">{q.replace(/_/g, ' ')}</Badge>
                          ))}
                       </div>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="documents" className="m-0">
                 <div className="p-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest opacity-40">Post orders and documents are available in the Site Registry.</p>
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
