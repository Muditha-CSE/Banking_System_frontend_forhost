import React, { useState } from 'react';
import Alert from '../Alert';

const DeleteSavingsAccount: React.FC = () => {
  const [accountNo, setAccountNo] = useState('');
  const [customerNic, setCustomerNic] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNo || !customerNic) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    setAlert(null);
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/agent/savingsaccounts/${accountNo}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ customer_nic: customerNic }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: `Savings account ${accountNo} and all linked fixed deposits deleted successfully!` 
        });
        setAccountNo('');
        setCustomerNic('');
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to delete savings account' });
      }
    } catch (error) {
      console.error('Error deleting savings account:', error);
      setAlert({ type: 'error', message: 'An error occurred while deleting the savings account' });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-2">Delete Savings Account</h2>
        <p className="text-gray-600 text-sm">
          ⚠️ <strong>Warning:</strong> Deleting a savings account will also delete ALL linked fixed deposits permanently.
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="accountNo" className="block text-sm font-medium text-black mb-2">
              Savings Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="accountNo"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter savings account number"
              required
            />
          </div>

          <div>
            <label htmlFor="customerNic" className="block text-sm font-medium text-black mb-2">
              Customer NIC (Creator) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerNic"
              value={customerNic}
              onChange={(e) => setCustomerNic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter NIC of customer who created the account"
              maxLength={12}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Only the customer who created this savings account can authorize its deletion.
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Security Rules:</h3>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>Only the customer who created the savings account can delete it</li>
              <li>ALL fixed deposits linked to this savings account will be deleted</li>
              <li>This action cannot be undone</li>
              <li>The deletion will be logged in the system activity log</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete Savings Account'}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-gray-300">
            <h3 className="text-xl font-bold text-black mb-4">⚠️ Confirm Deletion</h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete savings account <strong className="text-black">#{accountNo}</strong>?
              </p>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800 mb-2">This will permanently delete:</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>The savings account #{accountNo}</li>
                  <li>ALL fixed deposits linked to this account</li>
                  <li>All account holder associations</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Customer NIC authorizing deletion: <strong className="text-black">{customerNic}</strong>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteSavingsAccount;
