import { notFound } from 'next/navigation';
import {
  FileText,
  User,
  Calendar,
  Clock,
  FlaskConical,
  ShieldCheck,
  Check,
  Download,
} from 'lucide-react';

import { findSampleById } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResultEntryForm } from '@/components/samples/result-entry-form';
import { AuditTrail } from '@/components/samples/audit-trail';
import { Separator } from '@/components/ui/separator';

type SampleDetailPageProps = {
  params: {
    id: string;
  };
};

export default function SampleDetailPage({ params }: SampleDetailPageProps) {
  const sample = findSampleById(params.id);

  if (!sample) {
    notFound();
  }

  const isVerified = sample.status === 'Verified' || sample.status === 'Reported';

  const details = [
    { icon: User, label: 'Patient', value: `${sample.patientName} (${sample.patientId})` },
    { icon: FlaskConical, label: 'Test Name', value: sample.testName },
    { icon: User, label: 'Technician', value: sample.technician },
    { icon: Calendar, label: 'Collected', value: new Date(sample.collectionDate).toLocaleString() },
    { icon: Clock, label: 'Turnaround', value: sample.turnaroundTime },
    { icon: ShieldCheck, label: 'Priority', value: sample.priority },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Sample Details
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-muted-foreground">{sample.id}</span>
             <Badge>{sample.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Check className="mr-2" /> Verify Results</Button>
            <Button><Download className="mr-2" /> Generate Report</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ResultEntryForm sample={sample} isVerified={isVerified} />
          <AuditTrail auditTrail={sample.auditTrail} />
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-start gap-3">
                  <detail.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{detail.label}</p>
                    <p className="text-sm text-muted-foreground">{detail.value}</p>
                  </div>
                </div>
              ))}
              <Separator />
               <div className="space-y-2">
                    <p className="text-sm font-medium">Remarks</p>
                    {sample.remarks.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {sample.remarks.map((remark, index) => (
                                <li key={index}>{remark}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No remarks added yet.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
