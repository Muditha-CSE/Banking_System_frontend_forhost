import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerManagement from './CustomerManagement';
import SavingsAccountManagement from './SavingsAccountManagement';
import FixedDepositManagement from './FixedDepositManagement';
import Transactions from './transactions';
import JointAccountManagement from './JointAccountManagement';

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Restore active tab from localStorage or default to 'customers'
  const [activeTab, setActiveTab] = useState<
    'customers' | 'savings' | 'joint-accounts' | 'fixed-deposits' | 'transactions'
  >(() => {
    const saved = localStorage.getItem('agentDashboardTab');
    return (saved as any) || 'customers';
  });

  const tabs = [
    { id: 'customers', name: 'Customer Management', component: CustomerManagement },
    { id: 'savings', name: 'Savings Account Management', component: SavingsAccountManagement },
    { id: 'joint-accounts', name: 'Joint Account Management', component: JointAccountManagement },
    { id: 'fixed-deposits', name: 'Fixed Deposit Management', component: FixedDepositManagement },
    { id: 'transactions', name: 'Transactions', component: Transactions },
  ];

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agentDashboardTab', activeTab);
  }, [activeTab]);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || CustomerManagement;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-black">Agent Dashboard</h1>
              <span className="ml-4 text-sm text-gray-600">Welcome, {user?.username}</span>
            </div>
            {/* Logout handled by global Navbar; local red button removed per request */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b-2 border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;