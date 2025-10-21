import React, { useState } from 'react';
import { agentService } from '../../services/bankingService';
import { SavingsAccount } from '../../types';
import Alert from '../Alert';

const SavingsAccountManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'manage'>('create');

  const subTabs = [
    { id: 'create', name: 'Create Savings Account' },
    { id: 'manage', name: 'Manage Account Status' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Savings Account Management</h2>
        
        {/* Sub-tabs */}
        <div className="border-b-2 border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'create' && <CreateSavingsAccountForm />}
      {activeSubTab === 'manage' && <ManageAccountStatusForm />}
    </div>
  );
};

// Create Savings Account Form Component
const CreateSavingsAccountForm: React.FC = () => {
  const [account, setAccount] = useState<SavingsAccount>({
    created_customer: '',
    users: [{ nic: '', role: 'primary' }],
    initial_deposit: 0,
    plan_id: '1',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    setAlert(null);

    try {
      // Set created_customer to NIC value before sending
      const payload = {
        ...account,
        created_customer: account.users[0]?.nic || '',
      };
      const response = await agentService.addSavingsAccount(payload);
      setAlert({ type: 'success', message: response.data.message || 'Savings account created successfully!' });
      setAccount({
        created_customer: '',
        users: [{ nic: '', role: 'primary' }],
        initial_deposit: 0,
        plan_id: '1',
      });
    } catch (err: any) {
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to create savings account' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
            <label htmlFor="nic" className="block text-sm font-medium text-black mb-2">
              Customer NIC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nic"
              name="nic"
              value={account.users[0].nic}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter customer NIC"
              maxLength={12}
              required
            />
          </div>

          <div>
            <label htmlFor="initial_deposit" className="block text-sm font-medium text-black mb-2">
              Initial Deposit (LKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="initial_deposit"
              name="initial_deposit"
              value={account.initial_deposit}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter initial deposit amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="plan_id" className="block text-sm font-medium text-black mb-2">
              Savings Plan <span className="text-red-500">*</span>
            </label>
            <select
              id="plan_id"
              name="plan_id"
              value={account.plan_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              required
            >
              <option value="1">Children's Savings Plan</option>
              <option value="2">Teen's Savings Plan</option>
              <option value="3">Adult Savings Plan</option>
              <option value="4">Senior Citizen Savings Plan</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create Savings Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

// View Savings Accounts Component
const ViewSavingsAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNic, setSearchNic] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'search'>('all');

  // Load all accounts on component mount
  React.useEffect(() => {
    if (viewMode === 'all') {
      fetchAllAccounts();
    }
  }, [viewMode]);

  const fetchAllAccounts = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const token = localStorage.getItem('token');
  const response = await fetch('https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/savingsaccounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAccounts(data.accounts || []);
        if (!data.accounts || data.accounts.length === 0) {
          setAlert({ type: 'error', message: 'No savings accounts found' });
        }
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to fetch accounts' });
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAlert({ type: 'error', message: 'An error occurred while fetching accounts' });
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNic.trim()) {
      setAlert({ type: 'error', message: 'Please enter a customer NIC' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/customers/${searchNic}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAccounts(data.savingsAccounts || []);
        if (!data.savingsAccounts || data.savingsAccounts.length === 0) {
          setAlert({ type: 'error', message: 'No savings accounts found for this customer' });
        }
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to fetch accounts' });
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAlert({ type: 'error', message: 'An error occurred while fetching accounts' });
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* View Mode Toggle */}
      <div className="flex space-x-3">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          View All Accounts
        </button>
        <button
          onClick={() => setViewMode('search')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'search'
              ? 'bg-black text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          Search by Customer NIC
        </button>
      </div>

      {viewMode === 'search' && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="searchNic" className="block text-sm font-medium text-black mb-2">
                Search by Customer NIC
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="searchNic"
                  value={searchNic}
                  onChange={(e) => setSearchNic(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
                  placeholder="Enter customer NIC"
                  maxLength={12}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Account No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Balance (LKR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Account Holders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.account_no} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                      {account.account_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {account.plan_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {account.account_holders || account.created_customer_nic || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.active_status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.active_status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {account.created_date ? new Date(account.created_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Manage Account Status Form Component (Deactivate/Reactivate)
const ManageAccountStatusForm: React.FC = () => {
  const [accountNo, setAccountNo] = useState('');
  const [customerNic, setCustomerNic] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState<'deactivate' | 'reactivate'>('deactivate');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNo) {
      setAlert({ type: 'error', message: 'Please enter an account number' });
      return;
    }

    if (!customerNic) {
      setAlert({ type: 'error', message: 'Please enter customer NIC' });
      return;
    }

    setLoading(true);
    setAlert(null);
    setAccountInfo(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAlert({ type: 'error', message: 'Not authenticated. Please log in again.' });
        setLoading(false);
        return;
      }
      
      console.log('[SEARCH] Searching for account:', accountNo, 'with NIC:', customerNic);
      console.log('[SEARCH] Token exists:', !!token);
      
  const response = await fetch('https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/savingsaccounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[SEARCH] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SEARCH] Error response:', errorText);
        
        if (response.status === 403 || response.status === 401) {
          setAlert({ 
            type: 'error', 
            message: 'Authentication failed. Please log out and log in again as an agent.' 
          });
        } else {
          setAlert({ type: 'error', message: `Failed to fetch accounts: ${response.status} ${response.statusText}` });
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[SEARCH] Received data:', data);
      console.log('[SEARCH] Number of accounts:', data.accounts?.length);

      if (data.accounts && data.accounts.length > 0) {
        console.log('[SEARCH] Looking for account_no:', parseInt(accountNo));
        const account = data.accounts.find((acc: any) => {
          console.log('[SEARCH] Checking account:', acc.account_no, 'type:', typeof acc.account_no);
          return acc.account_no === parseInt(accountNo);
        });
        
        if (account) {
          console.log('[SEARCH] Found account:', account);
          setAccountInfo(account);
        } else {
          console.log('[SEARCH] Account not found in list');
          setAlert({ type: 'error', message: `Account #${accountNo} not found` });
        }
      } else {
        console.log('[SEARCH] No accounts in response');
        setAlert({ type: 'error', message: 'No savings accounts found in the system' });
      }
    } catch (error: any) {
      console.error('[SEARCH] Exception:', error);
      setAlert({ type: 'error', message: `Error: ${error.message || 'An error occurred while fetching account information'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setLoading(true);
    setAlert(null);
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem('token');
      const url = action === 'deactivate'
  ? `https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/savingsaccounts/${accountNo}`
  : `https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/savingsaccounts/${accountNo}/reactivate`;

      const response = await fetch(url, {
        method: action === 'deactivate' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          customer_nic: customerNic,
          isCustomerRequest: action === 'deactivate' ? true : false
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: action === 'deactivate'
            ? `Savings account ${accountNo} deactivated successfully! All linked fixed deposits have been marked as matured.`
            : `Savings account ${accountNo} reactivated successfully!`
        });
        setAccountNo('');
        setCustomerNic('');
        setAccountInfo(null);
      } else {
        setAlert({ type: 'error', message: data.error || `Failed to ${action} savings account` });
      }
    } catch (error) {
      console.error(`Error ${action}ing savings account:`, error);
      setAlert({ type: 'error', message: `An error occurred while ${action}ing the savings account` });
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search for Account */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Manage Account Status</h3>
        <form onSubmit={handleSearch} className="space-y-4">
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
              Customer NIC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerNic"
              value={customerNic}
              onChange={(e) => setCustomerNic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter PRIMARY account holder NIC"
              maxLength={12}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the NIC of the PRIMARY account holder to authorize status changes
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search Account'}
          </button>
        </form>
      </div>

      {/* Account Information and Actions */}
      {accountInfo && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Account No:</span>
                <span className="ml-2 font-medium text-black">{accountInfo.account_no}</span>
              </div>
              <div>
                <span className="text-gray-600">Balance:</span>
                <span className="ml-2 font-medium text-black">
                  LKR {parseFloat(accountInfo.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 font-medium text-black">{accountInfo.plan_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  accountInfo.active_status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {accountInfo.active_status ? 'Active' : 'Deactivated'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Account Holders:</span>
                <span className="ml-2 font-medium text-black">
                  {accountInfo.account_holders || accountInfo.created_customer_nic || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              {accountInfo.active_status ? 'Deactivate Account' : 'Reactivate Account'}
            </h3>

            {accountInfo.active_status ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>Note:</strong> Deactivating this savings account will mark ALL linked fixed deposits as matured.
                  No transactions will be allowed on this account until it is reactivated. Only the PRIMARY account holder can perform this action.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  ℹ️ <strong>Note:</strong> Reactivating this account will allow transactions to resume.
                  You can create new fixed deposits once the account is active. Only the PRIMARY account holder can perform this action.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Authorizing Customer:</strong> {customerNic}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This NIC will be verified as a PRIMARY account holder before the status change is processed.
                </p>
              </div>

              {accountInfo.active_status && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800">
                    ℹ️ Customer Request
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Deactivating through account management is treated as a customer-requested closure and will be recorded in the system.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setAction(accountInfo.active_status ? 'deactivate' : 'reactivate');
                  handleAction();
                }}
                disabled={loading}
                className={`w-full text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors ${
                  accountInfo.active_status
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {loading ? 'Processing...' : accountInfo.active_status ? 'Deactivate Account' : 'Reactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && accountInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-gray-300">
            <h3 className="text-xl font-bold text-black mb-4">
              {action === 'deactivate' ? '⚠️ Confirm Deactivation' : '✅ Confirm Reactivation'}
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                Are you sure you want to {action} savings account <strong className="text-black">#{accountNo}</strong>?
              </p>
              {action === 'deactivate' && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-800 mb-2">This will:</p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Deactivate the savings account #{accountNo}</li>
                    <li className="font-semibold">Mark as customer-requested closure</li>
                    <li>Mark ALL linked fixed deposits as matured</li>
                    <li>Prevent all transactions on this account</li>
                    <li>Preserve all transaction history</li>
                  </ul>
                </div>
              )}
              {action === 'reactivate' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-800 mb-2">This will:</p>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>Reactivate the savings account #{accountNo}</li>
                    <li>Allow deposits, withdrawals, and transfers</li>
                    <li>Allow creation of new fixed deposits</li>
                  </ul>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Customer NIC authorizing {action}: <strong className="text-black">{customerNic}</strong>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cancelAction}
                className="flex-1 bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 font-medium transition-colors ${
                  action === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                Yes, {action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsAccountManagement;
