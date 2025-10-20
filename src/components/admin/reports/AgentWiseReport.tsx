import React, { useState } from 'react';
import { adminService } from '../../../services/bankingService';
import { AgentWiseTransaction } from './reportTypes';
import { exportToExcel } from './ReportHelpers';

const AgentWiseReport: React.FC = () => {
  const [data, setData] = useState<AgentWiseTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminService.getAgentWiseTransactions();
      const rows = res.data.agentWiseTrans || res.data;
      setData(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      if (e.response?.status === 500) {
        setError('No agent data found. There are no accounts or transactions for agents.');
      } else {
        setError(e.response?.data?.message || e.message || 'Failed to fetch');
      }
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <button onClick={generate} disabled={loading}
          className="px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50">
          {loading ? 'Loading...' : 'Generate'}
        </button>
        {data.length > 0 && (
          <button onClick={() => exportToExcel(data, 'agent_wise_transactions')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Export
          </button>) }
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Agent</th>
                <th className="px-4 py-2 text-left">Deposits</th>
                <th className="px-4 py-2 text-left">Withdrawals</th>
                <th className="px-4 py-2 text-left">Transfers</th>
                <th className="px-4 py-2 text-left">Transactions</th>
                <th className="px-4 py-2 text-left">Total Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(a => (
                <tr key={a.username} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{a.username}</td>
                  <td className="px-4 py-2">${(a.total_deposits||0).toLocaleString()}<div className="text-xs text-gray-500">{a.deposit_count} transactions</div></td>
                  <td className="px-4 py-2">${(a.total_withdrawals||0).toLocaleString()}<div className="text-xs text-gray-500">{a.withdrawal_count} transactions</div></td>
                  <td className="px-4 py-2">${((a.total_accToacc ?? a.total_acctoacc) ||0).toLocaleString()}<div className="text-xs text-gray-500">{(a.accToacc_count ?? a.acctoacc_count) ||0} transactions</div></td>
                  <td className="px-4 py-2">{a.total_transactions}</td>
                  <td className="px-4 py-2">${(a.total_amount||0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentWiseReport;
