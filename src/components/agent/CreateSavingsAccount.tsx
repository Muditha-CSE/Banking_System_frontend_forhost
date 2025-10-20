import React, { useState } from 'react';
import { agentService } from '../../services/bankingService';
import { SavingsAccount, AccountUser } from '../../types';

const CreateSavingsAccount: React.FC = () => {
  const [account, setAccount] = useState<SavingsAccount>({
    created_customer: '',
    users: [{ nic: '', role: 'primary' }],
    initial_deposit: 0,
    plan_id: '1',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nic') {
      setAccount({
        ...account,
        users: [{ nic: value, role: 'primary' }],
      });
    } else {
      setAccount({
        ...account,
        [name]: name === 'initial_deposit' ? parseFloat(value) || 0 : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Set created_customer to NIC value before sending
      const payload = {
        ...account,
        created_customer: account.users[0]?.nic || '',
      };
      const response = await agentService.addSavingsAccount(payload);
      setMessage(response.data.message);
      setAccount({
        created_customer: '',
        users: [{ nic: '', role: 'primary' }],
        initial_deposit: 0,
        plan_id: '1',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create savings account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Savings Account</h2>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}
      
      {message && (
        <div className="mb-4 text-green-600 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
            Customer NIC
          </label>
          <input
            type="text"
            name="nic"
            id="nic"
            required
            value={account.users[0]?.nic || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="initial_deposit" className="block text-sm font-medium text-gray-700">
            Initial Deposit
          </label>
          <input
            type="number"
            name="initial_deposit"
            id="initial_deposit"
            required
            min="0"
            step="0.01"
            value={account.initial_deposit}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700">
            Plan
          </label>
          <select
            name="plan_id"
            id="plan_id"
            required
            value={account.plan_id}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          >
            <option value="1">Children Savings Account</option>
            <option value="2">Teen Savings Account</option>
            <option value="3">Adult Savings Account</option>
            <option value="4">Senior Savings Account</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Savings Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSavingsAccount;