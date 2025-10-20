import React, { useState, useMemo } from 'react';
import { adminService } from '../../../services/bankingService';
import { AccountWiseTransaction } from './reportTypes';
import { exportToExcel } from './ReportHelpers';

const AccountWiseReport: React.FC = () => {
  const [data, setData] = useState<AccountWiseTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showZeros, setShowZeros] = useState(false);

  // Helper to safely convert values to numbers (backend may return strings)
  const toNum = (val: any): number => {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  // Enrich each row with aggregate totals (coerce all values to numbers first)
  const enriched = useMemo(() => data.map(r => {
    const deposits = toNum(r.total_deposits);
    const withdrawals = toNum(r.total_withdrawals);
    const sent = toNum(r.total_sent);
    const received = toNum(r.total_received);
    const depCount = toNum(r.deposit_count);
    const withCount = toNum(r.withdrawal_count);
    const sentCount = toNum(r.sent_count);
    const recCount = toNum(r.received_count);

    return {
      ...r,
      total_deposits: deposits,
      total_withdrawals: withdrawals,
      total_sent: sent,
      total_received: received,
      deposit_count: depCount,
      withdrawal_count: withCount,
      sent_count: sentCount,
      received_count: recCount,
      // Volume = sum of absolute amounts
      total_transaction_amount: deposits + withdrawals + sent + received,
      // Net = inflows - outflows
      net_amount: (deposits + received) - (withdrawals + sent),
      // Total count (now properly adding numbers, not concatenating strings)
      total_transaction_count: depCount + withCount + sentCount + recCount
    };
  }), [data]);

  const visibleRows = useMemo(
    () => showZeros ? enriched : enriched.filter(r => r.total_transaction_count > 0),
    [enriched, showZeros]
  );

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminService.getAccountWiseTransactions();
      const rows = res.data.accountWiseTrans || res.data;
      setData(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          onClick={generate}
          disabled={loading}
          className="px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50 min-w-[120px]"
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
        {data.length > 0 && (
          <>
            <button
              onClick={() => {
                // Export with explicit columns including net_amount (all already numeric)
                const rows = visibleRows.map(r => ({
                  account_no: r.account_no,
                  total_deposits: r.total_deposits,
                  deposit_transactions: r.deposit_count,
                  total_withdrawals: r.total_withdrawals,
                  withdrawal_transactions: r.withdrawal_count,
                  total_sent: r.total_sent,
                  sent_transactions: r.sent_count,
                  total_received: r.total_received,
                  received_transactions: r.received_count,
                  net_amount: (r as any).net_amount,
                  total_transactions: (r as any).total_transaction_count
                }));
                exportToExcel(rows,'account_wise_transactions');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showZeros}
                onChange={e=>setShowZeros(e.target.checked)}
              />
              Show zero-activity accounts
            </label>
          </>
        )}
      </div>
      {data.length>0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {visibleRows.length} of {enriched.length} accounts.
        </div>
      )}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {visibleRows.length>0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Account</th>
                <th className="px-4 py-2 text-left">Deposits</th>
                <th className="px-4 py-2 text-left">Withdrawals</th>
                <th className="px-4 py-2 text-left">Sent</th>
                <th className="px-4 py-2 text-left">Received</th>
                <th className="px-4 py-2 text-left">Net Amount</th>
                <th className="px-4 py-2 text-left">Total Transactions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleRows.map(r => (
                <tr key={r.account_no} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{r.account_no}</td>
                  <td className="px-4 py-2">${r.total_deposits.toLocaleString()}<div className='text-xs text-gray-500'>{r.deposit_count} transactions</div></td>
                  <td className="px-4 py-2">${r.total_withdrawals.toLocaleString()}<div className='text-xs text-gray-500'>{r.withdrawal_count} transactions</div></td>
                  <td className="px-4 py-2">${r.total_sent.toLocaleString()}<div className='text-xs text-gray-500'>{r.sent_count} transactions</div></td>
                  <td className="px-4 py-2">${r.total_received.toLocaleString()}<div className='text-xs text-gray-500'>{r.received_count} transactions</div></td>
                  <td className="px-4 py-2 font-semibold">${((r as any).net_amount).toLocaleString()}</td>
                  <td className="px-4 py-2">{(r as any).total_transaction_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && data.length===0 && !error && (
        <p className="text-gray-500">No data loaded yet. Click Generate to fetch account-wise transactions.</p>
      )}
    </div>
  );
};

export default AccountWiseReport;
