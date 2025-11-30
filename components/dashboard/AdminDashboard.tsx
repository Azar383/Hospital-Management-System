import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { PatientIcon } from '../icons/PatientIcon';
import { StaffIcon } from '../icons/StaffIcon';
import { supabase } from '../../services/supabaseClient';

const StatCard = ({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading: boolean }) => (
    <Card>
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : <p className="text-2xl font-semibold text-gray-900">{value}</p>}
            </div>
        </div>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const { hospital } = useAuth();
    const [staffCount, setStaffCount] = useState(0);
    const [patientCount, setPatientCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!hospital) return;
            setLoading(true);

            const { count: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .eq('hospital_id', hospital.id);

            const { count: staffData, error: staffError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('hospital_id', hospital.id);

            if (patientError) console.error(patientError);
            else setPatientCount(patientData || 0);

            if (staffError) console.error(staffError);
            else setStaffCount(staffData || 0);
            
            setLoading(false);
        };

        fetchStats();
    }, [hospital]);


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={patientCount} icon={<PatientIcon className="h-6 w-6"/>} loading={loading} />
        <StatCard title="Total Staff" value={staffCount} icon={<StaffIcon className="h-6 w-6"/>} loading={loading} />
        <StatCard title="Bed Occupancy" value="N/A" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h2M9 5h6v6H9V5z" /></svg>} loading={loading} />
        <StatCard title="Appointments Today" value="N/A" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} loading={loading} />
      </div>
      <div className="mt-8">
        <Card title="Recent Activity">
           <p>Activity log coming soon...</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;