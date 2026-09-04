'use client';

import { 
  Star, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  MessageSquare,
  Award,
  Target,
  Search
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { guards } from '@/lib/data';

export default function PerformancePage() {
  const topGuards = [...guards].sort((a, b) => b.performanceScore - a.performanceScore);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Performance & Engagement</h1>
          <p className="text-muted-foreground text-lg">
            Monitor guard reliability, client satisfaction, and workforce gamification.
          </p>
        </div>
        <Button className="bg-primary text-white">
          <Award className="mr-2 h-4 w-4" /> Reward Program
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {topGuards.slice(0, 3).map((guard, index) => (
          <Card key={guard.id} className={`${index === 0 ? 'border-primary ring-1 ring-primary' : ''}`}>
            <CardHeader className="text-center">
              <Avatar className="h-16 w-16 mx-auto border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {guard.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <CardTitle>{guard.name}</CardTitle>
                <CardDescription>Rank #{index + 1} • {guard.currentSiteName}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Reliability Score</span>
                  <span className="text-primary">{guard.performanceScore}%</span>
                </div>
                <Progress value={guard.performanceScore} className="h-2" />
              </div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'text-primary fill-primary' : 'text-slate-200'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workforce Leaderboard</CardTitle>
              <CardDescription>Comprehensive metric aggregation across the workforce.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search officers..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guards.map((guard) => (
              <div key={guard.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {guard.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{guard.name}</p>
                    <p className="text-xs text-muted-foreground">{guard.id} • {guard.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attendance</p>
                    <p className="text-sm font-bold text-green-600">98%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patrols</p>
                    <p className="text-sm font-bold text-primary">{guard.performanceScore}%</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary font-bold">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}