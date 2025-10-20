import React, { useState } from 'react';
import { adminService } from '../../../services/bankingService';
import { FixedDeposit } from './reportTypes';
import { exportToExcel } from './ReportHelpers';

const ActiveFDsReport: React.FC = () => {
  const [data, setData] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generate = async () => {
    setLoading(true);
    setError('');
    // Clear previous data to avoid showing stale rows when request fails or returns empty
    setData([]);
    try {
      const res = await adminService.getActiveFDs();
      const rows = res.data.activeFDInfo || res.data;
      const normalized = Array.isArray(rows) ? rows : [];
      setData(normalized);
      if (normalized.length === 0) {
        setError('No active fixed deposits found.');
      }
    } catch (e:any) {
      setData([]);
      setError(e?.response?.data?.message || e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };
  return (<div>
    <div className='flex gap-3 mb-4'>
  <button onClick={generate} disabled={loading} className='px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50'>{loading? 'Loading...':'Generate'}</button>
      {data.length>0 && <button onClick={()=>exportToExcel(data,'active_fixed_deposits')} className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>Export</button>}
    </div>
    {error && <p className='text-red-600 mb-4'>{error}</p>}
    {data.length>0 && <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200 text-sm'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left'>FD Acc</th>
            <th className='px-4 py-2 text-left'>Customer</th>
            <th className='px-4 py-2 text-left'>NIC</th>
            <th className='px-4 py-2 text-left'>Agent</th>
            <th className='px-4 py-2 text-left'>Amount</th>
            <th className='px-4 py-2 text-left'>Rate</th>
            <th className='px-4 py-2 text-left'>Start</th>
            <th className='px-4 py-2 text-left'>End</th>
            <th className='px-4 py-2 text-left'>Next Interest</th>
            <th className='px-4 py-2 text-left'>Status</th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {data.map(fd => <tr key={fd.fd_account_no} className='hover:bg-gray-50'>
            <td className='px-4 py-2'>{fd.fd_account_no}</td>
            <td className='px-4 py-2'>{fd.customer_name}</td>
            <td className='px-4 py-2'>{fd.customer_nic}</td>
            <td className='px-4 py-2'>{fd.agent_username}</td>
            <td className='px-4 py-2'>${fd.amount.toLocaleString()}</td>
            <td className='px-4 py-2'>{fd.interest_rate}%</td>
            <td className='px-4 py-2'>{new Date(fd.start_date).toLocaleDateString()}</td>
            <td className='px-4 py-2'>{new Date(fd.end_date).toLocaleDateString()}</td>
            <td className='px-4 py-2'>{fd.next_interest_date? new Date(fd.next_interest_date).toLocaleDateString(): '—'}</td>
            <td className='px-4 py-2'><span className={`px-2 py-1 text-xs rounded-full ${fd.status==='active' ? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{fd.status}</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </div>);
};
export default ActiveFDsReport;
