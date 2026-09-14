
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  ChevronRight, 
  Plus, 
  ChevronDown,
  Activity,
  Loader2
} from 'lucide-react';
import { useJsonStore } from '@/lib/store';
import { User } from '@/lib/types';
import { getAuthorizedDashboards, getDefaultDashboard } from '@/lib/dashboard-config';
import { Button } from '@/components/ui/button';
import { ExecutiveDashboard } from '@/components/dashboard/executive-dashboard';
import { OperationsDashboard } from '@/components/dashboard/operations-dashboard';
import { HRDashboard } from '@/components/dashboard/hr-dashboard';
import { WarRoom } from '@/components/dashboard/war-room';
import { FinanceDashboard } from '@/components/dashboard/finance-dashboard';
import { ComplianceDashboard } from '@/components/dashboard/compliance-dashboard';
import { AIDashboard } from '@/components/dashboard/ai-dashboard';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const PlaceholderDashboard = ({ title }: { title: string }) => (
  <div className="p-20 text-center flex flex-col items-center gap-4 bg-slate-50 rounded-[3rem] border border-dashed">
     <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center shadow-sm">
        <Activity className="h-8 w-8 text-slate-300" />
     </div>
     <div>
       <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-800">{title}</h3>
       <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Intelligence Module Initialising...</p>
     </div>
  </div>
);

function DashboardContent() {
  const store = useJsonStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const user = store.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const dbId = searchParams.get('id') || getDefaultDashboard(user.role);
      setActiveDashboardId(dbId);
    }
  }, [searchParams]);

  if (!isMounted || !currentUser) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dashboards = getAuthorizedDashboards(currentUser.role, (currentUser.extraPermissions || []).map(p => p as string));
  const activeDashboard = dashboards.find(db => db.id === activeDashboardId) || dashboards[0];

  const renderActiveDashboard = () => {
    switch (activeDashboard?.id) {
      case 'executive': return <ExecutiveDashboard />;
      case 'operations': return <OperationsDashboard />;
      case 'hr': return <HRDashboard />;
      case 'command-centre': return <WarRoom />;
      case 'finance': return <FinanceDashboard />;
      case 'compliance': return <ComplianceDashboard />;
      case 'ai-insights': return <AIDashboard />;
      default: return <PlaceholderDashboard title={activeDashboard?.title || 'Dashboard'} />;
    }
  };

  const switchDashboard = (id: string) => {
    router.push(`/dashboard?id=${id}`);
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <LayoutDashboard className="h-3 w-3" />
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 italic">{activeDashboard?.title}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 italic uppercase">
            {activeDashboard?.title}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            {activeDashboard?.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dashboards.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-2xl font-black text-xs h-12 px-6 uppercase italic tracking-tighter border-slate-200 shadow-sm bg-white">
                  Switch Dashboard <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 shadow-2xl border-none">
                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest pb-3">Available Views</DropdownMenuLabel>
                <DropdownMenuSeparator className="mb-2" />
                {dashboards.map(db => (
                  <DropdownMenuItem 
                    key={db.id} 
                    onClick={() => switchDashboard(db.id)}
                    className={`rounded-2xl py-3 px-4 flex items-center gap-4 cursor-pointer mb-1 ${activeDashboardId === db.id ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50'}`}
                  >
                    <db.icon className={`h-5 w-5 ${activeDashboardId === db.id ? 'text-primary' : 'text-slate-400'}`} />
                    <div className="flex flex-col">
                      <span className="font-black text-xs uppercase italic tracking-tight">{db.title}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Access</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button className="bg-primary text-white hover:bg-primary/90 rounded-2xl h-12 px-8 font-black text-xs uppercase italic tracking-tighter shadow-xl shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create Record
          </Button>
        </div>
      </div>

      {renderActiveDashboard()}
    </div>
  );
}

export default function UnifiedDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
