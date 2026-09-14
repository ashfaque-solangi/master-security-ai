'use client';

import { 
  Users, 
  UserPlus, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJsonStore } from '@/lib/store';
import { format } from 'date-fns';
import Link from 'next/link';

export function HRDashboard() {
  const store = useJsonStore();
  const guards = store.getGuards();
  const applicants = store.getApplicants();
  const leave = store.getAudits().filter(a => a.action === 'GUARD_STATUS_CHANGED' && a.newValues?.status === 'On Leave');

  const complianceIssues = guards.filter(g => g.complianceStatus !== 'Compliant').length;
  const hiringReady = applicants.filter(a => a.currentStage === 'VERIFICATION').length;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          label="Total Workforce" 
          value={guards.length} 
          icon={Users} 
          description="Registered Personnel"
          href="/workforce"
        />
        <KPICard 
          label="Hiring Pipeline" 
          value={applicants.length} 
          icon={UserPlus} 
          status="success"
          description={`${hiringReady} Verified`}
          href="/recruitment"
        />
        <KPICard 
          label="Compliance Alerts" 
          value={complianceIssues} 
          icon={ShieldCheck} 
          status={complianceIssues > 0 ? 'warning' : 'success'}
          description="Requires Review"
          href="/compliance"
        />
        <KPICard 
          label="Active Leave" 
          value={leave.length} 
          icon={Calendar} 
          href="/workforce"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Workforce Growth Trend</CardTitle>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="p-10 flex items-center justify-center min-h-[300px]">
            <div className="text-center opacity-20 group">
               <TrendingUp className="h-24 w-24 mx-auto mb-4 group-hover:scale-110 transition-transform" />
               <p className="font-black italic uppercase tracking-tighter text-2xl">Growth Visualisation Active</p>
               <p className="text-xs font-bold uppercase mt-2">Analytical Engine Tracking +12% YoY</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b px-8 py-6 bg-slate-50/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Pending Compliance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {guards.filter(g => g.complianceStatus !== 'Compliant').map(guard => (
                <div key={guard.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 italic uppercase">{guard.name}</p>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{guard.complianceStatus}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild className="rounded-xl h-8 w-8 text-primary">
                    <Link href={`/compliance?id=${guard.id}`}><ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              ))}
              {complianceIssues === 0 && (
                <div className="p-12 text-center text-slate-400 italic font-medium">100% Workforce Compliant</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between bg-slate-50/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Recent Applicants</CardTitle>
            <Button variant="link" asChild className="text-xs font-black text-primary p-0 h-auto uppercase italic tracking-tighter">
              <Link href="/recruitment">VIEW PIPELINE</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Candidate</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Applied</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Stage</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Exp.</th>
                    <th className="text-right px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {applicants.slice(0, 5).map(app => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="font-black text-slate-800 uppercase italic text-xs">{app.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{app.email}</div>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-500">{format(new Date(app.appliedDate), 'MMM dd, yyyy')}</td>
                      <td className="px-8 py-4">
                        <Badge variant="outline" className="text-[8px] font-black uppercase italic tracking-widest bg-slate-50 border-none px-3">
                          {app.currentStage.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-primary">{app.experience}</td>
                      <td className="px-8 py-4 text-right">
                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase opacity-0 group-hover:opacity-100">REVIEW</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
