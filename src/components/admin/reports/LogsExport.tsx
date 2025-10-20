import React, { useState } from 'react';
import { adminService } from '../../../services/bankingService';
import { exportToExcel } from './ReportHelpers';

const LogsExport: React.FC = () => {
  const [auditLoading,setAuditLoading]=useState(false);
  const [auditError,setAuditError]=useState('');
  const [systemLoading,setSystemLoading]=useState(false);

  const exportSystem = async ()=>{
    setSystemLoading(true);
    try {
      const res = await adminService.getSystemLogs();
      const rows = res.data.systemLogs || res.data;
      if(Array.isArray(rows)) exportToExcel(rows,'system_activity_logs');
    } finally { setSystemLoading(false);} };

  const exportAudit = async ()=>{
    setAuditLoading(true); setAuditError('');
    try {
      const res = await adminService.getAuditLogs();
      const rows = res.data.auditLogs || res.data.oditLogs || res.data;
      if(Array.isArray(rows)) exportToExcel(rows,'audit_logs'); else setAuditError('No audit data');
    } catch(e:any){ setAuditError(e.response?.data?.message || e.message || 'Failed to export'); }
    finally { setAuditLoading(false);} };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='bg-white shadow rounded p-6 flex flex-col items-center'>
        <h3 className='font-semibold text-gray-800 mb-2'>System Activity Logs (Export Only)</h3>
  <button onClick={exportSystem} disabled={systemLoading} className='px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50'>{systemLoading? 'Exporting...':'Export System Logs'}</button>
        <p className='text-gray-500 text-sm mt-2 text-center'>Not displayed in UI. Download directly.</p>
      </div>
      <div className='bg-white shadow rounded p-6 flex flex-col items-center'>
        <h3 className='font-semibold text-gray-800 mb-2'>Audit Logs (Export Only)</h3>
  <button onClick={exportAudit} disabled={auditLoading} className='px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50'>{auditLoading? 'Exporting...':'Export Audit Logs'}</button>
        {auditError && <p className='text-red-600 text-sm mt-2'>{auditError}</p>}
        <p className='text-gray-500 text-sm mt-2 text-center'>Not displayed in UI. Download directly.</p>
      </div>
    </div>
  );
};
export default LogsExport;
