import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { UserIcon } from '../icons/UserIcon';
import { supabase } from '../../services/supabaseClient';
import { type Appointment } from '../../types';

interface DoctorDashboardProps {
  setActiveView: (view: string) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ setActiveView }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                time,
                status,
                patients ( name )
            `)
            .eq('doctor_id', user.id)
            .eq('date', today)
            .eq('status', 'Scheduled')
            .order('time');

        if (error) {
            console.error("Error fetching appointments", error);
        } else {
            setAppointments(data as any);
        }
        setLoading(false);
    }
    fetchAppointments();
  }, [user]);

  const doctorName = user ? `${user.first_name} ${user.last_name}` : '';
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, Dr. {doctorName}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card title="Today's Appointments" actions={<Button size="sm" onClick={() => setActiveView('appointments')}>View All</Button>}>
                <div className="divide-y divide-gray-200">
                    {loading ? <p>Loading appointments...</p> :
                     appointments.length > 0 ? appointments.map(appt => (
                        <div key={appt.id} className="py-4 flex items-center justify-between">
                           <div className="flex items-center">
                             <div className="bg-gray-200 p-2 rounded-full mr-4"><UserIcon className="h-5 w-5 text-gray-500" /></div>
                             <div>
                                <p className="font-medium">{appt.patients?.name}</p>
                                <p className="text-sm text-gray-500">{appt.time}</p>
                             </div>
                           </div>
                           <Button size="sm" variant="secondary" onClick={() => alert(`Viewing patient: ${appt.patients?.name}`)}>View Patient</Button>
                        </div>
                    )) : (
                        <p className="text-gray-500 py-4">No appointments scheduled for today.</p>
                    )}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card title="Quick Actions">
                <div className="space-y-3">
                    <Button className="w-full" onClick={() => setActiveView('patients')}>Find Patient</Button>
                    <Button className="w-full" variant="secondary" onClick={() => setActiveView('appointments')}>View My Schedule</Button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;