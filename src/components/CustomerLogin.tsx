import React, { useState } from 'react';
import axios from 'axios';

interface CustomerLoginProps {
  onLogin: (token: string, user: { userId: number; nic: string }) => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLogin }) => {
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/public/logincustomer', {
        nic,
        password,
      });
      if (res.data && res.data.token && res.data.user) {
        onLogin(res.data.token, {
          userId: res.data.user.userId,
          nic: res.data.user.nic,
        });
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black text-center mb-2">
          Customer Login
        </h2>
        <p className="text-center text-sm text-gray-600">
          Sign in with your NIC
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">NIC</label>
          <input 
            type="text" 
            value={nic} 
            onChange={e => setNic(e.target.value)} 
            required 
            className="appearance-none relative block w-full px-4 py-3 bg-white border-2 border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter your NIC"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="appearance-none relative block w-full px-4 py-3 bg-white border-2 border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 text-sm text-center py-2 px-4 rounded-md">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default CustomerLogin;
