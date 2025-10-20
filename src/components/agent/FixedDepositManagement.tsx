
import React, { useState } from 'react';
import { agentService } from '../../services/bankingService';
import { FixedDeposit } from '../../types';
import Alert from '../Alert';

// Top-level utility functions for FD status display
export const getStatusBadge = (status: string, isActive?: boolean) => {
  if (isActive === false) {
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Deactivated</span>;
  }
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'active') {
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Active</span>;
  } else if (statusLower === 'matured') {
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Matured</span>;
  } else {
    return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">{status}</span>;
  }
};

export const getStatusReason = (fdInfo: any) => {
  const today = new Date();
  const endDate = fdInfo.end_date ? new Date(fdInfo.end_date) : null;
  if (fdInfo.is_active === false) {
    if (endDate && today >= endDate) {
      return {
        reason: 'Closed after maturity date',
        color: 'text-gray-700',
        icon: '📅',
        detail: `This FD reached its maturity date on ${endDate.toLocaleDateString()} and was subsequently closed.`
      };
    } else {
      return {
        reason: 'Manually closed before maturity',
        color: 'text-red-700',
        icon: '✂️',
        detail: 'This FD was closed early by an authorized user. A 2% penalty was applied.'
      };
    }
  }
  if (fdInfo.status === 'matured') {
    return {
      reason: 'Reached maturity date',
      color: 'text-gray-700',
      icon: '✅',
      detail: endDate ? `Matured on ${endDate.toLocaleDateString()}. Funds settled to linked savings account.` : 'Matured naturally.'
    };
  }
  if (fdInfo.status === 'active') {
    if (endDate && today >= endDate) {
      return {
        reason: 'Past maturity date (needs processing)',
        color: 'text-orange-700',
        icon: '⏰',
        detail: `This FD reached maturity on ${endDate.toLocaleDateString()} but hasn't been marked as matured yet.`
      };
    } else if (endDate) {
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        reason: `Currently active (${daysRemaining} days until maturity)`,
        color: 'text-green-700',
        icon: '🔄',
        detail: `Will mature on ${endDate.toLocaleDateString()}`
      };
    } else {
      return {
        reason: 'Currently active',
        color: 'text-green-700',
        icon: '🔄',
        detail: 'FD is currently earning interest.'
      };
    }
  }
  return {
    reason: 'Unknown status',
    color: 'text-gray-700',
    icon: '❓',
    detail: 'Status information not available.'
  };
};

const FixedDepositManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'manage'>('create');

  const subTabs = [
    { id: 'create', name: 'Create Fixed Deposit' },
    { id: 'manage', name: 'Manage FD Status' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Fixed Deposit Management</h2>
        
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
      {activeSubTab === 'create' && <CreateFixedDepositForm />}
      {activeSubTab === 'manage' && <ManageFDStatusForm />}
    </div>
  );
};

