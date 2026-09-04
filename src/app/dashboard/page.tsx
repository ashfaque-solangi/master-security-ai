
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Building2, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ShieldAlert,
  CalendarCheck,
  TrendingUp,
  Briefcase,
  Activity,
  Zap,
  Radio,
  Navigation,
  CloudSun
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { calculateDailyHours } from '@/lib/scheduling-validation';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  
  const [stats, setStats] = useState({
    activeGuards: 0,
    onDuty: 0,
    openShifts: 0,
    incidents: 0,
    complianceAlerts: 0,
    siteHealth: 92
  });

  useEffect(() => {
    setMounted(true);
    const guards = store.getGuards();
    const shifts = store.getShifts();
    const incidents = store.getIncidents();

    setStats({
      activeGuards: guards.filter(g => g.status === 'Active').length,
      onDuty: shifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + (s.assignments?.length || 0), 0),
      openShifts: shifts.filter(s => s.status === 'Open').length,
      incidents: incidents.filter(i => i.status !== 'Resolved').length,
      complianceAlerts: guards.filter(g => g.complianceStatus !== 'Compliant').length,
      siteHealth: 94
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
            LIVE COMMAND CENTRE
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Real-time Operational Oversights • {format(new Date(), 'EEEE, MMMM dd')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white border-slate-200 px-4 py-1.5 h-10 rounded-full flex items-center gap-2">
            <CloudSun className="h-4 w-4 text-orange-400" />
            <span className="font-bold">London: 18°C</span>
          </Badge>
          <Button className="bg-slate-900 text-white rounded-full font-black px-6 shadow-xl shadow-slate-200">
            FORCE REFRESH
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
             <UserCheck className="h-32 w-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-white/70">Personnel On-Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats.onDuty}</div>
            <p className="text-[10px] mt-1 font-bold text-white/80">98.4% Post Coverage</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative group overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
             <AlertTriangle className="h-32 w-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Incidents</CardTitle>
            <Badge variant="destructive" className="h-5 px-2 animate-pulse">{stats.incidents} LIVE</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.incidents}</div>
            <p className="text-[10px] mt-1 font-bold text-red-500">2 High Severity Events</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Site Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.siteHealth}%</div>
            <Progress value={stats.siteHealth} className="h-1.5 mt-2 bg-slate-100" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-white/50">Vacancies</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary">{stats.openShifts}</div>
            <p className="text-[10px] mt-1 font-bold text-white/60">Across 3 Strategic Sites</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary" />
                      Guard GPS Monitor
                    </CardTitle>
                    <CardDescription className="text-xs">Live tracking of workforce location and activity.</CardDescription>
                 </div>
                 <Button variant="ghost" size="sm" className="text-primary font-bold">FULL MAP</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {store.getShifts().filter(s => s.status === 'In Progress').map(shift => (
                      <div key={shift.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-dashed">
                               {shift.assignments[0]?.guardName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-800">{shift.assignments[0]?.guardName}</p>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                                  <MapPin className="h-2 w-2 text-primary" /> {shift.siteName}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Last Activity</p>
                               <p className="text-xs font-black text-green-600">Patrol Checkpoint 4</p>
                            </div>
                            <Badge className="bg-green-50 text-green-600 border-none">LIVE</Badge>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Live Incident Stream</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y border-t">
                    {store.getIncidents().slice(0, 3).map(inc => (
                      <div key={inc.id} className="p-4 bg-slate-50/50 flex items-start gap-4">
                         <div className={`p-2 rounded-lg ${inc.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                            <AlertTriangle className="h-5 w-5" />
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between">
                               <p className="text-sm font-black text-slate-800">{inc.type} at {inc.siteName}</p>
                               <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(inc.timestamp), 'HH:mm')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{inc.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <Badge variant="outline" className="text-[9px] uppercase">{inc.status}</Badge>
                               <Button variant="link" className="text-[10px] h-auto p-0 font-bold">ACKNOWLEDGE</Button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                 <Zap className="h-24 w-24" />
              </div>
              <CardHeader>
                 <CardTitle className="text-lg font-black flex items-center gap-2">
                    AI OPS ANALYST
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
                    <p className="text-xs leading-relaxed font-bold">
                       Detecting <span className="underline decoration-white/50">3 Critical Gaps</span> in tomorrow's night shift at **Nakatomi Plaza**.
                       Recommend deployment of Officer Jenkins due to low fatigue score.
                    </p>
                    <Button className="w-full mt-4 bg-white text-primary hover:bg-white/90 rounded-full font-black text-[10px] uppercase">
                       Optimize Tomorrow
                    </Button>
                 </div>
                 <p className="text-[10px] text-center text-white/60 font-bold uppercase tracking-widest">
                    Last Global Sync: 2 mins ago
                 </p>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Compliance Blockers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {store.getGuards().filter(g => g.complianceStatus !== 'Compliant').slice(0, 3).map(g => (
                   <div key={g.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                      <div>
                         <p className="text-xs font-black text-slate-800">{g.name}</p>
                         <p className="text-[9px] font-bold text-red-500 uppercase">Licence Expired</p>
                      </div>
                      <Badge variant="destructive" className="text-[8px]">BLOCKED</Badge>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
