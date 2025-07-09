// src/components/UI/LoadingSpinner.jsx
import { FaRocket, FaTasks } from 'react-icons/fa';

export default function LoadingSpinner({ message = "Loading...", size = "default" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6", 
    large: "h-8 w-8"
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center space-y-4 border border-gray-700/50 shadow-2xl">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2 animate-pulse">
            <FaTasks className="text-2xl text-white" />
          </div>
          {/* Spinning ring around logo */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-blue-500 animate-spin"></div>
        </div>

        {/* Main spinner and text */}
        <div className="flex items-center space-x-3">
          <div className={`animate-spin rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 ${sizeClasses[size]}`}></div>
          <span className="text-gray-200 font-medium">{message}</span>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
