import React, { useEffect, useState } from 'react';
import { agentService } from '../../services/bankingService';
import { useCustomerRefresh } from '../../contexts/CustomerRefreshContext';

interface CustomerRow {
  user_id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  gender: string;
  address: string;
  DOB: string;
  role: string;
  is_active?: boolean;
}

const ManageCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState<Partial<CustomerRow & { password: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  
  const { refreshTrigger } = useCustomerRefresh();

  const loadCustomers = async () => {
    setLoading(true); setError('');
    try {
      const res = await agentService.listCustomers();
      setCustomers(res.data.customers || []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, [refreshTrigger]);

  const startEdit = async (nic: string) => {
    setLoading(true); setError(''); setMsg('');
    try {
      const res = await agentService.getCustomer(nic);
      const row: CustomerRow = res.data.customer;
      setSelected(row);
      setForm(row);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const submitUpdate = async () => {
    setLoading(true); setError(''); setMsg('');
    try {
      await agentService.updateCustomer(selected!.nic, form);
      setMsg('Customer updated successfully');
      setSelected(null);
      setForm({});
      loadCustomers();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (nic: string, name: string) => {
    const message = `⚠️ WARNING: Are you sure you want to deactivate customer ${name}?\n\n` +
      `This will:\n` +
      `• Close all savings accounts linked to this customer\n` +
      `• Close all fixed deposits with a 2% EARLY CLOSURE PENALTY\n` +
      `• For joint accounts: Only removed if this customer is the sole primary holder\n` +
      `• 98% of FD amounts will be credited to linked savings accounts\n` +
      `• 2% penalty goes to the bank\n\n` +
      `This action will be logged in the system.`;
    
    if (!window.confirm(message)) return;
    setLoading(true); setError(''); setMsg('');
    try {
      await agentService.deleteCustomer(nic);
      setMsg(`Customer ${name} deactivated successfully. All FDs closed with applicable penalties.`);
      loadCustomers();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to deactivate customer');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (nic: string, name: string) => {
    if (!window.confirm(`Are you sure you want to reactivate customer ${name}?`)) return;
    setLoading(true); setError(''); setMsg('');
    try {
      await agentService.reactivateCustomer(nic);
      setMsg(`Customer ${name} reactivated successfully`);
      loadCustomers();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to reactivate customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Customers</h2>
      
      {/* Penalty Warning Banner */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-bold text-yellow-900 mb-2">⚠️ Customer Deactivation Policy:</h3>
        <ul className="text-xs text-yellow-900 space-y-1 list-disc list-inside">
          <li><strong>Fixed Deposits:</strong> All active FDs will be closed with a 2% early closure penalty</li>
          <li><strong>Penalty Calculation:</strong> 98% credited to linked savings account, 2% retained by bank</li>
          <li><strong>Matured FDs:</strong> Full amount + interest credited (no penalty)</li>
          <li><strong>Joint Accounts:</strong> Account remains active if other primary holders exist</li>
          <li><strong>Savings Accounts:</strong> Will be deactivated along with the customer</li>
        </ul>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}
      {msg && <div className="text-green-600 mb-3">{msg}</div>}

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Username','Name','Email','Phone','NIC','Gender','Address','Status','Actions'].map(h=> (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map(c => (
              <tr key={c.user_id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{c.username}</td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2">{c.nic}</td>
                <td className="px-4 py-2">{c.gender}</td>
                <td className="px-4 py-2">{c.address}</td>
                <td className="px-4 py-2">
                  {c.is_active !== false ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Active</span>
                  ) : (
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Deactivated</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      disabled={loading || c.is_active === false}
                      onClick={() => startEdit(c.nic)}
                      className="px-3 py-1 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    {c.is_active !== false ? (
                      <button
                        disabled={loading}
                        onClick={() => handleDeactivate(c.nic, c.name)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        disabled={loading}
                        onClick={() => handleReactivate(c.nic, c.name)}
                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      {selected && (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold mb-3">Edit Customer: {selected.name} ({selected.nic})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Name"
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Email"
              value={form.email || ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Phone"
              value={form.phone || ''}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              value={form.gender || ''}
              onChange={e => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Address"
              value={form.address || ''}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Date of Birth (YYYY-MM-DD)"
              type="date"
              value={form.DOB || ''}
              onChange={e => setForm({ ...form, DOB: e.target.value })}
            />
            <input
              className="border p-2 rounded col-span-1 sm:col-span-2"
              placeholder="Password (leave blank to keep)"
              type="password"
              value={form.password || ''}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              disabled={loading}
              onClick={submitUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              disabled={loading}
              onClick={() => { setSelected(null); setForm({}); }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
