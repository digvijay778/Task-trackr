import React, { useState } from 'react';
import { FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';

const LogoutButton = ({ onLogout, className = "", variant = "default" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      // You could add a toast notification here instead of alert
      alert('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const confirmLogout = () => {
    setShowConfirm(true);
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  // Different button variants
  const variants = {
    default: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl",
    subtle: "bg-gray-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-400 border border-gray-600/50 hover:border-red-500/50",
    minimal: "text-gray-400 hover:text-red-400 hover:bg-red-500/10",
    danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500/50"
  };

  return (
    <>
      <button
        onClick={confirmLogout}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${variants[variant]} ${
          isLoading ? 'opacity-50 cursor-not-allowed transform-none' : ''
        } ${className}`}
        title="Logout"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-current"></div>
        ) : (
          <FaSignOutAlt className="w-4 h-4" />
        )}
        <span className="hidden sm:inline font-medium">
          {isLoading ? 'Logging out...' : 'Logout'}
        </span>
      </button>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <FaExclamationTriangle className="text-white text-lg" />
              </div>
              <h3 className="font-semibold text-lg text-white">Confirm Logout</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your tasks.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelLogout}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform ${
                    isLoading 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-white mr-2"></div>
                      Logging out...
                    </div>
                  ) : (
                    <>
                      <FaSignOutAlt className="inline mr-2" />
                      Yes, Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
