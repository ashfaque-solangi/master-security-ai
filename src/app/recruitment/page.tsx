
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Briefcase, FileText, CheckCircle2, Clock, 
  AlertTriangle, Filter, Search, ArrowRight, MoreVertical, 
  Mail, Calendar, GraduationCap, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { RecruitmentStage } from '@/lib/types';
import { format } from 'date-fns';

const STAGES: RecruitmentStage[] = [
  'JOB_POSTED', 'APPLICATION', 'SHORTLISTED', 'INTERVIEW', 
  'DOCUMENT_COLLECTION', 'VALIDATION', 'VERIFICATION', 
  'CONTRACT', 'TRAINING', 'ONBOARDING', 'ACTIVE'
];

export default function RecruitmentHub() {
  const store = useJsonStore();
  const [mounted, setMounted] = useState(false);
  const [applicants, setApplicants] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setApplicants(store.getApplicants());
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Talent Pipeline</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guard Acquisition & Compliance Onboarding</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-10 font-black text-xs uppercase shadow-sm">
            <FileText className="mr-2 h-4 w-4" /> JOB POSTS
          </Button>
          <Button className="bg-primary text-white rounded-xl h-10 px-6 font-black text-xs uppercase italic shadow-lg">
            <UserPlus className="mr-2 h-4 w-4" /> ADD APPLICANT
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Leads</p>
                <p className="text-3xl font-black text-slate-800 italic">{applicants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Interviews</p>
                <p className="text-3xl font-black text-slate-800 italic">{applicants.filter(a => a.currentStage === 'INTERVIEW').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verified</p>
                <p className="text-3xl font-black text-slate-800 italic">08</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Blocked</p>
                <p className="text-3xl font-black text-slate-800 italic">03</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {STAGES.map(stage => {
          const stageApps = applicants.filter(a => a.currentStage === stage);
          return (
            <div key={stage} className="min-w-[300px] space-y-4">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {stage.replace(/_/g, ' ')} ({stageApps.length})
                </h3>
                <MoreVertical className="h-3 w-3 text-slate-300" />
              </div>
              <div className="space-y-3">
                {stageApps.map(app => (
                  <Card key={app.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-2xl">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-black text-slate-800 italic">{app.name}</p>
                          <p className="text-[9px] font-bold text-primary uppercase mt-0.5">{app.experience} EXP</p>
                        </div>
                        <Badge variant="outline" className="text-[8px] opacity-0 group-hover:opacity-100">MOVE</Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <Mail className="h-3 w-3 text-slate-400" />
                        </div>
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <GraduationCap className="h-3 w-3 text-slate-400" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
                          {format(new Date(app.appliedDate), 'MMM dd')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {stageApps.length === 0 && (
                  <div className="p-10 border border-dashed rounded-3xl flex items-center justify-center text-[10px] font-black text-slate-200 uppercase tracking-widest bg-slate-50/30">
                    Empty Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
