import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutButton = ({ onLogout, className = "" }) => {
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await onLogout();
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`}
      title="Logout"
    >
      <FaSignOutAlt className="w-4 h-4" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
};

export default LogoutButton;
