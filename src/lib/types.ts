export type Sample = {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  status: 'Collected' | 'Processing' | 'Pending Verification' | 'Verified' | 'Reported' | 'Disposed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  technician: string;
  collectionDate: string;
  turnaroundTime: string;
  results: TestResult[];
  predefinedRules: string;
  statisticalData: string;
  remarks: string[];
  auditTrail: AuditEntry[];
};

export type TestResult = {
  parameter: string;
  value: number | null;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
};

export type AuditEntry = {
  user: string;
  action: string;
  timestamp: string;
};

export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  sampleCount: number;
};

export type BloodUnit = {
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  quantity: number;
  lowStockThreshold: number;
};
