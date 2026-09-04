'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download,
  Plus,
  MoreHorizontal,
  Clock,
  MapPin,
  User,
  Trash2,
  CheckCircle2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Incident, IncidentType, Severity, IncidentStatus } from '@/lib/types';
import { format } from 'date-fns';

export default function IncidentsPage() {
  const store = useJsonStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form State
  const [type, setType] = useState<IncidentType>('Observation');
  const [severity, setSeverity] = useState<Severity>('Low');
  const [status, setStatus] = useState<IncidentStatus>('Open');
  const [desc, setDesc] = useState('');
  const [siteName, setSiteName] = useState('Tech Hub HQ');

  useEffect(() => {
    setIsMounted(true);
    setIncidents(store.getIncidents());
  }, []);

  const handleCreate = () => {
    const incident: Incident = {
      id: `INC-${Date.now()}`,
      siteId: 'SITE-CUSTOM',
      siteName: siteName,
      guardId: 'GRD-ADMIN',
      guardName: 'Admin System',
      type: type,
      severity: severity,
      status: 'Open',
      description: desc,
      timestamp: new Date().toISOString(),
    };
    const updated = store.addIncident(incident);
    setIncidents(updated);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedIncident) return;
    const updatedIncident: Incident = {
      ...selectedIncident,
      type,
      severity,
      status,
      description: desc,
      siteName
    };
    const updated = store.updateIncident(updatedIncident);
    setIncidents(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteIncident(id);
    setIncidents(updated);
  };

  const openEdit = (incident: Incident) => {
    setSelectedIncident(incident);
    setType(incident.type);
    setSeverity(incident.severity);
    setStatus(incident.status);
    setDesc(incident.description);
    setSiteName(incident.siteName);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setType('Observation');
    setSeverity('Low');
    setStatus('Open');
    setDesc('');
    setSiteName('Tech Hub HQ');
    setSelectedIncident(null);
  };

  const updateStatus = (incident: Incident, newStatus: IncidentStatus) => {
    const updated = store.updateIncident({ ...incident, status: newStatus });
    setIncidents(updated);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Incidents & Reports</h1>
          <p className="text-muted-foreground">
            Manage field reports, safety events, and emergency escalations.
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
              <DialogDescription>Fill in the details from the field report.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Site Location</label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Type</label>
                  <Select value={type} onValueChange={(v) => setType(v as IncidentType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intrusion">Intrusion</SelectItem>
                      <SelectItem value="Fire">Fire</SelectItem>
                      <SelectItem value="Vandalism">Vandalism</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Observation">Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Severity</label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
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
              <div className="space-y-2">
                <label className="text-sm font-bold">Description</label>
                <Textarea 
                  placeholder="Describe the incident..." 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Incident Report</DialogTitle>
            <DialogDescription>Modify details for incident {selectedIncident?.id}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Site Location</label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as IncidentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intrusion">Intrusion</SelectItem>
                    <SelectItem value="Fire">Fire</SelectItem>
                    <SelectItem value="Vandalism">Vandalism</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Observation">Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Severity</label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as IncidentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Description</label>
              <Textarea 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search incidents..." className="pl-8" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>A live list of all incidents managed in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                  <TableCell className="font-medium">{incident.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {incident.siteName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {incident.guardName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{isMounted ? format(new Date(incident.timestamp), 'MMM dd, yyyy') : '...'}</span>
                      <span className="text-muted-foreground">{isMounted ? format(new Date(incident.timestamp), 'HH:mm') : '...'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={incident.severity === 'High' || incident.severity === 'Critical' ? 'destructive' : 'secondary'}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      incident.status === 'Open' ? 'text-red-500 border-red-500' :
                      incident.status === 'In Progress' ? 'text-blue-500 border-blue-500' :
                      'text-green-500 border-green-500'
                    }>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEdit(incident)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(incident, 'Resolved')}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(incident.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {incidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground italic">
                    No incidents reported. System clear.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
