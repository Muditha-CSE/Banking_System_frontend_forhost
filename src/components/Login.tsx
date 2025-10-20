import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/bankingService';
import { LoginCredentials } from '../types';
import CustomerLogin from './CustomerLogin';


const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'officials'>('customer');
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [customerUser, setCustomerUser] = useState<{ userId: number; nic: string } | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(credentials);
      if (response.data.token) {
        // Decode JWT token to extract user info (simple base64 decode of payload)
        const token = response.data.token;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          userId: payload.userId.toString(),
          username: credentials.username,
          role: payload.role as 'admin' | 'agent' | 'public' | 'customer',
          token: token,
        };
        login(user);
        // Redirect based on role
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'agent':
            navigate('/agent');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };



  // Handle customer login
  const handleCustomerLogin = (token: string, user: { userId: number; nic: string }) => {
    setCustomerToken(token);
    setCustomerUser(user);
  };



  if (customerToken && customerUser) {
    // Render CustomerDashboard directly if customer login is successful
    const CustomerDashboard = require('./CustomerDashboard').default;
    return <CustomerDashboard token={customerToken} user={customerUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-2">
            Banking System
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === 'customer'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              Customer Login
            </button>
            <button
              onClick={() => setActiveTab('officials')}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === 'officials'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              Bank Officials
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'customer' ? (
              <CustomerLogin onLogin={handleCustomerLogin} />
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-black text-center mb-2">
                    Admin/Agent Login
                  </h2>
                  <p className="text-center text-sm text-gray-600">
                    For bank staff only
                  </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={credentials.username}
                        onChange={handleChange}
                        className="appearance-none relative block w-full px-4 py-3 bg-white border-2 border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={credentials.password}
                        onChange={handleChange}
                        className="appearance-none relative block w-full px-4 py-3 bg-white border-2 border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-500 text-red-700 text-sm text-center py-2 px-4 rounded-md">
                      {error}
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;