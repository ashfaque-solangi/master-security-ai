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
  Navigation
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { useTrackingSimulation } from '@/hooks/use-tracking-simulation';
import Link from 'next/link';

const STALE_THRESHOLD_SECONDS = 30;

export function WarRoom() {
  // Initialize Simulation Engine (Dev/Demo Only)
  useTrackingSimulation();

  const store = useJsonStore();
  const [now, setNow] = useState(new Date());
  
  const sites = store.getSites();
  const guards = store.getGuards();
  const shifts = store.getShifts();
  const incidents = store.getIncidents();
  const sosAlerts = store.getSOS();
  const alarms = store.getAlarms();
  const vehicles = store.getVehicles();
  const locations = store.getGuardLocations();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeGuards = shifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + (s.assignments?.length || 0), 0);
  const totalGuards = guards.length;
  const onlinePercent = totalGuards > 0 ? (activeGuards / totalGuards) * 100 : 0;
  const criticalGaps = shifts.filter(s => s.status === 'Open' && (s.priority === 'STAT' || s.priority === 'Urgent')).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top KPI Bar */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <KPICard label="Online" value={activeGuards} icon={Users} description={`${onlinePercent.toFixed(0)}% Capacity`} className="lg:col-span-1" />
        <KPICard label="On Duty" value={activeGuards} icon={ShieldCheck} status="success" className="lg:col-span-1" />
        <KPICard label="SOS Alerts" value={sosAlerts.length} icon={ShieldAlert} status={sosAlerts.length > 0 ? "destructive" : "success"} className="lg:col-span-1" />
        <KPICard label="Incidents" value={incidents.filter(i => i.status !== 'Resolved').length} icon={AlertTriangle} status="warning" className="lg:col-span-1" />
        <KPICard label="Patrols" value={shifts.filter(s => s.status === 'In Progress').length} icon={Activity} className="lg:col-span-1" />
        <KPICard label="Vehicles" value={vehicles.filter(v => v.status === 'Active').length} icon={Truck} className="lg:col-span-1" />
        <KPICard label="Alarms" value={alarms.length} icon={Bell} status={alarms.length > 0 ? "destructive" : "info"} className="lg:col-span-1" />
        <KPICard label="Vacancies" value={criticalGaps} icon={Zap} status={criticalGaps > 0 ? "destructive" : "info"} className="lg:col-span-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* LEFT: Live Event Feed */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl overflow-hidden bg-white flex flex-col h-[600px]">
          <CardHeader className="bg-slate-900 text-white p-6 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <CardTitle className="text-xs font-black uppercase tracking-widest italic">Live Command Feed</CardTitle>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{format(now, 'HH:mm:ss')}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 divide-y divide-slate-100">
             {sosAlerts.map(sos => (
               <div key={sos.id} className="p-4 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="destructive" className="text-[8px] font-black h-4 px-2">SOS ALERT</Badge>
                    <span className="text-[9px] font-bold text-slate-400">{format(parseISO(sos.timestamp), 'HH:mm')}</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 uppercase italic">{sos.guardName}</p>
                  <p className="text-[10px] text-red-600 font-bold mt-1">EMERGENCY AT {sos.siteName}</p>
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
             <div className="p-4 bg-primary/5 border-y border-primary/10">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                   <Navigation className="h-3 w-3 animate-pulse" /> Telemetry Active
                </p>
             </div>
             {locations.map(loc => {
                const guard = guards.find(g => g.id === loc.guardId);
                const secondsAgo = differenceInSeconds(now, parseISO(loc.timestamp));
                const isStale = secondsAgo > STALE_THRESHOLD_SECONDS;
                return (
                  <div key={loc.id} className="p-4 hover:bg-slate-50 transition-colors">
                     <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-black text-slate-800 uppercase italic">{guard?.name || 'Unknown Unit'}</p>
                        <Badge variant="outline" className={`text-[7px] font-black h-3 px-1 ${isStale ? 'text-amber-500' : 'text-green-500'}`}>
                           {isStale ? 'STALE' : 'LIVE'}
                        </Badge>
                     </div>
                     <p className="text-[9px] text-slate-400 font-mono">LAT: {loc.latitude.toFixed(4)} LNG: {loc.longitude.toFixed(4)}</p>
                     <p className="text-[8px] text-slate-300 uppercase mt-1">Last Update: {secondsAgo}s ago</p>
                  </div>
                );
             })}
          </CardContent>
        </Card>

        {/* CENTER: Operational Site Map Visualization */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-slate-50 relative group h-[600px]">
           <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center opacity-30 grayscale contrast-125" />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
           
           <CardHeader className="relative z-10 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Operational Grid</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Simulated Live Tracking Overlay</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-white/80 backdrop-blur-md text-slate-600 font-black border border-slate-200">DEV SIMULATOR</Badge>
                <Badge className="bg-primary text-white font-black italic">LIVE SENSORS</Badge>
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

              {/* Live Guard Markers (Simulated Mapping to visual grid) */}
              {locations.map((loc, idx) => {
                 const secondsAgo = differenceInSeconds(now, parseISO(loc.timestamp));
                 if (secondsAgo > 60) return null; // Only show recent ones on map
                 return (
                  <div 
                    key={loc.id} 
                    className="absolute pointer-events-auto transition-all duration-1000 ease-in-out"
                    style={{ 
                      top: `${25 + (idx * 12) % 55}%`, 
                      left: `${20 + (idx * 22) % 65}%` 
                    }}
                  >
                    <div className="relative">
                       <div className="h-8 w-8 rounded-2xl bg-primary border-4 border-white shadow-xl flex items-center justify-center text-white">
                          <Navigation className="h-4 w-4 fill-current" />
                       </div>
                       <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-primary animate-ping opacity-20" />
                       <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap">
                          {guards.find(g => g.id === loc.guardId)?.name.split(' ')[0]}
                       </div>
                    </div>
                  </div>
                 );
              })}
           </div>

           <CardContent className="absolute bottom-8 left-8 right-8 z-10">
              <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                 <div className="flex gap-6">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tracked Units</span>
                       <span className="text-xl font-black italic text-slate-800">{locations.length}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol</span>
                       <span className="text-xl font-black italic text-primary">SIM-GPS v1</span>
                    </div>
                 </div>
                 <Button size="sm" className="bg-slate-900 text-white rounded-xl h-10 px-6 font-black uppercase italic italic tracking-tighter">RE-CALIBRATE</Button>
              </div>
           </CardContent>
        </Card>

        {/* RIGHT: Critical Alerts */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl overflow-hidden bg-white h-[600px] flex flex-col">
          <CardHeader className="border-b p-6 shrink-0">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">High-Priority Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">Critical</p>
                {sosAlerts.length > 0 ? sosAlerts.map(sos => (
                  <div key={sos.id} className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-red-800 italic">SOS TRIGGERED</p>
                      <span className="text-[9px] font-bold text-red-400">{format(parseISO(sos.timestamp), 'HH:mm')}</span>
                    </div>
                    <p className="text-[10px] text-red-700 font-bold leading-relaxed">Officer {sos.guardName} at {sos.siteName} triggered a panic alert. Immediate response required.</p>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-8 px-4 text-[9px] font-black rounded-lg">RESPOND</Button>
                      <Button size="sm" variant="outline" className="bg-white border-red-200 text-red-600 h-8 px-4 text-[9px] font-black rounded-lg">VIEW GPS</Button>
                    </div>
                  </div>
                )) : <p className="p-6 text-center text-slate-300 text-[10px] font-black uppercase border border-dashed rounded-2xl italic">No critical SOS events</p>}
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-1">High Priority</p>
                {criticalGaps > 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                    <p className="text-xs font-black text-amber-800 italic uppercase">Staffing Gap Detected</p>
                    <p className="text-[10px] text-amber-700 font-bold">Unfilled requirement at Tech Hub HQ starting in 45m.</p>
                    <Button size="sm" className="bg-amber-600 text-white h-8 px-4 text-[9px] font-black rounded-lg w-full">AUTO-ASSIGN</Button>
                  </div>
                ) : null}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <p className="text-xs font-black text-slate-800 italic uppercase">Delayed Patrol</p>
                    <p className="text-[10px] text-slate-500 font-bold">Patrol Unit 04 is 12m behind schedule at Retail Park East.</p>
                    <Button size="sm" variant="ghost" className="text-primary h-8 px-4 text-[9px] font-black rounded-lg w-full">CONTACT GUARD</Button>
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM PANELS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
           <CardHeader className="bg-slate-50/50 p-4 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Site Health Index</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {sites.slice(0, 5).map(site => (
                  <div key={site.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-[11px] font-black text-slate-800 uppercase italic truncate max-w-[120px]">{site.name}</p>
                    <Badge variant="outline" className={`text-[9px] font-black border-none ${site.healthScore > 90 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{site.healthScore}%</Badge>
                  </div>
                ))}
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
           <CardHeader className="bg-slate-50/50 p-4 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Active Patrols</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {shifts.filter(s => s.status === 'In Progress').slice(0, 5).map(shift => (
                  <div key={shift.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase">{shift.siteName}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{shift.assignments?.[0]?.guardName || 'Officer'}</p>
                    </div>
                    <span className="text-[10px] font-black text-primary italic">94%</span>
                  </div>
                ))}
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
           <CardHeader className="bg-slate-50/50 p-4 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Guards on Duty</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {guards.filter(g => g.status === 'Active').slice(0, 5).map(guard => (
                  <div key={guard.id} className="p-4 flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-800 italic uppercase">{guard.name}</p>
                    <Badge className="bg-green-500 h-2 w-2 rounded-full p-0" />
                  </div>
                ))}
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
           <CardHeader className="bg-slate-50/50 p-4 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Open Board</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {shifts.filter(s => s.status === 'Open').slice(0, 5).map(shift => (
                  <div key={shift.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                    <p className="text-[11px] font-black text-slate-800 uppercase italic truncate max-w-[120px]">{shift.siteName}</p>
                    <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                ))}
                {shifts.filter(s => s.status === 'Open').length === 0 && <p className="p-12 text-center text-slate-400 text-[10px] font-black italic uppercase">Grid Fully Staffed</p>}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}