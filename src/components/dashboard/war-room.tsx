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
  Search,
  Check,
  ChevronRight,
  RefreshCw,
  Heart,
  History
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useJsonStore } from '@/lib/store';
import { format, parseISO, differenceInSeconds, startOfDay, endOfDay } from 'date-fns';
import { useTrackingSimulation } from '@/hooks/use-tracking-simulation';
import { LiveGuardContext, SOSAlert, WelfareCheck, GuardLocation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { HistoricalPlayback } from './historical-playback';

export function WarRoom() {
  // Initialize Simulation Engine (Dev/Demo Only)
  useTrackingSimulation();

  const store = useJsonStore();
  const { toast } = useToast();
  const [now, setNow] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchTerm] = useState('');
  
  // Interaction State
  const [selectedContext, setSelectedContext] = useState<LiveGuardContext | null>(null);
  const [selectedSOS, setSelectedSOS] = useState<SOSAlert | null>(null);
  const [selectedWelfare, setSelectedWelfare] = useState<WelfareCheck | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  // Historical Playback State
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [replayHistory, setReplayHistory] = useState<GuardLocation[]>([]);
  const [replaySOS, setReplaySOS] = useState<SOSAlert[]>([]);
  const [replayWelfare, setReplayWelfare] = useState<WelfareCheck[]>([]);
  const [replayFrame, setReplayFrame] = useState<GuardLocation | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted || !now) return null;

  const sites = store.getSites() ?? [];
  const guards = store.getGuards() ?? [];
  const shifts = store.getShifts() ?? [];
  const incidents = store.getIncidents() ?? [];
  const sosAlerts = store.getSOS() ?? [];
  const vehicles = store.getVehicles() ?? [];
  const liveContexts = store.getLiveGuardContexts() ?? [];
  const welfareChecks = store.getWelfareChecks() ?? [];

  const activeSOS = sosAlerts.filter(s => s.status !== 'Resolved');
  const activeWelfare = welfareChecks.filter(c => c.status === 'Missed' || c.status === 'Escalated');
  const activeGuardsCount = liveContexts.filter(c => c.status === 'Active').length;
  const totalGuards = guards.length;
  const onlinePercent = totalGuards > 0 ? (liveContexts.length / totalGuards) * 100 : 0;
  const criticalGaps = shifts.filter(s => s.status === 'Open' && (s.priority === 'STAT' || s.priority === 'Urgent')).length;

  const filteredPersonnel = liveContexts.filter(c => {
    const search = searchQuery.toLowerCase();
    return (
      (c.guard?.name || '').toLowerCase().includes(search) ||
      (c.site?.name || '').toLowerCase().includes(search) ||
      (c.rolePerformed || '').toLowerCase().includes(search)
    );
  });

  const handleAcknowledge = (id: string) => {
    store.acknowledgeSOS(id);
    toast({ title: "SOS Acknowledged", description: "Response team tracking initiated." });
  };

  const handleEscalate = (id: string) => {
    store.escalateSOS(id);
    toast({ title: "SOS ESCALATED", description: "Emergency protocol activated.", variant: "destructive" });
  };

  const handleResolve = () => {
    if (!selectedSOS) return;
    store.resolveSOS(selectedSOS.id, resolutionNotes);
    toast({ title: "SOS Resolved", description: "Operational grid secured." });
    setSelectedSOS(null);
    setResolutionNotes('');
  };

  const openForensicReplay = (guardId: string) => {
    const start = format(startOfDay(now), "yyyy-MM-dd'T'HH:mm");
    const end = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm");
    
    const history = store.getGuardLocationHistory(guardId, start, end);
    const sos = sosAlerts.filter(s => s.guardId === guardId && s.timestamp >= start && s.timestamp <= end);
    const welfare = welfareChecks.filter(w => w.guardId === guardId && w.scheduledAt >= start && w.scheduledAt <= end);
    
    setReplayHistory(history);
    setReplaySOS(sos);
    setReplayWelfare(welfare);
    setIsReplayMode(true);
    setSelectedContext(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <KPICard label="Online" value={liveContexts.length} icon={Users} description={`${onlinePercent.toFixed(0)}% Capacity`} className="lg:col-span-1" />
        <KPICard label="Active" value={activeGuardsCount} icon={ShieldCheck} status="success" className="lg:col-span-1" />
        <KPICard label="SOS Alerts" value={activeSOS.length} icon={ShieldAlert} status={activeSOS.length > 0 ? "destructive" : "success"} className="lg:col-span-1" />
        <KPICard label="Welfare" value={activeWelfare.length} icon={Heart} status={activeWelfare.length > 0 ? "warning" : "success"} className="lg:col-span-1" />
        <KPICard label="Incidents" value={incidents.filter(i => i.status !== 'Resolved').length} icon={AlertTriangle} status="warning" className="lg:col-span-1" />
        <KPICard label="Patrols" value={shifts.filter(s => s.status === 'In Progress').length} icon={Activity} className="lg:col-span-1" />
        <KPICard label="Vehicles" value={vehicles.filter(v => v.status === 'Active').length} icon={Truck} className="lg:col-span-1" />
        <KPICard label="Vacancies" value={criticalGaps} icon={Zap} status={criticalGaps > 0 ? "destructive" : "info"} className="lg:col-span-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
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
                  {filteredPersonnel.map(ctx => {
                    const isSOS = activeSOS.some(s => s.guardId === ctx.guard.id);
                    const isWelfare = activeWelfare.some(c => c.guardId === ctx.guard.id);
                    return (
                      <div 
                        key={ctx.guard.id} 
                        onClick={() => { setSelectedContext(ctx); setIsReplayMode(false); }}
                        className={`p-4 transition-colors cursor-pointer group ${isSOS ? 'bg-red-50 hover:bg-red-100' : isWelfare ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                               {isSOS && <ShieldAlert className="h-3 w-3 text-red-600 animate-pulse" />}
                               {isWelfare && !isSOS && <Heart className="h-3 w-3 text-amber-600 animate-pulse" />}
                               <p className="text-xs font-black text-slate-800 uppercase italic truncate">{ctx.guard.name}</p>
                            </div>
                            <Badge variant="outline" className={`text-[7px] font-black h-4 px-1.5 ${
                              isSOS ? 'bg-red-600 text-white border-none' :
                              isWelfare ? 'bg-amber-500 text-white border-none' :
                              ctx.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' :
                              ctx.status === 'Stale' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-slate-50 text-slate-400'
                            }`}>
                              {isSOS ? 'EMERGENCY' : isWelfare ? 'WELFARE RISK' : ctx.status.toUpperCase()}
                            </Badge>
                         </div>
                         <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-2">{(ctx.rolePerformed || 'Officer').replace(/_/g, ' ')}</p>
                         <div className="space-y-1">
                            <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5"><Building2 className="h-3 w-3" /> {ctx.site.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1.5"><Clock className="h-3 w-3" /> Last sync: {ctx.location ? differenceInSeconds(now, parseISO(ctx.location.timestamp)) : '--'}s ago</p>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto m-0 divide-y divide-slate-50">
               {activeSOS.map(sos => (
                 <div key={sos.id} onClick={() => setSelectedSOS(sos)} className="p-4 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="destructive" className="text-[8px] font-black h-4 px-2">SOS ALERT - {sos.status.toUpperCase()}</Badge>
                      <span className="text-[9px] font-bold text-slate-400">{format(parseISO(sos.timestamp), 'HH:mm')}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase italic">{sos.guardName}</p>
                    <p className="text-[10px] text-red-600 font-bold mt-1 uppercase">Emergency at {sos.siteName}</p>
                 </div>
               ))}
               {activeWelfare.map(w => (
                 <div key={w.id} onClick={() => setSelectedWelfare(w)} className="p-4 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="text-[8px] font-black h-4 px-2 border-amber-300 text-amber-700 bg-amber-100 uppercase">Welfare {w.status}</Badge>
                      <span className="text-[9px] font-bold text-slate-400">{format(parseISO(w.scheduledAt), 'HH:mm')}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase italic">{w.guardName}</p>
                    <p className="text-[10px] text-amber-700 font-bold mt-1 uppercase">No response from {w.siteName}</p>
                 </div>
               ))}
            </TabsContent>
          </Tabs>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-50 relative group h-[650px]">
             <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center opacity-30 grayscale contrast-125" />
             <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
             
             <CardHeader className="relative z-10 p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Operational Grid</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Live Telemetry & Field Context Overlay</CardDescription>
                </div>
                {isReplayMode && (
                  <Button variant="outline" onClick={() => setIsReplayMode(false)} className="rounded-xl border-primary text-primary font-black uppercase italic tracking-tighter text-xs h-9">EXIT REPLAY</Button>
                )}
             </CardHeader>

             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isReplayMode ? (
                  liveContexts.map((ctx, idx) => {
                     if (!ctx.location) return null;
                     const isStale = ctx.status === 'Stale';
                     const isSOS = activeSOS.some(s => s.guardId === ctx.guard.id);
                     const isWelfare = activeWelfare.some(c => c.guardId === ctx.guard.id);
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
                             isSOS ? 'bg-red-600 animate-bounce' :
                             isWelfare ? 'bg-amber-500 animate-pulse' :
                             isStale ? 'bg-amber-300' : 'bg-primary'
                           }`}>
                              {isSOS ? <ShieldAlert className="h-5 w-5" /> : isWelfare ? <Heart className="h-5 w-5" /> : <Navigation className="h-5 w-5 fill-current" />}
                           </div>
                           
                           <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 backdrop-blur-sm text-white px-3 py-1 rounded-xl shadow-xl flex flex-col items-center ${isSOS ? 'bg-red-900/90' : isWelfare ? 'bg-amber-900/90' : 'bg-slate-900/90'}`}>
                              <span className="text-[9px] font-black uppercase italic whitespace-nowrap">{ctx.guard.name.split(' ')[0]}</span>
                              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{isSOS ? 'SOS ACTIVE' : isWelfare ? 'WELFARE RISK' : ctx.status}</span>
                           </div>
                        </div>
                      </div>
                     );
                  })
                ) : (
                  replayFrame && (
                    <div 
                      className="absolute pointer-events-auto transition-all duration-200"
                      style={{ 
                        top: `${25 + (Math.random() * 50)}%`, 
                        left: `${20 + (Math.random() * 60)}%` 
                      }}
                    >
                      <div className="relative group/marker">
                         <div className="h-10 w-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white bg-slate-800">
                            <MapPin className="h-5 w-5" />
                         </div>
                         <Badge className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black uppercase px-2 py-0.5">HISTORICAL</Badge>
                      </div>
                    </div>
                  )
                )}
             </div>

             <CardContent className="absolute bottom-8 left-8 right-8 z-10">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-2xl">
                   <div className="flex gap-10">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tracked Units</span>
                         <span className="text-2xl font-black italic text-slate-800">{liveContexts.length} OPERATIONAL</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Safety Incidents</span>
                         <span className={`text-2xl font-black italic ${activeSOS.length + activeWelfare.length > 0 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>{activeSOS.length + activeWelfare.length} ACTIVE</span>
                      </div>
                   </div>
                   <Button size="lg" className="bg-slate-900 text-white rounded-2xl px-10 font-black uppercase italic tracking-tighter shadow-xl" onClick={() => store.syncWelfareChecks()}>SYNC FIELD STATUS</Button>
                </div>
             </CardContent>
          </Card>
          
          {isReplayMode && selectedContext === null && (
            <HistoricalPlayback 
              guard={replaySOS[0] ? guards.find(g => g.id === replaySOS[0].guardId)! : guards[0]}
              history={replayHistory}
              sosEvents={replaySOS}
              welfareEvents={replayWelfare}
              onFrameChange={setReplayFrame}
            />
          )}
        </div>

        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl overflow-hidden bg-white h-[650px] flex flex-col">
          <CardHeader className="border-b p-6 shrink-0">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Critical Field Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Panic / SOS Events</p>
                {activeSOS.length > 0 ? activeSOS.map(sos => (
                  <div key={sos.id} onClick={() => setSelectedSOS(sos)} className="p-4 bg-red-50 border border-red-100 rounded-3xl space-y-3 shadow-sm cursor-pointer hover:border-red-400 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                        <p className="text-xs font-black text-red-800 italic uppercase">{sos.status.toUpperCase()}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-red-700 font-bold leading-relaxed uppercase">Officer {sos.guardName} at {sos.siteName} triggered SOS.</p>
                  </div>
                )) : <p className="p-5 text-center text-slate-200 text-[10px] font-black uppercase border border-dashed rounded-3xl italic">No Panic Alerts</p>}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Welfare Checks</p>
                {activeWelfare.length > 0 ? activeWelfare.map(w => (
                  <div key={w.id} onClick={() => setSelectedWelfare(w)} className="p-4 bg-amber-50 border border-amber-200 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-amber-400 transition-colors">
                    <div className="flex justify-between items-center">
                       <Badge className="bg-amber-500 text-white text-[8px] font-black italic">{w.status.toUpperCase()}</Badge>
                       <span className="text-[9px] font-bold text-amber-700">{format(parseISO(w.scheduledAt), 'HH:mm')}</span>
                    </div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase italic">{w.guardName} @ {w.siteName}</p>
                    <p className="text-[9px] text-amber-600 uppercase font-black">Lone Worker check-in missed</p>
                  </div>
                )) : <p className="p-5 text-center text-slate-200 text-[10px] font-black uppercase border border-dashed rounded-3xl italic">Checks Clear</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SOS Detail Dialog */}
      <Dialog open={!!selectedSOS} onOpenChange={(v) => !v && setSelectedSOS(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
           <DialogHeader className="bg-red-600 text-white p-8 relative">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <ShieldAlert className="h-6 w-6" />
                {selectedSOS?.guardName}
              </DialogTitle>
              <DialogDescription className="text-white/80 font-black uppercase text-[10px] tracking-widest mt-1">
                {(selectedSOS?.rolePerformed || 'Officer').replace(/_/g, ' ')}
              </DialogDescription>
           </DialogHeader>
           
           <div className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Site</p>
                    <p className="text-sm font-black text-slate-800 uppercase italic flex items-center gap-2">
                       <MapPin className="h-3.5 w-3.5 text-red-600" /> {selectedSOS?.siteName}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Reference</p>
                    <p className="text-sm font-black text-slate-800 uppercase italic flex items-center gap-2">
                       <Calendar className="h-3.5 w-3.5 text-red-600" /> {selectedSOS?.shiftName}
                    </p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <Button onClick={handleResolve} className="rounded-2xl h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic tracking-tighter text-xs">RESOLVE ALERT</Button>
                 <Button variant="outline" onClick={() => setSelectedSOS(null)} className="rounded-2xl h-12 font-black uppercase italic tracking-tighter text-xs border-slate-200">CLOSE PANEL</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* Guard Detail Context Panel */}
      <Dialog open={!!selectedContext} onOpenChange={(v) => !v && setSelectedContext(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-start">
               <div>
                 <Badge className="bg-primary text-white font-black italic uppercase text-[8px] mb-2 px-2">LIVE CONTEXT</Badge>
                 <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">{selectedContext?.guard.name}</DialogTitle>
                 <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personnel Ref: {selectedContext?.guard.id}</DialogDescription>
               </div>
               <Badge className={`rounded-xl h-6 font-black uppercase text-[8px] ${selectedContext?.status === 'Active' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                 {selectedContext?.status}
               </Badge>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-dashed">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Site</p>
                  <p className="text-xs font-black text-slate-800 uppercase mt-1 italic truncate">{selectedContext?.site.name}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-dashed">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assignment Role</p>
                  <p className="text-xs font-black text-primary uppercase mt-1 italic truncate">{selectedContext?.rolePerformed.replace(/_/g, ' ')}</p>
               </div>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
               <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Duty Window</p>
                    <p className="text-xs font-bold">{selectedContext && format(parseISO(selectedContext.shift.startTime), 'HH:mm')} - {selectedContext && format(parseISO(selectedContext.shift.endTime), 'HH:mm')}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Telemetry Health</p>
                    <p className="text-xs font-bold">Accuracy: ±{selectedContext?.location?.accuracyMeters.toFixed(0) || '0'}m</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <Button 
                onClick={() => selectedContext && openForensicReplay(selectedContext.guard.id)}
                className="rounded-2xl h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase italic tracking-tighter text-xs"
               >
                 <History className="mr-2 h-4 w-4" /> FORENSIC PATH REPLAY
               </Button>
               <Button variant="outline" onClick={() => setSelectedContext(null)} className="rounded-2xl h-12 font-black uppercase italic tracking-tighter text-xs border-slate-200">CLOSE PANEL</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
