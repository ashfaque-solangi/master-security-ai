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
  Pencil
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
import { Site, Severity } from '@/lib/types';

export default function SitesPage() {
  const store = useJsonStore();
  const [sites, setSites] = useState<Site[]>([]);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sites & Clients</h1>
          <p className="text-muted-foreground">
            Manage operational locations, contracts, and site health.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" /> New Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Operational Site</DialogTitle>
              <DialogDescription>Add a new contracted location to the platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Site Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Center Alpha" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Client Name</label>
                <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Global Tech Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Security Blvd" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Risk Level</label>
                <Select value={risk} onValueChange={(v) => setRisk(v as Severity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Site</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Site Configuration</DialogTitle>
            <DialogDescription>Update details for {selectedSite?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Site Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Client Name</label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Risk Level</label>
              <Select value={risk} onValueChange={(v) => setRisk(v as Severity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <Card key={site.id} className="group hover:border-accent transition-all relative">
             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(site)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(site.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <Badge variant={
                  site.riskLevel === 'Critical' ? 'destructive' :
                  site.riskLevel === 'High' ? 'destructive' :
                  'outline'
                }>
                  {site.riskLevel} Risk
                </Badge>
              </div>
              <div className="mt-4">
                <CardTitle className="text-xl">{site.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {site.address}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Coverage Status</span>
                  <span>{site.activeGuardsCount} Guards Active</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Client</p>
                  <p className="text-sm font-semibold truncate">{site.clientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Open Shifts</p>
                  <p className={`text-sm font-semibold ${site.openShifts > 0 ? 'text-destructive' : ''}`}>
                    {site.openShifts} Critical
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button className="flex-1 text-accent border-accent hover:bg-accent/5" variant="outline">
                  Site Details
                </Button>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
