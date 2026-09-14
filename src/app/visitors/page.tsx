'use client';

import { 
  Search, 
  Filter, 
  Plus, 
  Building2,
  Download
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useJsonStore } from '@/lib/store';
import { Visitor } from '@/lib/types';

export default function VisitorsPage() {
  const store = useJsonStore();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setVisitors(store.getVisitors());
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Visitor Management</h1>
          <p className="text-muted-foreground text-lg">
            Track site access, host notifications, and visitor lifecycle records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Logs</Button>
          <Button className="bg-primary text-white">
            <Plus className="mr-2 h-4 w-4" /> Pre-Register
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search visitors..." className="pl-8" />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Status</Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Active & Upcoming Visitors</CardTitle>
          <CardDescription>Real-time log of personnel accessing monitored sites.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.length > 0 ? visitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-semibold">{visitor.name}</TableCell>
                  <TableCell>{visitor.company}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {visitor.siteName}
                    </div>
                  </TableCell>
                  <TableCell>{visitor.hostName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium">{format(new Date(visitor.checkIn), 'HH:mm')}</span>
                      <span className="text-muted-foreground">{format(new Date(visitor.checkIn), 'MMM dd')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={visitor.status === 'Checked In' ? 'secondary' : 'outline'}>
                      {visitor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Check Out</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">No visitors registered for today.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
