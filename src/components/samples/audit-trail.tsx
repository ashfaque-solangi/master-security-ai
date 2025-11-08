import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AuditEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export function AuditTrail({ auditTrail }: { auditTrail: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>History of actions on this sample.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditTrail.slice().reverse().map((entry, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <span className="text-sm font-medium">
                  {entry.user.substring(0, 1)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{entry.user}</span> {entry.action.toLowerCase()}.
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
