import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import PatientProfile from './PatientProfile';
import { type Patient } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { supabase } from '../../services/supabaseClient';

const AddPatientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: () => void; // Changed to a refresh trigger
}> = ({ isOpen, onClose, onAddPatient }) => {
    const { hospital } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const newPatientData = {
            name: formData.get('name') as string,
            dob: formData.get('dob') as string,
            gender: formData.get('gender') as 'Male' | 'Female' | 'Other',
            contact: formData.get('contact') as string,
            address: formData.get('address') as string,
            blood_type: formData.get('blood_type') as string,
            emergency_contact: {
                name: formData.get('emergency_contact_name') as string,
                phone: formData.get('emergency_contact_phone') as string,
            },
            patient_type: formData.get('patient_type') as 'OPD' | 'IPD',
            department: formData.get('department') as string,
            hospital_id: hospital!.id,
        };

        const { error } = await supabase.from('patients').insert(newPatientData);

        if (error) {
            setError(error.message);
        } else {
            onAddPatient();
            onClose();
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Patient">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input name="name" label="Full Name" required />
                <Input name="dob" label="Date of Birth" type="date" required />
                <Select name="gender" label="Gender" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </Select>
                <Input name="contact" label="Contact Phone" type="tel" required />
                <Input name="address" label="Address" required />
                <Input name="blood_type" label="Blood Type" required />
                <Input name="emergency_contact_name" label="Emergency Contact Name" required />
                <Input name="emergency_contact_phone" label="Emergency Contact Phone" type="tel" required />
                <Select name="patient_type" label="Patient Type" required>
                    <option value="OPD">OPD (Outpatient)</option>
                    <option value="IPD">IPD (Inpatient)</option>
                </Select>
                <Input name="department" label="Department" required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Patient'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const PatientList: React.FC = () => {
  const { hospital } = useAuth();
  const { hasPermission } = usePermissions();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchPatients = useCallback(async () => {
    if (!hospital) return;
    setLoading(true);
    let query = supabase.from('patients').select('*').eq('hospital_id', hospital.id);

    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    } else {
        setPatients(data);
    }
    setLoading(false);
  }, [hospital, searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handlePatientAdded = () => {
    fetchPatients();
  }

  if (selectedPatient) {
    return <PatientProfile patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <>
      <Card title="Patient Directory" actions={
        hasPermission('PATIENT:CREATE') && <Button onClick={() => setIsModalOpen(true)}>Add Patient</Button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading patients...</td></tr>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.patient_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button size="sm" variant="secondary" onClick={() => setSelectedPatient(patient)}>
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))
              ) : (
                <tr><td colSpan={4} className="text-center py-4">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AddPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddPatient={handlePatientAdded} />
    </>
  );
};

export default PatientList;