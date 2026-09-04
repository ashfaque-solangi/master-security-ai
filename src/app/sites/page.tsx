'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Building2, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Trash2,
  Pencil,
  Activity,
  UserCheck
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Site, Severity, Shift } from '@/lib/types';

export default function SitesPage() {
  const store = useJsonStore();
  const [sites, setSites] = useState<Site[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [risk, setRisk] = useState<Severity>('Low');
  const [client, setClient] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setSites(store.getSites());
    setShifts(store.getShifts());
  }, []);

  const handleAdd = () => {
    if (!name) return;
    const site: Site = {
      id: `SITE-${Math.floor(Math.random() * 1000)}`,
      name,
      clientId: `CL-${Math.floor(Math.random() * 100)}`,
      clientName: client || 'Private Client',
      address,
      riskLevel: risk,
      activeGuardsCount: 0,
      openShifts: 0,
      healthScore: 100,
      revenuePerMonth: 5000,
    };
    const updated = store.addSite(site);
    setSites(updated);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedSite || !name) return;
    const updatedSite: Site = {
      ...selectedSite,
      name,
      address,
      riskLevel: risk,
      clientName: client
    };
    const updated = store.updateSite(updatedSite);
    setSites(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteSite(id);
    setSites(updated);
  };

  const openEdit = (site: Site) => {
    setSelectedSite(site);
    setName(site.name);
    setAddress(site.address);
    setRisk(site.riskLevel);
    setClient(site.clientName);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setRisk('Low');
    setClient('');
    setSelectedSite(null);
  };

  if (!isMounted) return null;

  // Helper to get operational data for a site
  const getSiteStats = (siteId: string) => {
    const siteShifts = shifts.filter(s => s.siteId === siteId);
    const active = siteShifts.filter(s => s.status === 'In Progress').length;
    const open = siteShifts.filter(s => s.status === 'Open').length;
    const guards = siteShifts.filter(s => s.status === 'In Progress' && s.guardName).map(s => s.guardName);
    return { active, open, guards };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Operational Sites</h1>
          <p className="text-muted-foreground font-medium">
            Manage contracted locations, monitor live coverage, and audit site health.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Register New Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Operational Site</DialogTitle>
              <DialogDescription>Add a new contracted location to the platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Site Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Center Alpha" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Client Name</label>
                <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Global Tech Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Physical Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Security Blvd" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Risk Profile</label>
                <Select value={risk} onValueChange={(v) => setRisk(v as Severity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                    <SelectItem value="Critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="bg-primary">Create Site</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => {
          const stats = getSiteStats(site.id);
          const coveragePercent = stats.active > 0 || stats.open > 0 ? (stats.active / (stats.active + stats.open)) * 100 : 100;
          
          return (
            <Card key={site.id} className="group border-none shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-white">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${
                site.riskLevel === 'Critical' ? 'bg-red-600' :
                site.riskLevel === 'High' ? 'bg-orange-500' :
                'bg-blue-500'
              }`} />
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(site)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(site.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-black uppercase rounded-full ${
                    site.riskLevel === 'Critical' ? 'border-red-200 bg-red-50 text-red-600' : 'bg-slate-50'
                  }`}>
                    {site.riskLevel} Risk
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-xl font-black text-slate-800">{site.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 text-xs font-medium">
                    <MapPin className="h-3 w-3 text-primary" />
                    {site.address}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Live Shift Coverage</span>
                    <span className="text-primary">{stats.active} Covered / {stats.open} Open</span>
                  </div>
                  <Progress value={coveragePercent} className="h-2 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Primary Client</p>
                    <p className="text-sm font-black text-slate-700 truncate">{site.clientName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Operational Score</p>
                    <div className="flex items-center gap-1.5">
                      <Activity className={`h-3 w-3 ${site.healthScore > 90 ? 'text-green-500' : 'text-orange-500'}`} />
                      <p className={`text-sm font-black ${site.healthScore > 90 ? 'text-green-500' : 'text-orange-500'}`}>
                        {site.healthScore}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> On-Duty Officers
                  </p>
                  {stats.guards.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {stats.guards.map((name, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] py-0 px-2 h-6">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No officers currently clocked in.</p>
                  )}
                </div>

                <Button className="w-full bg-slate-900 text-white rounded-xl h-11 font-black group-hover:bg-primary transition-colors">
                  OPEN SITE COMMAND <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
