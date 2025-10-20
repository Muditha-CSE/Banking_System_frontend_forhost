import React, { createContext, useContext, useState, useCallback } from 'react';

interface CustomerRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const CustomerRefreshContext = createContext<CustomerRefreshContextType | undefined>(undefined);

export const CustomerRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <CustomerRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </CustomerRefreshContext.Provider>
  );
};

export const useCustomerRefresh = () => {
  const context = useContext(CustomerRefreshContext);
  if (!context) {
    throw new Error('useCustomerRefresh must be used within CustomerRefreshProvider');
  }
  return context;
};
