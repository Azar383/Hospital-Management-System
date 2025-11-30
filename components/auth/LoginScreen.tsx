import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { HospitalIcon } from '../icons/HospitalIcon';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const errorMessage = await login(email, password);
    if (errorMessage) {
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
         <div className="flex justify-center items-center mb-6">
            <HospitalIcon className="h-10 w-10 text-blue-600"/>
            <h1 className="text-3xl font-bold text-gray-800 ml-3">CloudCare HMS</h1>
        </div>
        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">Staff Login</h2>
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., alice@hms.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
             <div className="text-right">
                <a href="#" onClick={() => alert('Forgot Password functionality not implemented.')} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot Password?
                </a>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
             <p className="text-sm text-center text-gray-600">
                New hospital?{' '}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Register here
                </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;