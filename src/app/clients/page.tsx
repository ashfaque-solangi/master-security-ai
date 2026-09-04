
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
  ArrowUpRight
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Client } from '@/lib/types';

export default function ClientManagement() {
  const store = useJsonStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    setMounted(true);
    setClients(store.getClients());
  }, []);

  const handleAdd = () => {
    if (!name || !email) return;
    const client: Client = {
      id: `CL-${Math.floor(Math.random() * 1000)}`,
      name,
      contactPerson,
      email,
      phone,
      status,
      industry
    };
    const updated = store.addClient(client);
    setClients(updated);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedClient || !name) return;
    const updatedClient: Client = {
      ...selectedClient,
      name,
      contactPerson,
      email,
      phone,
      status,
      industry
    };
    const updated = store.updateClient(updatedClient);
    setClients(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteClient(id);
    setClients(updated);
  };

  const openEdit = (client: Client) => {
    setSelectedClient(client);
    setName(client.name);
    setContactPerson(client.contactPerson);
    setEmail(client.email);
    setPhone(client.phone);
    setIndustry(client.industry);
    setStatus(client.status);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setIndustry('');
    setStatus('Active');
    setSelectedClient(null);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">Manage contracted entities, billing profiles, and corporate relations.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Corporate Client</DialogTitle>
              <DialogDescription>Create a master account for a new contracted entity.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Client Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corporation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Primary Contact</label>
                  <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Industry</label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Finance" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@client.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Account Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Create Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search client registry..." className="pl-8" />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Status</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Client Registry</CardTitle>
          <CardDescription>Consolidated list of all business entities secured by the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-none">
                <TableHead className="px-6">Client Name</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Communication</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(client => (
                <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="px-6 font-bold text-slate-800">{client.name}</TableCell>
                  <TableCell>{client.contactPerson}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      {client.industry}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {client.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {client.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'Active' ? 'secondary' : 'outline'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(client)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Client Profile</DialogTitle>
            <DialogDescription>Modify details for {selectedClient?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Client Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Primary Contact</label>
                <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Industry</label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Email Address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
