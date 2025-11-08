import { StatsCards } from '@/components/dashboard/stats-cards';
import { SampleTable } from '@/components/dashboard/sample-table';
import { samples } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <StatsCards />
      <SampleTable samples={samples} />
    </div>
  );
}
