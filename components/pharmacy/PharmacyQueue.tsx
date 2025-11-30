import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { type MedicalRecord } from '../../types';
import { supabase } from '../../services/supabaseClient';

interface PrescriptionQueueItem extends MedicalRecord {
  patients: { name: string };
}

const PharmacyQueue: React.FC = () => {
  const { hospital } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = useCallback(async () => {
    if (!hospital) return;
    setLoading(true);
    const { data, error } = await supabase
        .from('medical_records')
        .select(`
            *,
            patients ( name )
        `)
        .eq('hospital_id', hospital.id)
        .eq('prescription_status', 'Pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    } else {
        setPrescriptions(data as PrescriptionQueueItem[]);
    }
    setLoading(false);
  }, [hospital]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);


  const handleFulfill = async (recordId: string) => {
    const { error } = await supabase
        .from('medical_records')
        .update({ prescription_status: 'Fulfilled' })
        .eq('id', recordId);
    
    if (error) {
        alert(error.message);
    } else {
        fetchPrescriptions(); // Refresh list
    }
  };

  return (
    <Card title="Prescription Fulfillment Queue">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescribing Doctor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading prescriptions...</td></tr>
            ) : prescriptions.length > 0 ? (
              prescriptions.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.patients.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.doctor_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                     {item.prescription && item.prescription.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {item.prescription.map((med, i) => (
                                <li key={i}>
                                    <strong>{med.name}</strong> ({med.dosage})
                                </li>
                            ))}
                        </ul>
                     ) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button size="sm" onClick={() => handleFulfill(item.id)}>
                      Mark as Fulfilled
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No pending prescriptions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PharmacyQueue;