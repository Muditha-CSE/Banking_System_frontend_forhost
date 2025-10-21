
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CustomerDashboardProps {
  token: string;
  user: { userId: number; nic: string };
}


// B Trust branding
const bankingHero =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80'; // Unsplash banking image
const bTrustLogo = '/btrust-logo.svg';

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ token, user }) => {
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
  const res = await axios.get(`https://btrust-dxase2esfxeghcb8.southeastasia-01.azurewebsites.net/api/customer/getCustomerDetails/${user.nic}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomerData(res.data);
      } catch (err: any) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to fetch customer data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [token, user.nic]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg text-blue-700 font-semibold">Loading customer data...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-red-600 text-lg font-bold">{error}</span>
      </div>
    );
  if (!customerData)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-gray-600 text-lg">No data found.</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-100 pb-12">
      {/* Hero Section */}
      <div className="relative w-full h-60 md:h-80 flex items-center justify-center bg-gradient-to-r from-blue-700 via-pink-400 to-yellow-300 rounded-b-3xl shadow-lg mb-8 overflow-hidden">
        <img
          src={bankingHero}
          alt="Banking Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-50 rounded-b-3xl"
        />
        <div className="absolute left-8 top-8 z-20 flex items-center gap-3">
          <img src={bTrustLogo} alt="B Trust Logo" className="w-14 h-14 rounded-full border-4 border-white shadow-lg bg-white" />
          <span className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg tracking-wide" style={{letterSpacing: '0.05em'}}>B Trust</span>
        </div>
        <div className="relative z-10 text-center flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">Welcome to B Trust</h1>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-2">Your trusted partner in modern banking</p>
          <span className="inline-block bg-white/80 text-blue-700 font-bold px-6 py-2 rounded-full shadow-lg text-lg mt-2 animate-bounce">Customer Dashboard</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:space-x-8 mb-8">
          <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-6 mb-4 md:mb-0 border-t-4 border-blue-400">
            <h2 className="text-2xl font-bold text-blue-700 mb-2 flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Customer NIC
            </h2>
            <div className="text-lg font-mono text-gray-700">{customerData.customer_nic}</div>
          </div>
          <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-6 border-t-4 border-pink-400">
            <h2 className="text-2xl font-bold text-pink-700 mb-2 flex items-center gap-2">
              <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" /></svg>
              Total Accounts
            </h2>
            <div className="text-lg font-mono text-gray-700">{customerData.total_accounts}</div>
          </div>
        </div>

        {/* Accounts Section */}
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">Your Accounts</h2>
        {customerData.accounts && customerData.accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {customerData.accounts.map((acc: any) => (
              <div
                key={acc.account_no}
                className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-blue-300 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 opacity-10 text-7xl pointer-events-none select-none">🏦</div>
                <h3 className="text-xl font-bold text-blue-700 mb-1">Account #{acc.account_no} <span className="text-xs text-gray-400">({acc.role})</span></h3>
                <div className="mb-2"><span className="font-semibold text-gray-600">Balance:</span> <span className="text-blue-700 font-bold">Rs. {acc.savings_balance}</span></div>
                {acc.fixed_deposits && acc.fixed_deposits.length > 0 && (
                  <div className="mt-3">
                    <span className="font-semibold text-pink-600">Fixed Deposits:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {acc.fixed_deposits.map((fd: any) => (
                        <li key={fd.fd_account_no} className="mb-1 text-gray-700">
                          <span className="font-bold text-pink-700">FD #{fd.fd_account_no}</span> | Amount: <span className="text-blue-700">Rs. {fd.amount}</span> | Status: <span className="text-green-700">{fd.status}</span><br />
                          <span className="text-xs text-gray-500">Start: {fd.starting_date ? new Date(fd.starting_date).toLocaleDateString() : '-'}</span> | <span className="text-xs text-gray-500">Maturity: {fd.maturity_date ? new Date(fd.maturity_date).toLocaleDateString() : '-'}</span><br />
                          <span className="text-xs text-gray-600">Plan: {fd.plan?.name} ({fd.plan?.duration_months} months @ {fd.plan?.interest_rate}% p.a.)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3">
                  <span className="font-semibold text-blue-600">Transactions:</span>
                  <ul className="list-disc ml-6 mt-1 text-gray-700">
                    <li>Deposits: <span className="font-bold">{acc.transactions.deposits.length}</span> (Total: Rs. {acc.summary.transaction_totals.deposits.total_amount})</li>
                    <li>Withdrawals: <span className="font-bold">{acc.transactions.withdrawals.length}</span> (Total: Rs. {acc.summary.transaction_totals.withdrawals.total_amount})</li>
                    <li>Transfers Sent: <span className="font-bold">{acc.transactions.transfers_sent.length}</span> (Total: Rs. {acc.summary.transaction_totals.transfers_sent.total_amount})</li>
                    <li>Transfers Received: <span className="font-bold">{acc.transactions.transfers_received.length}</span> (Total: Rs. {acc.summary.transaction_totals.transfers_received.total_amount})</li>
                    <li>Savings Interest: <span className="font-bold">{acc.transactions.savings_interest.length}</span> (Total: Rs. {acc.summary.transaction_totals.savings_interest.total_amount})</li>
                    <li>FD Interest: <span className="font-bold">{acc.transactions.fd_interest.length}</span> (Total: Rs. {acc.summary.transaction_totals.fd_interest.total_amount})</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <span className="font-semibold text-purple-700">Net Transaction Flow:</span> <span className="font-bold">Rs. {acc.summary.net_transaction_flow}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-lg">No accounts found for this customer.</div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
