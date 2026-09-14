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
import { patients } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export default function PatientsPage() {
  const patientList = patients ?? [];

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Patient Registry</h1>
            <p className="text-muted-foreground text-sm font-medium">
                Manage legacy patient records and diagnostic history.
            </p>
        </div>
        <Button className="bg-primary text-white rounded-2xl h-12 px-8 font-black text-xs uppercase italic tracking-tighter shadow-xl shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
       </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
        <CardHeader className="bg-slate-50/50 p-8 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-black italic uppercase">Active Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-8 h-14 text-[10px] font-black uppercase tracking-widest">ID Reference</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Patient Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">D.O.B</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Gender</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Terminal Contact</TableHead>
                <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Samples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientList.length > 0 ? (
                patientList.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-slate-50 transition-colors h-16">
                    <TableCell className="px-8">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-primary font-mono text-xs font-bold hover:underline"
                      >
                        {patient.id}
                      </Link>
                    </TableCell>
                    <TableCell className="font-black text-slate-800 uppercase italic text-sm">{patient.name}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-500">{patient.dateOfBirth}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-full">{patient.gender}</span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-600 font-mono">{patient.contact}</TableCell>
                    <TableCell className="px-8 text-right">
                      <span className="font-black italic text-primary">{patient.sampleCount}</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic font-black uppercase text-xs">
                    No records found in the diagnostic database
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}