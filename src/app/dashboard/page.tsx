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
  CloudSun,
  ShieldCheck,
  TrendingDown
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
import { getFatigueScore } from '@/lib/scheduling-validation';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Guard } from '@/lib/types';

export default function AdminDashboard() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  const [guards, setGuards] = useState<Guard[]>([]);
  
  const [stats, setStats] = useState({
    activeGuards: 0,
    onDuty: 0,
    openShifts: 0,
    incidents: 0,
    complianceAlerts: 0,
    siteHealth: 92,
    fatigueRisk: 0
  });

  useEffect(() => {
    setMounted(true);
    const allGuards = store.getGuards();
    const shifts = store.getShifts();
    const incidents = store.getIncidents();
    setGuards(allGuards);

    setStats({
      activeGuards: allGuards.filter(g => g.status === 'Active').length,
      onDuty: shifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + (s.assignments?.length || 0), 0),
      openShifts: shifts.filter(s => s.status === 'Open').length,
      incidents: incidents.filter(i => i.status !== 'Resolved').length,
      complianceAlerts: allGuards.filter(g => g.complianceStatus !== 'Compliant').length,
      siteHealth: 94,
      fatigueRisk: allGuards.filter(g => getFatigueScore(g) === 'HIGH' || getFatigueScore(g) === 'CRITICAL').length
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2 uppercase italic tracking-tighter">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
            LIVE COMMAND CENTRE
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Real-time Operational Oversights • {format(new Date(), 'EEEE, MMMM dd')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white border-slate-200 px-4 py-1.5 h-10 rounded-full flex items-center gap-2 shadow-sm">
            <CloudSun className="h-4 w-4 text-orange-400" />
            <span className="font-bold text-xs uppercase">London: 18°C</span>
          </Badge>
          <Button className="bg-slate-900 text-white rounded-full font-black px-6 shadow-xl shadow-slate-200 h-10 text-xs uppercase italic tracking-widest">
            FORCE REFRESH
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative group rounded-3xl">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
             <UserCheck className="h-32 w-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/70">Personnel On-Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black italic tracking-tighter">{stats.onDuty}</div>
            <p className="text-[9px] mt-1 font-black uppercase text-white/80 tracking-widest">98.4% POST COVERAGE</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative group overflow-hidden rounded-3xl">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
             <AlertTriangle className="h-32 w-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Incidents</CardTitle>
            <Badge variant="destructive" className="h-5 px-2 animate-pulse text-[8px] font-black uppercase">{stats.incidents} LIVE</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 italic tracking-tighter">{stats.incidents}</div>
            <p className="text-[9px] mt-1 font-black text-red-500 uppercase tracking-widest">CRITICAL RESPONSE NEEDED</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Site Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 italic tracking-tighter">{stats.siteHealth}%</div>
            <Progress value={stats.siteHealth} className="h-1 mt-2 bg-slate-100" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/50">Unfilled Posts</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary italic tracking-tighter">{stats.openShifts}</div>
            <p className="text-[9px] mt-1 font-black text-white/60 uppercase tracking-widest">VACANT REQUIREMENTS</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-white border-b flex flex-row items-center justify-between px-8 py-6">
                 <div>
                    <CardTitle className="text-xl font-black flex items-center gap-3 italic tracking-tighter">
                      <Navigation className="h-6 w-6 text-primary" />
                      GPS MONITOR
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Real-time workforce location telemetry</CardDescription>
                 </div>
                 <Button variant="ghost" size="sm" className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5">FULL MAP VIEW</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y border-slate-50">
                    {store.getShifts().filter(s => s.status === 'In Progress').map(shift => (
                      <div key={shift.id} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                         <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-dashed border-slate-300 group-hover:border-primary group-hover:text-primary transition-colors">
                               {shift.assignments?.[0]?.guardName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-base font-black text-slate-800 italic tracking-tighter">{shift.assignments?.[0]?.guardName}</p>
                               <p className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1.5 mt-1 tracking-widest">
                                  <MapPin className="h-2.5 w-2.5 text-primary" /> {shift.siteName}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-10">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Update</p>
                               <p className="text-xs font-black text-green-600 uppercase italic">Patrol Point 4 • Verified</p>
                            </div>
                            <Badge className="bg-green-50 text-green-600 border-none font-black text-[9px] px-3">LIVE</Badge>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-900 text-white px-8 py-6">
                 <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Incident Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y border-slate-50">
                    {store.getIncidents().slice(0, 3).map(inc => (
                      <div key={inc.id} className="p-8 bg-white flex items-start gap-6 hover:bg-slate-50 transition-colors">
                         <div className={`p-4 rounded-[1.25rem] ${inc.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'} shadow-sm`}>
                            <AlertTriangle className="h-6 w-6" />
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-base font-black text-slate-800 italic uppercase tracking-tight">{inc.type} at {inc.siteName}</p>
                               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{format(new Date(inc.timestamp), 'HH:mm')}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 line-clamp-2">{inc.description}</p>
                            <div className="flex items-center gap-4 mt-4">
                               <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200">{inc.status}</Badge>
                               <Button variant="link" className="text-[9px] h-auto p-0 font-black uppercase text-primary tracking-widest hover:no-underline">ACKNOWLEDGE EVENT</Button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-2xl bg-primary text-white overflow-hidden relative rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                 <Zap className="h-32 w-32" />
              </div>
              <CardHeader className="p-8">
                 <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                    <Zap className="h-6 w-6 text-white" />
                    AI OPS ANALYST
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <div className="bg-white/10 p-6 rounded-[1.5rem] border border-white/20 backdrop-blur-xl shadow-inner">
                    <p className="text-xs leading-relaxed font-black uppercase tracking-tight">
                       DETECTING <span className="text-white underline decoration-white/50">{stats.openShifts} VACANCIES</span> AT <span className="italic">NAKATOMI PLAZA</span>.
                    </p>
                    <p className="text-[10px] mt-2 text-white/70 font-bold leading-relaxed uppercase">
                       Recommend officer deployment via AI engine to prevent shift breach.
                    </p>
                    <Button className="w-full mt-6 bg-white text-primary hover:bg-white/90 rounded-full font-black text-[10px] uppercase h-12 italic shadow-xl tracking-tighter">
                       GLOBAL OPTIMIZATION
                    </Button>
                 </div>
                 <div className="flex items-center justify-between px-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/50">SYSTEM SYNC: ACTIVE</p>
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50 border-b px-8 py-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">FATIGUE RISK & OVERTIME</CardTitle>
                 <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[9px]">{stats.fatigueRisk} ALERTS</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {guards.filter(g => getFatigueScore(g) === 'HIGH' || getFatigueScore(g) === 'CRITICAL').slice(0, 3).map(g => (
                   <div key={g.id} className="flex items-center justify-between p-4 bg-orange-50/50 border border-orange-100 rounded-2xl group hover:bg-orange-100 transition-colors cursor-pointer">
                      <div className="space-y-1">
                         <p className="text-sm font-black text-slate-800 italic tracking-tighter">{g.name}</p>
                         <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{g.weeklyHours}h LOGGED WEEKLY</p>
                      </div>
                      <Badge variant="destructive" className="text-[8px] font-black uppercase italic h-5 px-3">RISK</Badge>
                   </div>
                 ))}
                 {stats.fatigueRisk === 0 && (
                    <div className="py-10 text-center space-y-3">
                       <ShieldCheck className="h-8 w-8 text-green-500 mx-auto opacity-30" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">WORKFORCE STABLE</p>
                    </div>
                 )}
                 <Button variant="outline" className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest h-11 border-dashed mt-2">VIEW ANALYTICS</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
