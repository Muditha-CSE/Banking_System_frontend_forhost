import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import AgentDashboard from './components/agent/AgentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerDashboard from './components/CustomerDashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : user?.role === 'agent' ? (
                  <Navigate to="/agent" replace />
                ) : user?.role === 'public' || user?.role === 'customer' ? (
                  <CustomerDashboard token={user.token} user={{ userId: Number(user.userId), nic: user.username }} />
                ) : (
                  <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-black mb-4">Welcome to Banking System</h1>
                      <p className="text-gray-600">Contact administrator for access.</p>
                    </div>
                  </div>
                )}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/unauthorized" 
            element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
                  <p className="text-gray-600">You don't have permission to access this resource.</p>
                </div>
              </div>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
