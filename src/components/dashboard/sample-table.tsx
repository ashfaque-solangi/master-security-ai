'use client';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Sample } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const statusMap: Record<
  Sample['status'],
  { variant: StatusVariant; label: string }
> = {
  Collected: { variant: 'outline', label: 'Collected' },
  Processing: { variant: 'secondary', label: 'Processing' },
  'Pending Verification': { variant: 'default', label: 'Pending' },
  Verified: { variant: 'default', label: 'Verified' },
  Reported: { variant: 'secondary', label: 'Reported' },
  Disposed: { variant: 'outline', label: 'Disposed' },
};

const priorityMap: Record<
  Sample['priority'],
  { variant: StatusVariant; label: string }
> = {
  Routine: { variant: 'outline', label: 'Routine' },
  Urgent: { variant: 'secondary', label: 'Urgent' },
  STAT: { variant: 'destructive', label: 'STAT' },
};

export function SampleTable({ samples }: { samples: Sample[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Tracking</CardTitle>
        <CardDescription>
          An overview of all samples in the workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Collected</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samples.map((sample) => (
              <TableRow key={sample.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/samples/${sample.id}`}
                    className="text-primary hover:underline"
                  >
                    {sample.id}
                  </Link>
                </TableCell>
                <TableCell>{sample.patientName}</TableCell>
                <TableCell>{sample.testName}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusMap[sample.status].variant}
                    className={
                      sample.status === 'Pending Verification'
                        ? 'bg-yellow-500 text-white'
                        : ''
                    }
                  >
                    {statusMap[sample.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityMap[sample.priority].variant}>
                    {priorityMap[sample.priority].label}
                  </Badge>
                </TableCell>
                <TableCell>{sample.technician}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(sample.collectionDate), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/samples/${sample.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Assign Technician</DropdownMenuItem>
                      <DropdownMenuItem>Generate Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
