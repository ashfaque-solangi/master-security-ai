'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  MessageSquare,
  Activity,
  CheckCircle2,
  Timer,
  Zap,
  Star,
  Building2,
  CreditCard,
  FileText,
  History,
  Download,
  ArrowRight,
  TrendingUp,
  XCircle,
  Radio
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJsonStore } from '@/lib/store';
import { Guard, Shift, Incident, PayrollRecord, Site } from '@/lib/types';
import { format, isPast, isFuture, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { validateGuardAssignment } from '@/lib/scheduling-validation';

export default function GuardPortal() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [currentGuard, setCurrentGuard] = useState<Guard | null>(null);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [openShifts, setOpenShifts] = useState<Shift[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const refreshData = () => {
    const user = store.getCurrentUser();
    if (user) {
      const allGuards = store.getGuards();
      const guardRecord = allGuards.find((g: Guard) => g.email === user.email);
      if (guardRecord) {
        setCurrentGuard(guardRecord);
        
        const allShifts = store.getShifts();
        const personalShifts = allShifts.filter((s: Shift) => 
          s.assignments?.some(ag => ag.guardId === guardRecord.id)
        );
        setMyShifts(personalShifts);
        
        // Find available open shifts that I'm qualified for
        const availableOpen = allShifts.filter(s => 
          s.status === 'Open' && 
          !s.assignments?.some(ag => ag.guardId === guardRecord.id)
        );
        setOpenShifts(availableOpen);
      }
    }
  };

  const handleClaimShift = (shift: Shift) => {
    if (!currentGuard) return;
    
    // Validate claim using central service
    const validation = validateGuardAssignment(currentGuard, shift, store.getShifts(), shift.role);
    
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Eligibility Failure",
        description: validation.message
      });
      return;
    }

    const updatedShift: Shift = {
      ...shift,
      assignments: [...(shift.assignments || []), {
        id: `ASG-${Date.now()}`,
        guardId: currentGuard.id,
        guardName: currentGuard.name,
        rolePerformed: shift.role,
        status: 'Assigned',
        assignedAt: new Date().toISOString(),
        assignedBy: 'SELF_CLAIM'
      }],
      status: 'Claimed'
    };

    store.updateShift(updatedShift);
    store.logAudit({
      action: 'GUARD_ASSIGNED',
      entityType: 'shift_assignment',
      entityId: shift.id,
      description: `Shift claimed by officer ${currentGuard.name} via portal.`,
      newValues: updatedShift
    });

    toast({
      title: "Shift Claimed",
      description: `You are now assigned to ${shift.siteName}.`
    });
    refreshData();
  };

  if (!isMounted) return null;
  if (!currentGuard) return <div className="p-8 text-center text-muted-foreground italic">Guard record not found. Please contact administration.</div>;

  const activeShift = myShifts.find(s => s.status === 'In Progress');
  const upcomingShifts = myShifts.filter(s => isFuture(new Date(s.startTime)) && s.status !== 'Completed');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 italic uppercase tracking-tighter">OFFICER HUB: {currentGuard.name}</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Global Field Operations Portal • REF: {currentGuard.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="destructive" className="rounded-full shadow-lg px-8 font-black animate-pulse h-12 uppercase italic tracking-tighter">
            <AlertTriangle className="mr-2 h-5 w-5" /> EMERGENCY SOS
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1 rounded-2xl h-14 w-fit">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic">Overview</TabsTrigger>
          <TabsTrigger value="open-shifts" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic flex items-center gap-2">
            Open Board <Badge className="bg-primary text-white h-5 px-1.5 text-[9px]">{openShifts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="roster" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic">My Roster</TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="command-gradient border-none text-white shadow-xl rounded-3xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Star className="h-32 w-32" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/60">Performance Rank</CardTitle>
                <TrendingUp className="h-4 w-4 text-white/50" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black italic tracking-tighter">{currentGuard.performanceScore}%</div>
                <p className="text-[9px] mt-1 font-black uppercase text-white/80">98% ON-TIME ARRIVAL</p>
                <Progress value={currentGuard.performanceScore} className="h-1 mt-4 bg-white/20 [&>div]:bg-white" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliance Status</CardTitle>
                <ShieldCheck className={`h-4 w-4 ${currentGuard.complianceStatus === 'Compliant' ? 'text-green-500' : 'text-orange-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black italic uppercase tracking-tight text-slate-800">{currentGuard.complianceStatus}</div>
                <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">SIA Valid until {format(new Date(currentGuard.licenceExpiry), 'MMM yyyy')}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weekly Hours</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black italic tracking-tighter text-primary">{currentGuard.weeklyHours} / 40h</div>
                <Progress value={(currentGuard.weeklyHours/40)*100} className="h-1 mt-2 bg-white/10" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-2xl overflow-hidden bg-slate-950 text-white relative rounded-[2.5rem]">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Timer className="h-64 w-64" />
            </div>
            <CardHeader className="p-10 pb-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Badge variant="outline" className="border-primary text-primary font-black uppercase text-[9px] mb-2 px-3 py-1">Mission Control</Badge>
                  <CardTitle className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                    <Radio className="h-8 w-8 text-primary animate-pulse" />
                    {activeShift ? "Active Duty" : "Standby Mode"}
                  </CardTitle>
                </div>
                <Badge className={activeShift ? "bg-primary text-white h-8 px-6 font-black italic" : "bg-slate-800 text-slate-400 h-8 px-6 font-black italic"}>
                  {activeShift ? "ON DUTY" : "OFF DUTY"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-6">
              {activeShift ? (
                <div className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest border-l-2 border-primary pl-3">Current Deployment</p>
                      <p className="text-4xl font-black text-white italic tracking-tighter">{activeShift.siteName}</p>
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> GPS POSITION VERIFIED
                      </p>
                    </div>
                    <div className="text-right space-y-4">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest border-r-2 border-primary pr-3 inline-block">Shift Window</p>
                      <p className="text-4xl font-black text-white italic tracking-tighter">
                        {format(parseISO(activeShift.startTime), 'HH:mm')} - {format(parseISO(activeShift.endTime), 'HH:mm')}
                      </p>
                      <p className="text-xs text-slate-400 font-bold">REMAINING: 4h 12m</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-[1.5rem] text-lg uppercase italic tracking-tighter shadow-xl shadow-primary/20">START PATROL</Button>
                    <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 h-16 rounded-[1.5rem] text-lg uppercase italic tracking-tighter">INCIDENT REPORT</Button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-6">
                  <p className="text-slate-500 font-black italic text-2xl uppercase tracking-tighter">No active assignment detected.</p>
                  <Button className="bg-white text-slate-900 font-black px-10 h-14 rounded-full text-xs uppercase tracking-widest hover:bg-slate-100" onClick={() => refreshData()}>REFRESH STATUS</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open-shifts" className="space-y-6">
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openShifts.map(shift => {
                const validation = currentGuard ? validateGuardAssignment(currentGuard, shift, store.getShifts(), shift.role) : { isValid: false };
                return (
                  <Card key={shift.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow group">
                    <div className={`h-1.5 w-full ${shift.priority === 'Urgent' ? 'bg-red-500' : 'bg-primary'}`} />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 rounded-2xl border group-hover:scale-110 transition-transform">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-full">{shift.priority}</Badge>
                      </div>
                      <div className="mt-4">
                        <CardTitle className="text-xl font-black italic text-slate-800 tracking-tighter">{shift.siteName}</CardTitle>
                        <p className="text-xs font-black text-primary uppercase mt-1 tracking-widest">{shift.role}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Timing</span>
                          <span className="text-slate-800">{format(parseISO(shift.startTime), 'EEE, MMM dd')}</span>
                        </div>
                        <p className="text-lg font-black text-slate-800 italic">
                          {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                        </p>
                      </div>

                      {validation.isValid ? (
                        <Button className="w-full bg-slate-900 text-white rounded-2xl h-12 font-black uppercase italic tracking-tighter group-hover:bg-primary transition-colors" onClick={() => handleClaimShift(shift)}>
                          CLAIM SHIFT <Zap className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-red-600 font-black uppercase leading-tight">Ineligible: {validation.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {openShifts.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed">
                  <p className="text-slate-400 font-black italic uppercase tracking-tighter">No available open shifts for your profile.</p>
                </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="roster" className="space-y-8">
           <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
             <CardHeader className="bg-white border-b px-8 py-6">
               <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Upcoming Deployments</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {upcomingShifts.map(shift => (
                 <div key={shift.id} className="p-8 border-b last:border-0 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-3xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20">
                        <span className="text-[10px] font-black uppercase leading-none mb-1">{format(parseISO(shift.startTime), 'MMM')}</span>
                        <span className="text-2xl font-black italic leading-none">{format(parseISO(shift.startTime), 'dd')}</span>
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-800 italic tracking-tighter">{shift.siteName}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                          {format(parseISO(shift.startTime), 'EEEE')} • {format(parseISO(shift.startTime), 'HH:mm')} Deployment
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <Badge variant="outline" className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{shift.role}</Badge>
                       <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary"><ArrowRight className="h-5 w-5" /></Button>
                    </div>
                 </div>
               ))}
               {upcomingShifts.length === 0 && (
                 <div className="p-20 text-center text-muted-foreground italic font-black uppercase tracking-tighter">No upcoming work scheduled.</div>
               )}
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
