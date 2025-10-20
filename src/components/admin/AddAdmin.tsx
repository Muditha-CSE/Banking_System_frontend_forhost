import React, { useState } from 'react';
import { isValidNIC, isValidMobile } from '../../utils/validation';
import { adminService } from '../../services/bankingService';
import { Admin } from '../../types';

const AddAdmin: React.FC = () => {
  const [admin, setAdmin] = useState<Admin>({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    NIC: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdmin({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isValidNIC(admin.NIC)) {
      setError('Invalid NIC. Must be 12 digits or 9 digits followed by V/v.');
      return;
    }
    if (!isValidMobile(admin.phone)) {
      setError('Invalid phone number. Must be 10 digits starting with 0 or +94 followed by 9 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.addAdmin(admin);
      setMessage(response.data.message);
      setAdmin({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        NIC: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Admin</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={admin.username}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={admin.password}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={admin.name}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={admin.email}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              value={admin.phone}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="NIC" className="block text-sm font-medium text-gray-700">
              NIC
            </label>
            <input
              type="text"
              name="NIC"
              id="NIC"
              required
              value={admin.NIC}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {message && (
          <div className="text-green-600 text-sm">{message}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading ? 'Adding Admin...' : 'Add Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdmin;