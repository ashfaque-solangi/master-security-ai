
'use client';

import { 
  Shield, 
  MapPin, 
  Building2, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  Plus
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
import { sites } from '@/lib/data';

export default function SitesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sites & Clients</h1>
          <p className="text-muted-foreground">
            Manage operational locations, contracts, and site health.
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Site
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <Card key={site.id} className="group hover:border-accent transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <Badge variant={
                  site.riskLevel === 'Critical' ? 'destructive' :
                  site.riskLevel === 'High' ? 'destructive' :
                  'outline'
                }>
                  {site.riskLevel} Risk
                </Badge>
              </div>
              <div className="mt-4">
                <CardTitle className="text-xl">{site.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {site.address}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Coverage Status</span>
                  <span>{site.activeGuardsCount} Guards Active</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Client</p>
                  <p className="text-sm font-semibold truncate">{site.clientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Open Shifts</p>
                  <p className={`text-sm font-semibold ${site.openShifts > 0 ? 'text-destructive' : ''}`}>
                    {site.openShifts} Critical
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button className="flex-1 text-accent border-accent hover:bg-accent/5" variant="outline">
                  Site Details
                </Button>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
