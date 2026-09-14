'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  description?: string;
  status?: 'success' | 'warning' | 'destructive' | 'info';
  href?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  description,
  status = 'info',
  href,
  className
}: KPICardProps) {
  const content = (
    <Card className={cn(
      "border shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden",
      href && "cursor-pointer group",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
            <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter">{value}</h3>
          </div>
          <div className={cn(
            "p-3 rounded-2xl border transition-transform group-hover:scale-110",
            status === 'success' ? "bg-green-50 text-green-600 border-green-100" :
            status === 'warning' ? "bg-amber-50 text-amber-600 border-amber-100" :
            status === 'destructive' ? "bg-red-50 text-red-600 border-red-100" :
            "bg-blue-50 text-primary border-primary/10"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {(trend || description) && (
          <div className="mt-4 flex items-center gap-3">
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                trend.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend.value}
              </div>
            )}
            {description && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
