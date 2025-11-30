export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Doctor = 'Doctor',
  Nurse = 'Nurse',
  Receptionist = 'Receptionist',
  Pharmacist = 'Pharmacist',
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  roles: UserRole[];
  hospital_id: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  license_number: string;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface Patient {
  id: string;
  created_at: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  blood_type: string;
  emergency_contact: { name: string; phone: string };
  patient_type: 'OPD' | 'IPD'; // Outpatient vs Inpatient
  department: string;
  photo_url?: string;
  hospital_id: string;
}

export interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface MedicalRecord {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string | null;
  doctor_name: string;
  notes: string;
  diagnosis: string;
  prescription: Medicine[];
  summary?: string;
  prescription_status?: 'Pending' | 'Fulfilled';
  hospital_id: string;
}

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    time: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    hospital_id: string;
    // Joined data from other tables
    patients?: { name: string };
    profiles?: { first_name: string, last_name: string };
}