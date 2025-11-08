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
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Blood Bank Inventory
        </h1>
        <p className="text-muted-foreground">
          Current status of blood unit inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {bloodBankInventory.map((unit) => {
          const isLow = unit.quantity < unit.lowStockThreshold;
          const progressValue = (unit.quantity / (unit.lowStockThreshold * 2)) * 100;

          return (
            <Card key={unit.bloodType} className={isLow ? 'border-destructive' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className={`text-2xl font-bold ${
                    isLow ? 'text-destructive' : ''
                  }`}
                >
                  {unit.bloodType}
                </CardTitle>
                <span className="text-5xl font-extrabold text-muted-foreground/20">
                  {unit.bloodType.includes('+') ? '+' : '-'}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{unit.quantity} Units</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLow ? 'Stock is critically low' : `${unit.lowStockThreshold}+ units recommended`}
                </p>
                <Progress value={progressValue} className={`mt-4 h-2 ${isLow ? '[&>div]:bg-destructive' : ''}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
