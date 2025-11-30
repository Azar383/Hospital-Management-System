
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { DashboardIcon } from '../icons/DashboardIcon';
import { PatientIcon } from '../icons/PatientIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { StaffIcon } from '../icons/StaffIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { HospitalIcon } from '../icons/HospitalIcon';
import { PharmacyIcon } from '../icons/PharmacyIcon';

interface NavLinkProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className="mr-3">{icon}</span>
        {label}
    </button>
);


interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen }) => {
  const { logout } = useAuth();
  const { hasPermission } = usePermissions();

  const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="h-5 w-5"/>, permission: 'DASHBOARD:READ' },
      { id: 'patients', label: 'Patients', icon: <PatientIcon className="h-5 w-5"/>, permission: 'PATIENT:READ' },
      { id: 'appointments', label: 'Appointments', icon: <CalendarIcon className="h-5 w-5"/>, permission: 'APPOINTMENT:READ' },
      { id: 'pharmacy', label: 'Pharmacy', icon: <PharmacyIcon className="h-5 w-5" />, permission: 'PRESCRIPTION:READ' },
      { id: 'staff', label: 'Staff Management', icon: <StaffIcon className="h-5 w-5"/>, permission: 'STAFF:READ' },
  ];

  return (
    <aside className={`fixed md:relative z-40 md:z-auto inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-center h-16 border-b">
         <HospitalIcon className="h-8 w-8 text-blue-600"/>
         <span className="ml-3 text-xl font-bold">CloudCare</span>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <nav className="flex-1 space-y-2">
            {navItems.map(item => (
                hasPermission(item.permission) && (
                    <NavLink 
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.id}
                        onClick={() => setActiveView(item.id)}
                    />
                )
            ))}
        </nav>
        <div className="mt-auto">
            <NavLink
                icon={<LogoutIcon className="h-5 w-5" />}
                label="Logout"
                isActive={false}
                onClick={logout}
            />
        </div>
      </div>
    </aside>
  );
};