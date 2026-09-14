
'use client';

import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJsonStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { RecruitmentStage } from '@/lib/types';
import Link from 'next/link';

const STAGES: { stage: RecruitmentStage; color: string }[] = [
  { stage: 'JOB_POSTED', color: 'bg-slate-400' },
  { stage: 'APPLICATION', color: 'bg-blue-400' },
  { stage: 'SHORTLISTED', color: 'bg-indigo-400' },
  { stage: 'INTERVIEW', color: 'bg-amber-400' },
  { stage: 'DOCUMENT_COLLECTION', color: 'bg-orange-400' },
  { stage: 'VERIFICATION', color: 'bg-emerald-400' },
  { stage: 'ACTIVE', color: 'bg-primary' }
];

export function RecruitmentDashboard() {
  const store = useJsonStore();
  const applicants = store.getApplicants();
  
  const readyForHire = applicants.filter(a => a.currentStage === 'VERIFICATION').length;
  const interviewing = applicants.filter(a => a.currentStage === 'INTERVIEW').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          label="Total Candidates" 
          value={applicants.length} 
          icon={Users} 
          trend={{ value: '12%', isUp: true }}
          description="Active leads in funnel"
        />
        <KPICard 
          label="Interviews Today" 
          value={interviewing} 
          icon={Clock} 
          status="info"
        />
        <KPICard 
          label="Ready for Activation" 
          value={readyForHire} 
          icon={CheckCircle2} 
          status="success"
          description="Provisioning pending"
        />
        <KPICard 
          label="Job Posts Open" 
          value="08" 
          icon={Briefcase} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Recruitment Funnel Velocity</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {STAGES.map((s, idx) => {
                const count = applicants.filter(a => a.currentStage === s.stage).length;
                const percentage = (count / (applicants.length || 1)) * 100;
                return (
                  <div key={s.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-tighter">
                      <span className="text-slate-500">{s.stage.replace(/_/g, ' ')}</span>
                      <span className="text-slate-800">{count} Candidates</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${s.color} transition-all duration-1000`} 
                            style={{ width: `${percentage}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-bold text-slate-400 w-8">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BarChart3 className="h-48 w-48" />
            </div>
            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Growth Forecast</CardTitle>
              <CardDescription className="text-slate-400 text-xs font-bold uppercase">Hiring demand vs capacity</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Requirement Alert</p>
                <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                  Anticipated demand at **Site Alpha** requires 4 new Officers by next month. 12 candidates in screening phase.
                </p>
                <Button size="sm" className="mt-4 bg-primary text-white font-black text-[10px] uppercase h-8 px-4 rounded-lg">View Hiring Plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-6 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Recent Candidate Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {applicants.slice(0, 4).map(app => (
                    <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] border">{app.name.charAt(0)}</div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase italic tracking-tight">{app.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{app.currentStage.replace(/_/g, ' ')}</p>
                          </div>
                       </div>
                       <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-primary" />
                    </div>
                  ))}
               </div>
               <Button variant="link" asChild className="w-full text-[10px] font-black text-primary h-10 uppercase tracking-widest border-t rounded-none">
                  <Link href="/recruitment">Open Pipeline</Link>
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
