import React, { useState } from 'react';
import Alert from '../Alert';

const DeleteFixedDeposit: React.FC = () => {
  const [fdAccountNo, setFdAccountNo] = useState('');
  const [customerNic, setCustomerNic] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fdAccountNo || !customerNic) {
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
      const response = await fetch(`http://localhost:3000/api/agent/fixeddeposits/${fdAccountNo}`, {
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
          message: `Fixed deposit ${fdAccountNo} deleted successfully!` 
        });
        setFdAccountNo('');
        setCustomerNic('');
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to delete fixed deposit' });
      }
    } catch (error) {
      console.error('Error deleting fixed deposit:', error);
      setAlert({ type: 'error', message: 'An error occurred while deleting the fixed deposit' });
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
        <h2 className="text-2xl font-bold text-black mb-2">Delete Fixed Deposit</h2>
        <p className="text-gray-600 text-sm">
          Delete a specific fixed deposit account. The linked savings account will remain intact.
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
            <label htmlFor="fdAccountNo" className="block text-sm font-medium text-black mb-2">
              Fixed Deposit Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="fdAccountNo"
              value={fdAccountNo}
              onChange={(e) => setFdAccountNo(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter fixed deposit account number"
              required
            />
          </div>

          <div>
            <label htmlFor="customerNic" className="block text-sm font-medium text-black mb-2">
              Customer NIC (Linked Savings Account Creator) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerNic"
              value={customerNic}
              onChange={(e) => setCustomerNic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter NIC of customer who created the linked savings account"
              maxLength={12}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Only the customer who created the linked savings account can authorize deletion of this fixed deposit.
            </p>
          </div>

            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-black mb-2">Security Rules:</h3>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>Only the customer who created the linked savings account can delete this FD</li>
              <li>For joint accounts, only a primary holder can delete the FD</li>
              <li>Only this specific fixed deposit will be deleted</li>
              <li>The linked savings account will remain active</li>
              <li>This action cannot be undone</li>
              <li>The deletion will be logged in the system activity log</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Early Closure Penalty:</h3>
            <ul className="text-xs text-yellow-900 space-y-1 list-disc list-inside">
              <li><strong>If closed before maturity date:</strong> A 2% penalty will be deducted from the deposit amount</li>
              <li>98% of the remaining amount will be credited to the linked savings account</li>
              <li>2% of the deposit goes to the bank as early closure penalty</li>
              <li>No interest will be paid for early closure</li>
              <li><strong>If matured:</strong> Full deposit amount + earned interest will be credited with no penalty</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete Fixed Deposit'}
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
                Are you sure you want to delete fixed deposit <strong className="text-black">#{fdAccountNo}</strong>?
              </p>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800 mb-2">This will permanently delete:</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Fixed deposit account #{fdAccountNo}</li>
                </ul>
                <p className="text-sm text-green-700 mt-2">
                  ✓ The linked savings account will remain active
                </p>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Penalty Notice:</p>
                <p className="text-xs text-yellow-900">
                  If this FD hasn't matured yet, a <strong>2% early closure penalty</strong> will be deducted. 
                  The remaining 98% will be credited to the linked savings account.
                </p>
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

export default DeleteFixedDeposit;
