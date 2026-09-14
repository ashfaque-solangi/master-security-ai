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
  const entries = (auditTrail ?? []).slice().reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>History of actions on this sample.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <span className="text-sm font-medium">
                  {(entry.user ?? 'U').substring(0, 1)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{entry.user ?? 'Unknown User'}</span> {(entry.action ?? 'Performed action').toLowerCase()}.
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.timestamp 
                    ? formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true }) 
                    : 'Unknown time'}
                </p>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground italic">
              No audit entries recorded.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
