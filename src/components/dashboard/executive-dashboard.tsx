'use client';

import { 
  Users, 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  History
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { format } from 'date-fns';

export function ExecutiveDashboard() {
  const store = useJsonStore();
  const guards = store.getGuards();
  const sites = store.getSites();
  const shifts = store.getShifts();
  const audits = store.getAudits();

  const activeStaff = shifts.filter(s => s.status === 'In Progress').reduce((acc, s) => acc + (s.assignments?.length || 0), 0);
  const totalRequired = shifts.reduce((acc, s) => acc + s.requirements.reduce((rAcc, r) => rAcc + r.count, 0), 0);
  const coverage = totalRequired > 0 ? (activeStaff / totalRequired) * 100 : 100;
  const compliance = (guards.filter(g => g.complianceStatus === 'Compliant').length / (guards.length || 1)) * 100;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          label="Total Workforce" 
          value={guards.length} 
          icon={Users} 
          trend={{ value: '4.2%', isUp: true }}
          description="vs last month"
          href="/workforce"
        />
        <KPICard 
          label="Operational Coverage" 
          value={`${coverage.toFixed(0)}%`} 
          icon={ShieldCheck} 
          status={coverage < 90 ? 'warning' : 'success'}
          description={`${activeStaff} guards on duty`}
          href="/scheduling"
        />
        <KPICard 
          label="Active Sites" 
          value={sites.length} 
          icon={Building2} 
          href="/sites"
        />
        <KPICard 
          label="Revenue Forecast" 
          value={`$${(sites.reduce((acc, s) => acc + s.revenuePerMonth, 0) / 1000).toFixed(1)}k`} 
          icon={DollarSign} 
          status="success"
          description="Current billing cycle"
          href="/payroll"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Portfolio Health</CardTitle>
                <CardDescription className="text-xs font-bold mt-1">Operational metrics per client site</CardDescription>
              </div>
              <Badge className="bg-primary text-white font-black italic px-4">REAL-TIME</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {sites.map(site => (
                <div key={site.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 italic uppercase">{site.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{site.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Health</p>
                      <Badge variant="outline" className={site.healthScore > 90 ? "text-green-500 bg-green-50 border-green-100" : "text-amber-500 bg-amber-50 border-amber-100"}>
                        {site.healthScore}%
                      </Badge>
                    </div>
                    <div className="w-24">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Coverage</p>
                      <Progress value={site.healthScore} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="h-48 w-48" />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Strategic Summary</CardTitle>
              <CardDescription className="text-slate-400 text-xs font-bold uppercase">Organization-wide insight summary</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Compliance</p>
                  <p className="text-xl font-black italic text-primary">{compliance.toFixed(1)}%</p>
                </div>
                <Progress value={compliance} className="h-1.5 bg-white/10" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Critical GAP</p>
                    <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                      3 guards at Retail Park East have licences expiring within 14 days. Scheduling risk detected.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b px-6 py-4 bg-slate-50/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History className="h-3 w-3" /> Recent Audit
              </CardTitle>
              <CardDescription className="hidden">System audit log overview</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {audits.slice(0, 4).map(log => (
                  <div key={log.id} className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black border">
                      {log.userName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-800 truncate">{log.description}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase">{format(new Date(log.timestamp), 'HH:mm')}</p>
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
