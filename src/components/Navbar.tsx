import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link to="/dashboard" className="text-xl font-bold hover:text-gray-600 transition-colors">
                Banking System
              </Link>
            </div>
            {/* Desktop Navigation Links */}
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
          {/* Hamburger menu button for mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {user && (
            <div className="hidden md:flex items-center space-x-4">
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
        {/* Mobile menu, show/hide based on menuOpen state */}
        <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 border border-transparent hover:border-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            {user?.role === 'agent' && (
              <Link
                to="/agent"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 border border-transparent hover:border-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                Agent Dashboard
              </Link>
            )}
            {user && (
              <div className="flex flex-col items-start px-3 py-2">
                <span className="font-medium">{user.username}</span>
                <span className="text-gray-600">({user.role})</span>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-2 bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;