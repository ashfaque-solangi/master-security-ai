'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search,
  Filter,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronRight,
  Activity,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  QrCode
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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useJsonStore } from '@/lib/store';
import { Patrol, PatrolCheckpoint, PatrolRoute, PatrolEvent } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function PatrolsPage() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([]);
  const [routes, setRoutes] = useState<PatrolRoute[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation State
  const [activeSimulation, setActiveSimulation] = useState<Patrol | null>(null);
  const [simCheckpoint, setSimCheckpoint] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    setPatrols(store.getPatrols());
    setCheckpoints(store.getCheckpoints());
    setRoutes(store.getRoutes());
  };

  const handleSimulateScan = () => {
    if (!activeSimulation || !simCheckpoint) return;
    try {
      store.recordPatrolScan({
        shiftId: activeSimulation.shiftId,
        routeId: activeSimulation.routeId,
        checkpointId: simCheckpoint,
        guardId: activeSimulation.guardId,
        isSimulated: true
      });
      refreshData();
      toast({
        title: "Scan Recorded",
        description: `Simulated scan for checkpoint ${simCheckpoint} completed.`
      });
      setSimCheckpoint('');
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: e.message
      });
    }
  };

  if (!isMounted) return null;

  const filteredPatrols = patrols.filter(p => 
    p.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.guardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">Patrol Command</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest flex items-center gap-2">
            <QrCode className="w-3 h-3 text-primary" /> Live Checkpoint Verification & Progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold uppercase text-[10px] h-12 px-6">
            <BarChart3 className="mr-2 h-4 w-4" /> Reports
          </Button>
          <Button className="bg-primary text-white rounded-2xl px-8 font-black uppercase italic shadow-xl shadow-primary/20 h-12 tracking-tighter">
            <PlayCircle className="mr-2 h-5 w-5" /> New Patrol
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100"><Activity className="h-6 w-6" /></div>
             <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[9px] uppercase italic">Real-time</Badge>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Units</p>
          <p className="text-4xl font-black text-slate-800 italic mt-1">{patrols.filter(p => p.status === 'Active').length}</p>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100"><CheckCircle2 className="h-6 w-6" /></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Completed Today</p>
          <p className="text-4xl font-black text-slate-800 italic mt-1">{patrols.filter(p => p.status === 'Completed').length}</p>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100"><AlertCircle className="h-6 w-6" /></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Missed / Late</p>
          <p className="text-4xl font-black text-amber-600 italic mt-1">2</p>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-white/5 text-primary rounded-2xl border border-white/10"><ShieldCheck className="h-6 w-6" /></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patrol Compliance</p>
          <p className="text-4xl font-black text-white italic mt-1">98.2%</p>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
        <Search className="ml-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Filter by site, route or guard name..." 
          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary"><Filter className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatrols.map((patrol) => (
          <Card key={patrol.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all bg-white">
            <div className={`h-1.5 w-full ${patrol.status === 'Completed' ? 'bg-green-500' : 'bg-primary animate-pulse'}`} />
            <CardHeader className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <Badge className={`text-[8px] font-black h-5 px-3 rounded-full border-none shadow-sm ${
                  patrol.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {patrol.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-slate-800">{patrol.routeName}</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{patrol.siteName}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-primary">{patrol.completion}%</span>
                </div>
                <Progress value={patrol.completion} className="h-1.5" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Officer: {patrol.guardName} • {patrol.checkpoints}/{patrol.totalCheckpoints} Scanned</p>
              </div>

              <div className="pt-4 border-t border-dashed flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(patrol.startTime), 'HH:mm')}</span>
                </div>
                {patrol.status === 'Active' && (
                  <Button 
                    onClick={() => setActiveSimulation(patrol)}
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] font-black text-primary uppercase italic h-8 px-4 rounded-xl hover:bg-primary/5"
                  >
                    Simulate Scan <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation Dialog */}
      <Dialog open={!!activeSimulation} onOpenChange={(v) => !v && setActiveSimulation(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="bg-slate-900 text-white p-8">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <QrCode className="h-6 w-6 text-primary" />
                Simulate Patrol Scan
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Site: {activeSimulation?.siteName}
              </DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6 bg-slate-50">
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Checkpoint to Scan</p>
                 <div className="grid grid-cols-1 gap-2">
                    {activeSimulation && routes.find(r => r.id === activeSimulation.routeId)?.checkpointIds.map(cpId => {
                      const cp = checkpoints.find(c => c.id === cpId);
                      const isScanned = store.getPatrolEvents().some(e => e.shiftId === activeSimulation.shiftId && e.checkpointId === cpId);
                      return (
                        <Button 
                          key={cpId}
                          variant={isScanned ? "secondary" : "outline"}
                          disabled={isScanned}
                          onClick={() => setSimCheckpoint(cpId)}
                          className={`justify-start h-14 rounded-2xl font-bold px-6 ${simCheckpoint === cpId ? 'border-primary border-2' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                             {isScanned ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <div className="h-4 w-4 rounded-full border-2" />}
                             <span className="text-xs uppercase">{cp?.name || 'Unknown'}</span>
                          </div>
                        </Button>
                      );
                    })}
                 </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 font-black uppercase leading-relaxed italic">Operational Warning: Scanning out of sequence will trigger a formal exception in the immutable event log.</p>
              </div>
           </div>
           <DialogFooter className="p-8 bg-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveSimulation(null)} className="rounded-xl font-bold uppercase text-xs">Cancel</Button>
              <Button disabled={!simCheckpoint} onClick={handleSimulateScan} className="bg-primary text-white rounded-xl font-black italic uppercase text-xs px-8 shadow-lg shadow-primary/20">Authorize Scan</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
