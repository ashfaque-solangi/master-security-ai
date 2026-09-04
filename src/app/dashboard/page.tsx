
'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  AlertCircle, 
  Clock, 
  MapPin, 
  TrendingUp,
  Activity,
  Zap,
  Flame,
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
import { guards, incidents, sites, sosAlerts } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeGuards = guards.filter(g => g.status === 'Active');
  const criticalIncidents = incidents.filter(i => i.severity === 'High' || i.severity === 'Critical');
  const openShiftsCount = sites.reduce((acc, site) => acc + site.openShifts, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Live Command Centre</h1>
          <p className="text-muted-foreground text-lg">
            Multi-site operational overview and emergency monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Reports</Button>
          <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse">
            Active SOS: {sosAlerts.length}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guards On-Site</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGuards.length} / {guards.length}</div>
            <Progress value={(activeGuards.length / guards.length) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Shift Risks</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{openShiftsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI Suggesting 5 replacements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{incidents.filter(i => i.status === 'Open').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalIncidents.length} Critical escalation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Avg</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {sosAlerts.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Flame className="h-5 w-5 animate-bounce" />
                Active Panic / SOS Alerts
              </CardTitle>
              <CardDescription>Immediate tactical response required.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sosAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center text-white font-bold">
                    {alert.guardName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-destructive">{alert.guardName} - SOS Triggered</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.siteName} • {isMounted ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true }) : 'Calculating...'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white">Acknowledge</Button>
                  <Button size="sm" className="bg-destructive text-white">Dispatch Support</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Live Site Alerts
            </CardTitle>
            <CardDescription>
              Real-time events across all monitored sites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full ${
                  incident.severity === 'Critical' || incident.severity === 'High' 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-accent/10 text-accent'
                }`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{incident.siteName} - {incident.type}</p>
                    <Badge variant={incident.severity === 'High' ? 'destructive' : 'outline'}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isMounted ? formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true }) : '...'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {incident.guardName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="link" className="w-full text-accent">View All Incidents</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Site Health & Status
            </CardTitle>
            <CardDescription>
              Infrastructure and coverage scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sites.map((site) => (
              <div key={site.id} className="space-y-2 py-2 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{site.name}</p>
                    <p className="text-xs text-muted-foreground">{site.activeGuardsCount} Guards • {site.riskLevel} Risk</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${site.healthScore > 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {site.healthScore}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Health</p>
                  </div>
                </div>
                <Progress value={site.healthScore} className={`h-1.5 ${site.healthScore > 90 ? '[&>div]:bg-green-500' : '[&>div]:bg-yellow-500'}`} />
              </div>
            ))}
            <Button className="w-full mt-4" variant="outline">
              Operational Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
