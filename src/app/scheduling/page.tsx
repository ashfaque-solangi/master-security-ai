'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJsonStore } from '@/lib/store';
import { Shift, Severity } from '@/lib/types';
import { format, addHours } from 'date-fns';

export default function SchedulingPage() {
  const store = useJsonStore();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Form State
  const [siteName, setSiteName] = useState('Tech Hub HQ');
  const [role, setRole] = useState('Security Officer');
  const [priority, setPriority] = useState<Severity>('Low');

  useEffect(() => {
    setIsMounted(true);
    setShifts(store.getShifts());
  }, []);

  const handleAdd = () => {
    const shift: Shift = {
      id: `SHF-${Math.floor(Math.random() * 1000)}`,
      siteId: 'SITE-001',
      siteName,
      startTime: new Date().toISOString(),
      endTime: addHours(new Date(), 8).toISOString(),
      status: 'Open',
      priority: priority === 'Critical' ? 'STAT' : priority === 'High' ? 'Urgent' : 'Routine',
      role
    };
    const updated = store.addShift(shift);
    setShifts(updated);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedShift) return;
    const updatedShift: Shift = {
      ...selectedShift,
      siteName,
      role,
      priority: priority === 'Critical' ? 'STAT' : priority === 'High' ? 'Urgent' : 'Routine'
    };
    const updated = store.updateShift(updatedShift);
    setShifts(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteShift(id);
    setShifts(updated);
  };

  const openEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setSiteName(shift.siteName);
    setRole(shift.role);
    setPriority(shift.priority === 'STAT' ? 'Critical' : shift.priority === 'Urgent' ? 'High' : 'Low');
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setSiteName('Tech Hub HQ');
    setRole('Security Officer');
    setPriority('Low');
    setSelectedShift(null);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Shift Scheduling</h1>
          <p className="text-muted-foreground text-lg">
            Create, manage and AI-optimize your security workforce roster.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/5">
            <Sparkles className="mr-2 h-4 w-4" /> AI Auto-Schedule
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground">
                <Plus className="mr-2 h-4 w-4" /> Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Shift</DialogTitle>
                <DialogDescription>Add a new operational shift to the roster.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Site Location</label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Role Required</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Severity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Routine</SelectItem>
                      <SelectItem value="High">Urgent</SelectItem>
                      <SelectItem value="Critical">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Publish Shift</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shift Details</DialogTitle>
            <DialogDescription>Modify the requirements for this shift.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Site Location</label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Role Required</label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Priority Level</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Severity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Routine</SelectItem>
                  <SelectItem value="High">Urgent</SelectItem>
                  <SelectItem value="Critical">STAT</SelectItem>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Search Sites</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Open Shifts</CardTitle>
              <CardDescription>Published and awaiting claim.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shifts.filter(s => s.status === 'Open').map(shift => (
                <div key={shift.id} className="p-3 rounded-md border border-dashed border-accent/40 bg-accent/5 relative group">
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-primary"
                      onClick={() => openEdit(shift)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDelete(shift.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold">{shift.siteName}</p>
                    <Badge variant="destructive" className="text-[10px]">{shift.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{shift.role}</p>
                  <Button size="sm" className="w-full text-xs h-8">Suggest Guard</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Roster</CardTitle>
                <CardDescription>Current and upcoming deployment schedule.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><CalendarIcon className="h-4 w-4" /></Button>
                <span className="text-sm font-medium">
                  {isMounted ? `Week of ${format(new Date(), 'MMM dd, yyyy')}` : '...'}
                </span>
                <Button variant="ghost" size="icon"><ArrowRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts.filter(s => s.status !== 'Open').map(shift => (
                  <div key={shift.id} className="grid grid-cols-1 md:grid-cols-6 items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                          {shift.guardName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{shift.guardName}</p>
                          <p className="text-xs text-muted-foreground">{shift.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{shift.siteName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {isMounted ? `${format(new Date(shift.startTime), 'HH:mm')} - ${format(new Date(shift.endTime), 'HH:mm')}` : '...'}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                        {shift.status}
                      </Badge>
                    </div>

                    <div className="md:col-span-1 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(shift)} className="text-primary"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(shift.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
