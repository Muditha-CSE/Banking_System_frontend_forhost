import React, { useState } from 'react';
import { isValidMobile } from '../../utils/validation';
import { adminService } from '../../services/bankingService';
import { Branch } from '../../types';

const AddBranch: React.FC = () => {
  const [branch, setBranch] = useState<Branch>({
    branch_name: '',
    branch_address: '',
    telephone_no: '',
    working_hours_start: '',
    working_hours_end: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBranch({
      ...branch,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isValidMobile(branch.telephone_no)) {
      setError('Invalid telephone number. Must be 10 digits starting with 0 or +94 followed by 9 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.addBranch(branch);
      setMessage(response.data.message);
      setBranch({
        branch_name: '',
        branch_address: '',
        telephone_no: '',
        working_hours_start: '',
        working_hours_end: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Branch</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700">
            Branch Name
          </label>
          <input
            type="text"
            name="branch_name"
            id="branch_name"
            required
            value={branch.branch_name}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="branch_address" className="block text-sm font-medium text-gray-700">
            Branch Address
          </label>
          <textarea
            name="branch_address"
            id="branch_address"
            required
            rows={3}
            value={branch.branch_address}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="telephone_no" className="block text-sm font-medium text-gray-700">
            Telephone Number
          </label>
          <input
            type="tel"
            name="telephone_no"
            id="telephone_no"
            required
            value={branch.telephone_no}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="working_hours_start" className="block text-sm font-medium text-gray-700">
              Working Hours Start
            </label>
            <input
              type="time"
              name="working_hours_start"
              id="working_hours_start"
              required
              value={branch.working_hours_start}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="working_hours_end" className="block text-sm font-medium text-gray-700">
              Working Hours End
            </label>
            <input
              type="time"
              name="working_hours_end"
              id="working_hours_end"
              required
              value={branch.working_hours_end}
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
            {loading ? 'Adding Branch...' : 'Add Branch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBranch;