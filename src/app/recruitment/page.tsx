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
import { applicants } from '@/lib/data';
import { format } from 'date-fns';

export default function RecruitmentDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">HR & Recruitment Dashboard</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage talent acquisition and onboarding pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm">
            <BarChart3 className="mr-2 h-4 w-4" /> Reports
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md px-6">
            + Job Posting
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Applicants</p>
                <p className="text-2xl font-extrabold text-slate-800">{applicants.length}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-green-500 font-bold flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> +8%
              </span>
              <span className="text-[10px] text-muted-foreground">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-orange-100 p-3 rounded-full text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Interviews</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  {applicants.filter(a => a.status === 'Interview').length}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={45} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Hires Pending</p>
                <p className="text-2xl font-extrabold text-slate-800">12</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="rounded-full text-[10px]">Ready for Contract</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Check Fails</p>
                <p className="text-2xl font-extrabold text-slate-800">2</p>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-red-500 font-bold">Action Required - Background Checks</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Active Pipeline
              </CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 text-xs h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Applicant</th>
                    <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Applied For</th>
                    <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Applied On</th>
                    <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                    <th className="text-right p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(applicant => (
                    <tr key={applicant.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold">{applicant.name}</div>
                        <div className="text-xs text-muted-foreground">{applicant.experience} exp.</div>
                      </td>
                      <td className="p-4">{applicant.role}</td>
                      <td className="p-4 text-xs">
                        {isMounted ? format(new Date(applicant.appliedDate), 'MMM dd, yyyy') : '...'}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          {applicant.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="text-primary text-xs">Manage</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">JD</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">John Doe</p>
                  <p className="text-xs text-muted-foreground">Tomorrow at 10:00 AM</p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Clock className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">JS</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Jane Smith</p>
                  <p className="text-xs text-muted-foreground">Oct 24 at 2:30 PM</p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Clock className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-none shadow-xl text-white">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hiring Velocity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Application to Hire</span>
                  <span className="text-primary font-bold">14 Days Avg.</span>
                </div>
                <Progress value={75} className="h-1 bg-white/10" />
              </div>
              <p className="text-xs text-slate-400">
                You are 15% faster than previous quarter. AI suggesting consolidation of background checks.
              </p>
              <Button className="w-full bg-primary text-white rounded-full text-xs">Optimize Pipeline</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
