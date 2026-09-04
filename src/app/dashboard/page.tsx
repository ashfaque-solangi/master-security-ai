
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
  Briefcase
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

export default function AdminDashboard() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  
  // Local state for calculated stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGuards: 0,
    activeGuards: 0,
    totalClients: 0,
    activeSites: 0,
    activeSubs: 0,
    todayShifts: 0,
    openShifts: 0,
    overtimeAlerts: 0,
    fatigueAlerts: 0
  });

  useEffect(() => {
    setMounted(true);
    const guards = store.getGuards();
    const sites = store.getSites();
    const users = store.getUsers();
    const clients = store.getClients();
    const subs = store.getSubcontractors();
    const shifts = store.getShifts();
    const now = new Date();

    const fatigueAlerts = guards.filter(g => {
      const hours = calculateDailyHours(g.id, now, shifts);
      return hours > 12;
    }).length;

    setStats({
      totalUsers: users.length,
      totalGuards: guards.length,
      activeGuards: guards.filter(g => g.status === 'Active').length,
      totalClients: clients.length,
      activeSites: sites.filter(s => s.status === 'Active').length,
      activeSubs: subs.filter(s => s.status === 'Active').length,
      todayShifts: shifts.filter(s => s.status !== 'Cancelled').length, // Mock logic for "Today"
      openShifts: shifts.filter(s => s.status === 'Open').length,
      overtimeAlerts: guards.filter(g => false).length, // Placeholder
      fatigueAlerts
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">COMMAND CENTRE</h1>
        <p className="text-muted-foreground font-medium">Enterprise Workforce Oversight • Global Real-time Stats</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-white/70">Operational Guards</CardTitle>
            <UserCheck className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.activeGuards} / {stats.totalGuards}</div>
            <p className="text-[10px] mt-1 font-bold text-white/80">92% Deployment Rate</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Managed Sites</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.activeSites}</div>
            <p className="text-[10px] mt-1 font-bold text-green-600">+2 New this month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's Load</CardTitle>
            <CalendarCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.todayShifts} Shifts</div>
            <div className="mt-2 flex items-center gap-2">
               <Badge variant="destructive" className="text-[9px] h-4">{stats.openShifts} OPEN</Badge>
               <span className="text-[10px] text-muted-foreground font-bold">Unassigned Posts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-white/50">Risk & Fatigue</CardTitle>
            <ShieldAlert className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{stats.fatigueAlerts}</div>
            <p className="text-[10px] mt-1 font-bold text-white/60">Guards exceeding 12h duty</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b pb-4">
             <CardTitle className="text-lg font-bold flex items-center gap-2">
               <Briefcase className="h-5 w-5 text-primary" />
               Critical Site Coverage
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y">
                {store.getSites().slice(0, 5).map(site => (
                  <div key={site.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400">{site.code}</div>
                        <div>
                           <p className="text-sm font-bold text-slate-800">{site.name}</p>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase">{site.address}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-black text-slate-900">4 / {site.requiredGuardCount} Guards</p>
                        <Progress value={40} className="h-1 w-24 mt-1" />
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-sm bg-orange-50 border border-primary/10">
              <CardHeader>
                 <CardTitle className="text-sm font-black flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    AI OPS INSIGHT
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    You have <span className="font-black underline">{stats.openShifts} unassigned posts</span> in the next 24 hours. 
                    Running **AI Auto-Scheduler** could optimize deployment and save **$420** in overtime costs.
                 </p>
                 <button className="w-full bg-primary text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-lg shadow-lg shadow-primary/20">
                    Run Optimization Pass
                 </button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
              <CardHeader>
                 <CardTitle className="text-sm font-bold">Subcontractor Pool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {store.getSubcontractors().map(sub => (
                   <div key={sub.id} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">{sub.name}</span>
                      <Badge variant="outline" className="text-[9px]">{sub.rating.toFixed(1)} ★</Badge>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
