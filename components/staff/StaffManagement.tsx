import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, type User } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { supabase } from '../../services/supabaseClient';


const AddStaffModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddStaff: () => void;
}> = ({ isOpen, onClose, onAddStaff }) => {
    const { hospital } = useAuth();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.Receptionist]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleChange = (role: UserRole) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
            ? prev.filter(r => r !== role) 
            : [...prev, role]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const password = 'password123'; // In a real app, this would be generated and sent via email.
        
        const { error } = await supabase.auth.signUp({
            email: formData.get('email') as string,
            password: password,
            options: {
                data: {
                    first_name: formData.get('first_name') as string,
                    last_name: formData.get('last_name') as string,
                    phone: formData.get('phone') as string,
                    department: formData.get('department') as string,
                    roles: selectedRoles,
                    hospital_id: hospital!.id,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            alert(`Staff member added. Their temporary password is: ${password}`);
            onAddStaff();
            onClose();
        }
        setLoading(false);
    }

    return (
         <Modal isOpen={isOpen} onClose={onClose} title="Add New Staff Member">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input name="first_name" label="First Name" type="text" required />
                    <Input name="last_name" label="Last Name" type="text" required />
                </div>
                <Input name="email" label="Email Address" type="email" required />
                <Input name="phone" label="Phone Number" type="tel" required />
                <Input name="department" label="Department" type="text" required />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(UserRole).filter(r => r !== UserRole.SuperAdmin).map(role => (
                            <label key={role} className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    value={role} 
                                    checked={selectedRoles.includes(role)} 
                                    onChange={() => handleRoleChange(role)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="text-sm text-gray-700">{role}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Staff"}</Button>
                </div>
            </form>
        </Modal>
    )
}

const StaffManagement: React.FC = () => {
  const { hospital, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!hospital) return;
    setLoading(true);
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('hospital_id', hospital.id);
    
    if (error) {
        console.error(error);
    } else {
        // We need email from auth.users, but it's not in profiles.
        // In a real app, a DB function would be better. For now, we patch the current user's email.
        const staffWithEmails = data.map(s => s.id === user?.id ? { ...s, email: user.email } : { ...s, email: 'not-available' });
        setStaff(staffWithEmails as User[]);
    }
    setLoading(false);
  }, [hospital, user]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <>
      <Card title="Staff Management" actions={
        hasPermission('STAFF:CREATE') && <Button onClick={() => setIsModalOpen(true)}>Add Staff</Button>
        }>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading staff...</td></tr>
              ) : staff.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.roles.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {hasPermission('STAFF:UPDATE') && <Button variant="secondary" size="sm">Edit</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddStaff={fetchStaff} />
    </>
  );
};

export default StaffManagement;