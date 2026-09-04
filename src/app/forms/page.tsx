
'use client';

import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Settings2, 
  Eye, 
  Copy, 
  Trash2, 
  MoreVertical,
  Layout,
  Type,
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { forms } from '@/lib/data';
import { format } from 'date-fns';

export default function FormBuilder() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dynamic Form Builder</h1>
          <p className="text-muted-foreground">Configure custom report structures for field officers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md px-6">
          <Plus className="mr-2 h-4 w-4" /> Create New Form
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Active Form Definitions</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search templates..." className="pl-8 text-xs h-9 bg-slate-50 border-none" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Form Name</th>
                      <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Fields</th>
                      <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Last Modified</th>
                      <th className="text-left p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                      <th className="text-right p-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map(form => (
                      <tr key={form.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-primary" /> {form.name}
                          </div>
                        </td>
                        <td className="p-4 font-medium">{form.fields}</td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {mounted ? format(new Date(form.lastModified), 'MMM dd, yyyy') : '...'}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">
                            {form.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Layout className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                BUILDER TOOLBOX
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400">Drag fields to create your custom report.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                  <Type className="h-4 w-4 text-primary" />
                  <span className="text-sm">Short Text</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                  <Layout className="h-4 w-4 text-primary" />
                  <span className="text-sm">Rich Description</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm">Multiple Choice</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                  <ChevronDown className="h-4 w-4 text-primary" />
                  <span className="text-sm">Dropdown List</span>
                </div>
              </div>
              <Button className="w-full bg-primary text-white rounded-full font-bold text-xs mt-4">Save Configuration</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Reporting AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI can automatically summarize these reports and distribute them to client contacts based on severity.
              </p>
              <div className="p-3 bg-orange-50 rounded-lg border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Recommended</p>
                <p className="text-[11px] font-medium text-slate-700">Add a "Hazard Identification" field to increase compliance by 15%.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
