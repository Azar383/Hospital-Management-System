
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import AdminDashboard from './dashboard/AdminDashboard';
import DoctorDashboard from './dashboard/DoctorDashboard';
import NurseDashboard from './dashboard/NurseDashboard';
import ReceptionistDashboard from './dashboard/ReceptionistDashboard';
import PatientList from './patients/PatientList';
import StaffManagement from './staff/StaffManagement';
import AppointmentScheduler from './appointments/AppointmentScheduler';
import PharmacistDashboard from './dashboard/PharmacistDashboard';
import PharmacyQueue from './pharmacy/PharmacyQueue';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        // FIX: The user object has `roles` (an array), not `role`. Check if `roles` includes the required role.
        if (user?.roles.includes(UserRole.Admin)) return <AdminDashboard />;
        if (user?.roles.includes(UserRole.Doctor)) return <DoctorDashboard setActiveView={setActiveView} />;
        if (user?.roles.includes(UserRole.Nurse)) return <NurseDashboard />;
        if (user?.roles.includes(UserRole.Receptionist)) return <ReceptionistDashboard setActiveView={setActiveView} />;
        if (user?.roles.includes(UserRole.Pharmacist)) return <PharmacistDashboard setActiveView={setActiveView} />;
        return <div>Dashboard</div>;
      case 'patients':
        return <PatientList />;
      case 'staff':
         return <StaffManagement />;
      case 'appointments':
          return <AppointmentScheduler />;
      case 'pharmacy':
        return <PharmacyQueue />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={sidebarOpen}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;