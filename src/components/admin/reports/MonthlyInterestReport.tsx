import React, { useState } from 'react';
import { adminService } from '../../../services/bankingService';
import { exportToExcel } from './ReportHelpers';

const MonthlyInterestReport: React.FC = () => {
  const [data,setData]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const generate = async ()=>{ setLoading(true); setError(''); try { const res = await adminService.getMonthlyInterestDistribution(); const rows = res.data.interestDist || res.data; setData(Array.isArray(rows)? rows: []);} catch(e:any){ setError(e.response?.data?.message || e.message || 'Failed to fetch'); } finally { setLoading(false);} };
  const monthStart = data[0]?.month_start_date ? new Date(data[0].month_start_date).toLocaleDateString(): null;
  const displayData = monthStart ? data.map(({month_start_date,...rest})=>rest): data;
  const columns = displayData[0] ? Object.keys(displayData[0]) : [];
  return (<div>
    <div className='flex gap-3 mb-4'>
  <button onClick={generate} disabled={loading} className='px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50'>{loading? 'Loading...':'Generate'}</button>
      {displayData.length>0 && <button onClick={()=>exportToExcel(displayData,'monthly_interest_distribution')} className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>Export</button>}
    </div>
    {error && <p className='text-red-600 mb-4'>{error}</p>}
    {monthStart && <p className='text-sm text-gray-600 mb-2'>Month Starting: {monthStart}</p>}
    {displayData.length>0 && <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200 text-sm'>
        <thead className='bg-gray-50'><tr>{columns.map(c=> <th key={c} className='px-4 py-2 text-left capitalize'>{c.replace(/_/g,' ')}</th>)}</tr></thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {displayData.map((row,i)=>(<tr key={i} className='hover:bg-gray-50'>
            {columns.map(col=> <td key={col} className='px-4 py-2'>{(() => { const v=row[col]; if(v===null||v===undefined) return '—'; if(typeof v==='number' && /amount|total/i.test(col)) return `$${v.toLocaleString()}`; if(typeof v==='string' && (/date/i.test(col) || /^\d{4}-\d{2}-\d{2}/.test(v))) { const d=new Date(v); return isNaN(d.getTime())? v : d.toLocaleDateString(); } return v.toString(); })()}</td>)}
          </tr>))}
        </tbody>
      </table>
    </div>}
  </div>);
};
export default MonthlyInterestReport;
