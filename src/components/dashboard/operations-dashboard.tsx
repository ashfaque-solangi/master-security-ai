'use client';

import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Zap, 
  Clock,
  ArrowRight,
  TrendingUp,
  Truck,
  Activity
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJsonStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export function OperationsDashboard() {
  const store = useJsonStore();
  const shifts = store.getShifts();
  const incidents = store.getIncidents();
  const vehicles = store.getVehicles();
  const guards = store.getGuards();

  const activeShifts = shifts.filter(s => s.status === 'In Progress');
  const openShifts = shifts.filter(s => s.status === 'Open');
  const urgentGaps = openShifts.filter(s => s.priority === 'STAT' || s.priority === 'Urgent').length;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          label="Ongoing Deployments" 
          value={activeShifts.length} 
          icon={Activity} 
          description="Live Site Posts"
          href="/shifts"
        />
        <KPICard 
          label="Unfilled Vacancies" 
          value={openShifts.length} 
          icon={AlertTriangle} 
          status={urgentGaps > 0 ? 'destructive' : 'warning'}
          description={`${urgentGaps} Urgent Priority`}
          href="/scheduling"
        />
        <KPICard 
          label="Active Patrol Units" 
          value={vehicles.filter(v => v.status === 'Active').length} 
          icon={Truck} 
          href="/fleet"
        />
        <KPICard 
          label="Operational Compliance" 
          value="98.2%" 
          icon={ShieldCheck} 
          status="success"
          href="/compliance"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between bg-slate-50/50">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Live Deployment Registry</CardTitle>
                <CardDescription className="text-xs font-bold mt-1">Currently active personnel in the field</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full font-black text-[10px] h-8 px-4 border-primary text-primary">
                <Link href="/shifts">MANAGE ROSTER</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {activeShifts.length > 0 ? activeShifts.map(shift => (
                  <div key={shift.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 italic uppercase">{shift.siteName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {shift.assignments.map(a => (
                            <Badge key={a.id} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[8px] px-2">
                              {a.guardName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</p>
                      <p className="text-sm font-black text-slate-800">{format(parseISO(shift.endTime), 'HH:mm')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-20 text-center text-muted-foreground italic font-black uppercase tracking-widest opacity-20">Monitoring Operational Grid...</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b px-8 py-6 bg-slate-50/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Critical Fatigue Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {guards.filter(g => g.weeklyHours > 40).map(guard => (
                  <div key={guard.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                        {guard.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{guard.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{guard.qualifiedRoles[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weekly Hours</p>
                        <p className={guard.weeklyHours > 48 ? "text-sm font-black text-red-600" : "text-sm font-black text-amber-600"}>{guard.weeklyHours}h</p>
                      </div>
                      <Badge className={guard.weeklyHours > 48 ? "bg-red-500" : "bg-amber-500"}>RISK</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="command-gradient border-none text-white shadow-xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-32 w-32" />
            </div>
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Zap className="h-6 w-6 text-white fill-white" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-3">
              <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl h-14 font-black uppercase italic tracking-tighter shadow-xl">CREATE SHIFT</Button>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 rounded-2xl h-14 font-black uppercase italic tracking-tighter">AI AUTO-FILL</Button>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between bg-slate-50/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Active Incidents</CardTitle>
              <Badge className="bg-red-500 h-5 px-3 text-[8px] font-black">{incidents.filter(i => i.status !== 'Resolved').length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {incidents.filter(i => i.status !== 'Resolved').slice(0, 5).map(incident => (
                  <div key={incident.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-black text-slate-800 uppercase italic truncate max-w-[150px]">{incident.siteName}</p>
                      <Badge variant={incident.severity === 'Critical' || incident.severity === 'High' ? 'destructive' : 'secondary'} className="text-[7px] font-black uppercase h-4">
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{incident.description}</p>
                    <div className="flex items-center justify-between mt-3">
                       <span className="text-[8px] font-black text-slate-400 uppercase">{format(new Date(incident.timestamp), 'HH:mm')}</span>
                       <Button variant="link" asChild className="p-0 h-auto text-[8px] font-black text-primary uppercase">
                          <Link href={`/incidents?id=${incident.id}`}>VIEW REPORT</Link>
                       </Button>
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
