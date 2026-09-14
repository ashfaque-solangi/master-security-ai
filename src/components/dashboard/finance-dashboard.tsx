
'use client';

import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Building2, 
  AlertCircle,
  TrendingDown,
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { KPICard } from './kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useJsonStore } from '@/lib/store';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const REVENUE_DATA = [
  { name: 'Jan', revenue: 112000, payroll: 82000 },
  { name: 'Feb', revenue: 124500, payroll: 84000 },
  { name: 'Mar', revenue: 118000, payroll: 83500 },
  { name: 'Apr', revenue: 132000, payroll: 88000 },
  { name: 'May', revenue: 145000, payroll: 92000 },
];

const SITE_PROFIT = [
  { name: 'Tech Hub HQ', profit: 42000, margin: 38 },
  { name: 'Retail Park East', profit: 28000, margin: 32 },
  { name: 'Data Center Alpha', profit: 35000, margin: 41 },
  { name: 'Logistics Central', profit: 12000, margin: 18 },
];

export function FinanceDashboard() {
  const store = useJsonStore();
  const sites = store.getSites();
  const totalRevenue = sites.reduce((acc, s) => acc + s.revenuePerMonth, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Monthly Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}k`} icon={DollarSign} trend={{ value: '12.4%', isUp: true }} description="Projected MRR" />
        <KPICard label="Estimated Payroll" value="$84.2k" icon={CreditCard} description="Due in 4 days" />
        <KPICard label="Outstanding Invoices" value="$22.5k" icon={Receipt} status="warning" description="08 Past Due" />
        <KPICard label="Gross Margin" value="32.8%" icon={PieChartIcon} status="success" trend={{ value: '2.1%', isUp: true }} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Revenue vs Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                <Bar dataKey="payroll" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Personnel Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 p-8 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Site Profitability Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {SITE_PROFIT.map(site => (
                <div key={site.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black text-slate-800 italic uppercase">{site.name}</span>
                    <span className="font-mono text-green-600 font-bold">${(site.profit / 1000).toFixed(1)}k Profit</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Progress value={site.margin} className="h-2 flex-1 [&>div]:bg-primary" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-20 text-right">{site.margin}% MARGIN</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 p-8 border-b flex flex-row items-center justify-between">
           <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Recent Invoice Ledger</CardTitle>
           <Button variant="ghost" size="sm" className="text-primary font-black text-xs uppercase italic tracking-tighter">Export CSV <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client</th>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Due Date</th>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                <th className="text-right px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {[
                 { client: 'Global Tech Corp', amount: 12500, due: '2024-03-25', status: 'Paid' },
                 { client: 'Eastside Properties', amount: 8400, due: '2024-03-28', status: 'Pending' },
                 { client: 'Apex Logistics', amount: 14200, due: '2024-03-15', status: 'Overdue' }
               ].map((inv, idx) => (
                 <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6 font-black text-slate-800 italic uppercase italic tracking-tight">{inv.client}</td>
                    <td className="px-8 py-6 font-mono font-bold text-slate-600">${inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{inv.due}</td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className={`text-[8px] font-black h-5 px-3 rounded-full ${inv.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : inv.status === 'Overdue' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100'}`}>{inv.status}</Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary"><MoreVertical className="h-4 w-4" /></Button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
