import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, type Appointment, type User, type Patient } from '../../types';
import { supabase } from '../../services/supabaseClient';

const AppointmentScheduler: React.FC = () => {
    const { hospital } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<User[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!hospital) return;
        setLoading(true);

        const { data: apptData, error: apptError } = await supabase
            .from('appointments')
            .select(`
                *,
                patients ( name ),
                profiles ( first_name, last_name )
            `)
            .eq('hospital_id', hospital.id)
            .order('date', { ascending: false });

        const { data: docData, error: docError } = await supabase
            .from('profiles')
            .select('*')
            .eq('hospital_id', hospital.id)
            .contains('roles', [UserRole.Doctor]);
        
        const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('id, name')
            .eq('hospital_id', hospital.id);

        if (apptError) console.error(apptError); else setAppointments(apptData as any);
        if (docError) console.error(docError); else setDoctors(docData as User[]);
        if (patientError) console.error(patientError); else setPatients(patientData as Patient[]);

        setLoading(false);
    }, [hospital]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const newAppointment = {
            patient_id: formData.get('patient_id') as string,
            doctor_id: formData.get('doctor_id') as string,
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            status: 'Scheduled',
            hospital_id: hospital!.id,
        };

        const { error } = await supabase.from('appointments').insert(newAppointment);

        if (error) {
            alert(error.message);
        } else {
            setIsModalOpen(false);
            fetchData(); // Refresh list
        }
    };

    const getStatusColor = (status: 'Scheduled' | 'Completed' | 'Cancelled') => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
        }
    }
    
    return (
        <>
            <Card title="Appointments" actions={<Button onClick={() => setIsModalOpen(true)}>New Appointment</Button>}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-4">Loading appointments...</td></tr>
                            ) : appointments.map(appt => (
                                <tr key={appt.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appt.patients?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`Dr. ${appt.profiles?.first_name} ${appt.profiles?.last_name}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.date} at {appt.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Appointment">
                <form onSubmit={handleAddAppointment} className="space-y-4">
                    <Select name="patient_id" label="Patient" required>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                    <Select name="doctor_id" label="Doctor" required>
                        {doctors.map(d => <option key={d.id} value={d.id}>{`Dr. ${d.first_name} ${d.last_name}`}</option>)}
                    </Select>
                    <Input name="date" label="Date" type="date" required />
                    <Input name="time" label="Time" type="time" required />
                     <div className="flex justify-end pt-4 space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Schedule</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AppointmentScheduler;