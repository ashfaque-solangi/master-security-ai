
'use client';

import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Calendar,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { format, isPast, isBefore, addDays } from 'date-fns';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';

export function ComplianceDashboard() {
  const store = useJsonStore();
  const guards = store.getGuards();

  const expired = guards.filter(g => isPast(new Date(g.licenceExpiry))).length;
  const expiringSoon = guards.filter(g => {
    const expiry = new Date(g.licenceExpiry);
    return !isPast(expiry) && isBefore(expiry, addDays(new Date(), 30));
  }).length;
  const missingDocs = guards.reduce((acc, g) => acc + (g.docsMissing || 0), 0);
  const compliantPercent = ((guards.length - expired) / (guards.length || 1)) * 100;

  const STATUS_DATA = [
    { name: 'Compliant', value: guards.length - expired - expiringSoon, color: '#10b981' },
    { name: 'Expiring', value: expiringSoon, color: '#f59e0b' },
    { name: 'Expired', value: expired, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Overall Health" value={`${compliantPercent.toFixed(1)}%`} icon={ShieldCheck} status="success" />
        <KPICard label="Expired Licenses" value={expired} icon={XCircle} status="destructive" description="Immediate Block" />
        <KPICard label="Expiring (30d)" value={expiringSoon} icon={Clock} status="warning" description="Notice Sent" />
        <KPICard label="Missing Docs" value={missingDocs} icon={FileText} status="warning" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Workforce Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={STATUS_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Critical Compliance Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {[
                { label: 'SIA License Renewal', period: 'Next 30 Days', count: expiringSoon, severity: 'High' },
                { label: 'Right to Work Audit', period: 'Next 60 Days', count: 12, severity: 'Medium' },
                { label: 'First Aid Recertification', period: 'Next 90 Days', count: 24, severity: 'Low' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dashed">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.severity === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{item.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800 italic">{item.count}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Personnel Affected</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 p-8 border-b">
           <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Compliance Exceptions Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Personnel</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Requirement</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Expiry</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                  <th className="text-right px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guards.filter(g => g.complianceStatus !== 'Compliant').map(guard => (
                  <tr key={guard.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] border">{guard.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase italic tracking-tight">{guard.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{guard.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 text-xs">SIA LICENSE RE-VALIDATION</td>
                    <td className="px-8 py-6 font-mono text-xs text-red-600 font-bold">{format(new Date(guard.licenceExpiry), 'MMM dd, yyyy')}</td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="text-[8px] font-black h-5 px-3 bg-red-50 text-red-600 border-red-100 uppercase">{guard.complianceStatus}</Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary"><MoreVertical className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
