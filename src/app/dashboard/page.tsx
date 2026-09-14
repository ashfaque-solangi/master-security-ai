
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, AlertTriangle, Radio, Navigation, 
  CloudSun, Zap, Activity, Clock, ShieldCheck, MapPin, 
  MessageSquare, Briefcase, TrendingUp, Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useJsonStore } from '@/lib/store';
import { format } from 'date-fns';
import { AccessControlService } from '@/lib/access-control';
import Link from 'next/link';

export default function OperationalCommandCentre() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setUser(store.getCurrentUser());
  }, []);

  if (!mounted || !user) return null;

  const guards = store.getGuards();
  const shifts = store.getShifts();
  const incidents = store.getIncidents();
  const sos = store.getSOS();
  const alarms = store.getAlarms();
  const vehicles = store.getVehicles();

  // Metrics Aggregation
  const activeStaff = shifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + s.assignments.length, 0);
  const totalRequired = shifts.reduce((acc, s) => acc + s.requirements.reduce((rAcc, r) => rAcc + r.count, 0), 0);
  const openPositions = totalRequired - activeStaff;
  const coverage = totalRequired > 0 ? (activeStaff / totalRequired) * 100 : 100;
  
  const criticalIncidents = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const pendingCompliance = guards.filter(g => g.complianceStatus !== 'Compliant').length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Command Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2 uppercase italic">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
            OPERATIONAL COMMAND CENTRE
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Real-time Enterprise Intelligence • {format(new Date(), 'HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white border-slate-200 h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm">
            <CloudSun className="h-4 w-4 text-orange-400" />
            <span className="font-bold text-xs uppercase">London: 18°C</span>
          </Badge>
          <Button className="bg-slate-900 text-white rounded-xl h-10 px-6 font-black text-xs uppercase italic tracking-widest shadow-xl">
            LIVE SYNC
          </Button>
        </div>
      </div>

      {/* KPI Section (WEB-01 #1) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/workforce">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-primary text-white rounded-2xl cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/70">Staffing Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black italic">{coverage.toFixed(1)}%</div>
              <Progress value={coverage} className="h-1 mt-2 bg-white/20" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/scheduling">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 italic">{openPositions}</div>
              <p className="text-[9px] font-bold text-red-500 uppercase mt-1">Gaps Detected</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/incidents">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 italic">{criticalIncidents + sos.length}</div>
              <p className="text-[9px] font-bold text-orange-600 uppercase mt-1">Priority Required</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/compliance">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliance Index</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 italic">{pendingCompliance}</div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Blocked Personnel</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/50">Site Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-400 italic">94%</div>
            <p className="text-[9px] font-bold text-white/60 uppercase mt-1">Stable</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Command View (WEB-01 #2) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Live Events Timeline (WEB-01 #3) */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black italic uppercase flex items-center gap-2">
                <Activity className="h-4 w-4" /> Operational Live Feed
              </CardTitle>
              <Badge className="bg-green-500 text-[8px] animate-pulse">LIVE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {sos.map(alert => (
                  <div key={alert.id} className="p-4 bg-red-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600 animate-bounce">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-red-900 uppercase">EMERGENCY SOS: {alert.guardName}</p>
                        <p className="text-[10px] font-bold text-red-600">{alert.siteName} • {format(new Date(alert.timestamp), 'HH:mm:ss')}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-black text-[9px]">RESPOND</Button>
                  </div>
                ))}
                {incidents.slice(0, 5).map(inc => (
                  <div key={inc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${inc.severity === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase">{inc.type}: {inc.siteName}</p>
                        <p className="text-[10px] font-bold text-slate-400">{inc.description.substring(0, 40)}...</p>
                      </div>
                    </div>
                    <Link href={`/incidents?id=${inc.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary font-black text-[9px]">VIEW</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Site Command Panels */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Guards Panel */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.15em]">Personnel Telemetry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {guards.filter(g => g.status === 'Active').slice(0, 4).map(g => (
                  <div key={g.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-[10px]">{g.name.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-black text-slate-800 italic">{g.name}</p>
                        <p className="text-[9px] font-bold text-green-500 flex items-center gap-1 uppercase">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Checked In
                        </p>
                      </div>
                    </div>
                    <Link href={`/workforce?id=${g.id}`}>
                      <Navigation className="h-3 w-3 text-slate-300 hover:text-primary transition-colors cursor-pointer" />
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vehicle Ops */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.15em]">Mobile Fleet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 border border-dashed rounded-xl">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-black text-slate-800">{v.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{v.status}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black">{format(new Date(v.lastUpdate), 'HH:mm')}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary border-none text-white shadow-xl rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-32 w-32" />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <Zap className="h-5 w-5 fill-white" /> AI Ops Analyst
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-tight">
                  Detecting staffing gaps at <span className="italic underline">Nakatomi Plaza</span>
                </p>
                <p className="text-[10px] mt-2 text-white/60 font-medium">
                  2 unfilled positions found. Recommend deployment of available guards with CCTV certification.
                </p>
                <Button className="w-full mt-6 bg-white text-primary hover:bg-white/90 rounded-full font-black text-[10px] uppercase h-11 italic shadow-lg">
                  RUN AI OPTIMIZATION
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50 px-8 py-6 flex flex-row items-center justify-between border-b">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patrol Progress</CardTitle>
              <Activity className="h-3 w-3 text-primary" />
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Tech Hub HQ</span>
                  <span className="text-primary">82%</span>
                </div>
                <Progress value={82} className="h-1.5" />
                <p className="text-[9px] font-bold text-slate-400">Next Checkpoint: Server Room 4</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Retail Park East</span>
                  <span className="text-green-500">COMPLETE</span>
                </div>
                <Progress value={100} className="h-1.5 [&>div]:bg-green-500" />
                <p className="text-[9px] font-bold text-slate-400">Verified at 14:22 by System</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
