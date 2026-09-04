'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Zap,
  Flame,
  ArrowRight,
  Target,
  Sparkles,
  MapPin,
  ShieldAlert,
  Timer
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
import { useJsonStore } from '@/lib/store';
import { Guard, Incident, Site, SOSAlert, Shift } from '@/lib/types';
import { formatDistanceToNow, isWithinInterval, parseISO } from 'date-fns';

export default function DashboardPage() {
  const store = useJsonStore();
  const [isMounted, setIsMounted] = useState(false);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const sosAlerts: SOSAlert[] = [
    {
      id: 'SOS-001',
      guardId: 'GRD-001',
      guardName: 'Marcus Thorne',
      siteName: 'Tech Hub HQ',
      timestamp: new Date().toISOString(),
      status: 'Active',
      location: { lat: 37.7749, lng: -122.4194 }
    }
  ];

  useEffect(() => {
    setIsMounted(true);
    setGuards(store.getGuards());
    setIncidents(store.getIncidents());
    setSites(store.getSites());
    setShifts(store.getShifts());
  }, []);

  if (!isMounted) return null;

  const activeGuards = guards.filter(g => g.status === 'Active');
  const criticalIncidents = incidents.filter(i => i.severity === 'High' || i.severity === 'Critical');
  const openShiftsCount = shifts.filter(s => s.status === 'Open').length;
  const fatiguedGuards = guards.filter(g => g.weeklyHours >= 38);

  const getGuardsForSite = (siteId: string) => {
    const activeShifts = shifts.filter(s => s.siteId === siteId && s.status === 'In Progress');
    const team: string[] = [];
    activeShifts.forEach(s => {
      if (s.assignedGuards) {
        s.assignedGuards.forEach(ag => team.push(ag.name));
      }
    });
    return Array.from(new Set(team));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Welcome Admin!</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Command Centre / Operational Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm">
            <Zap className="mr-2 h-4 w-4" /> AI Reports
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md px-6">
            + New Incident
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Guards</p>
                <p className="text-2xl font-extrabold text-slate-800">{activeGuards.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(activeGuards.length / (guards.length || 1)) * 100} className="h-1.5" />
              <p className="text-[10px] mt-2 text-muted-foreground font-medium">Target: {guards.length} total personnel</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Site Coverage</p>
                <p className="text-2xl font-extrabold text-slate-800">94.2%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-green-500 font-bold flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> +2.4%
              </span>
              <span className="text-[10px] text-muted-foreground">than last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Open Risks</p>
                <p className="text-2xl font-extrabold text-slate-800">{incidents.filter(i => i.status === 'Open').length}</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="destructive" className="rounded-full text-[10px]">
                {criticalIncidents.length} Critical Escalations
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Open Shifts</p>
                <p className="text-2xl font-extrabold text-slate-800">{openShiftsCount}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] text-primary font-bold">
              AI Suggesting Replacements <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {sosAlerts.length > 0 && (
            <Card className="border-l-4 border-l-destructive shadow-lg bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-destructive/5 pb-4">
                <div>
                  <CardTitle className="text-destructive text-lg flex items-center gap-2 font-black">
                    <Flame className="h-5 w-5 animate-pulse" />
                    EMERGENCY RESPONSE REQUIRED
                  </CardTitle>
                  <CardDescription className="text-destructive/80 font-medium">Critical SOS Alerts active in the field.</CardDescription>
                </div>
                <Button size="sm" variant="destructive" className="rounded-full px-6">View Command Map</Button>
              </CardHeader>
              <CardContent className="p-0">
                {sosAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-6 border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center text-destructive text-xl font-black">
                        {alert.guardName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800">{alert.guardName}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="font-bold text-destructive underline">{alert.siteName}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button size="sm" variant="outline" className="rounded-full border-destructive text-destructive hover:bg-destructive hover:text-white">Acknowledge</Button>
                      <Button size="sm" className="bg-destructive text-white rounded-full px-6">Dispatch Now</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Incident Feed
                </CardTitle>
                <Button variant="link" className="text-primary text-xs font-bold">View History</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-start gap-4 p-6 border-b last:border-0 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className={`mt-1 p-2 rounded-lg ${
                    incident.severity === 'Critical' || incident.severity === 'High' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-orange-50 text-primary'
                  }`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-slate-800">{incident.siteName} - {incident.type}</p>
                      <Badge variant={incident.severity === 'High' ? 'destructive' : 'secondary'} className="rounded-full text-[10px]">
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(parseISO(incident.timestamp), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {incident.guardName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                Fatigue Monitoring (Overtime Control)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {fatiguedGuards.length > 0 ? fatiguedGuards.map(guard => (
                <div key={guard.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{guard.name}</span>
                    <span className="text-red-600">{guard.weeklyHours}h / 40h</span>
                  </div>
                  <Progress value={(guard.weeklyHours / 40) * 100} className="h-1.5 [&>div]:bg-red-500" />
                </div>
              )) : (
                <p className="text-xs text-muted-foreground italic">No guards currently nearing weekly limit.</p>
              )}
              <Button variant="outline" className="w-full text-xs font-bold mt-2">Manage Rosters</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Site Coverage Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {sites.slice(0, 5).map((site) => {
                const siteGuards = getGuardsForSite(site.id);
                return (
                  <div key={site.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-800">{site.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className="text-[9px] h-4">{site.riskLevel} RISK</Badge>
                           <span className="text-[10px] text-muted-foreground font-bold uppercase">{siteGuards.length} On Duty</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${site.healthScore > 90 ? 'text-green-500' : 'text-orange-500'}`}>
                          {site.healthScore}%
                        </p>
                      </div>
                    </div>
                    <Progress value={site.healthScore} className={`h-1.5 ${site.healthScore > 90 ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'}`} />
                    {siteGuards.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {siteGuards.map((name, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-50 border px-2 py-0.5 rounded text-[9px] font-bold text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            {name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-none shadow-xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI OPS INSIGHT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                You have <span className="text-primary font-bold">{openShiftsCount} unassigned shifts</span> this week. Recommend running **AI Auto-Fill** to prevent coverage gaps.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold">Launch Auto-Scheduler</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
