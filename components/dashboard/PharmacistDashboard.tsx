import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseClient';

interface PharmacistDashboardProps {
  setActiveView: (view: string) => void;
}

const PharmacistDashboard: React.FC<PharmacistDashboardProps> = ({ setActiveView }) => {
  const { hospital } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingCount = async () => {
        if (!hospital) return;
        setLoading(true);
        const { count, error } = await supabase
            .from('medical_records')
            .select('*', { count: 'exact', head: true })
            .eq('hospital_id', hospital.id)
            .eq('prescription_status', 'Pending');
        
        if (error) {
            console.error(error);
        } else {
            setPendingCount(count || 0);
        }
        setLoading(false);
    }
    fetchPendingCount();
  }, [hospital]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmacist Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">Pending Prescriptions</p>
                    {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>}
                </div>
            </div>
        </Card>
      </div>
       <div className="mt-8">
        <Card title="Quick Actions">
            <div className="flex space-x-4">
                <Button onClick={() => setActiveView('pharmacy')}>
                    Go to Fulfillment Queue
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default PharmacistDashboard;