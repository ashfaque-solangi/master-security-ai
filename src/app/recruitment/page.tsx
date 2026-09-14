
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Briefcase, FileText, CheckCircle2, Clock, 
  AlertTriangle, Filter, Search, ArrowRight, MoreVertical, 
  Mail, Calendar, GraduationCap, ShieldCheck, XCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { RecruitmentStage } from '@/lib/types';
import { format } from 'date-fns';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const STAGES: RecruitmentStage[] = [
  'JOB_POSTED', 'APPLICATION', 'SHORTLISTED', 'INTERVIEW', 
  'DOCUMENT_COLLECTION', 'VALIDATION', 'VERIFICATION', 
  'CONTRACT', 'TRAINING', 'ONBOARDING', 'ACTIVE'
];

export default function RecruitmentHub() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    setApplicants(store.getApplicants());
  }, []);

  const moveApplicant = (id: string, nextStage: RecruitmentStage) => {
    const updated = store.updateRecruitmentStage(id, nextStage);
    setApplicants(updated);
    toast({ 
      title: "Stage Updated", 
      description: nextStage === 'ACTIVE' 
        ? `Candidate moved to ACTIVE duty and guard profile provisioned.` 
        : `Candidate moved to ${nextStage.replace(/_/g, ' ')}` 
    });
    setSelectedApp(null);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Talent Pipeline</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workforce Acquisition & Forensic Onboarding</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-10 font-black text-xs uppercase shadow-sm">
            <FileText className="mr-2 h-4 w-4" /> POST JOB
          </Button>
          <Button className="bg-primary text-white rounded-xl h-10 px-6 font-black text-xs uppercase italic shadow-lg">
            <UserPlus className="mr-2 h-4 w-4" /> ADD APPLICANT
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><Users className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Leads</p>
              <p className="text-3xl font-black text-slate-800 italic">{applicants.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100"><Calendar className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Interviews</p>
              <p className="text-3xl font-black text-slate-800 italic">{applicants.filter(a => a.currentStage === 'INTERVIEW').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100"><ShieldCheck className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compliance OK</p>
              <p className="text-3xl font-black text-slate-800 italic">{applicants.filter(a => a.currentStage === 'VERIFICATION').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100"><AlertTriangle className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Drop-offs</p>
              <p className="text-3xl font-black text-slate-800 italic">{applicants.filter(a => a.status === 'Rejected').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
        {STAGES.map(stage => {
          const stageApps = applicants.filter(a => a.currentStage === stage && a.status !== 'Rejected');
          return (
            <div key={stage} className="min-w-[320px] space-y-4">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {stage.replace(/_/g, ' ')} ({stageApps.length})
                </h3>
              </div>
              <div className="space-y-4 min-h-[400px] p-2 bg-slate-50/50 rounded-[2rem] border border-dashed">
                {stageApps.map(app => (
                  <Card 
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-2xl bg-white"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-black text-slate-800 italic tracking-tight">{app.name}</p>
                          <p className="text-[9px] font-bold text-primary uppercase mt-0.5">{app.experience} EXP • {app.id}</p>
                        </div>
                        <Badge variant="outline" className="text-[8px] opacity-0 group-hover:opacity-100 bg-slate-50">MANAGE</Badge>
                      </div>
                      <div className="pt-3 border-t border-slate-50 flex items-center gap-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {format(new Date(app.appliedDate), 'MMM dd')}
                        </span>
                        <div className="ml-auto flex -space-x-2">
                           <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center"><FileText className="h-3 w-3 text-slate-400" /></div>
                           <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center"><Mail className="h-3 w-3 text-slate-400" /></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(val) => !val && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-8 bg-slate-900 text-white relative">
             <div className="absolute top-8 right-8">
                <Badge className="bg-primary text-white font-black px-4">{selectedApp?.currentStage.replace(/_/g, ' ')}</Badge>
             </div>
             <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Candidate Profile</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Review candidate details, documents, and move them through the onboarding pipeline.</DialogDescription>
          </DialogHeader>
          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Info className="h-3 w-3" /> Onboarding Checklist</h4>
               <div className="space-y-3">
                  {[
                    { label: 'SIA Licence Verified', status: selectedApp?.currentStage === 'VERIFICATION' || selectedApp?.currentStage === 'ACTIVE' },
                    { label: 'Right to Work Documentation', status: true },
                    { label: 'Background / DBS Check', status: false },
                    { label: 'Onboarding Training', status: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed">
                       {item.status ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-slate-300" />}
                       <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Move to Stage</h4>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                {STAGES.map(stage => (
                  <Button 
                    key={stage} 
                    variant="outline" 
                    className={`justify-start font-bold text-[10px] uppercase h-10 rounded-xl ${selectedApp?.currentStage === stage ? 'border-primary text-primary bg-primary/5' : ''}`}
                    onClick={() => moveApplicant(selectedApp.id, stage)}
                  >
                    {stage.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
              <Button variant="destructive" className="w-full font-black text-xs uppercase h-12 rounded-xl mt-4">
                <XCircle className="mr-2 h-4 w-4" /> Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
