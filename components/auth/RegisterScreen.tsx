import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { HospitalIcon } from '../icons/HospitalIcon';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        hospitalName: '',
        address: '',
        phone: '',
        licenseNumber: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        password: '',
        confirmPassword: ''
    });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { registerHospital } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setError('');
    setLoading(true);

    const errorMessage = await registerHospital({
        hospitalDetails: {
            name: formData.hospitalName,
            address: formData.address,
            phone: formData.phone,
            license_number: formData.licenseNumber,
        },
        adminDetails: {
            first_name: formData.adminFirstName,
            last_name: formData.adminLastName,
            email: formData.adminEmail,
            password: formData.password,
        }
    });

    if (errorMessage) {
        setError(errorMessage);
        setLoading(false);
    } else {
        setIsSuccess(true);
        setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            <div className="flex justify-center items-center mb-6">
                <HospitalIcon className="h-10 w-10 text-blue-600"/>
                <h1 className="text-3xl font-bold text-gray-800 ml-3">CloudCare HMS</h1>
            </div>
            <Card>
                <div className="text-center p-6">
                    <h2 className="text-2xl font-bold text-green-600">Registration Submitted!</h2>
                    <p className="mt-4 text-gray-600">
                        Your hospital registration has been submitted successfully.
                    </p>
                    <p className="mt-2 text-gray-600">
                        A confirmation link has been sent to the administrator's email. Please check your inbox to activate the account.
                    </p>
                    <Button onClick={onSwitchToLogin} className="mt-6 w-full">
                        Proceed to Login
                    </Button>
                </div>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center items-center mb-6">
            <HospitalIcon className="h-10 w-10 text-blue-600"/>
            <h1 className="text-3xl font-bold text-gray-800 ml-3">CloudCare HMS</h1>
        </div>
        <Card>
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Register Your Hospital</h2>
            <Input id="hospitalName" label="Hospital Name" type="text" value={formData.hospitalName} onChange={handleChange} required />
            <Input id="address" label="Address" type="text" value={formData.address} onChange={handleChange} required />
            <Input id="phone" label="Contact Phone" type="tel" value={formData.phone} onChange={handleChange} required />
            <Input id="licenseNumber" label="Medical License Number" type="text" value={formData.licenseNumber} onChange={handleChange} required />
            <hr className="my-2"/>
            <h3 className="text-lg font-medium text-gray-800">Administrator Details</h3>
            <div className="grid grid-cols-2 gap-4">
                <Input id="adminFirstName" label="First Name" type="text" value={formData.adminFirstName} onChange={handleChange} required />
                <Input id="adminLastName" label="Last Name" type="text" value={formData.adminLastName} onChange={handleChange} required />
            </div>
            <Input id="adminEmail" label="Administrator Email" type="email" value={formData.adminEmail} onChange={handleChange} required />
            <Input id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />
            <Input id="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} required />

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register & Create Account'}
            </Button>
            <p className="text-sm text-center text-gray-600">
                Already registered?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Login here
                </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterScreen;