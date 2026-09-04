'use client';

import { useState, useEffect } from 'react';
import { 
  Building, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Map, 
  Clock,
  MessageSquare,
  Sparkles,
  ArrowRight,
  LayoutDashboard
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
import { format } from 'date-fns';
import { Site, Incident, Shift } from '@/lib/types';

export default function ClientPortalDashboard() {
  const store = useJsonStore();
  const [isMounted, setIsMounted] = useState(false);
  const [clientSites, setClientSites] = useState<Site[]>([]);
  const [clientIncidents, setClientIncidents] = useState<Incident[]>([]);
  const [clientShifts, setClientShifts] = useState<Shift[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const user = store.getCurrentUser();
    if (user && user.clientId) {
      const allSites = store.getSites();
      const filteredSites = allSites.filter(s => s.clientId === user.clientId);
      setClientSites(filteredSites);

      const allIncidents = store.getIncidents();
      setClientIncidents(allIncidents.filter(i => filteredSites.some(s => s.id === i.siteId)));

      const allShifts = store.getShifts();
      setClientShifts(allShifts.filter(s => filteredSites.some(site => site.id === s.siteId)));
    }
  }, []);

  if (!isMounted) return null;

  const activeStaffCount = clientShifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + (s.assignments?.length || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">CLIENT SERVICE PORTAL</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Enterprise visibility for {clientSites[0]?.clientName || 'Partner'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm border-primary text-primary font-bold">
            <FileText className="mr-2 h-4 w-4" /> RECONCILE BILLING
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md px-6 font-black">
            <MessageSquare className="mr-2 h-4 w-4" /> OPS SUPPORT
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deployed Staff</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeStaffCount}</div>
            <p className="text-[10px] text-green-400 font-bold mt-1">100% POST COVERAGE</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{clientIncidents.filter(i => i.status === 'Open').length}</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">REQUIRING REVIEW</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patrol Completion</CardTitle>
            <Map className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">98.4%</div>
            <Progress value={98.4} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/60">Compliance Health</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">94.2%</div>
            <p className="text-[10px] text-white/80 font-bold mt-1">SIA & TRAINING VALIDATED</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black italic">SITE INCIDENT LOG</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary font-bold">VIEW ALL</Button>
            </CardHeader>
            <CardContent className="p-0">
              {clientIncidents.length > 0 ? clientIncidents.map(incident => (
                <div key={incident.id} className="p-6 border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">{incident.siteName} - {incident.type}</h4>
                    <Badge variant={incident.severity === 'High' ? 'destructive' : 'secondary'} className="text-[9px] font-black uppercase">{incident.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">{incident.description}</p>
                  <div className="flex items-center gap-6 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary" /> {format(new Date(incident.timestamp), 'MMM dd, HH:mm')}</span>
                    <span className="flex items-center gap-1.5"><Building className="h-3 w-3 text-primary" /> REF: {incident.id}</span>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-muted-foreground italic font-medium">No incidents reported on your sites.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black italic uppercase tracking-widest text-slate-400">Managed Sites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clientSites.map(site => (
                  <div key={site.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-dashed">
                    <div>
                      <p className="text-sm font-black text-slate-800">{site.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{site.address}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-600 border-none text-[8px]">ACTIVE</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black italic uppercase tracking-widest text-slate-400">Site Compliance & Docs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-xl hover:border-primary transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10"><FileText className="h-4 w-4 text-slate-600 group-hover:text-primary" /></div>
                    <span className="text-xs font-black text-slate-700">Annual Risk Assessment 2024</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-xl hover:border-primary transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10"><FileText className="h-4 w-4 text-slate-600 group-hover:text-primary" /></div>
                    <span className="text-xs font-black text-slate-700">Standard Operating Procedures (SOP)</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-primary border-none text-white shadow-xl overflow-hidden relative rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white/80 animate-pulse" />
                CLIENT AI ANALYST
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-white/90 leading-relaxed font-bold">
                Analyzing site data... Staffing is at 100% efficiency. Recommend reviewing the recent Observation report for Nakatomi Plaza.
              </p>
              <div className="bg-white/10 p-4 rounded-2xl text-[10px] space-y-3 border border-white/20 backdrop-blur-md">
                <p className="font-black text-white/60 uppercase tracking-widest border-b border-white/10 pb-2">SUGGESTED ACTIONS</p>
                <button className="block w-full text-left hover:text-white transition-colors font-bold">• Summarize incidents this week</button>
                <button className="block w-full text-left hover:text-white transition-colors font-bold">• Review guard compliance status</button>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-full font-black text-xs h-11 uppercase shadow-xl">Launch Analyst</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 pb-4">
              <CardTitle className="text-sm font-black italic uppercase tracking-widest text-slate-500">Live Patrol Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Exterior Patrol</span>
                  <span className="text-primary">65% DONE</span>
                </div>
                <Progress value={65} className="h-1.5" />
                <p className="text-[10px] text-slate-400 font-bold">Officer: Marcus Thorne • 4/6 Checkpoints</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Floor Sweep</span>
                  <span className="text-green-500">COMPLETE</span>
                </div>
                <Progress value={100} className="h-1.5 [&>div]:bg-green-500" />
                <p className="text-[10px] text-slate-400 font-bold">Officer: Leo Varga • Logged 09:42</p>
              </div>
              <Button variant="link" className="w-full text-primary font-black text-[10px] p-0 h-auto flex items-center justify-center gap-2 uppercase tracking-widest">
                SITE LOGS <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
