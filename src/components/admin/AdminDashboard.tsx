import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import ManageAdmins from './ManageAdmins';
import ManageAgents from './ManageAgents';
import AddBranch from './AddBranch';
import Reports from './Reports';
import { adminService } from '../../services/bankingService';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Restore active tab from localStorage or default to 0
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const saved = localStorage.getItem('adminDashboardTab');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const tabs = [
    { name: 'Manage Admins', component: ManageAdmins },
    { name: 'Manage Agents', component: ManageAgents },
    { name: 'Add Branch', component: AddBranch },
    { name: 'Reports', component: Reports },
  ];

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminDashboardTab', selectedIndex.toString());
  }, [selectedIndex]);

  const handleDeactivateSelf = async () => {
    setIsDeactivating(true);
    try {
      const response = await adminService.deactivateSelf();
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      alert(response.data?.message || 'Your account has been deactivated successfully. You will now be logged out.');
      
      navigate('/login');
    } catch (error: any) {
      console.error('Error deactivating account:', error);
      alert(error.response?.data?.error || 'Failed to deactivate account');
      setIsDeactivating(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-4xl font-bold text-black mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-8">Manage your banking system</p>
          
          {/* Welcome Section */}
          <div className="bg-white border-2 border-gray-200 shadow-lg rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Welcome, Administrator</h2>
                <p className="text-gray-600">You are successfully logged in as an administrator.</p>
              </div>
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Deactivate My Account
              </button>
            </div>
          </div>
          
          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-black mb-4">Confirm Account Deactivation</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to deactivate your admin account? You will be logged out immediately and will not be able to log in again unless reactivated by another administrator.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isDeactivating}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivateSelf}
                    disabled={isDeactivating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeactivating ? 'Deactivating...' : 'Yes, Deactivate'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 rounded-xl bg-white border-2 border-gray-200 p-1 mb-4">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white',
                      selected
                        ? 'bg-black text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-white border-2 border-gray-200 p-6 shadow-lg',
                    'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white'
                  )}
                >
                  <tab.component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;