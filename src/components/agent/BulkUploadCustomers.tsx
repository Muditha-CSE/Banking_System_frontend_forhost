import React, { useState } from 'react';
import { agentService } from '../../services/bankingService';
import Papa from 'papaparse';
import { useCustomerRefresh } from '../../contexts/CustomerRefreshContext';

interface BulkCustomer {
  username: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  gender: string;
  address: string;
  DOB: string;
  password: string;
}

const BulkUploadCustomers: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<BulkCustomer[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { triggerRefresh } = useCustomerRefresh();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setError('');
      setMessage('');
      parseCsv(file);
    }
  };

  const parseCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError('CSV file is empty or has no data rows');
          return;
        }
        
        // Map the parsed data to BulkCustomer format
        const parsed: BulkCustomer[] = results.data.map((row: any) => ({
          username: (row.username || '').trim(),
          name: (row.name || '').trim(),
          email: (row.email || '').trim(),
          phone: (row.phone || '').trim(),
          nic: (row.nic || '').trim(),
          gender: (row.gender || '').trim(),
          address: (row.address || '').trim(),
          DOB: (row.DOB || '').trim(),
          password: (row.password || '').trim(),
        }));
        
        setCsvData(parsed);
        setShowPreview(true);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file: ' + error.message);
      }
    });
  };

  const submitBulk = async () => {
    if (csvData.length === 0) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await agentService.bulkCreateCustomers(csvData as any);
      setMessage(res.data?.message || `Successfully created ${csvData.length} customers`);
      
      // Reset form
      setCsvFile(null);
      setCsvData([]);
      setShowPreview(false);
      
      // Clear file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Trigger refresh for ManageCustomers component
      triggerRefresh();
      
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to create customers');
    } finally {
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    setCsvFile(null);
    setCsvData([]);
    setShowPreview(false);
    setError('');
    setMessage('');
    
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Upload Customers (CSV)</h2>
      
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

      <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6">
        <h3 className="font-semibold mb-2 text-gray-900">CSV File Format</h3>
        <p className="text-sm text-gray-800 mb-2">
          Your CSV file must have the following columns in this exact order:
        </p>
        <code className="block bg-white p-2 rounded text-xs mb-2 overflow-x-auto">
          username,name,email,phone,nic,gender,address,DOB,password
        </code>
  <p className="text-sm text-gray-800 mb-2">Example:</p>
        <code className="block bg-white p-2 rounded text-xs overflow-x-auto">
          jdoe,John Doe,john@example.com,0771234567,199012345678,male,123 Main St,1990-01-15,password123
        </code>
  <div className="mt-3 text-sm text-gray-800">
          <p className="font-semibold mb-1">Validation Rules:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>NIC: 12 digits or 9 digits + V</li>
            <li>Phone: 10 digits starting with 0, or +94 followed by 9 digits</li>
            <li>Gender: "male" or "female"</li>
            <li>Password: Minimum 8 characters</li>
            <li>DOB: Format YYYY-MM-DD</li>
          </ul>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded p-6">
        <div className="mb-4">
          <label htmlFor="csv-file-input" className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input 
            id="csv-file-input"
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-100 file:text-gray-800
              hover:file:bg-gray-200
              disabled:opacity-50"
          />
        </div>

        {showPreview && csvData.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3 text-lg">
              Preview - {csvData.length} customer{csvData.length !== 1 ? 's' : ''} ready to upload
            </h4>
            
            <div className="border rounded overflow-hidden mb-4">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIC</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.map((customer, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{customer.username}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{customer.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{customer.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{customer.phone}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{customer.nic}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{customer.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                disabled={loading} 
                onClick={submitBulk} 
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Uploading...' : `Upload ${csvData.length} Customer${csvData.length !== 1 ? 's' : ''}`}
              </button>
              <button 
                disabled={loading} 
                onClick={cancelUpload} 
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadCustomers;
