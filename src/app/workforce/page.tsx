
'use client';

import { 
  Users, 
  Search, 
  Filter, 
  UserPlus,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { guards } from '@/lib/data';

export default function WorkforcePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workforce Management</h1>
          <p className="text-muted-foreground">
            Manage your security officers, track compliance, and view real-time status.
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground">
          <UserPlus className="mr-2 h-4 w-4" /> Add Officer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search officers by name or ID..." className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Status
        </Button>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Site
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {guards.map((guard) => (
          <Card key={guard.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              guard.status === 'Active' ? 'bg-green-500' :
              guard.status === 'On Break' ? 'bg-yellow-500' :
              'bg-gray-400'
            }`} />
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback>{guard.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{guard.name}</CardTitle>
                <CardDescription className="text-xs">{guard.id}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                  <Badge variant="outline" className="text-[10px] w-full justify-center">
                    {guard.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Compliance</p>
                  <Badge 
                    variant={guard.complianceStatus === 'Compliant' ? 'secondary' : 'destructive'} 
                    className="text-[10px] w-full justify-center"
                  >
                    {guard.complianceStatus}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="truncate">{guard.currentSiteName || 'No Active Shift'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{guard.email}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">Profile</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs text-accent">Message</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
