import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import authService from '../../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate(); // ✅ FIXED: Use navigate hook
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await authService.requestPasswordReset(email);
      setMessage('Password reset link has been sent to your email address.');
    } catch (err) {
      console.error('Password reset request failed:', err);
      setError('❌ Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Proper navigation function
  const handleBackToLogin = () => {
    console.log('🔄 Navigating back to login...');
    navigate('/'); // Navigate to login page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 to-olive-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-olive-800 text-green p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="text-olive-200">Enter your email to reset your password</p>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olive-600 text-black py-2 px-4 rounded-lg hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* ✅ FIXED: Back to Login Button */}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center text-olive-600 hover:text-olive-800 py-2 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
