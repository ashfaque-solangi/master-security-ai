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

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Patient Records</h1>
            <p className="text-muted-foreground">
                Manage patient information and test history.
            </p>
        </div>
        <Button>Add New Patient</Button>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>A list of all patients in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Samples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="text-primary hover:underline"
                    >
                      {patient.id}
                    </Link>
                  </TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.dateOfBirth}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>{patient.sampleCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
