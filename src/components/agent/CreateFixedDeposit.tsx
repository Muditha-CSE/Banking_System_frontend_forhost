import React, { useState } from 'react';
import { agentService } from '../../services/bankingService';
import { FixedDeposit } from '../../types';

const CreateFixedDeposit: React.FC = () => {
  const [fixedDeposit, setFixedDeposit] = useState<FixedDeposit>({
    account_no: '',
    NIC: '',
    amount: 0,
    fd_plan_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFixedDeposit({
      ...fixedDeposit,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await agentService.addFixedDeposit(fixedDeposit);
      setMessage(response.data.message);
      setFixedDeposit({ account_no: '', NIC: '', amount: 0, fd_plan_id: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create fixed deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Fixed Deposit</h2>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}
      
      {message && (
        <div className="mb-4 text-green-600 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="account_no" className="block text-sm font-medium text-gray-700">
            Savings Account Number
          </label>
          <input
            type="text"
            name="account_no"
            id="account_no"
            required
            value={fixedDeposit.account_no}
            onChange={handleChange}
            placeholder="Enter existing savings account number"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
          <p className="mt-1 text-xs text-gray-500">The savings account to link this FD to</p>
        </div>

        <div>
          <label htmlFor="NIC" className="block text-sm font-medium text-gray-700">
            Customer NIC
          </label>
          <input
            type="text"
            name="NIC"
            id="NIC"
            required
            value={fixedDeposit.NIC}
            onChange={handleChange}
            placeholder="12 digits or 9 digits + V"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Fixed Deposit Amount
          </label>
          <input
            type="number"
            name="amount"
            id="amount"
            required
            min="0"
            step="0.01"
            value={fixedDeposit.amount}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="fd_plan_id" className="block text-sm font-medium text-gray-700">
            FD Plan
          </label>
          <select
            name="fd_plan_id"
            id="fd_plan_id"
            required
            value={fixedDeposit.fd_plan_id}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          >
            <option value="">Select Plan</option>
            <option value="1">6 Months - 13% Interest</option>
            <option value="2">1 Year - 14% Interest</option>
            <option value="3">2 Years - 15% Interest</option>
            <option value="4">3 Years - 16% Interest</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading ? 'Creating Fixed Deposit...' : 'Create Fixed Deposit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFixedDeposit;