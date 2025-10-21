
import React, { useState } from 'react';
import Alert from '../Alert';

interface AccountHolder {
  nic: string;
  role: 'primary' | 'secondary';
}

interface JointAccount {
  account_no: string;
  balance: number;
  active_status: boolean;
  holders: AccountHolder[];
}

const JointAccountManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  // Create form state
  const [holders, setHolders] = useState<AccountHolder[]>([{ nic: '', role: 'primary' }]);
  const [initialDeposit, setInitialDeposit] = useState('');
  const [creatingCustomerNic, setCreatingCustomerNic] = useState('');
  // Manage state
  const [searchNic, setSearchNic] = useState('');
  const [searchAccountNo, setSearchAccountNo] = useState('');
  const [searchedAccount, setSearchedAccount] = useState<JointAccount | null>(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [manageLoading, setManageLoading] = useState(false);
  const [searchedNicRole, setSearchedNicRole] = useState<'primary' | 'secondary' | null>(null);
  // General
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handlers for create form
  const handleHolderChange = (idx: number, field: keyof AccountHolder, value: string) => {
    const updated = [...holders];
    updated[idx][field] = value as any;
    setHolders(updated);
  };
  const addHolder = () => setHolders([...holders, { nic: '', role: 'secondary' }]);
  const removeHolder = (idx: number) => {
    if (holders.length === 1) return;
    setHolders(holders.filter((_: AccountHolder, i: number) => i !== idx));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
  const res = await fetch('https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/addsavingsaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          users: holders,
          initial_deposit: parseFloat(initialDeposit),
          created_customer: creatingCustomerNic,
          plan_id: 5, // Joint savings plan
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Joint account created successfully!');
        setHolders([{ nic: '', role: 'primary' }]);
        setInitialDeposit('');
        setCreatingCustomerNic('');
      } else {
        setMessage(data.message || 'Failed to create joint account.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for manage tab
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setManageLoading(true);
    setSearchMessage('');
    setSearchedAccount(null);
    setSearchedNicRole(null);
    try {
      const token = localStorage.getItem('token');
      // Use new endpoint to fetch joint account by account_no and NIC
  const res = await fetch(`https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/jointaccount?account_no=${searchAccountNo}&nic=${searchNic}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (res.ok && data && data.account) {
        // Set role based on the account query (this record matches the searched NIC)
        if (data.account.role === 'primary' || data.account.role === 'secondary') {
          setSearchedNicRole(data.account.role);
        } else {
          setSearchedNicRole(null);
        }
        // Fetch holders from the dedicated endpoint
        let holders: AccountHolder[] = [];
        try {
          const holdersRes = await fetch(`https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/jointaccount/${data.account.account_no}/holders`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          });
          const holdersData = await holdersRes.json();
          if (holdersRes.ok && holdersData && Array.isArray(holdersData.holders)) {
            holders = holdersData.holders.map((h: any) => ({ nic: h.nic, role: h.role }));
            // Determine the role of the searched NIC among holders (fallback)
            if (!data.account.role) {
              const clean = (searchNic || '').trim().toUpperCase();
              const found = holders.find(h => (h.nic || '').trim().toUpperCase() === clean);
              setSearchedNicRole(found ? found.role : null);
            }
          }
        } catch (_) {
          // Ignore holders fetch failure; we'll show account without holders
        }
        setSearchedAccount({
          account_no: data.account.account_no,
          balance: data.account.balance,
          active_status: data.account.active_status,
          holders,
        });
      } else {
        setSearchMessage(data.message || 'No joint account found for this NIC and account number.');
      }
    } catch (err) {
      setSearchMessage('Error connecting to server.');
    } finally {
      setManageLoading(false);
    }
  };

  // Activate/Deactivate logic
  const handleStatusChange = async (action: 'activate' | 'deactivate') => {
    if (!searchedAccount) return;
    setManageLoading(true);
    setSearchMessage('');
    try {
      const token = localStorage.getItem('token');
      // Align with backend routes
      const isActivate = action === 'activate';
      const url = isActivate
  ? `https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/savingsaccount/${encodeURIComponent(searchNic)}/${encodeURIComponent(searchedAccount.account_no)}/reactivate`
  : `https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/agent/jointaccount/${encodeURIComponent(searchedAccount.account_no)}`;
      const res = await fetch(url, {
        method: isActivate ? 'PATCH' : 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customer_nic: searchNic })
      });
      const data = await res.json();
      if (res.ok) {
        setSearchMessage(`Account ${action}d successfully.`);
        setSearchedAccount({ ...searchedAccount, active_status: isActivate });
      } else {
        setSearchMessage(data.message || data.error || `Failed to ${action} account.`);
      }
    } catch (err) {
      setSearchMessage('Error connecting to server.');
    } finally {
      setManageLoading(false);
    }
  };

  // UI
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Joint Account Management</h2>
        <div className="border-b-2 border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'create' ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'}`}
              onClick={() => setActiveTab('create')}
            >Create Joint Account</button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'manage' ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'}`}
              onClick={() => setActiveTab('manage')}
            >Manage Joint Account</button>
          </nav>
        </div>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {message && <Alert type={message.includes('successfully') ? 'success' : 'error'} message={message} onClose={() => setMessage('')} />}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Initial Deposit <span className="text-red-500">*</span></label>
                <input type="number" value={initialDeposit} onChange={e => setInitialDeposit(e.target.value)} required className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Creating Customer NIC <span className="text-red-500">*</span></label>
                <input type="text" value={creatingCustomerNic} onChange={e => setCreatingCustomerNic(e.target.value)} required placeholder="NIC of the customer creating the account" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white" />
              </div>
              <hr />
              <h4 className="font-semibold mb-2">Account Holders</h4>
              {holders.map((holder: AccountHolder, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" placeholder="Customer NIC" value={holder.nic} onChange={e => handleHolderChange(idx, 'nic', e.target.value)} required className="flex-1 px-2 py-1 border-2 border-gray-300 rounded-lg" />
                  <select value={holder.role} onChange={e => handleHolderChange(idx, 'role', e.target.value)} className="px-2 py-1 border-2 border-gray-300 rounded-lg">
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                  <button type="button" onClick={() => removeHolder(idx)} disabled={holders.length === 1} className="px-2 py-1 bg-gray-200 rounded">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addHolder} className="mb-3 px-3 py-1 bg-blue-100 rounded">Add Another Holder</button>
              <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">{loading ? 'Creating...' : 'Create Joint Account'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input type="text" placeholder="Enter NIC" value={searchNic} onChange={e => setSearchNic(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg" required />
            <input type="text" placeholder="Enter Account Number" value={searchAccountNo} onChange={e => setSearchAccountNo(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg" required />
            <button type="submit" disabled={manageLoading} className="bg-black text-white px-4 py-2 rounded-lg">{manageLoading ? 'Searching...' : 'Search'}</button>
          </form>
          {searchMessage && <Alert type={searchMessage.includes('successfully') ? 'success' : 'error'} message={searchMessage} onClose={() => setSearchMessage('')} />}
          {searchedAccount && (
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <div className="mb-2"><span className="font-semibold">Account No:</span> {searchedAccount.account_no}</div>
              <div className="mb-2"><span className="font-semibold">Balance:</span> LKR {searchedAccount.balance}</div>
              <div className="mb-2"><span className="font-semibold">Status:</span> {searchedAccount.active_status ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-red-600 font-semibold">Inactive</span>}</div>
              <div className="mb-2 font-semibold">Holders:</div>
              <ul className="mb-4">
                {(searchedAccount.holders || []).map((h: AccountHolder, i: number) => (
                  <li key={i} className="ml-4">{h.nic} <span className="text-xs text-gray-500">({h.role})</span></li>
                ))}
              </ul>
              {/* Activate/Deactivate buttons - only show if searched NIC is primary holder */}
              <div className="flex flex-col gap-2">
                {searchedNicRole !== 'primary' && (
                  <div className="text-sm text-gray-600">
                    Only the primary account holder can {searchedAccount.active_status ? 'deactivate' : 'reactivate'} this joint account.
                  </div>
                )}
                <div className="flex gap-4">
                  {searchedAccount.active_status ? (
                    searchedNicRole === 'primary' && (
                      <button onClick={() => handleStatusChange('deactivate')} disabled={manageLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">Deactivate Account</button>
                    )
                  ) : (
                    searchedNicRole === 'primary' && (
                      <button onClick={() => handleStatusChange('activate')} disabled={manageLoading} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">Activate Account</button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JointAccountManagement;

