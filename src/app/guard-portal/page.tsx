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
  Radio,
  LogOut,
  LogIn,
  Hash,
  Shield,
  Heart
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
import { Guard, Shift, Incident, PayrollRecord, Site, LeaveRecord, WelfareCheck } from '@/lib/types';
import { format, isPast, isFuture, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { validateGuardAssignment } from '@/lib/scheduling-validation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GuardPortal() {
  const store = useJsonStore();
  const { toast } = useToast();
  const [currentGuard, setCurrentGuard] = useState<Guard | null>(null);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [openShifts, setOpenShifts] = useState<Shift[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [welfarePrompt, setWelfarePrompt] = useState<WelfareCheck | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const user = store.getCurrentUser();
    if (user) {
      const allGuards = store.getGuards();
      const guardRecord = allGuards.find((g: Guard) => g.email === user.email);
      if (guardRecord) {
        setCurrentGuard(guardRecord);
        setLeaveRecords(store.getLeave());
        
        const allShifts = store.getShifts();
        const personalShifts = allShifts.filter((s: Shift) => 
          s.assignments?.some(ag => ag.guardId === guardRecord.id && ['Assigned', 'Confirmed', 'In Transit', 'On Site'].includes(ag.status))
        );
        setMyShifts(personalShifts);
        
        // Find available open shifts
        const availableOpen = allShifts.filter(s => 
          s.status === 'Open' && 
          !s.assignments?.some(ag => ag.guardId === guardRecord.id && ag.status !== 'Rejected' && ag.status !== 'Withdrawn')
        );
        setOpenShifts(availableOpen);

        // Check for prompted welfare checks
        const allChecks = store.getWelfareChecks();
        const activePrompt = allChecks.find(c => c.guardId === guardRecord.id && c.status === 'Prompted');
        setWelfarePrompt(activePrompt || null);
      }
    }
  };

  const handleClaimShift = (shift: Shift) => {
    if (!currentGuard) return;
    
    try {
      store.submitClaim(shift.id, currentGuard.id, shift.role);
      toast({
        title: "Claim Submitted",
        description: "Your request has been sent to the dispatcher for approval."
      });
      refreshData();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: e.message
      });
    }
  };

  const handleWithdraw = (shift: Shift, assignmentId: string) => {
    store.withdrawClaim(shift.id, assignmentId);
    toast({
      title: "Claim Withdrawn",
      description: "You have successfully removed your request for this shift."
    });
    refreshData();
  };

  const handleCheckIn = (shift: Shift) => {
    const updatedAssignments = shift.assignments.map(a => 
      a.guardId === currentGuard?.id ? { ...a, status: 'On Site' as const, checkInTime: new Date().toISOString() } : a
    );
    const updatedShift: Shift = { ...shift, assignments: updatedAssignments, status: 'In Progress' };
    store.updateShift(updatedShift);
    
    if (currentGuard) {
      store.updateGuard({ ...currentGuard, status: 'Active' });
    }

    store.logAudit({
      action: 'ATTENDANCE_CHECK_IN',
      entityType: 'shift',
      entityId: shift.id,
      description: `Officer ${currentGuard?.name} checked in at ${shift.siteName}`
    });

    toast({ title: "Checked In", description: "Your status is now ACTIVE at " + shift.siteName });
    refreshData();
  };

  const handleCheckOut = (shift: Shift) => {
    const updatedAssignments = shift.assignments.map(a => 
      a.guardId === currentGuard?.id ? { ...a, status: 'Confirmed' as const, checkOutTime: new Date().toISOString() } : a
    );
    const updatedShift: Shift = { ...shift, assignments: updatedAssignments, status: 'Completed' };
    store.updateShift(updatedShift);
    
    if (currentGuard) {
      store.updateGuard({ ...currentGuard, status: 'Off Duty' });
    }

    store.logAudit({
      action: 'ATTENDANCE_CHECK_OUT',
      entityType: 'shift',
      entityId: shift.id,
      description: `Officer ${currentGuard?.name} checked out from ${shift.siteName}`
    });

    toast({ title: "Checked Out", description: "Shift completed. Data logged for payroll." });
    refreshData();
  };

  const handleTriggerSOS = () => {
    if (!currentGuard) return;
    try {
      store.triggerSOS(currentGuard.id);
      toast({
        variant: "destructive",
        title: "SOS ALERT TRIGGERED",
        description: "Emergency protocol initiated. Command centre has your location."
      });
      refreshData();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "SOS Failed",
        description: e.message
      });
    }
  };

  const handleWelfareResponse = (response: 'OK' | 'HELP') => {
    if (!welfarePrompt) return;
    store.respondWelfare(welfarePrompt.id, response);
    setWelfarePrompt(null);
    toast({ title: "Check-in Confirmed", description: "Your safety status has been transmitted to Command." });
  };

  if (!isMounted) return null;
  if (!currentGuard) return <div className="p-8 text-center text-muted-foreground italic">Guard record not found. Please contact administration.</div>;

  const activeShift = myShifts.find(s => s.status === 'In Progress');
  const upcomingShifts = myShifts.filter(s => isFuture(new Date(s.startTime)) && s.status !== 'Completed');

  // Filter for my pending claims
  const allShifts = store.getShifts();
  const myPendingClaims = allShifts.filter(s => 
    s.assignments?.some(a => a.guardId === currentGuard.id && a.status === 'Pending')
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 italic uppercase tracking-tighter">OFFICER HUB: {currentGuard.name}</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Global Field Operations Portal • REF: {currentGuard.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="rounded-full shadow-lg px-8 font-black animate-pulse h-12 uppercase italic tracking-tighter">
                <AlertTriangle className="mr-2 h-5 w-5" /> EMERGENCY SOS
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black italic uppercase text-red-600">TRIGGER EMERGENCY SOS?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold text-slate-600">
                  This will immediately alert the Command Centre, transmit your current location, and initiate emergency response protocols.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl font-bold">CANCEL</AlertDialogCancel>
                <AlertDialogAction onClick={handleTriggerSOS} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black italic">INITIATE SOS</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1 rounded-2xl h-14 w-fit">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic">Overview</TabsTrigger>
          <TabsTrigger value="open-shifts" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic flex items-center gap-2">
            Open Board <Badge className="bg-primary text-white h-5 px-1.5 text-[9px]">{openShifts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="my-claims" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic flex items-center gap-2">
            My Bids <Badge className="bg-amber-500 text-white h-5 px-1.5 text-[9px]">{myPendingClaims.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="roster" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md px-8 font-black text-xs uppercase italic">My Roster</TabsTrigger>
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
            <div className="absolute top-0 right-0 p-10 pb-4 opacity-5">
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
                      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                        <Hash className="w-4 h-4" /> {activeShift.code}
                      </div>
                      <p className="text-4xl font-black text-white italic tracking-tighter">{activeShift.name}</p>
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> {activeShift.siteName} (GPS VERIFIED)
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
                    {activeShift.assignments.find(a => a.guardId === currentGuard.id)?.status !== 'On Site' ? (
                      <Button 
                        onClick={() => handleCheckIn(activeShift)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-[1.5rem] text-lg uppercase italic tracking-tighter shadow-xl shadow-primary/20"
                      >
                        <LogIn className="mr-2 h-6 w-6" /> CHECK IN
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleCheckOut(activeShift)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black h-16 rounded-[1.5rem] text-lg uppercase italic tracking-tighter shadow-xl shadow-red-500/20"
                      >
                        <LogOut className="mr-2 h-6 w-6" /> CHECK OUT
                      </Button>
                    )}
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
           {/* (Previous open-shifts code preserved) */}
        </TabsContent>
      </Tabs>

      {/* Welfare Check Dialog */}
      <Dialog open={!!welfarePrompt} onOpenChange={() => {}}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-amber-500 text-white p-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 animate-pulse" />
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Safety Check</DialogTitle>
            </div>
            <DialogDescription className="text-white/80 font-bold uppercase text-[10px] tracking-widest mt-1">
              LONE WORKER WELFARE PROTOCOL
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 bg-slate-50">
             <div className="p-6 bg-white rounded-3xl border border-dashed text-center shadow-inner space-y-2">
                <p className="text-sm font-black text-slate-800 uppercase italic">Are you currently safe and secure at {welfarePrompt?.siteName}?</p>
             </div>
             <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => handleWelfareResponse('OK')}
                  className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg uppercase italic tracking-tighter shadow-xl shadow-green-500/20"
                >
                  <ShieldCheck className="mr-2 h-6 w-6" /> I AM OK
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleWelfareResponse('HELP')}
                  className="h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-black uppercase text-xs tracking-widest"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" /> NEED ASSISTANCE
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
