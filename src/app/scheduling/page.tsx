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
  Trash2
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
import { useJsonStore } from '@/lib/store';
import { Shift } from '@/lib/types';
import { format, addHours } from 'date-fns';

export default function SchedulingPage() {
  const store = useJsonStore();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Shift State
  const [siteName, setSiteName] = useState('Tech Hub HQ');
  const [role, setRole] = useState('Security Officer');

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
      priority: 'Routine',
      role
    };
    const updated = store.addShift(shift);
    setShifts(updated);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = store.deleteShift(id);
    setShifts(updated);
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Publish Shift</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => handleDelete(shift.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
                  {`Week of ${format(new Date(), 'MMM dd, yyyy')}`}
                </span>
                <Button variant="ghost" size="icon"><ArrowRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts.filter(s => s.status !== 'Open').map(shift => (
                  <div key={shift.id} className="grid grid-cols-1 md:grid-cols-6 items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
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
                          {`${format(new Date(shift.startTime), 'HH:mm')} - ${format(new Date(shift.endTime), 'HH:mm')}`}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                        {shift.status}
                      </Badge>
                    </div>

                    <div className="md:col-span-1 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(shift.id)} className="text-destructive">Delete</Button>
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
