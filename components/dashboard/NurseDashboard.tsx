import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { type Patient } from '../../types';

const NurseDashboard: React.FC = () => {
  const { hospital } = useAuth();
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
        if (!hospital) return;
        setLoading(true);
        // This is a mock assignment. In a real app, you'd have an assignment table.
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('hospital_id', hospital.id)
            .limit(5); // Get first 5 patients for this nurse
        
        if (error) {
            console.error("Error fetching patients for nurse:", error);
        } else {
            setAssignedPatients(data);
        }
        setLoading(false);
    }
    fetchPatients();
  }, [hospital]);


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Nurse Dashboard</h1>
      <Card title="Assigned Patients">
        {loading ? <p>Loading patients...</p> : (
        <ul className="divide-y divide-gray-200">
          {assignedPatients.length > 0 ? assignedPatients.map(patient => (
            <li key={patient.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900">{patient.name}</p>
                <p className="text-sm text-gray-500">Ward: A, Bed: 101</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Vitals
              </button>
            </li>
          )) : <p className="text-gray-500">No patients assigned.</p>}
        </ul>
        )}
      </Card>
    </div>
  );
};

export default NurseDashboard;