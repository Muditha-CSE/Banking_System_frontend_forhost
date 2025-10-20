import React, { useState, useEffect } from 'react';
import AddAdmin from './AddAdmin';
import ReactivateAdmins from './ReactivateAdmins';

const ManageAdmins: React.FC = () => {
  // Restore active sub-tab from localStorage or default to 'add'
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'reactivate'>(() => {
    const saved = localStorage.getItem('manageAdminsSubTab');
    return (saved as 'add' | 'reactivate') || 'add';
  });

  const subTabs = [
    { id: 'add', name: 'Add Admin' },
    { id: 'reactivate', name: 'Reactivate Admins' },
  ];

  // Save active sub-tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('manageAdminsSubTab', activeSubTab);
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Manage Admins</h2>
        
        {/* Sub-tabs */}
        <div className="border-b-2 border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'add' && <AddAdmin />}
      {activeSubTab === 'reactivate' && <ReactivateAdmins />}
    </div>
  );
};

export default ManageAdmins;
