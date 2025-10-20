import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/bankingService';
import AddAgent from './AddAgent';

interface AgentRow {
  user_id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  branch_id: number;
  is_active?: boolean;
}

const ManageAgents: React.FC = () => {
  // Restore active sub-tab from localStorage or default to 'add'
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'manage'>(() => {
    const saved = localStorage.getItem('manageAgentsSubTab');
    return (saved as 'add' | 'manage') || 'add';
  });
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [selected, setSelected] = useState<AgentRow | null>(null);
  const [form, setForm] = useState<Partial<AgentRow & { newUsername: string; password: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const subTabs = [
    { id: 'add', name: 'Add Agent' },
    { id: 'manage', name: 'View/Edit Agents' },
  ];

  // Save active sub-tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('manageAgentsSubTab', activeSubTab);
  }, [activeSubTab]);

  const loadAgents = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminService.listAgents();
      setAgents(res.data.agents || []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const startEdit = async (username: string) => {
    setLoading(true); setError(''); setMsg('');
    try {
      const res = await adminService.getAgent(username);
      const row: AgentRow = res.data.agent;
      setSelected(row);
      setForm({
        name: row.name,
        email: row.email,
        phone: row.phone,
        nic: row.nic,
        branch_id: row.branch_id,
        newUsername: row.username,
      });
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch agent');
    } finally {
      setLoading(false);
    }
  };

  const submitUpdate = async () => {
    if (!selected) return;
    setLoading(true); setError(''); setMsg('');
    try {
      const payload: any = {};
      const fields: (keyof typeof form)[] = ['name','email','phone','nic','branch_id','newUsername','password'];
      for (const f of fields) {
        if (typeof form[f] !== 'undefined' && form[f] !== null && form[f] !== '') payload[f] = form[f];
      }
      const res = await adminService.updateAgent(selected.username, payload);
      setMsg(res.data?.message || 'Agent updated successfully');
      setSelected(null);
      setForm({});
      loadAgents();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to update agent');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced: Prompt for replacement agent
  const handleDeactivate = async (username: string, name: string, user_id: number) => {
    // Filter out the agent being deactivated
    const replacementOptions = agents.filter(a => a.user_id !== user_id && a.is_active !== false);
    if (replacementOptions.length === 0) {
      setError('No other active agents available in this branch to reassign customers.');
      return;
    }
    let replacementUsername: string | null = null;
    const replacementName = window.prompt(
      `Enter the username of the replacement agent for deactivating "${name}" (${username}):\n` +
      replacementOptions.map(a => `${a.username}: ${a.name}`).join('\n')
    );
    if (!replacementName) return;
    replacementUsername = replacementName.trim();
    const replacementAgent = replacementOptions.find(a => a.username === replacementUsername);
    if (!replacementAgent) {
      setError('Invalid replacement agent username.');
      return;
    }
    if (!window.confirm(`Are you sure you want to deactivate agent "${name}" (${username}) and reassign all their customers to agent ${replacementAgent.name} (${replacementAgent.username})? This action cannot be undone.`)) {
      return;
    }
    setLoading(true); setError(''); setMsg('');
    try {
      const res = await adminService.deactivateAgent(username, replacementAgent.username);
      setMsg(res.data?.message || 'Agent deactivated successfully');
      loadAgents();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to deactivate agent');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (username: string, name: string, user_id: number) => {
    if (!window.confirm(`Are you sure you want to activate agent "${name}" (${username})?`)) {
      return;
    }
    setLoading(true); setError(''); setMsg('');
    try {
      const res = await adminService.activateAgent(username);
      setMsg(res.data?.message || 'Agent activated successfully');
      loadAgents();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to activate agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-black">
            Manage Agents
          </h1>
          <p className="text-gray-600">Add new agents, view, edit, activate and deactivate agents</p>
        </div>

        {/* Sub-tabs */}
        <div className="mb-6">
          <div className="border-b-2 border-gray-200">
            <nav className="-mb-0.5 flex space-x-8">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as 'add' | 'manage')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeSubTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Add Agent Sub-tab */}
        {activeSubTab === 'add' && (
          <AddAgent onAgentAdded={loadAgents} />
        )}

        {/* View/Edit Agents Sub-tab */}
        {activeSubTab === 'manage' && (
          <>
            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
                {error}
              </div>
            )}
            {msg && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-green-700">
                {msg}
              </div>
            )}

            {/* Agents Table */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Username','Name','Email','Phone','NIC','Branch','Status','Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {agents.map(a => (
                  <tr key={a.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{a.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.nic}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.branch_id}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        a.is_active === false 
                          ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                          : 'bg-green-100 text-green-700 border-2 border-green-300'
                      }`}>
                        {a.is_active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button 
                          disabled={loading} 
                          onClick={()=>startEdit(a.username)} 
                          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xs"
                        >
                          Edit
                        </button>
                        {a.is_active === false ? (
                          <button 
                            disabled={loading} 
                            onClick={()=>handleActivate(a.username, a.name, a.user_id)} 
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xs"
                          >
                            Activate
                          </button>
                        ) : (
                          <button 
                            disabled={loading} 
                            onClick={()=>handleDeactivate(a.username, a.name, a.user_id)} 
                            className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xs border-2 border-gray-300"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Form */}
        {selected && (
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-black">Edit Agent: <span className="text-gray-600">{selected.username}</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Username</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="New Username" 
                  value={form.newUsername || ''} 
                  onChange={e=>setForm({...form, newUsername: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="Leave blank to keep current" 
                  type="password" 
                  value={form.password || ''} 
                  onChange={e=>setForm({...form, password: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="Name" 
                  value={form.name || ''} 
                  onChange={e=>setForm({...form, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="Email" 
                  value={form.email || ''} 
                  onChange={e=>setForm({...form, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="Phone" 
                  value={form.phone || ''} 
                  onChange={e=>setForm({...form, phone: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIC</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="NIC" 
                  value={form.nic || ''} 
                  onChange={e=>setForm({...form, nic: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch ID</label>
                <input 
                  className="w-full bg-white border-2 border-gray-300 text-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  placeholder="Branch ID" 
                  type="number" 
                  value={form.branch_id ?? ''} 
                  onChange={e=>setForm({...form, branch_id: Number(e.target.value)})} 
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                disabled={loading} 
                onClick={submitUpdate} 
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Save Changes
              </button>
              <button 
                disabled={loading} 
                onClick={()=>{setSelected(null); setForm({});}} 
                className="px-6 py-3 bg-gray-200 border-2 border-gray-300 text-black rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAgents;
