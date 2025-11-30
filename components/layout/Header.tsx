import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserIcon } from '../icons/UserIcon';
import { HospitalIcon } from '../icons/HospitalIcon';

interface HeaderProps {
    toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, hospital } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center text-gray-600">
                <HospitalIcon className="h-6 w-6 mr-2" />
                <span className="font-semibold">{hospital?.name}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="font-semibold text-sm text-gray-800">{user ? `${user.first_name} ${user.last_name}`: ''}</p>
              <p className="text-xs text-gray-500">{user?.roles[0]}</p>
            </div>
            <UserIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};