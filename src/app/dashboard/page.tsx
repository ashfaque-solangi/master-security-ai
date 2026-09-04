
'use client';

import { 
  Shield, 
  Users, 
  AlertCircle, 
  Clock, 
  MapPin, 
  TrendingUp,
  Activity
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
import { guards, incidents, sites } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const activeGuards = guards.filter(g => g.status === 'Active');
  const criticalIncidents = incidents.filter(i => i.severity === 'High' || i.severity === 'Critical');
  const openShiftsCount = sites.reduce((acc, site) => acc + site.openShifts, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Live Command Centre</h1>
          <p className="text-muted-foreground text-lg">
            Operational overview of active sites and workforce.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Reports</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            New Incident
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
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{incidents.filter(i => i.status === 'Open').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalIncidents.length} Critical escalation required
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openShiftsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI Suggesting 5 replacements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Live Site Alerts
            </CardTitle>
            <CardDescription>
              Recent events across all monitored sites.
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
                      {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
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
              <MapPin className="h-5 w-5 text-accent" />
              Workforce Status
            </CardTitle>
            <CardDescription>
              Real-time guard deployment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guards.map((guard) => (
              <div key={guard.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                      {guard.name.substring(0, 1)}
                    </div>
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                      guard.status === 'Active' ? 'bg-green-500' : 
                      guard.status === 'On Break' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{guard.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {guard.currentSiteName || 'Off-site'}
                    </p>
                  </div>
                </div>
                <Badge variant={guard.complianceStatus === 'Compliant' ? 'secondary' : 'destructive'} className="text-[10px]">
                  {guard.complianceStatus}
                </Badge>
              </div>
            ))}
            <Button className="w-full mt-4" variant="outline">
              Manage Workforce
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
