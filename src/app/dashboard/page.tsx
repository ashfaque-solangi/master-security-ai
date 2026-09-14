
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, AlertTriangle, Radio, Navigation, 
  CloudSun, Zap, Activity, Clock, ShieldCheck, MapPin, 
  MessageSquare, Briefcase, TrendingUp, Search, CheckCircle2,
  Truck, Bell, Wifi, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useJsonStore } from '@/lib/store';
import { format } from 'date-fns';
import Link from 'next/link';

export default function OperationalCommandCentre() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setLiveEvents(store.getLiveEvents());

    const interval = setInterval(() => {
      const demoEvents: any[] = [
        { id: `EV-${Date.now()}`, timestamp: new Date().toISOString(), type: 'GUARD_CHECKED_IN', siteName: 'Tech Hub HQ', description: 'Marcus Thorne checked in for Night Shift', severity: 'Low' },
        { id: `EV-${Date.now() + 1}`, timestamp: new Date().toISOString(), type: 'SOS_TRIGGERED', siteName: 'Retail Park East', description: 'Emergency alert from Sarah Jenkins', severity: 'Critical' },
      ];
      const randomEvent = demoEvents[Math.floor(Math.random() * demoEvents.length)];
      setLiveEvents(prev => [randomEvent, ...prev].slice(0, 10));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const guards = store.getGuards();
  const shifts = store.getShifts();
  const incidents = store.getIncidents();
  const sos = store.getSOS();
  const vehicles = store.getVehicles();

  const activeStaff = shifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + (s.assignments?.length || 0), 0);
  const totalRequired = shifts.reduce((acc, s) => acc + s.requirements.reduce((rAcc, r) => rAcc + r.count, 0), 0);
  const openPositions = totalRequired - activeStaff;
  const coverage = totalRequired > 0 ? (activeStaff / totalRequired) * 100 : 100;
  
  const criticalIncidents = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const compliantCount = guards.filter(g => g.complianceStatus === 'Compliant').length;
  const complianceScore = (compliantCount / (guards.length || 1)) * 100;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 uppercase italic">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
            OPERATIONAL COMMAND CENTRE
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Enterprise Intelligence • System Live • {format(new Date(), 'HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white border-slate-200 h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm">
            <Wifi className="h-3 w-3 text-green-500 animate-ping" />
            <span className="font-bold text-xs uppercase">Network Stable</span>
          </Badge>
          <Button className="bg-slate-900 text-white rounded-xl h-10 px-6 font-black text-xs uppercase italic tracking-widest shadow-xl">
            GLOBAL SYNC
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="command-gradient border-none text-white rounded-3xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/70">Staffing Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">{coverage.toFixed(1)}%</div>
            <Progress value={coverage} className="h-1 mt-3 bg-white/20 [&>div]:bg-white" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-2 text-red-500">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Gap Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 italic">{openPositions}</div>
            <p className="text-[9px] font-bold text-red-500 uppercase mt-1">Unfilled Posts</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white">
          <CardHeader className="pb-2 text-primary">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/50">Emergency Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white italic">{sos.length + criticalIncidents}</div>
            <p className="text-[9px] font-bold text-primary uppercase mt-1">Priority 1 Required</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliance Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 italic">{complianceScore.toFixed(0)}%</div>
            <Progress value={complianceScore} className="h-1 mt-3" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fleet Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 italic">{vehicles.filter(v => v.status === 'Active').length}</div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Mobile Patrol Units</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between px-8 py-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary animate-bounce" />
                <CardTitle className="text-sm font-black italic uppercase tracking-widest">Operational Live Stream</CardTitle>
              </div>
              <Badge className="bg-green-500 text-[8px] px-3">ENCRYPTED FEED</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {liveEvents.length > 0 ? liveEvents.map(event => (
                  <div key={event.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${
                        event.type === 'SOS_TRIGGERED' ? 'bg-red-100 text-red-600' : 
                        event.type === 'ALARM_TRIGGERED' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase italic">{event.type.replace(/_/g, ' ')}: {event.siteName}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">{event.description}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-2">{format(new Date(event.timestamp), 'HH:mm:ss')}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-primary font-black text-[10px] uppercase">
                      <Link href={event.type === 'SOS_TRIGGERED' ? '/incidents' : '/dashboard'}>TRACE</Link>
                    </Button>
                  </div>
                )) : (
                  <div className="p-20 text-center text-muted-foreground italic font-black uppercase tracking-widest opacity-20">Monitoring Data Bus...</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.15em] flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" /> Active Personnel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                {guards.filter(g => g.status === 'Active').slice(0, 4).map(g => (
                  <div key={g.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dashed hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs">{g.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-slate-800 italic">{g.name}</p>
                        <p className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Checked In
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary"><Navigation className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.15em] flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Mobile Units
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 border border-dashed rounded-2xl bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${v.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">{v.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{v.status}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black">{format(new Date(v.lastUpdate), 'HH:mm')}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-slate-900 border-none text-white shadow-2xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShieldCheck className="h-48 w-48" />
            </div>
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary fill-primary" />
                AI OPS ANALYST
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                <p className="text-xs font-black uppercase text-primary tracking-widest mb-3">SITE HEALTH RISK</p>
                <p className="text-sm font-bold text-white/90 leading-relaxed italic">
                  Detecting a coverage gap at <span className="underline decoration-primary">Retail Park East</span> for upcoming shifts.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <Badge className="bg-red-500 text-[9px] font-black">CRITICAL</Badge>
                  <p className="text-[10px] text-white/40 font-bold uppercase">PROBABILITY: 92%</p>
                </div>
                <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-black text-xs h-12 rounded-2xl uppercase tracking-widest shadow-xl shadow-primary/20">
                  RECONCILE ROSTER
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 px-10 py-6 border-b">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment context</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-black text-slate-800 italic tracking-tighter">18°C</p>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">London Operations</p>
                </div>
                <CloudSun className="h-12 w-12 text-orange-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visibility</p>
                  <p className="text-sm font-black text-slate-800">Clear • 10km</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Index</p>
                  <p className="text-sm font-black text-green-500">Low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
