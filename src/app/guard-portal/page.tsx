
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
  Star
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
import { useJsonStore } from '@/lib/store';
import { Guard, Shift, Incident } from '@/lib/types';
import { format } from 'date-fns';

export default function GuardPortal() {
  const store = useJsonStore();
  const [currentGuard, setCurrentGuard] = useState<Guard | null>(null);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [myIncidents, setMyIncidents] = useState<Incident[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = store.getCurrentUser();
    if (user) {
      const allGuards = store.getGuards();
      const guardRecord = allGuards.find((g: Guard) => g.email === user.email);
      if (guardRecord) {
        setCurrentGuard(guardRecord);
        
        const allShifts = store.getShifts();
        setMyShifts(allShifts.filter((s: Shift) => s.guardName === guardRecord.name));
        
        const allIncidents = store.getIncidents();
        setMyIncidents(allIncidents.filter((i: Incident) => i.guardName === guardRecord.name));
      }
    }
  }, []);

  if (!isMounted) return null;
  if (!currentGuard) return <div className="p-8 text-center text-muted-foreground italic">Guard record not found. Please contact administration.</div>;

  const activeShift = myShifts.find(s => s.status === 'In Progress');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Hello, {currentGuard.name}</h1>
          <p className="text-muted-foreground text-sm font-medium">Your operational dashboard for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="destructive" className="rounded-full shadow-lg px-6 font-black animate-pulse">
            <AlertTriangle className="mr-2 h-4 w-4" /> EMERGENCY SOS
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="command-gradient border-none text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Performance Score</CardTitle>
            <Star className="h-5 w-5 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{currentGuard.performanceScore}%</div>
            <p className="text-[10px] mt-2 text-white/80 font-bold uppercase tracking-tighter">Top 5% of workforce this month</p>
            <Progress value={currentGuard.performanceScore} className="h-1.5 mt-4 bg-white/20 [&>div]:bg-white" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Compliance Status</CardTitle>
            <ShieldCheck className={`h-5 w-5 ${currentGuard.complianceStatus === 'Compliant' ? 'text-green-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{currentGuard.complianceStatus}</div>
            <p className="text-xs text-muted-foreground mt-1">SIA Licence expires {format(new Date(currentGuard.licenceExpiry), 'MMM dd, yyyy')}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Recent Reports</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{myIncidents.length} Submitted</div>
            <p className="text-xs text-muted-foreground mt-1">Last activity: {myIncidents[0]?.type || 'None'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Shift Card */}
          <Card className="border-none shadow-xl overflow-hidden bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Timer className="h-32 w-32" />
            </div>
            <CardHeader className="border-b border-white/10 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Current Active Duty
                </CardTitle>
                <Badge className="bg-primary text-white font-bold px-3 py-1">ON DUTY</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {activeShift ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Site Location</p>
                      <p className="text-2xl font-black text-white">{activeShift.siteName}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Tech Hub, Silicon Valley
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Shift Time</p>
                      <p className="text-2xl font-black text-white">
                        {format(new Date(activeShift.startTime), 'HH:mm')} - {format(new Date(activeShift.endTime), 'HH:mm')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Total Duration: 8 Hours</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">
                      <CheckCircle2 className="mr-2 h-5 w-5" /> Start Patrol
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 rounded-xl">
                      <Activity className="mr-2 h-5 w-5" /> Incident Report
                    </Button>
                    <Button variant="destructive" className="h-12 w-12 rounded-xl p-0">
                      <Zap className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 italic">No active shift currently in progress.</p>
                  <Button className="mt-4 bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 rounded-full">Clock In Now</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg font-bold">Upcoming Roster</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myShifts.filter(s => s.status === 'Open' || s.status === 'Published').length > 0 ? (
                myShifts.map(shift => (
                  <div key={shift.id} className="p-6 border-b last:border-0 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-black">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{shift.siteName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(shift.startTime), 'EEEE, MMM dd')} • {format(new Date(shift.startTime), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{shift.role}</Badge>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground italic">No upcoming shifts scheduled.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary text-white pb-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SUPPORT CHAT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                  <p className="font-bold text-primary mb-1 uppercase tracking-tighter">Ops Message:</p>
                  <p className="text-slate-600">Please ensure all body-cams are docked and charging before the end of your shift at Tech Hub.</p>
                </div>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold">Contact Supervisor</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">My Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myIncidents.map(incident => (
                <div key={incident.id} className="px-6 py-4 border-t last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold truncate">{incident.type}</p>
                    <Badge className="text-[9px] px-2" variant={incident.status === 'Resolved' ? 'secondary' : 'default'}>{incident.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{incident.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{format(new Date(incident.timestamp), 'MMM dd, HH:mm')}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
