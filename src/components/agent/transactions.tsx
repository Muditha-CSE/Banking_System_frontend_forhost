import React, { useState } from 'react';
import { agentService } from '../../services/bankingService';
import { AgentDepositRequest, AgentWithdrawRequest, AgentTransferRequest } from '../../types';

type TabKey = 'deposit' | 'withdraw' | 'transfer';

const Transactions: React.FC = () => {
  const [active, setActive] = useState<TabKey>('deposit');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');

  const [deposit, setDeposit] = useState<AgentDepositRequest>({ customer_nic: '', account_no: '', amount: 0 });
  const [withdraw, setWithdraw] = useState<AgentWithdrawRequest>({ customer_nic: '', account_no: '', amount: 0 });
  const [transfer, setTransfer] = useState<AgentTransferRequest>({ sender_NIC: '', sender_account_no: '', receiver_account_no: '', amount: 0 });

  const run = async (fn: () => Promise<any>) => {
    setLoading(true); setMsg(''); setErr('');
    try {
      const res = await fn();
      setMsg(res.data?.message || 'Success');
    } catch (e: any) {
      setErr(e.response?.data?.message || e.response?.data?.error || e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {([
            { id: 'deposit', name: 'Deposit' },
            { id: 'withdraw', name: 'Withdraw' },
            { id: 'transfer', name: 'Account to Account' },
          ] as { id: TabKey, name: string }[]).map(tab => (
            <button key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${active===tab.id ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}
            >{tab.name}</button>
          ))}
        </nav>
      </div>

      {msg && <div className="text-green-600 mb-3">{msg}</div>}
      {err && <div className="text-red-600 mb-3">{err}</div>}

      {active === 'deposit' && (
        <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); run(()=>agentService.makeDeposit(deposit as any));}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Customer NIC" value={deposit.customer_nic} onChange={e=>setDeposit({...deposit, customer_nic: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Account No" value={deposit.account_no} onChange={e=>setDeposit({...deposit, account_no: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Amount" type="number" min={1} value={deposit.amount} onChange={e=>setDeposit({...deposit, amount: Number(e.target.value)})} required />
          </div>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50">{loading?'Processing...':'Make Deposit'}</button>
        </form>
      )}

      {active === 'withdraw' && (
        <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); run(()=>agentService.makeWithdraw(withdraw as any));}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Customer NIC" value={withdraw.customer_nic} onChange={e=>setWithdraw({...withdraw, customer_nic: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Account No" value={withdraw.account_no} onChange={e=>setWithdraw({...withdraw, account_no: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Amount" type="number" min={1} value={withdraw.amount} onChange={e=>setWithdraw({...withdraw, amount: Number(e.target.value)})} required />
          </div>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50">{loading?'Processing...':'Make Withdrawal'}</button>
        </form>
      )}

      {active === 'transfer' && (
        <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); run(()=>agentService.accToAccTransfer(transfer as any));}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Sender NIC"
              value={transfer.sender_NIC}
              onChange={e=>setTransfer({...transfer, sender_NIC: e.target.value})}
              required
              maxLength={12}
              pattern="^\d{12}|\d{9}[Vv]$"
              title="Enter 12 digits or 9 digits followed by V/v"
            />
            <input className="border p-2 rounded" placeholder="Sender Account No" value={transfer.sender_account_no} onChange={e=>setTransfer({...transfer, sender_account_no: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Receiver Account No" value={transfer.receiver_account_no} onChange={e=>setTransfer({...transfer, receiver_account_no: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Amount" type="number" min={1} value={transfer.amount} onChange={e=>setTransfer({...transfer, amount: Number(e.target.value)})} required />
          </div>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50">{loading?'Processing...':'Transfer'}</button>
        </form>
      )}
    </div>
  );
};

export default Transactions;