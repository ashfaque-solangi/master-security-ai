import type { Sample, Patient, BloodUnit } from './types';

export const samples: Sample[] = [
  {
    id: 'SAM-2024-001',
    patientName: 'John Doe',
    patientId: 'PAT-001',
    testName: 'Complete Blood Count',
    status: 'Pending Verification',
    priority: 'Urgent',
    technician: 'Alice Johnson',
    collectionDate: '2024-07-28T10:00:00Z',
    turnaroundTime: '4 hours',
    results: [
      { parameter: 'WBC', value: 7.5, unit: 'x10^9/L', referenceRange: { min: 4.0, max: 11.0 } },
      { parameter: 'RBC', value: 4.92, unit: 'x10^12/L', referenceRange: { min: 4.5, max: 5.9 } },
      { parameter: 'HGB', value: 15.1, unit: 'g/dL', referenceRange: { min: 13.5, max: 17.5 } },
      { parameter: 'PLT', value: 350, unit: 'x10^9/L', referenceRange: { min: 150, max: 450 } },
    ],
    predefinedRules: 'If HGB is below 10, flag as anemic.',
    statisticalData: 'Median PLT for this demographic is 280.',
    remarks: [],
    auditTrail: [
      { user: 'Collector', action: 'Sample collected', timestamp: '2024-07-28T10:05:00Z' },
      { user: 'Alice Johnson', action: 'Results entered', timestamp: '2024-07-28T11:30:00Z' },
    ],
  },
  {
    id: 'SAM-2024-002',
    patientName: 'Jane Smith',
    patientId: 'PAT-002',
    testName: 'Lipid Panel',
    status: 'Processing',
    priority: 'Routine',
    technician: 'Bob Williams',
    collectionDate: '2024-07-28T09:30:00Z',
    turnaroundTime: '24 hours',
    results: [
        { parameter: 'Cholesterol', value: null, unit: 'mg/dL', referenceRange: { min: 125, max: 200 } },
        { parameter: 'Triglycerides', value: null, unit: 'mg/dL', referenceRange: { min: 0, max: 150 } },
        { parameter: 'HDL', value: null, unit: 'mg/dL', referenceRange: { min: 40, max: 60 } },
    ],
    predefinedRules: 'Flag results above the reference range maximum.',
    statisticalData: '',
    remarks: [],
    auditTrail: [
      { user: 'Collector', action: 'Sample collected', timestamp: '2024-07-28T09:35:00Z' },
    ],
  },
  {
    id: 'SAM-2024-003',
    patientName: 'Peter Jones',
    patientId: 'PAT-003',
    testName: 'Thyroid Function Test',
    status: 'Verified',
    priority: 'Routine',
    technician: 'Alice Johnson',
    collectionDate: '2024-07-27T14:00:00Z',
    turnaroundTime: '48 hours',
    results: [
      { parameter: 'TSH', value: 6.8, unit: 'mIU/L', referenceRange: { min: 0.4, max: 4.0 } },
      { parameter: 'Free T4', value: 1.1, unit: 'ng/dL', referenceRange: { min: 0.8, max: 1.8 } },
    ],
    predefinedRules: 'If TSH is high and Free T4 is normal, suggest subclinical hypothyroidism.',
    statisticalData: '',
    remarks: ['High TSH with normal T4 may indicate subclinical hypothyroidism. Clinical correlation advised.'],
    auditTrail: [
        { user: 'Collector', action: 'Sample collected', timestamp: '2024-07-27T14:05:00Z' },
        { user: 'Alice Johnson', action: 'Results entered', timestamp: '2024-07-27T16:00:00Z' },
        { user: 'Dr. Supervisor', action: 'Results verified', timestamp: '2024-07-27T17:00:00Z' },
    ],
  },
    {
    id: 'SAM-2024-004',
    patientName: 'Mary Davis',
    patientId: 'PAT-004',
    testName: 'Basic Metabolic Panel',
    status: 'Reported',
    priority: 'STAT',
    technician: 'Charlie Brown',
    collectionDate: '2024-07-26T08:00:00Z',
    turnaroundTime: '1 hour',
    results: [
        { parameter: 'Glucose', value: 95, unit: 'mg/dL', referenceRange: { min: 70, max: 100 } },
        { parameter: 'Creatinine', value: 0.9, unit: 'mg/dL', referenceRange: { min: 0.6, max: 1.2 } },
    ],
    predefinedRules: '',
    statisticalData: '',
    remarks: ['All values within normal limits.'],
    auditTrail: [
        { user: 'Collector', action: 'Sample collected', timestamp: '2024-07-26T08:05:00Z' },
        { user: 'Charlie Brown', action: 'Results entered', timestamp: '2024-07-26T08:30:00Z' },
        { user: 'Dr. Supervisor', action: 'Results verified', timestamp: '2024-07-26T08:45:00Z' },
        { user: 'System', action: 'Report generated', timestamp: '2024-07-26T08:46:00Z' },
    ],
  },
  {
    id: 'SAM-2024-005',
    patientName: 'John Doe',
    patientId: 'PAT-001',
    testName: 'Coagulation Panel',
    status: 'Collected',
    priority: 'Routine',
    technician: 'Unassigned',
    collectionDate: '2024-07-29T11:00:00Z',
    turnaroundTime: '6 hours',
    results: [],
    predefinedRules: '',
    statisticalData: '',
    remarks: [],
    auditTrail: [
        { user: 'Collector', action: 'Sample collected', timestamp: '2024-07-29T11:05:00Z' },
    ],
  },
];

export const patients: Patient[] = [
    { id: 'PAT-001', name: 'John Doe', dateOfBirth: '1985-05-15', gender: 'Male', contact: 'john.doe@email.com', sampleCount: 2 },
    { id: 'PAT-002', name: 'Jane Smith', dateOfBirth: '1992-08-22', gender: 'Female', contact: 'jane.smith@email.com', sampleCount: 1 },
    { id: 'PAT-003', name: 'Peter Jones', dateOfBirth: '1978-11-30', gender: 'Male', contact: 'peter.jones@email.com', sampleCount: 1 },
    { id: 'PAT-004', name: 'Mary Davis', dateOfBirth: '1965-02-10', gender: 'Female', contact: 'mary.davis@email.com', sampleCount: 1 },
    { id: 'PAT-005', name: 'David Wilson', dateOfBirth: '2001-07-19', gender: 'Male', contact: 'david.wilson@email.com', sampleCount: 0 },
];

export const bloodBankInventory: BloodUnit[] = [
    { bloodType: 'A+', quantity: 45, lowStockThreshold: 20 },
    { bloodType: 'A-', quantity: 15, lowStockThreshold: 10 },
    { bloodType: 'B+', quantity: 30, lowStockThreshold: 15 },
    { bloodType: 'B-', quantity: 8, lowStockThreshold: 10 },
    { bloodType: 'AB+', quantity: 12, lowStockThreshold: 5 },
    { bloodType: 'AB-', quantity: 3, lowStockThreshold: 5 },
    { bloodType: 'O+', quantity: 60, lowStockThreshold: 30 },
    { bloodType: 'O-', quantity: 25, lowStockThreshold: 15 },
];

export function findSampleById(id: string): Sample | undefined {
  return samples.find(sample => sample.id === id);
}
