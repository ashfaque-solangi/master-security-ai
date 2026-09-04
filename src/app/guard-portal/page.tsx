
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
  ArrowRight
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
import { format, isPast, isFuture } from 'date-fns';

export default function GuardPortal() {
  const store = useJsonStore();
  const [currentGuard, setCurrentGuard] = useState<Guard | null>(null);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [myIncidents, setMyIncidents] = useState<Incident[]>([]);
  const [myPayroll, setMyPayroll] = useState<PayrollRecord[]>([]);
  const [mySites, setMySites] = useState<Site[]>([]);
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
        const personalShifts = allShifts.filter((s: Shift) => 
          s.assignedGuards.some(ag => ag.id === guardRecord.id)
        );
        setMyShifts(personalShifts);
        
        const allIncidents = store.getIncidents();
        setMyIncidents(allIncidents.filter((i: Incident) => i.guardId === guardRecord.id));

        const allPayroll = getPayrollRecords(guardRecord.name);
        setMyPayroll(allPayroll);

        const allSites = store.getSites();
        const personalSiteIds = new Set(personalShifts.map(s => s.siteId));
        setMySites(allSites.filter(site => personalSiteIds.has(site.id)));
      }
    }
  }, []);

  const getPayrollRecords = (name: string) => {
    return [
      { id: 'PAY-001', guardName: 'Marcus Thorne', period: 'Feb 01 - Feb 15', hours: 84, amount: 3250.50, status: 'Paid' as any },
      { id: 'PAY-PREV', guardName: 'Marcus Thorne', period: 'Jan 15 - Jan 31', hours: 80, amount: 3000.00, status: 'Paid' as any },
    ].filter(r => r.guardName === name);
  };

  if (!isMounted) return null;
  if (!currentGuard) return <div className="p-8 text-center text-muted-foreground italic">Guard record not found. Please contact administration.</div>;

  const activeShift = myShifts.find(s => s.status === 'In Progress');
  const upcomingShifts = myShifts.filter(s => isFuture(new Date(s.startTime)) && s.status !== 'Completed');
  const pastShifts = myShifts.filter(s => s.status === 'Completed');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Hello, {currentGuard.name}</h1>
          <p className="text-muted-foreground text-sm font-medium">Field Operations Portal</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="destructive" className="rounded-full shadow-lg px-6 font-black animate-pulse">
            <AlertTriangle className="mr-2 h-4 w-4" /> EMERGENCY SOS
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-12">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold">Overview</TabsTrigger>
          <TabsTrigger value="roster" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold">Roster & Attendance</TabsTrigger>
          <TabsTrigger value="sites" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold">My Sites</TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="command-gradient border-none text-white shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Performance</CardTitle>
                <Star className="h-5 w-5 text-white/50" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">{currentGuard.performanceScore}%</div>
                <p className="text-[10px] mt-2 text-white/80 font-bold uppercase">Top 5% of workforce</p>
                <Progress value={currentGuard.performanceScore} className="h-1.5 mt-4 bg-white/20 [&>div]:bg-white" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Compliance</CardTitle>
                <ShieldCheck className={`h-5 w-5 ${currentGuard.complianceStatus === 'Compliant' ? 'text-green-500' : 'text-orange-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">{currentGuard.complianceStatus}</div>
                <p className="text-xs text-muted-foreground mt-1">SIA Licence valid until {format(new Date(currentGuard.licenceExpiry), 'MMM dd, yyyy')}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Reports</CardTitle>
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
              <Card className="border-none shadow-xl overflow-hidden bg-slate-900 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Timer className="h-32 w-32" />
                </div>
                <CardHeader className="border-b border-white/10 pb-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Active Duty Status
                    </CardTitle>
                    <Badge className={activeShift ? "bg-primary text-white" : "bg-slate-700 text-slate-300"}>
                      {activeShift ? "ON DUTY" : "OFF DUTY"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {activeShift ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Current Site</p>
                          <p className="text-2xl font-black text-white">{activeShift.siteName}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> GPS Tracking Active
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Shift Time</p>
                          <p className="text-2xl font-black text-white">
                            {format(new Date(activeShift.startTime), 'HH:mm')} - {format(new Date(activeShift.endTime), 'HH:mm')}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Total Duration: 8h</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">Start Patrol</Button>
                        <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 rounded-xl">Report Incident</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-slate-400 italic">You have no active shift. Next shift soon.</p>
                      <Button className="mt-4 bg-white text-slate-900 font-bold px-8 rounded-full">View Roster</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-primary text-white pb-6">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Ops Centre
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <p className="font-bold text-primary mb-1 text-[10px] uppercase">Announcement:</p>
                      <p className="text-slate-600">Site keys for Tech Hub have been moved to Lockbox 4.</p>
                    </div>
                    <Button className="w-full bg-slate-900 text-white rounded-xl font-bold">Call Supervisor</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roster" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Upcoming Roster</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingShifts.length > 0 ? (
                  upcomingShifts.map(shift => (
                    <div key={shift.id} className="p-6 border-b last:border-0 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-bold">
                          {format(new Date(shift.startTime), 'dd')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{shift.siteName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(shift.startTime), 'EEEE, MMM dd')} • {format(new Date(shift.startTime), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase">{shift.role}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic">No upcoming shifts.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Attendance History</CardTitle>
                  <History className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {pastShifts.length > 0 ? (
                  pastShifts.map(shift => (
                    <div key={shift.id} className="p-4 border-b last:border-0 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{shift.siteName}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(shift.startTime), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">8.0 hrs</p>
                        <Badge variant="secondary" className="text-[9px] bg-green-50 text-green-600">Verified</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic">No historical records found.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mySites.map(site => (
              <Card key={site.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-1.5 w-full ${site.riskLevel === 'High' ? 'bg-red-500' : site.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`} />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Building2 className="h-6 w-6 text-slate-600" />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-black">{site.riskLevel} RISK</Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                      <MapPin className="h-3 w-3" /> {site.address}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Site Access Code</p>
                    <p className="font-mono text-sm font-bold bg-white p-2 rounded border border-dashed text-center">4 4 9 1 #</p>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-bold flex items-center justify-between">
                    View Site SOP <FileText className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Gross Earnings (MTD)</p>
                <p className="text-2xl font-black text-slate-800">$2,450.00</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Approved Hours</p>
                <p className="text-2xl font-black text-slate-800">84.0h</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Hourly Rate</p>
                <p className="text-2xl font-black text-slate-800">$18.50</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-slate-900 text-white">
              <CardContent className="p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Next Pay Date</p>
                <p className="text-2xl font-black">Feb 28</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="bg-white border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Payroll Ledger</CardTitle>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="mr-2 h-3 w-3" /> Export YTD
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reference</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Period</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hours</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPayroll.map(record => (
                      <tr key={record.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 font-mono text-xs font-bold">{record.id}</td>
                        <td className="p-4 font-medium">{record.period}</td>
                        <td className="p-4">{record.hours}h</td>
                        <td className="p-4 font-bold text-slate-800">${record.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200">
                            {record.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="text-primary font-bold text-xs">
                            <FileText className="mr-2 h-3 w-3" /> Payslip
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
