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
  ArrowRight
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
import { incidents, sites, patrols } from '@/lib/data';
import { format } from 'date-fns';

export default function ClientPortalDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clientSites = sites.slice(0, 2);
  const clientIncidents = incidents.filter(i => clientSites.some(s => s.id === i.siteId));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Client Service Portal</h1>
          <p className="text-muted-foreground text-sm font-medium">Real-time visibility into your security operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm border-primary text-primary">
            <FileText className="mr-2 h-4 w-4" /> Download Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md px-6">
            <MessageSquare className="mr-2 h-4 w-4" /> Contact Support
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Current Coverage</CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground mt-1">All posts currently filled</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Open Incidents</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientIncidents.filter(i => i.status === 'Open').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring your review</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Patrol Completion</CardTitle>
            <Map className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across all sites</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg font-bold">Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {clientIncidents.map(incident => (
                <div key={incident.id} className="p-6 border-b last:border-0 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{incident.siteName} - {incident.type}</h4>
                    <Badge variant={incident.severity === 'High' ? 'destructive' : 'secondary'}>{incident.severity}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{incident.description}</p>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {isMounted ? format(new Date(incident.timestamp), 'MMM dd, HH:mm') : '...'}</span>
                    <span className="flex items-center gap-1"><Building className="h-3 w-3" /> ID: {incident.id}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Site Compliance & Docs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg"><FileText className="h-5 w-5 text-slate-600" /></div>
                  <div>
                    <p className="text-sm font-bold">Annual Risk Assessment 2024</p>
                    <p className="text-xs text-muted-foreground">Updated Oct 12, 2024</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-primary font-bold">View</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg"><FileText className="h-5 w-5 text-slate-600" /></div>
                  <div>
                    <p className="text-sm font-bold">Site SOP (Standard Operating Procedures)</p>
                    <p className="text-xs text-muted-foreground">Version 4.2 • Updated Oct 01</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-primary font-bold">View</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-primary border-none text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white/80" />
                CLIENT AI ASSISTANT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/90 leading-relaxed">
                Ask me anything about your site operations, recent incidents, or guard compliance.
              </p>
              <div className="bg-white/10 p-3 rounded-lg text-xs space-y-2 border border-white/20">
                <p className="font-bold text-white/60 uppercase tracking-widest">Try asking:</p>
                <button className="block w-full text-left hover:text-white transition-colors">"Summarize incidents this week"</button>
                <button className="block w-full text-left hover:text-white transition-colors">"Check guard compliance status"</button>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-full font-bold">Open Assistant</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Live Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {patrols.filter(p => p.status === 'In Progress').map(patrol => (
                <div key={patrol.id} className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{patrol.siteName} - Patrol</span>
                    <span>{patrol.completion}%</span>
                  </div>
                  <Progress value={patrol.completion} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">Guard: {patrol.guardName} • {patrol.checkpoints} Checkpoints</p>
                </div>
              ))}
              <Button variant="link" className="w-full text-primary font-bold text-xs p-0 h-auto flex items-center gap-2">
                View All Patrols <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
