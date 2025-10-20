import React, { useState } from 'react';
import { adminService } from '../../../services/bankingService';

const CustomerAccountActivityReport: React.FC = () => {
  const [nic,setNic]=useState('');
  const [account,setAccount]=useState('');
  const [data,setData]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [header,setHeader]=useState<{name?:string,nic?:string,account_no?:string}>({});
  const generate= async()=>{ 
    if(!nic||!account) return; 
    setLoading(true); setError(''); setData([]); setHeader({}); 
    try { 
      const res = await adminService.getCustomerActivityForAcc(nic, account);
      const payload = res.data?.getCusActivity || res.data;
      if (payload?.nic) setHeader({ name: payload.name, nic: payload.nic, account_no: payload.account_no });
      const rows = payload ? [payload] : [];
      setData(rows);
    } catch(e:any){ 
      setError(e.response?.data?.message || e.message || 'Failed'); 
    } finally { setLoading(false);} };
  const columns = data[0]? Object.keys(data[0]): [];
  return (<div>
    <div className='flex flex-col sm:flex-row gap-3 mb-4'>
      <input value={nic} onChange={e=>setNic(e.target.value)} placeholder='Customer NIC' className='border rounded px-3 py-2 flex-1'/>
      <input value={account} onChange={e=>setAccount(e.target.value)} placeholder='Account Number' className='border rounded px-3 py-2 flex-1'/>
  <button onClick={generate} disabled={!nic || !account || loading} className='px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50'>{loading? 'Loading...':'Get Activity'}</button>
    </div>
    {header?.nic && (
      <div className='mb-3 text-sm text-gray-700'>
        <span className='font-semibold'>Customer:</span> {header.name || '—'} ({header.nic}) • <span className='font-semibold'>Account:</span> {header.account_no}
      </div>
    )}
    {error && <p className='text-red-600 mb-4'>{error}</p>}
    {data.length>0 && <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200 text-sm'>
        <thead className='bg-gray-50'><tr>{columns.map(c=> <th key={c} className='px-4 py-2 text-left capitalize'>{c.replace(/_/g,' ')}</th>)}</tr></thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {data.map((row,i)=>(<tr key={i} className='hover:bg-gray-50'>{columns.map(col=> <td key={col} className='px-4 py-2'>{row[col]?.toString() ?? '—'}</td>)}</tr>))}
        </tbody>
      </table>
    </div>}
  </div>);
};
export default CustomerAccountActivityReport;
