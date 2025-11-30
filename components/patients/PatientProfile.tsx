import React, { useState, useEffect, useCallback } from 'react';
import { type Patient, type MedicalRecord, type Medicine } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { summarizeText } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { usePermissions } from '../../hooks/usePermissions';
import { supabase } from '../../services/supabaseClient';

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
}

const NewMedicalRecordForm: React.FC<{patient: Patient, onAddRecord: () => void}> = ({ patient, onAddRecord }) => {
    const { user, hospital } = useAuth();
    const { hasPermission } = usePermissions();
    const [notes, setNotes] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState<Medicine[]>([]);
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        if (!notes) return;
        setIsSummarizing(true);
        const result = await summarizeText(notes);
        setSummary(result);
        setIsSummarizing(false);
    };

    const handlePrescriptionChange = (index: number, field: keyof Medicine, value: string) => {
        const updatedPrescription = [...prescription];
        updatedPrescription[index] = { ...updatedPrescription[index], [field]: value };
        setPrescription(updatedPrescription);
    };

    const addMedicine = () => {
        setPrescription([...prescription, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedicine = (index: number) => {
        setPrescription(prescription.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const newRecord = {
            patient_id: patient.id,
            doctor_id: user!.id,
            doctor_name: `${user!.first_name} ${user!.last_name}`,
            notes,
            diagnosis,
            prescription: prescription.length > 0 ? prescription : null,
            summary,
            prescription_status: prescription.length > 0 ? 'Pending' : null,
            hospital_id: hospital!.id,
        };

        const { error } = await supabase.from('medical_records').insert(newRecord);

        if (error) {
            alert(`Error adding record: ${error.message}`);
        } else {
            onAddRecord();
            setNotes('');
            setDiagnosis('');
            setPrescription([]);
            setSummary('');
        }
        setLoading(false);
    };
    
    return (
        <Card title="Add New Medical Record">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"></textarea>
                </div>
                {notes && (
                     <Button type="button" variant="secondary" size="sm" onClick={handleSummarize} disabled={isSummarizing} leftIcon={<SparklesIcon className="h-4 w-4"/>}>
                        {isSummarizing ? 'Summarizing...' : 'Summarize with AI'}
                    </Button>
                )}
                {summary && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-semibold text-blue-800">AI Summary:</p>
                        <p className="text-sm text-gray-700">{summary}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis</label>
                    <input id="diagnosis" type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500" />
                </div>

                {hasPermission('PRESCRIPTION:CREATE') && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Prescription</h4>
                        <div className="space-y-4">
                            {prescription.map((med, index) => (
                                <div key={index} className="p-3 border rounded-md relative space-y-2">
                                     <button type="button" onClick={() => removeMedicine(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                                     <input placeholder="Medicine Name" value={med.name} onChange={e => handlePrescriptionChange(index, 'name', e.target.value)} className="w-full text-sm mt-1 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                     <div className="grid grid-cols-2 gap-2">
                                        <input placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={e => handlePrescriptionChange(index, 'dosage', e.target.value)} className="w-full text-sm mt-1 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                        <input placeholder="Frequency (e.g., Twice a day)" value={med.frequency} onChange={e => handlePrescriptionChange(index, 'frequency', e.target.value)} className="w-full text-sm mt-1 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                     </div>
                                      <input placeholder="Duration (e.g., 7 days)" value={med.duration} onChange={e => handlePrescriptionChange(index, 'duration', e.target.value)} className="w-full text-sm mt-1 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                      <input placeholder="Instructions" value={med.instructions} onChange={e => handlePrescriptionChange(index, 'instructions', e.target.value)} className="w-full text-sm mt-1 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                </div>
                            ))}
                        </div>
                         <Button type="button" size="sm" variant="secondary" onClick={addMedicine} className="mt-2">Add Medicine</Button>
                    </div>
                )}

                <div className="text-right">
                    <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Record"}</Button>
                </div>
            </form>
        </Card>
    );
};


const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onBack }) => {
    const { hasPermission } = usePermissions();
    const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        const { data, error } = await supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error(error);
        } else {
            setMedicalHistory(data);
        }
        setLoadingHistory(false);
    }, [patient.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

  return (
    <div>
      <Button onClick={onBack} variant="secondary" size="sm" className="mb-4">
        &larr; Back to Patient List
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card title="Patient Information">
                <div className="space-y-3">
                    <div><p className="text-sm text-gray-500">Name</p><p>{patient.name}</p></div>
                    <div><p className="text-sm text-gray-500">Date of Birth</p><p>{patient.dob}</p></div>
                    <div><p className="text-sm text-gray-500">Gender</p><p>{patient.gender}</p></div>
                    <div><p className="text-sm text-gray-500">Contact</p><p>{patient.contact}</p></div>
                    <div><p className="text-sm text-gray-500">Address</p><p>{patient.address}</p></div>
                    <div><p className="text-sm text-gray-500">Emergency Contact</p><p>{patient.emergency_contact.name} ({patient.emergency_contact.phone})</p></div>
                    <div><p className="text-sm text-gray-500">Patient Type</p><p>{patient.patient_type}</p></div>
                    <div><p className="text-sm text-gray-500">Blood Type</p><p className="font-bold text-red-600">{patient.blood_type}</p></div>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
            {hasPermission('MEDICAL_RECORD:CREATE') && <NewMedicalRecordForm patient={patient} onAddRecord={fetchHistory} />}
            <Card title="Medical History">
                <div className="space-y-6">
                    {loadingHistory ? <p>Loading history...</p> :
                     medicalHistory.length > 0 ? medicalHistory.map(record => (
                        <div key={record.id} className="p-4 border rounded-md">
                            <div className="flex justify-between items-baseline">
                                <p className="font-semibold">{record.diagnosis}</p>
                                <p className="text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm text-gray-500">Prescribed by {record.doctor_name}</p>
                            {record.summary && <p className="mt-2 text-sm italic text-blue-700 bg-blue-50 p-2 rounded">Summary: {record.summary}</p>}
                            <p className="mt-2 text-sm">{record.notes}</p>
                            {record.prescription && record.prescription.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-sm font-semibold">Prescription:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-1 text-sm text-gray-700">
                                        {record.prescription.map((med, i) => (
                                            <li key={i}>
                                                <strong>{med.name}</strong> ({med.dosage}, {med.frequency} for {med.duration}). {med.instructions}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )) : (
                        <p className="text-gray-500">No medical history found.</p>
                    )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;