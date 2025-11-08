import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Beaker, CheckCircle, Clock, FlaskConical } from 'lucide-react';

export function StatsCards() {
  const stats = [
    {
      title: 'Total Samples',
      value: '1,257',
      icon: <FlaskConical className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: 'Processing',
      value: '82',
      icon: <Beaker className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: 'Pending Verification',
      value: '15',
      icon: <Clock className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: 'Verified Today',
      value: '213',
      icon: <CheckCircle className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
