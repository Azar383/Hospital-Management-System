
import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ReceptionistDashboardProps {
  setActiveView: (view: string) => void;
}

const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ setActiveView }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Receptionist Dashboard</h1>
      <Card title="Common Tasks">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button className="w-full h-24 text-lg" onClick={() => setActiveView('patients')}>
            Manage Patients
          </Button>
          <Button className="w-full h-24 text-lg" onClick={() => setActiveView('appointments')}>
            Schedule Appointment
          </Button>
           <Button className="w-full h-24 text-lg" variant="secondary">
            Process Billing
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;
