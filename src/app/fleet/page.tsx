'use client';

import { 
  Truck, 
  MapPin, 
  Fuel, 
  Activity, 
  AlertCircle,
  Wrench,
  Search,
  Filter
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { vehicles } from '@/lib/data';
import { format } from 'date-fns';

export default function FleetPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Fleet & Equipment</h1>
          <p className="text-muted-foreground text-lg">
            Monitor vehicle deployment, maintenance schedules, and fuel usage.
          </p>
        </div>
        <Button className="bg-primary text-white">
          <Truck className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search fleet..." className="pl-8" />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Status</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="group hover:border-primary transition-all shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <Badge variant={vehicle.status === 'Active' ? 'secondary' : 'outline'}>
                  {vehicle.status}
                </Badge>
              </div>
              <div className="mt-4">
                <CardTitle>{vehicle.model}</CardTitle>
                <CardDescription className="font-mono text-xs uppercase font-bold tracking-wider">
                  {vehicle.plate}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Fuel Level</span>
                  </div>
                  <span className={vehicle.fuelLevel < 20 ? 'text-destructive' : ''}>
                    {vehicle.fuelLevel}%
                  </span>
                </div>
                <Progress value={vehicle.fuelLevel} className={`h-1.5 ${vehicle.fuelLevel < 20 ? '[&>div]:bg-destructive' : ''}`} />
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Current Location</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {vehicle.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Next Service</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {format(new Date(vehicle.nextService), 'MMM dd')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" variant="outline">Telemetry</Button>
                <Button className="flex-1 bg-secondary hover:bg-secondary/80">Log Maintenance</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}