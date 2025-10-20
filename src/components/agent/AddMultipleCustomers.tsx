import React, { useState } from 'react';
import { isValidNIC, isValidMobile } from '../../utils/validation';
import { agentService } from '../../services/bankingService';
import { useCustomerRefresh } from '../../contexts/CustomerRefreshContext';

interface CustomerForm {
  username: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  gender: string;
  address: string;
  DOB: string;
  password: string;
  confirmPassword: string;
}

const AddMultipleCustomers: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [showForms, setShowForms] = useState(false);
  const [customers, setCustomers] = useState<CustomerForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { triggerRefresh } = useCustomerRefresh();

  const handleCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerCount < 1 || customerCount > 50) {
      setError('Please enter a number between 1 and 50');
      return;
    }
    
    // Initialize empty customer forms
    const emptyCustomers: CustomerForm[] = Array(customerCount).fill(null).map(() => ({
      username: '',
      name: '',
      email: '',
      phone: '',
      nic: '',
      gender: '',
      address: '',
      DOB: '',
      password: '',
      confirmPassword: '',
    }));
    
    setCustomers(emptyCustomers);
    setShowForms(true);
    setError('');
    setMessage('');
  };

  const handleCustomerChange = (index: number, field: keyof CustomerForm, value: string) => {
    const updated = [...customers];
    updated[index][field] = value;
    setCustomers(updated);
  };

  const validateCustomer = (customer: CustomerForm, index: number): string | null => {
    if (!customer.username.trim()) return `Customer ${index + 1}: Username is required`;
    if (!customer.name.trim()) return `Customer ${index + 1}: Name is required`;
    if (!customer.email.trim()) return `Customer ${index + 1}: Email is required`;
    if (!customer.phone.trim()) return `Customer ${index + 1}: Phone is required`;
    if (!customer.nic.trim()) return `Customer ${index + 1}: NIC is required`;
    if (!customer.gender) return `Customer ${index + 1}: Gender is required`;
    if (!customer.address.trim()) return `Customer ${index + 1}: Address is required`;
    if (!customer.DOB) return `Customer ${index + 1}: Date of Birth is required`;
  if (!customer.password) return `Customer ${index + 1}: Password is required`;
  if (!customer.confirmPassword) return `Customer ${index + 1}: Confirm Password is required`;
    
    if (!isValidNIC(customer.nic)) {
      return `Customer ${index + 1}: Invalid NIC. Must be 12 digits or 9 digits followed by V/v`;
    }
    if (!isValidMobile(customer.phone)) {
      return `Customer ${index + 1}: Invalid phone number. Must be 10 digits starting with 0 or +94 followed by 9 digits`;
    }
    if (customer.password.length < 8) {
      return `Customer ${index + 1}: Password must be at least 8 characters long`;
    }
    if (customer.password !== customer.confirmPassword) {
      return `Customer ${index + 1}: Passwords do not match`;
    }
    
    return null;
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Validate all customers
    for (let i = 0; i < customers.length; i++) {
      const validationError = validateCustomer(customers[i], i);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    // Check for duplicate usernames within the batch
    const usernames = customers.map(c => c.username.toLowerCase());
    const duplicates = usernames.filter((u, i) => usernames.indexOf(u) !== i);
    if (duplicates.length > 0) {
      setError(`Duplicate username found within batch: ${duplicates[0]}`);
      return;
    }
    
    // Check for duplicate NICs within the batch
    const nics = customers.map(c => c.nic.toUpperCase());
    const duplicateNICs = nics.filter((n, i) => nics.indexOf(n) !== i);
    if (duplicateNICs.length > 0) {
      setError(`Duplicate NIC found within batch: ${duplicateNICs[0]}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Normalize data and exclude confirmPassword from payload
      const normalized = customers.map(c => ({
        username: c.username,
        name: c.name,
        email: c.email,
        phone: c.phone,
        nic: c.nic,
        gender: c.gender.toLowerCase(),
        address: c.address,
        DOB: c.DOB,
        password: c.password,
      }));
      
      const response = await agentService.bulkCreateCustomers(normalized as any);
      setMessage(response.data?.message || `Successfully created ${customers.length} customers`);
      
      // Reset form
      setShowForms(false);
      setCustomerCount(0);
      setCustomers([]);
      
      // Trigger refresh for ManageCustomers component
      triggerRefresh();
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add customers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForms(false);
    setCustomerCount(0);
    setCustomers([]);
    setError('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Multiple Customers</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded">
          {message}
        </div>
      )}

      {!showForms ? (
        <div className="bg-white border border-gray-300 rounded p-6 max-w-md">
          <form onSubmit={handleCountSubmit}>
            <label htmlFor="customerCount" className="block text-sm font-medium text-gray-700 mb-2">
              How many customers do you want to add?
            </label>
            <input
              type="number"
              id="customerCount"
              min="1"
              max="50"
              value={customerCount || ''}
              onChange={(e) => setCustomerCount(parseInt(e.target.value) || 0)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black mb-4"
              placeholder="Enter number (1-50)"
              required
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-900 font-medium"
            >
              Continue
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmitAll}>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Enter details for {customerCount} customer{customerCount !== 1 ? 's' : ''}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>

          <div className="space-y-8">
            {customers.map((customer, index) => (
              <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <h4 className="text-md font-semibold mb-4 text-gray-900">
                  Customer {index + 1} of {customerCount}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.username}
                      onChange={(e) => handleCustomerChange(index, 'username', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => handleCustomerChange(index, 'name', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => handleCustomerChange(index, 'email', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => handleCustomerChange(index, 'phone', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                      placeholder="0771234567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.nic}
                      onChange={(e) => handleCustomerChange(index, 'nic', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                      placeholder="199012345678 or 901234567V"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={customer.gender}
                      onChange={(e) => handleCustomerChange(index, 'gender', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={customer.DOB}
                      onChange={(e) => handleCustomerChange(index, 'DOB', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={customer.password}
                      onChange={(e) => handleCustomerChange(index, 'password', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                      placeholder="Min 8 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={customer.confirmPassword}
                      onChange={(e) => handleCustomerChange(index, 'confirmPassword', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                      placeholder="Re-enter password"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.address}
                      onChange={(e) => handleCustomerChange(index, 'address', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 justify-end sticky bottom-4 bg-white p-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Adding Customers...' : `Add All ${customerCount} Customers`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddMultipleCustomers;
