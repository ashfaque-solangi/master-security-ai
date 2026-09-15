'use client';

import { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Map as MapIcon, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Truck,
  Bell,
  CheckCircle2,
  XCircle,
  Building2,
  Zap,
  MoreVertical,
  Navigation,
  Info,
  MapPin,
  Calendar,
  Shield,
  Search
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useJsonStore, STALE_THRESHOLD_SECONDS } from '@/lib/store';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { useTrackingSimulation } from '@/hooks/use-tracking-simulation';
import { LiveGuardContext } from '@/lib/types';
import Link from 'next/link';

export function WarRoom() {
  // Initialize Simulation Engine (Dev/Demo Only)
  useTrackingSimulation();

  const store = useJsonStore();
  const [now, setNow] = useState(new Date());
  const [searchQuery, setSearchTerm] = useState('');
  const [selectedContext, setSelectedContext] = useState<LiveGuardContext | null>(null);
  
  const sites = store.getSites();
  const guards = store.getGuards();
  const shifts = store.getShifts();
  const incidents = store.getIncidents();
  const sosAlerts = store.getSOS();
  const alarms = store.getAlarms();
  const vehicles = store.getVehicles();
  const liveContexts = store.getLiveGuardContexts();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeGuardsCount = liveContexts.filter(c => c.status === 'Active').length;
  const totalGuards = guards.length;
  const onlinePercent = totalGuards > 0 ? (liveContexts.length / totalGuards) * 100 : 0;
  const criticalGaps = shifts.filter(s => s.status === 'Open' && (s.priority === 'STAT' || s.priority === 'Urgent')).length;

  const filteredPersonnel = liveContexts.filter(c => 
    c.guard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rolePerformed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top KPI Bar */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <KPICard label="Online" value={liveContexts.length} icon={Users} description={`${onlinePercent.toFixed(0)}% Capacity`} className="lg:col-span-1" />
        <KPICard label="Active" value={activeGuardsCount} icon={ShieldCheck} status="success" className="lg:col-span-1" />
        <KPICard label="SOS Alerts" value={sosAlerts.length} icon={ShieldAlert} status={sosAlerts.length > 0 ? "destructive" : "success"} className="lg:col-span-1" />
        <KPICard label="Incidents" value={incidents.filter(i => i.status !== 'Resolved').length} icon={AlertTriangle} status="warning" className="lg:col-span-1" />
        <KPICard label="Patrols" value={shifts.filter(s => s.status === 'In Progress').length} icon={Activity} className="lg:col-span-1" />
        <KPICard label="Vehicles" value={vehicles.filter(v => v.status === 'Active').length} icon={Truck} className="lg:col-span-1" />
        <KPICard label="Alarms" value={alarms.length} icon={Bell} status={alarms.length > 0 ? "destructive" : "info"} className="lg:col-span-1" />
        <KPICard label="Vacancies" value={criticalGaps} icon={Zap} status={criticalGaps > 0 ? "destructive" : "info"} className="lg:col-span-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* LEFT: Command Feed & Personnel List */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl overflow-hidden bg-white flex flex-col h-[650px]">
          <Tabs defaultValue="personnel" className="flex flex-col h-full">
            <CardHeader className="bg-slate-900 text-white p-6 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <CardTitle className="text-xs font-black uppercase tracking-widest italic">Live Command</CardTitle>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{format(now, 'HH:mm:ss')}</span>
              </div>
              <TabsList className="bg-white/10 w-full h-10 border-none">
                <TabsTrigger value="personnel" className="flex-1 text-[10px] font-black uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900">Personnel</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 text-[10px] font-black uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900">Activity</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="personnel" className="flex-1 overflow-hidden m-0">
               <div className="p-4 border-b">
                 <div className="relative">
                   <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                   <Input 
                    placeholder="Search personnel..." 
                    className="pl-8 h-9 text-[11px] bg-slate-50 border-none rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
               </div>
               <div className="overflow-y-auto h-[480px] divide-y divide-slate-50">
                  {filteredPersonnel.map(ctx => (
                    <div 
                      key={ctx.guard.id} 
                      onClick={() => setSelectedContext(ctx)}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black text-slate-800 uppercase italic truncate">{ctx.guard.name}</p>
                          <Badge variant="outline" className={`text-[7px] font-black h-4 px-1.5 ${
                            ctx.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' :
                            ctx.status === 'Stale' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-slate-50 text-slate-400'
                          }`}>
                            {ctx.status.toUpperCase()}
                          </Badge>
                       </div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-2">{ctx.rolePerformed.replace(/_/g, ' ')}</p>
                       <div className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5"><Building2 className="h-3 w-3" /> {ctx.site.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1.5"><Clock className="h-3 w-3" /> Last sync: {ctx.location ? differenceInSeconds(now, parseISO(ctx.location.timestamp)) : '--'}s ago</p>
                       </div>
                    </div>
                  ))}
                  {filteredPersonnel.length === 0 && (
                    <div className="p-12 text-center text-slate-300 italic font-black text-[10px] uppercase">No Personnel Matching Criteria</div>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto m-0 divide-y divide-slate-50">
               {sosAlerts.map(sos => (
                 <div key={sos.id} className="p-4 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="destructive" className="text-[8px] font-black h-4 px-2">SOS ALERT</Badge>
                      <span className="text-[9px] font-bold text-slate-400">{format(parseISO(sos.timestamp), 'HH:mm')}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase italic">{sos.guardName}</p>
                    <p className="text-[10px] text-red-600 font-bold mt-1 uppercase">Emergency at {sos.siteName}</p>
                 </div>
               ))}
               {incidents.filter(i => i.status !== 'Resolved').map(inc => (
                 <div key={inc.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="text-[8px] font-black h-4 px-2 border-orange-200 text-orange-600 uppercase">{inc.type}</Badge>
                      <span className="text-[9px] font-bold text-slate-400">{format(parseISO(inc.timestamp), 'HH:mm')}</span>
                    </div>
                    <p className="text-xs font-black text-slate-700 uppercase italic line-clamp-1">{inc.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1"><Building2 className="h-2.5 w-2.5" /> {inc.siteName}</p>
                 </div>
               ))}
            </TabsContent>
          </Tabs>
        </Card>

        {/* CENTER: Operational Site Map Visualization */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-slate-50 relative group h-[650px]">
           <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center opacity-30 grayscale contrast-125" />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
           
           <CardHeader className="relative z-10 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Operational Grid</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Live Telemetry & Field Context Overlay</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-white/80 backdrop-blur-md text-slate-600 font-black border border-slate-200">DEVELOPMENT SIMULATION</Badge>
                <Badge className="bg-primary text-white font-black italic">LIVE GPS SENSORS</Badge>
              </div>
           </CardHeader>

           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Site Markers */}
              {sites.map((site, idx) => (
                <div 
                  key={site.id} 
                  className="absolute pointer-events-auto cursor-pointer transition-transform hover:scale-110"
                  style={{ 
                    top: `${20 + (idx * 15) % 60}%`, 
                    left: `${15 + (idx * 25) % 70}%` 
                  }}
                >
                  <div className={`h-12 w-12 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ${
                    site.healthScore > 90 ? 'bg-green-500' : site.healthScore > 70 ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}

              {/* Live Guard Markers */}
              {liveContexts.map((ctx, idx) => {
                 if (!ctx.location) return null;
                 const isStale = ctx.status === 'Stale';
                 return (
                  <div 
                    key={ctx.guard.id} 
                    onClick={() => setSelectedContext(ctx)}
                    className="absolute pointer-events-auto transition-all duration-1000 ease-in-out cursor-pointer"
                    style={{ 
                      top: `${25 + (idx * 12) % 55}%`, 
                      left: `${20 + (idx * 22) % 65}%` 
                    }}
                  >
                    <div className="relative group/marker">
                       <div className={`h-10 w-10 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white transition-colors ${
                         isStale ? 'bg-amber-500' : 'bg-primary'
                       }`}>
                          <Navigation className="h-5 w-5 fill-current" />
                       </div>
                       {!isStale && <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-primary animate-ping opacity-20" />}
                       
                       {/* Identity Label */}
                       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-xl shadow-xl flex flex-col items-center">
                          <span className="text-[9px] font-black uppercase italic whitespace-nowrap">{ctx.guard.name.split(' ')[0]}</span>
                          <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{ctx.status}</span>
                       </div>
                    </div>
                  </div>
                 );
              })}
           </div>

           <CardContent className="absolute bottom-8 left-8 right-8 z-10">
              <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-2xl">
                 <div className="flex gap-10">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tracked Units</span>
                       <span className="text-2xl font-black italic text-slate-800">{liveContexts.length} OPERATIONAL</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Source</span>
                       <span className="text-2xl font-black italic text-primary">SIM-GPS v2.0</span>
                    </div>
                 </div>
                 <Button size="lg" className="bg-slate-900 text-white rounded-2xl px-10 font-black uppercase italic tracking-tighter shadow-xl">RE-CALIBRATE FIELD</Button>
              </div>
           </CardContent>
        </Card>

        {/* RIGHT: High-Priority Panel */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl overflow-hidden bg-white h-[650px] flex flex-col">
          <CardHeader className="border-b p-6 shrink-0">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Critical Field Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Panic / SOS Events</p>
                {sosAlerts.length > 0 ? sosAlerts.map(sos => (
                  <div key={sos.id} className="p-4 bg-red-50 border border-red-100 rounded-3xl space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                        <p className="text-xs font-black text-red-800 italic uppercase">SOS ACTIVE</p>
                      </div>
                      <span className="text-[9px] font-bold text-red-400">{format(parseISO(sos.timestamp), 'HH:mm')}</span>
                    </div>
                    <p className="text-[10px] text-red-700 font-bold leading-relaxed uppercase">Officer {sos.guardName} at {sos.siteName} triggered emergency silent alarm.</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white h-9 text-[9px] font-black rounded-xl">RESPOND</Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-white border-red-200 text-red-600 h-9 text-[9px] font-black rounded-xl">GPS LOCK</Button>
                    </div>
                  </div>
                )) : <p className="p-10 text-center text-slate-200 text-[10px] font-black uppercase border border-dashed rounded-3xl italic">Grid Secured</p>}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Staffing Gaps</p>
                {criticalGaps > 0 ? (
                  <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl space-y-3 shadow-sm">
                    <p className="text-xs font-black text-amber-800 italic uppercase flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Unfilled Post
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold uppercase">Requirement at Tech Hub HQ starting in 45m has zero assignments.</p>
                    <Button size="sm" className="bg-amber-600 text-white h-9 text-[9px] font-black rounded-xl w-full">ROSTER AI</Button>
                  </div>
                ) : null}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl space-y-2">
                    <p className="text-xs font-black text-slate-800 italic uppercase">Telemetry Lag</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Guard Unit Leo Varga at Retail Park East shows stale location (>30s).</p>
                    <Button size="sm" variant="ghost" className="text-primary h-8 px-4 text-[9px] font-black rounded-lg w-full">INITIATE WELFARE CHECK</Button>
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedContext} onOpenChange={(v) => !v && setSelectedContext(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
           <DialogHeader className="bg-slate-900 text-white p-8 relative">
              <div className="absolute top-8 right-8">
                 <Badge className={`px-4 h-6 rounded-full font-black italic uppercase text-[9px] ${
                    selectedContext?.status === 'Active' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                 }`}>{selectedContext?.status}</Badge>
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                {selectedContext?.guard.name}
              </DialogTitle>
              <DialogDescription className="text-primary font-black uppercase text-[10px] tracking-widest mt-1">
                {selectedContext?.rolePerformed.replace(/_/g, ' ')}
              </DialogDescription>
           </DialogHeader>
           
           <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Site</p>
                    <p className="text-sm font-black text-slate-800 uppercase italic flex items-center gap-2">
                       <MapPin className="h-3.5 w-3.5 text-primary" /> {selectedContext?.site.name}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Unit</p>
                    <p className="text-sm font-black text-slate-800 uppercase italic flex items-center gap-2">
                       <Calendar className="h-3.5 w-3.5 text-primary" /> {selectedContext?.shift.name}
                    </p>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-dashed">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Telemetry</span>
                    <span className="text-[10px] font-black text-slate-800 uppercase italic">±{selectedContext?.location?.accuracyMeters.toFixed(0) || '0'}m Precision</span>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="text-slate-500 uppercase">Latitude</span>
                       <span className="font-mono text-slate-800">{selectedContext?.location?.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="text-slate-500 uppercase">Longitude</span>
                       <span className="font-mono text-slate-800">{selectedContext?.location?.longitude.toFixed(6)}</span>
                    </div>
                 </div>
                 <div className="pt-2 flex items-center gap-2 text-primary">
                    <Activity className="h-3.5 w-3.5 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Streaming via {selectedContext?.location?.source} source</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <Button className="rounded-2xl h-12 bg-slate-900 text-white font-black uppercase italic tracking-tighter text-xs">CONTACT UNIT</Button>
                 <Button variant="outline" className="rounded-2xl h-12 font-black uppercase italic tracking-tighter text-xs border-slate-200">VIEW HISTORY</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}