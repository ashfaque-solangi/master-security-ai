'use client';

import { useState, useEffect } from 'react';
import { 
  Map, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  BarChart3
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
import { Input } from '@/components/ui/input';
import { patrols } from '@/lib/data';
import { format } from 'date-fns';

export default function PatrolsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Live Patrol Monitoring</h1>
          <p className="text-muted-foreground text-lg">
            Track real-time checkpoint completion and mobile patrol routes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Patrol Analytics</Button>
          <Button className="bg-primary text-white">Configure Route</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Patrol Sequences</CardTitle>
              <CardDescription>Real-time verification of guard activity.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter sites..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {patrols.map((patrol) => (
              <div key={patrol.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{patrol.siteName}</h4>
                      <p className="text-xs text-muted-foreground">{patrol.guardName} • Started {mounted ? format(new Date(patrol.startTime), 'HH:mm') : '...'}</p>
                    </div>
                  </div>
                  <Badge variant={patrol.status === 'Completed' ? 'secondary' : 'outline'}>
                    {patrol.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Progress: {patrol.checkpoints} Checkpoints</span>
                    <span>{patrol.completion}%</span>
                  </div>
                  <Progress value={patrol.completion} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Patrol Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <p className="text-3xl font-black">98.2%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Compliance Rate</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Avg. Completion Time</span>
                <span className="font-bold">42m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Missed Checkpoints</span>
                <span className="font-bold text-red-200">02 Today</span>
              </div>
            </div>
            <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold">Download Audit</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}