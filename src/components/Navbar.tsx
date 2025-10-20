import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link to="/dashboard" className="text-xl font-bold hover:text-gray-600 transition-colors">
                Banking System
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent hover:border-gray-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user?.role === 'agent' && (
                  <Link
                    to="/agent"
                    className="hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent hover:border-gray-300"
                  >
                    Agent Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-medium">{user.username}</span>
                <span className="text-gray-600 ml-2">({user.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;