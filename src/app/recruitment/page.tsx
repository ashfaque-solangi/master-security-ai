
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Filter,
  ArrowRight,
  MoreVertical,
  Mail,
  FileText
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { format } from 'date-fns';

const stages = ['Shortlisted', 'Interview', 'Validation', 'Contract', 'Training', 'Active'];

export default function RecruitmentDashboard() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  const [guards, setGuards] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setGuards(store.getGuards());
  }, []);

  if (!mounted) return null;

  const applicants = guards.filter(g => g.status === 'Applicant' || !!g.recruitmentStage);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">HR & TALENT PIPELINE</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest text-[10px]">Workforce Acquisition & Compliance Validation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm border-slate-200 font-bold h-10 px-6">
            <BarChart3 className="mr-2 h-4 w-4" /> PERFORMANCE
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/20 font-black h-10 px-6">
            <UserPlus className="mr-2 h-4 w-4" /> CREATE POSTING
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Applicants</p>
                <p className="text-3xl font-black text-slate-800">{applicants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-orange-50 p-3 rounded-2xl text-primary border border-orange-100">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">In Interview</p>
                <p className="text-3xl font-black text-slate-800">
                  {applicants.filter(a => a.recruitmentStage === 'Interview').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600 border border-green-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hires This Month</p>
                <p className="text-3xl font-black text-slate-800">14</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-50 p-3 rounded-2xl text-red-600 border border-red-100">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Blockers</p>
                <p className="text-3xl font-black text-slate-800">03</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageApps = applicants.filter(a => a.recruitmentStage === stage);
          return (
            <div key={stage} className="min-w-[280px] space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stage} ({stageApps.length})</h3>
                <MoreVertical className="h-3 w-3 text-slate-400" />
              </div>
              <div className="space-y-3">
                 {stageApps.map(app => (
                   <Card key={app.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 space-y-3">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-sm font-black text-slate-800">{app.name}</p>
                               <p className="text-[10px] font-bold text-primary uppercase">{app.qualifiedRoles[0]}</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">MOVE</Badge>
                         </div>
                         <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                            <div className="flex -space-x-2">
                               <div className="h-5 w-5 rounded-full bg-slate-100 border border-white flex items-center justify-center">
                                  <FileText className="h-2.5 w-2.5 text-slate-400" />
                               </div>
                               <div className="h-5 w-5 rounded-full bg-slate-100 border border-white flex items-center justify-center">
                                  <Mail className="h-2.5 w-2.5 text-slate-400" />
                               </div>
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Exp: 4 Years</span>
                         </div>
                      </CardContent>
                   </Card>
                 ))}
                 {stageApps.length === 0 && (
                   <div className="p-8 border border-dashed rounded-2xl flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50/50">
                      Empty Stage
                   </div>
                 )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
