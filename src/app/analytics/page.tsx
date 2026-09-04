'use client';

import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShieldCheck,
  Briefcase,
  ArrowUpRight,
  Target
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { sites, guards } from '@/lib/data';

export default function AnalyticsPage() {
  const totalRevenue = sites.reduce((acc, site) => acc + site.revenuePerMonth, 0);
  const avgPerformance = guards.reduce((acc, guard) => acc + guard.performanceScore, 0) / guards.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-primary">CEO Operations Dashboard</h1>
        <p className="text-muted-foreground text-xl font-medium">
          Predictive performance and financial profitability oversight.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="command-gradient border-none text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">MRR Forecast</CardTitle>
            <DollarSign className="h-5 w-5 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(1)}k</div>
            <div className="flex items-center gap-1 text-xs mt-2 text-green-400 font-bold">
              <TrendingUp className="h-3 w-3" />
              +12.4% vs prev
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Workforce Health</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{avgPerformance.toFixed(1)}%</div>
            <Progress value={avgPerformance} className="h-1.5 mt-2 bg-accent/10 [&>div]:bg-accent" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Operational Margin</CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">32.8%</div>
            <div className="flex items-center gap-1 text-xs mt-2 text-green-600 font-bold">
              <TrendingUp className="h-3 w-3" />
              +2.1% AI Optimized
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Site Risk Index</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">Low</div>
            <div className="text-xs mt-2 text-muted-foreground font-medium">98.2% Patrol Completion</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Contract Profitability</CardTitle>
            <CardDescription>Revenue vs. Operational Cost per client site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sites.map(site => (
              <div key={site.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{site.name}</span>
                  <span className="font-mono text-green-600 font-bold">${site.revenuePerMonth.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Progress value={Math.random() * 40 + 60} className="h-2 flex-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Margin 38%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              AI Strategic Insights
            </CardTitle>
            <CardDescription>Autonomous recommendations for margin improvement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-white border border-primary/10 space-y-2">
              <p className="text-sm font-bold">Shift Optimization Opportunity</p>
              <p className="text-xs text-muted-foreground">
                Consolidating overlapping patrols at **Tech Hub HQ** could reduce overtime spend by **$1,200/mo** without impacting risk score.
              </p>
              <Button size="sm" className="mt-2 text-[10px] h-7 px-3">Review Proposal</Button>
            </div>
            <div className="p-4 rounded-lg bg-white border border-primary/10 space-y-2">
              <p className="text-sm font-bold">Predictive Turnover Alert</p>
              <p className="text-xs text-muted-foreground">
                3 guards at **Retail Park East** show high burnout probability scores. Recommend rotation to low-risk sites.
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-[10px] h-7 px-3">Manage Rotation</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
