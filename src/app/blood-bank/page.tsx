import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { bloodBankInventory } from '@/lib/data';

export default function BloodBankPage() {
  const inventory = bloodBankInventory ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Blood Bank Inventory
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Current status of blood unit inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {inventory.length > 0 ? (
          inventory.map((unit) => {
            const isLow = unit.quantity < unit.lowStockThreshold;
            const progressValue = (unit.quantity / (unit.lowStockThreshold * 2)) * 100;

            return (
              <Card key={unit.bloodType} className={isLow ? 'border-destructive shadow-lg' : 'shadow-sm border-none'}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle
                    className={`text-2xl font-black italic ${
                      isLow ? 'text-destructive' : 'text-slate-800'
                    }`}
                  >
                    {unit.bloodType}
                  </CardTitle>
                  <span className="text-5xl font-black text-slate-200">
                    {unit.bloodType.includes('+') ? '+' : '-'}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black italic text-slate-800">{unit.quantity} Units</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 italic">
                    {isLow ? 'Stock critical' : `${unit.lowStockThreshold}+ units recommended`}
                  </p>
                  <Progress value={progressValue} className={`mt-4 h-1.5 ${isLow ? '[&>div]:bg-destructive' : ''}`} />
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed">
            <p className="text-slate-400 font-black italic uppercase tracking-tighter">No inventory data detected</p>
          </div>
        )}
      </div>
    </div>
  );
}