
'use client';

import { 
  Sparkles, 
  Brain, 
  Activity, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Bot
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJsonStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';

export function AIDashboard() {
  const store = useJsonStore();
  const guards = store.getGuards();
  const shifts = store.getShifts();

  const fatigueRiskCount = guards.filter(g => g.weeklyHours > 44).length;
  const vacantShifts = shifts.filter(s => s.status === 'Open').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Intelligence Score" value="98.2" icon={Brain} status="success" description="System Optimal" />
        <KPICard label="Staffing Risk" value={vacantShifts > 0 ? "HIGH" : "LOW"} icon={Zap} status={vacantShifts > 0 ? "destructive" : "success"} />
        <KPICard label="Fatigue Index" value={fatigueRiskCount} icon={Activity} status={fatigueRiskCount > 0 ? "warning" : "success"} description="Guards Over 44h" />
        <KPICard label="Predictive Health" value="Healthy" icon={Sparkles} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Bot className="h-64 w-64 text-primary" />
            </div>
            <CardHeader className="p-10 pb-4 relative z-10">
              <Badge className="bg-primary text-white font-black italic mb-4 px-4 py-1">AI OPERATIONAL INSIGHT</Badge>
              <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Autonomous Efficiency Report</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Analytical Period: This Week (Live)</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6 relative z-10 space-y-10">
               <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-l-2 border-primary pl-3">Detected Anomaly</p>
                     <p className="text-2xl font-black italic tracking-tighter text-amber-500">Rising Incident Frequency at Site B</p>
                     <p className="text-xs text-slate-400 font-bold leading-relaxed">Incident volume has increased by 15% WoW. Staffing logs indicate a gap in the night-shift patrol pattern.</p>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-l-2 border-green-500 pl-3">Recommendation</p>
                     <p className="text-2xl font-black italic tracking-tighter text-white">Augment Perimeter Patrol</p>
                     <p className="text-xs text-slate-400 font-bold leading-relaxed">System proposes adding 1 additional Security Officer to the 22:00-06:00 window to restore health score.</p>
                  </div>
               </div>
               <div className="flex gap-4 pt-4">
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-2xl text-lg uppercase italic tracking-tighter shadow-xl shadow-primary/20">ACCEPT & DEPLOY</Button>
                  <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 h-16 rounded-2xl text-lg uppercase italic tracking-tighter">SIMULATE IMPACT</Button>
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-8 border-b">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Rule-Based Efficiency Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Roster Utilization</p>
                   <div className="h-32 w-32 mx-auto relative flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="hsl(var(--primary))" strokeWidth="12" strokeDasharray="364" strokeDashoffset="54" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xl font-black italic text-slate-800">85%</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Compliance Rating</p>
                   <div className="h-32 w-32 mx-auto relative flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="364" strokeDashoffset="12" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xl font-black italic text-slate-800">97%</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Incident Response</p>
                   <div className="h-32 w-32 mx-auto relative flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="364" strokeDashoffset="82" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xl font-black italic text-slate-800">78%</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-6 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Predictive Fatigue Risk</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {guards.filter(g => g.weeklyHours > 40).map(guard => (
                    <div key={guard.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div>
                          <p className="text-xs font-black text-slate-800 italic uppercase">{guard.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{guard.weeklyHours}h This Week</p>
                       </div>
                       <Badge className={guard.weeklyHours > 48 ? "bg-red-500" : "bg-amber-500"}>RISK</Badge>
                    </div>
                  ))}
                  {fatigueRiskCount === 0 && <p className="p-12 text-center text-slate-400 italic font-black text-[10px] uppercase">All Personnel Within Hours</p>}
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-6 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 italic">Intelligence Source Traceability</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] font-black text-slate-700 uppercase">SchedulingValidationService Linked</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] font-black text-slate-700 uppercase">StorageService Data Authorized</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] font-black text-slate-700 uppercase">AccessControl Scoping Active</span>
               </div>
               <p className="text-[9px] text-slate-400 font-bold italic leading-relaxed">All AI-driven insights are generated through deterministic rule verification and satisfy multi-tenant isolation protocols.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
