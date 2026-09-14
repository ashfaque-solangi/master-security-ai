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
  ClipboardList,
  Building,
  Info,
  Hash,
  QrCode,
  Map as MapIcon,
  Navigation
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
import { Site, Severity, Shift, Client, MockDocument, PatrolCheckpoint, PatrolRoute } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SitesPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([]);
  const [routes, setRoutes] = useState<PatrolRoute[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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

  // Checkpoint Form
  const [cpName, setCpName] = useState('');
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'QR' | 'NFC'>('QR');

  // Route Form
  const [routeName, setRouteName] = useState('');
  const [routeDuration, setRouteDuration] = useState(30);
  const [routeCheckpoints, setRouteCheckpoints] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setSites(store.getSites());
    setShifts(store.getShifts());
    setClients(store.getClients());
    setCheckpoints(store.getCheckpoints());
    setRoutes(store.getRoutes());
  };

  const handleAdd = () => {
    if (!name || !clientId || !code) {
      toast({ title: 'Validation Error', description: 'Name, Client and Site Code are mandatory.', variant: 'destructive' });
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
      toast({ title: 'Site Created', description: `${name} (${code}) has been operationalized.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setCode('');
    setRisk('Low');
    setClientId('');
  };

  const handleAddCheckpoint = () => {
    if (!selectedSite || !cpName || !cpCode) return;
    const cp: PatrolCheckpoint = {
      id: `CP-${Date.now()}`,
      organizationId: selectedSite.organizationId,
      siteId: selectedSite.id,
      name: cpName,
      code: cpCode,
      type: cpType,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.addCheckpoint(cp);
    setCheckpoints(store.getCheckpoints());
    setCpName('');
    setCpCode('');
    toast({ title: "Checkpoint Added", description: `QR/NFC point ${cpName} registered for this site.` });
  };

  const handleAddRoute = () => {
    if (!selectedSite || !routeName || routeCheckpoints.length === 0) return;
    const route: PatrolRoute = {
      id: `ROU-${Date.now()}`,
      organizationId: selectedSite.organizationId,
      siteId: selectedSite.id,
      name: routeName,
      code: `ROU-${Date.now().toString().slice(-4)}`,
      status: 'Active',
      estimatedDuration: routeDuration,
      checkpointIds: routeCheckpoints,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.addRoute(route);
    setRoutes(store.getRoutes());
    setRouteName('');
    setRouteCheckpoints([]);
    toast({ title: "Route Created", description: `Patrol route ${routeName} with ${routeCheckpoints.length} points defined.` });
  };

  if (!isMounted) return null;

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSiteOperationalData = (siteId: string) => {
    const siteShifts = shifts.filter(s => s.siteId === siteId);
    const assignedCount = siteShifts.reduce((acc, s) => acc + (s.assignments?.filter(a => a.status === 'Assigned')?.length || 0), 0);
    return { shifts: siteShifts, guardCount: assignedCount };
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
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-xl px-6 font-black uppercase text-[10px] italic h-10">
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-xl px-6 font-black uppercase text-[10px] italic h-10">
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
                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Register a new physical location for security deployment.</DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Site Title</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northgate Mall" className="rounded-xl h-11" />
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unique Site Code</label>
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deployment Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Command Way, Lahore" className="rounded-xl h-11" />
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
          placeholder="Search site identity, code or client..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Filter className="h-4 w-4" /></Button>
      </div>

      {viewMode === 'table' ? (
        <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 h-14">Identity / Code</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Client Partner</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Human-Readable Shifts</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Guards</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map(site => {
                const { shifts: siteShifts, guardCount } = getSiteOperationalData(site.id);
                return (
                  <TableRow key={site.id} onClick={() => setSelectedSite(site)} className="hover:bg-slate-50/50 transition-colors cursor-pointer h-20">
                    <TableCell className="px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 italic uppercase tracking-tight">{site.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">{site.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-slate-600 text-xs italic uppercase">{site.clientName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {siteShifts.slice(0, 2).map(s => (
                          <Badge key={s.id} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[7px] font-black h-4 px-2 italic uppercase">
                            {s.name}
                          </Badge>
                        ))}
                        {siteShifts.length > 2 && <Badge variant="outline" className="bg-slate-50 border-none text-[7px] font-black h-4 px-2">+{siteShifts.length - 2} MORE</Badge>}
                        {siteShifts.length === 0 && <span className="text-[8px] font-bold text-slate-300 italic uppercase">No Scheduled Shifts</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[8px] font-black uppercase rounded-full px-3 h-5 border-none shadow-sm ${
                        site.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {site.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-black text-slate-800 text-lg italic">{guardCount}</TableCell>
                    <TableCell className="text-right px-8">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-primary rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSites.map((site) => {
            const { shifts: siteShifts, guardCount } = getSiteOperationalData(site.id);
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
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Deployment Status</p>
                      <p className="text-xs font-black text-slate-700 truncate italic uppercase">{siteShifts.length} ACTIVE UNITS</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Personnel Distribution</span>
                      <span className="text-sm font-black text-slate-800 italic">{guardCount} ASSIGNED OFFICERS</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Site Detail Dialog */}
      <Dialog open={!!selectedSite} onOpenChange={(val) => !val && setSelectedSite(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-10 relative">
            <div className="absolute top-10 right-10 flex gap-6">
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Site Reference</p>
                    <p className="text-xl font-black italic text-primary uppercase">{selectedSite?.code}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="text-primary w-7 h-7" />
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
              <TabsTrigger value="shifts" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Deployed Shifts</TabsTrigger>
              <TabsTrigger value="patrols" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Patrol & Routes</TabsTrigger>
              <TabsTrigger value="guards" className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase text-[10px] tracking-widest">Personnel Ledger</TabsTrigger>
            </TabsList>

            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <TabsContent value="overview" className="m-0 space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-4 shadow-inner">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> Availability</p>
                     <p className="text-2xl font-black italic text-slate-800">{selectedSite?.operatingHours}</p>
                  </Card>
                  <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-4 shadow-inner">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Shield className="h-3 w-3 text-primary" /> Risk Profile</p>
                     <p className="text-2xl font-black italic text-slate-800 uppercase">{selectedSite?.riskLevel} RISK</p>
                  </Card>
                  <Card className="border-none bg-slate-50 p-6 rounded-3xl space-y-4 shadow-inner">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users className="h-3 w-3 text-primary" /> Performance Index</p>
                     <p className="text-2xl font-black italic text-slate-800">{selectedSite?.healthScore}%</p>
                  </Card>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-3 italic">Authoritative Post Orders</h4>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-dashed text-sm font-medium text-slate-600 leading-relaxed italic shadow-inner">
                    {selectedSite?.instructions || 'Standard operational procedures apply. All personnel must log arrival and departure via verified GPS terminal.'}
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
                          {format(new Date(shift.startTime), 'MMM dd, HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')} • {shift.code}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-[8px] font-black h-6 px-4 rounded-full uppercase italic ${
                      shift.status === 'Draft' ? 'bg-slate-200 text-slate-600' :
                      shift.status === 'Open' ? 'bg-red-100 text-red-600' :
                      'bg-primary text-white shadow-sm'
                    }`}>{shift.status}</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="patrols" className="m-0 space-y-10">
                 {/* Checkpoints Sub-module */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Site Checkpoints (QR/NFC)</h4>
                       <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 rounded-xl text-[9px] font-black uppercase italic"><Plus className="h-3 w-3 mr-1.5" /> Add Point</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-[2.5rem]">
                             <DialogHeader>
                                <DialogTitle className="text-xl font-black italic uppercase">Add Checkpoint</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase text-slate-400">Register a new physical verification point.</DialogDescription>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Point Name</label>
                                   <Input value={cpName} onChange={(e) => setCpName(e.target.value)} placeholder="e.g. Server Room Entrance" className="rounded-xl h-11" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Code</label>
                                      <Input value={cpCode} onChange={(e) => setCpCode(e.target.value)} placeholder="QR-001" className="rounded-xl h-11" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Point Type</label>
                                      <Select value={cpType} onValueChange={(v: any) => setCpType(v)}>
                                         <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                         <SelectContent>
                                            <SelectItem value="QR">QR Code</SelectItem>
                                            <SelectItem value="NFC">NFC Tag</SelectItem>
                                         </SelectContent>
                                      </Select>
                                   </div>
                                </div>
                             </div>
                             <DialogFooter>
                                <Button onClick={handleAddCheckpoint} className="bg-primary text-white rounded-xl px-12 font-black italic">Save Checkpoint</Button>
                             </DialogFooter>
                          </DialogContent>
                       </Dialog>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {checkpoints.filter(c => c.siteId === selectedSite?.id).map(cp => (
                         <div key={cp.id} className="p-4 bg-slate-50 border rounded-2xl space-y-2 relative group hover:bg-white hover:shadow-md transition-all">
                            <QrCode className="h-5 w-5 text-primary mb-1" />
                            <p className="text-[10px] font-black text-slate-800 uppercase italic truncate">{cp.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{cp.code} • {cp.type}</p>
                         </div>
                       ))}
                       {checkpoints.filter(c => c.siteId === selectedSite?.id).length === 0 && (
                         <div className="col-span-full py-12 text-center border border-dashed rounded-[2rem] text-slate-300 italic font-medium">No checkpoints configured for this location.</div>
                       )}
                    </div>
                 </div>

                 {/* Routes Sub-module */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patrol Routes</h4>
                       <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 rounded-xl text-[9px] font-black uppercase italic"><Plus className="h-3 w-3 mr-1.5" /> Define Route</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-[2.5rem] max-w-md">
                             <DialogHeader>
                                <DialogTitle className="text-xl font-black italic uppercase">Patrol Route Builder</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase text-slate-400">Define the ordered sequence of checkpoints.</DialogDescription>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Route Title</label>
                                   <Input value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="e.g. Night Perimeter" className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Select Ordered Checkpoints</label>
                                   <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl">
                                      {checkpoints.filter(c => c.siteId === selectedSite?.id).map(cp => (
                                        <div key={cp.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                                           <span className="text-[10px] font-bold uppercase">{cp.name}</span>
                                           <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => {
                                              if (routeCheckpoints.includes(cp.id)) {
                                                setRouteCheckpoints(routeCheckpoints.filter(id => id !== cp.id));
                                              } else {
                                                setRouteCheckpoints([...routeCheckpoints, cp.id]);
                                              }
                                            }}
                                            className="h-6 px-2 text-[8px] font-black uppercase"
                                           >
                                              {routeCheckpoints.includes(cp.id) ? "Remove" : "Add"}
                                           </Button>
                                        </div>
                                      ))}
                                   </div>
                                   <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                      <p className="text-[8px] font-black uppercase text-slate-400 mb-2">Build Sequence:</p>
                                      <div className="flex flex-wrap gap-2">
                                         {routeCheckpoints.map((id, idx) => (
                                           <Badge key={id} className="bg-primary text-white text-[8px] font-black italic">{idx + 1}. {checkpoints.find(c => c.id === id)?.name}</Badge>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <DialogFooter>
                                <Button onClick={handleAddRoute} className="bg-primary text-white rounded-xl px-12 font-black italic">Save Route</Button>
                             </DialogFooter>
                          </DialogContent>
                       </Dialog>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {routes.filter(r => r.siteId === selectedSite?.id).map(route => (
                         <div key={route.id} className="p-6 bg-slate-50 border rounded-[1.5rem] flex items-center justify-between hover:bg-white transition-all group">
                            <div className="flex items-center gap-5">
                               <div className="h-12 w-12 rounded-2xl bg-white border flex items-center justify-center text-primary shadow-sm"><Navigation className="h-6 w-6" /></div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{route.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{route.checkpointIds.length} Points • Sequence Validated</p>
                               </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
                         </div>
                       ))}
                       {routes.filter(r => r.siteId === selectedSite?.id).length === 0 && (
                         <div className="py-12 text-center border border-dashed rounded-[2rem] text-slate-300 italic font-medium">No patrol routes defined.</div>
                       )}
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="guards" className="m-0 space-y-4">
                 {shifts.filter(s => s.siteId === selectedSite?.id).flatMap(s => s.assignments || []).map(asg => (
                    <div key={asg.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center font-black text-slate-400 text-xs shadow-inner">
                             {(asg.guardName || '?').charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{asg.guardName}</p>
                             <p className="text-[9px] font-bold text-primary uppercase tracking-widest italic">{asg.rolePerformed?.replace(/_/g, ' ')}</p>
                          </div>
                       </div>
                       <Badge variant="outline" className="text-[8px] font-black px-4 h-6 italic rounded-xl">{asg.status}</Badge>
                    </div>
                 ))}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
