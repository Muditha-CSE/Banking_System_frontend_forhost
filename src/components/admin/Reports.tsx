import React from 'react';
import { Tab } from '@headlessui/react';
import AgentWiseReport from './reports/AgentWiseReport';
import AccountWiseReport from './reports/AccountWiseReport';
import ActiveFDsReport from './reports/ActiveFDsReport';
import MonthlyInterestReport from './reports/MonthlyInterestReport';
import CustomerActivityReport from './reports/CustomerActivityReport';
import CustomerAccountActivityReport from './reports/CustomerAccountActivityReport';
import LogsExport from './reports/LogsExport';

// Clean, minimal Reports component with internal subtabs for each report plus logs export
const Reports: React.FC = () => {
  const tabs = [
    { name: 'Agent-wise', content: <AgentWiseReport /> },
    { name: 'Account-wise', content: <AccountWiseReport /> },
    { name: 'Active FDs', content: <ActiveFDsReport /> },
    { name: 'Monthly Interest', content: <MonthlyInterestReport /> },
    { name: 'Customer Activity', content: <CustomerActivityReport /> },
    { name: 'Customer Account Activity', content: <CustomerAccountActivityReport /> },
    { name: 'Logs Export', content: <LogsExport /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
      <Tab.Group>
        <Tab.List className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <Tab key={tab.name} className={({ selected }) =>
              `px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                selected ? 'bg-black text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}>{tab.name}</Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabs.map(tab => (
            <Tab.Panel key={tab.name} className="focus:outline-none">
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Reports;