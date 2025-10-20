import React, { useState } from 'react';
import AddCustomer from './AddCustomer';
import AddMultipleCustomers from './AddMultipleCustomers';
import BulkUploadCustomers from './BulkUploadCustomers';
import ManageCustomers from './ManageCustomers';
import { CustomerRefreshProvider } from '../../contexts/CustomerRefreshContext';

const CustomerManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'add-single' | 'add-multiple' | 'bulk-upload' | 'manage'>('add-single');

  const subTabs = [
    { id: 'add-single', name: 'Add Customer', component: AddCustomer },
    { id: 'add-multiple', name: 'Add Multiple', component: AddMultipleCustomers },
    { id: 'bulk-upload', name: 'Bulk Upload (CSV)', component: BulkUploadCustomers },
    { id: 'manage', name: 'Manage Customers', component: ManageCustomers },
  ];

  const ActiveSubComponent = subTabs.find(tab => tab.id === activeSubTab)?.component || AddCustomer;

  return (
    <CustomerRefreshProvider>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Management</h2>
        
        {/* Sub-tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            {subTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSubTab === subTab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {subTab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Sub-component Content */}
        <div className="mt-6">
          <ActiveSubComponent />
        </div>
      </div>
    </CustomerRefreshProvider>
  );
};

export default CustomerManagement;
