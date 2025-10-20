import React, { useState } from 'react';
import { isValidNIC, isValidMobile } from '../../utils/validation';
import { agentService } from '../../services/bankingService';
import { Customer } from '../../types';
import { useCustomerRefresh } from '../../contexts/CustomerRefreshContext';

const AddCustomer: React.FC = () => {
  const [customer, setCustomer] = useState<Customer>({
    username: '',
    name: '',
    email: '',
    phone: '',
    NIC: '',
    gender: '',
    address: '',
    DOB: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reconfirmPassword, setReconfirmPassword] = useState('');
  
  const { triggerRefresh } = useCustomerRefresh();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'reconfirmPassword') {
      setReconfirmPassword(value);
    } else {
      setCustomer({ ...customer, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isValidNIC(customer.NIC)) {
      setError('Invalid NIC. Must be 12 digits or 9 digits followed by V/v.');
      return;
    }
    if (!isValidMobile(customer.phone)) {
      setError('Invalid phone number. Must be 10 digits starting with 0 or +94 followed by 9 digits.');
      return;
    }

    if (!customer.password || customer.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (customer.password !== reconfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Normalize gender to lowercase full word
      const normalized = {
        ...customer,
        gender: (customer.gender || '').toLowerCase(),
      };
      const response = await agentService.addCustomer(normalized);
      setMessage(response.data.message);
      setCustomer({
        username: '',
        name: '',
        email: '',
        phone: '',
        NIC: '',
        gender: '',
        address: '',
        DOB: '',
        password: '',
      });
      setReconfirmPassword('');
      
      // Trigger refresh for ManageCustomers component
      triggerRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Customer</h2>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}
      
      {message && (
        <div className="mb-4 text-green-600 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={customer.username}
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
              value={customer.name}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>
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
            minLength={8}
            value={customer.password}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
        </div>

        <div>
          <label htmlFor="reconfirmPassword" className="block text-sm font-medium text-gray-700">
            Reconfirm Password
          </label>
          <input
            type="password"
            name="reconfirmPassword"
            id="reconfirmPassword"
            required
            minLength={8}
            value={reconfirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="DOB" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            name="DOB"
            id="DOB"
            required
            value={customer.DOB}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            id="gender"
            required
            value={customer.gender}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
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
            value={customer.NIC}
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
            value={customer.phone}
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
            value={customer.email}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            value={customer.address}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading ? 'Adding Customer...' : 'Add Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;