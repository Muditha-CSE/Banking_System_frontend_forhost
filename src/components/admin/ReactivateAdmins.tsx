import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/bankingService';

interface Admin {
  user_id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  is_active: boolean;
  created_by: number;
}

const ReactivateAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactivatingId, setReactivatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDeactivatedAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.listDeactivatedAdmins();
      setAdmins(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch deactivated admins');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeactivatedAdmins();
  }, []);

  const handleReactivate = async (user_id: number) => {
    setReactivatingId(user_id);
    setError(null);
    setSuccess(null);
    try {
      await adminService.reactivateAdmin(user_id);
      setSuccess('Admin reactivated successfully.');
      fetchDeactivatedAdmins();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reactivate admin');
    }
    setReactivatingId(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reactivate Admins</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {success && <p className="text-green-600 mb-2">{success}</p>}
          {admins.length === 0 ? (
            <p>No deactivated admins found.</p>
          ) : (
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Username</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Phone</th>
                  <th className="border px-2 py-1">NIC</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.user_id}>
                    <td className="border px-2 py-1">{admin.username}</td>
                    <td className="border px-2 py-1">{admin.name}</td>
                    <td className="border px-2 py-1">{admin.email}</td>
                    <td className="border px-2 py-1">{admin.phone}</td>
                    <td className="border px-2 py-1">{admin.nic}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        disabled={reactivatingId === admin.user_id}
                        onClick={() => handleReactivate(admin.user_id)}
                      >
                        {reactivatingId === admin.user_id ? 'Reactivating...' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ReactivateAdmins;