// Create Fixed Deposit Form Component
const CreateFixedDepositForm: React.FC = () => {
  const [fixedDeposit, setFixedDeposit] = useState<FixedDeposit>({
    account_no: '',
    NIC: '',
    amount: 0,
    fd_plan_id: '1',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFixedDeposit({
      ...fixedDeposit,
      [name]: name === 'amount' 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      // Basic validation for NIC (12 digits or 9 digits + V/v)
      const nic = (fixedDeposit.NIC || '').trim();
      if (!/^(?:\d{12}|\d{9}[Vv])$/.test(nic)) {
        setAlert({ type: 'error', message: 'Invalid NIC. Must be 12 digits or 9 digits followed by V/v.' });
        setLoading(false);
        return;
      }

      const payload = { ...fixedDeposit, NIC: nic };
      const response = await agentService.addFixedDeposit(payload);
      setAlert({ type: 'success', message: response.data.message || 'Fixed deposit created successfully!' });
      setFixedDeposit({
        account_no: '',
        NIC: '',
        amount: 0,
        fd_plan_id: '1',
      });
    } catch (err: any) {
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to create fixed deposit' 
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
            <label htmlFor="account_no" className="block text-sm font-medium text-black mb-2">
              Linked Savings Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="account_no"
              name="account_no"
              value={fixedDeposit.account_no || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter linked savings account number"
              required
            />
          </div>

          <div>
            <label htmlFor="NIC" className="block text-sm font-medium text-black mb-2">
              Customer NIC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="NIC"
              name="NIC"
              value={fixedDeposit.NIC || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="199012345678 or 901234567V"
              maxLength={12}
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-black mb-2">
              Deposit Amount (LKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={fixedDeposit.amount || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter deposit amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="fd_plan_id" className="block text-sm font-medium text-black mb-2">
              Fixed Deposit Plan <span className="text-red-500">*</span>
            </label>
            <select
              id="fd_plan_id"
              name="fd_plan_id"
              value={fixedDeposit.fd_plan_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              required
            >
              <option value="1">6 Months - 13% Interest</option>
              <option value="2">1 Year - 14% Interest</option>
              <option value="3">3 Years - 15% Interest</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create Fixed Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
};

// View Fixed Deposits Component
const ViewFixedDeposits: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNic, setSearchNic] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'search'>('all');

  // Load all deposits on component mount
  React.useEffect(() => {
    if (viewMode === 'all') {
      fetchAllDeposits();
    }
  }, [viewMode]);

  const fetchAllDeposits = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/agent/fixeddeposits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Filter only active FDs (is_active = true)
        const activeDeposits = (data.deposits || []).filter((fd: any) => fd.is_active === true);
        setDeposits(activeDeposits);
        if (activeDeposits.length === 0) {
          setAlert({ type: 'error', message: 'No active fixed deposits found' });
        }
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to fetch fixed deposits' });
        setDeposits([]);
      }
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
      setAlert({ type: 'error', message: 'An error occurred while fetching fixed deposits' });
      setDeposits([]);
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
      const response = await fetch(`http://localhost:3000/api/agent/customers/${searchNic}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Filter only active FDs (is_active = true)
        const activeDeposits = (data.fixedDeposits || []).filter((fd: any) => fd.is_active === true);
        setDeposits(activeDeposits);
        if (activeDeposits.length === 0) {
          setAlert({ type: 'error', message: 'No active fixed deposits found for this customer' });
        }
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to fetch fixed deposits' });
        setDeposits([]);
      }
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
      setAlert({ type: 'error', message: 'An error occurred while fetching fixed deposits' });
      setDeposits([]);
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
          View All Fixed Deposits
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

      {deposits.length > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    FD Account No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Linked Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Deposit Amount (LKR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Interest Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-200">
                {deposits.map((deposit) => {
                  const statusInfo = getStatusReason(deposit);
                  return (
                    <tr key={deposit.fd_account_no} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                        {deposit.fd_account_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {deposit.linked_account_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {parseFloat(deposit.deposit_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {deposit.plan_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {deposit.interest_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(deposit.status, deposit.is_active)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className={`font-medium ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.reason}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statusInfo.detail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {deposit.end_date ? new Date(deposit.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Manage FD Status Form Component (Mature/Reactivate)
const ManageFDStatusForm: React.FC = () => {
  const [fdAccountNo, setFdAccountNo] = useState('');
  const [customerNic, setCustomerNic] = useState('');
  const [fdInfo, setFdInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState<'mature' | 'reactivate'>('mature');
  const [canManage, setCanManage] = useState<boolean | null>(null);
  const [canManageReason, setCanManageReason] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fdAccountNo) {
      setAlert({ type: 'error', message: 'Please enter a fixed deposit account number' });
      return;
    }

    if (!customerNic) {
      setAlert({ type: 'error', message: 'Please enter customer NIC' });
      return;
    }

    setLoading(true);
    setAlert(null);
    setFdInfo(null);
  setCanManage(null);
  setCanManageReason(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAlert({ type: 'error', message: 'Not authenticated. Please log in again.' });
        setLoading(false);
        return;
      }
      
      console.log('[FD SEARCH] Searching for FD:', fdAccountNo, 'with NIC:', customerNic);
      console.log('[FD SEARCH] Token exists:', !!token);
      
      const response = await fetch('http://localhost:3000/api/agent/fixeddeposits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[FD SEARCH] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FD SEARCH] Error response:', errorText);
        
        if (response.status === 403 || response.status === 401) {
          setAlert({ 
            type: 'error', 
            message: 'Authentication failed. Please log out and log in again as an agent.' 
          });
        } else {
          setAlert({ type: 'error', message: `Failed to fetch fixed deposits: ${response.status} ${response.statusText}` });
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[FD SEARCH] Received data:', data);
      console.log('[FD SEARCH] Number of FDs:', data.deposits?.length);

      if (data.deposits && data.deposits.length > 0) {
        console.log('[FD SEARCH] Looking for fd_account_no:', parseInt(fdAccountNo));
        const fd = data.deposits.find((dep: any) => {
          console.log('[FD SEARCH] Checking FD:', dep.fd_account_no, 'type:', typeof dep.fd_account_no);
          return dep.fd_account_no === parseInt(fdAccountNo);
        });
        
        if (fd) {
          console.log('[FD SEARCH] Found FD:', fd);
          // Authorize NIC by reading holders of the linked savings account BEFORE revealing details
          try {
            const token2 = localStorage.getItem('token');
            const linkedAcc = fd.linked_account_no;
            if (!linkedAcc) {
              console.warn('[FD SEARCH] Missing linked_account_no in FD payload; cannot verify holders');
              setFdInfo(null);
              setCanManage(false);
              setCanManageReason('Unable to verify account holders.');
              setAlert({ type: 'error', message: 'Unable to verify account holders.' });
              return;
            }
            const holdersUrl = `http://localhost:3000/api/agent/jointaccount/${encodeURIComponent(linkedAcc)}/holders`;
            const holdersResp = await fetch(holdersUrl, { headers: { 'Authorization': `Bearer ${token2}` } });
            console.log('[FD SEARCH] Holders check status:', holdersResp.status);
            if (!holdersResp.ok) {
              // Fallback: try single-holder by checking savings account creator NIC
              try {
                const accResp = await fetch(`http://localhost:3000/api/agent/savingsaccounts/${encodeURIComponent(linkedAcc)}`, {
                  headers: { 'Authorization': `Bearer ${token2}` }
                });
                if (accResp.ok) {
                  const accData = await accResp.json().catch(() => ({}));
                  const created = (accData?.account?.created_customer_nic || '').trim().toUpperCase();
                  const inputNic = (customerNic || '').trim().toUpperCase();
                  if (created && created === inputNic) {
                    setFdInfo(fd);
                    setCanManage(true);
                    setCanManageReason(null);
                    // Continue without returning, so we don't early-exit incorrectly
                  } else {
                    setFdInfo(null);
                    setCanManage(false);
                    setCanManageReason('Only the account holder of the linked savings account can view/manage this fixed deposit.');
                    setAlert({ type: 'error', message: 'The provided NIC is not an account holder of the linked savings account.' });
                    return;
                  }
                } else {
                  setFdInfo(null);
                  setCanManage(false);
                  setCanManageReason('Unable to verify account holders.');
                  setAlert({ type: 'error', message: 'Unable to verify account holders.' });
                  return;
                }
              } catch (e) {
                setFdInfo(null);
                setCanManage(false);
                setCanManageReason('Unable to verify account holders.');
                setAlert({ type: 'error', message: 'Unable to verify account holders.' });
                return;
              }
            }
            const holdersData = await holdersResp.json().catch(() => ({}));
            const inputNic = (customerNic || '').trim().toUpperCase();
            const holders: Array<{ nic: string; role: string }> = (holdersData?.holders || []).map((h: any) => ({
              nic: (h.nic || '').trim().toUpperCase(),
              role: (h.role || '').toString().toLowerCase(),
            }));
            const found = holders.find(h => h.nic === inputNic);
            if (!found) {
              // Not an account holder: do not reveal details
              setFdInfo(null);
              setCanManage(false);
              setCanManageReason('Only the account holder of the linked savings account can view/manage this fixed deposit.');
              setAlert({ type: 'error', message: 'The provided NIC is not an account holder of the linked savings account.' });
              return;
            }
            // Holder found: reveal FD details; enable actions only for primary
            setFdInfo(fd);
            setCanManage(found.role === 'primary');
            setCanManageReason(found.role === 'primary' ? null : 'Only the PRIMARY account holder of the linked savings account can manage this fixed deposit.');
          } catch (authErr) {
            console.warn('[FD SEARCH] Primary authorization check failed:', authErr);
            // On auth failure, do not reveal details
            setFdInfo(null);
            setCanManage(false);
            setCanManageReason('Unable to verify account holder authorization.');
            setAlert({ type: 'error', message: 'Unable to verify account holder authorization.' });
          }
        } else {
          console.log('[FD SEARCH] FD not found in list');
          setAlert({ type: 'error', message: `Fixed deposit #${fdAccountNo} not found` });
        }
      } else {
        console.log('[FD SEARCH] No FDs in response');
        setAlert({ type: 'error', message: 'No fixed deposits found in the system' });
      }
    } catch (error: any) {
      console.error('[FD SEARCH] Exception:', error);
      setAlert({ type: 'error', message: `Error: ${error.message || 'An error occurred while fetching fixed deposit information'}` });
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
      const url = action === 'mature'
        ? `http://localhost:3000/api/agent/fixeddeposits/${fdAccountNo}`
        : `http://localhost:3000/api/agent/fixeddeposits/${fdAccountNo}/reactivate`;

      const response = await fetch(url, {
        method: action === 'mature' ? 'DELETE' : 'PATCH',
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
          message: action === 'mature'
            ? `Fixed deposit ${fdAccountNo} has been marked as matured successfully!`
            : `Fixed deposit ${fdAccountNo} reactivated successfully!`
        });
        setFdAccountNo('');
        setCustomerNic('');
        setFdInfo(null);
      } else {
        setAlert({ type: 'error', message: data.error || `Failed to ${action} fixed deposit` });
      }
    } catch (error) {
      console.error(`Error ${action}ing fixed deposit:`, error);
      setAlert({ type: 'error', message: `An error occurred while ${action}ing the fixed deposit` });
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
  };

  const getStatusBadge = (status: string, isActive?: boolean) => {
    // If explicitly deactivated (is_active = false), show deactivated badge
    if (isActive === false) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Deactivated</span>;
    }
    
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active') {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Active</span>;
    } else if (statusLower === 'matured') {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Matured</span>;
    } else {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getStatusReason = (fdInfo: any) => {
    const today = new Date();
    const endDate = fdInfo.end_date ? new Date(fdInfo.end_date) : null;
    
    // Check if deactivated
    if (fdInfo.is_active === false) {
      if (endDate && today >= endDate) {
        return {
          reason: 'Closed after maturity date',
          color: 'text-gray-700',
          icon: '📅',
          detail: `This FD reached its maturity date on ${endDate.toLocaleDateString()} and was subsequently closed.`
        };
      } else {
        return {
          reason: 'Manually closed before maturity',
          color: 'text-red-700',
          icon: '✂️',
          detail: 'This FD was closed early by an authorized user. A 2% penalty was applied.'
        };
      }
    }
    
    // Check if matured but still active
    if (fdInfo.status === 'matured') {
      return {
        reason: 'Reached maturity date',
        color: 'text-gray-700',
        icon: '✅',
        detail: endDate ? `Matured on ${endDate.toLocaleDateString()}. Funds settled to linked savings account.` : 'Matured naturally.'
      };
    }
    
    // Active FD
    if (fdInfo.status === 'active') {
      if (endDate && today >= endDate) {
        return {
          reason: 'Past maturity date (needs processing)',
          color: 'text-orange-700',
          icon: '⏰',
          detail: `This FD reached maturity on ${endDate.toLocaleDateString()} but hasn't been marked as matured yet.`
        };
      } else if (endDate) {
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          reason: `Currently active (${daysRemaining} days until maturity)`,
          color: 'text-green-700',
          icon: '🔄',
          detail: `Will mature on ${endDate.toLocaleDateString()}`
        };
      } else {
        return {
          reason: 'Currently active',
          color: 'text-green-700',
          icon: '🔄',
          detail: 'FD is currently earning interest.'
        };
      }
    }
    
    return {
      reason: 'Unknown status',
      color: 'text-gray-700',
      icon: '❓',
      detail: 'Status information not available.'
    };
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

      {/* Search for FD */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Manage Fixed Deposit Status</h3>
        <form onSubmit={handleSearch} className="space-y-4">
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
              Customer NIC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerNic"
              value={customerNic}
              onChange={(e) => setCustomerNic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white"
              placeholder="Enter PRIMARY account holder NIC of linked savings account"
              maxLength={12}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the NIC of the PRIMARY account holder of the linked savings account to authorize status changes
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search Fixed Deposit'}
          </button>
        </form>
      </div>

      {/* FD Information and Actions */}
      {fdInfo && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Fixed Deposit Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">FD Account No:</span>
                <span className="ml-2 font-medium text-black">{fdInfo.fd_account_no}</span>
              </div>
              <div>
                <span className="text-gray-600">Linked Account:</span>
                <span className="ml-2 font-medium text-black">{fdInfo.linked_account_no}</span>
              </div>
              <div>
                <span className="text-gray-600">Deposit Amount:</span>
                <span className="ml-2 font-medium text-black">
                  LKR {parseFloat(fdInfo.deposit_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 font-medium text-black">{fdInfo.plan_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Interest Rate:</span>
                <span className="ml-2 font-medium text-black">{fdInfo.interest_rate || 'N/A'}%</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2">{getStatusBadge(fdInfo.status, fdInfo.is_active)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Status Reason:</span>
                <div className="ml-2 mt-1">
                  <div className={`text-sm font-medium ${getStatusReason(fdInfo).color}`}>
                    {getStatusReason(fdInfo).icon} {getStatusReason(fdInfo).reason}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getStatusReason(fdInfo).detail}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Start Date:</span>
                <span className="ml-2 font-medium text-black">
                  {fdInfo.start_date ? new Date(fdInfo.start_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">End Date:</span>
                <span className="ml-2 font-medium text-black">
                  {fdInfo.end_date ? new Date(fdInfo.end_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              {fdInfo.status === 'active' ? 'Mark as Matured' : fdInfo.is_active === false ? 'Fixed Deposit Status' : 'Reactivate Fixed Deposit'}
            </h3>

            {fdInfo.status === 'active' ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>Note:</strong> Marking this fixed deposit as matured will stop interest accrual.
                  The linked savings account will remain active. Only the PRIMARY account holder of the linked savings account can perform this action.
                </p>
              </div>
            ) : fdInfo.is_active === false ? (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm font-semibold mb-2">
                  🚫 <strong>Cannot Reactivate Fixed Deposit</strong>
                </p>
                <p className="text-red-700 text-sm">
                  This fixed deposit has been deactivated and cannot be reactivated. Once a fixed deposit is closed/deactivated, it is permanently closed. 
                  If you need a new fixed deposit, please create a new one.
                </p>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-red-600">
                    <strong>Reason:</strong> Fixed deposits that have been deactivated (closed early or due to customer deactivation) cannot be reopened due to regulatory and accounting requirements.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  ℹ️ <strong>Note:</strong> This fixed deposit has matured. The funds have been settled to the linked savings account.
                </p>
              </div>
            )}

            {fdInfo.status === 'active' && fdInfo.is_active !== false && (
              <div className="space-y-4">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Authorizing Customer:</strong> {customerNic}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This NIC will be verified as an account holder of the linked savings account before the status change is processed.
                  </p>
                  {canManage === false && (
                    <p className="text-sm text-red-600 mt-2">
                      🚫 {canManageReason || 'Only an authorized account holder can manage this fixed deposit.'}
                    </p>
                  )}
                </div>

                {canManage === true && (
                  <button
                    onClick={() => {
                      setAction('mature');
                      handleAction();
                    }}
                    disabled={loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {loading ? 'Processing...' : 'Mark as Matured'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && fdInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-gray-300">
            <h3 className="text-xl font-bold text-black mb-4">
              {action === 'mature' ? '⚠️ Confirm Maturation' : '✅ Confirm Reactivation'}
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                Are you sure you want to {action === 'mature' ? 'mark as matured' : 'reactivate'} fixed deposit <strong className="text-black">#{fdAccountNo}</strong>?
              </p>
              {action === 'mature' && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">This will:</p>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Mark the fixed deposit #{fdAccountNo} as matured</li>
                    <li>Stop interest accrual</li>
                    <li>Keep the linked savings account active</li>
                    <li>Preserve all transaction history</li>
                  </ul>
                </div>
              )}
              {action === 'reactivate' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-800 mb-2">This will:</p>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>Reactivate the fixed deposit #{fdAccountNo}</li>
                    <li>Resume interest accrual</li>
                    <li>Update status to active</li>
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
                  action === 'mature'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                Yes, {action === 'mature' ? 'Mark as Matured' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedDepositManagement;
