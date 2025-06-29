import { useState, useEffect } from 'react';
import { FaUser, FaLock, FaAt, FaPhone, FaCheckCircle, FaClipboardList, FaRocket, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';

export default function AuthPage() {
  const { login, register, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    rememberMe: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const errors = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (formData.name.trim().length < 3) {
        errors.name = 'Name must be at least 3 characters';
      }

      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        errors.phone = 'Please enter a valid Indian phone number';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ SUBMIT HANDLER WITH ALERT FOR GUARANTEED ERROR DISPLAY
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage('');
    setFormErrors({});
    
    // Validate form first
    if (!validateForm()) {
      const errorMsg = 'Please fix the errors below and try again.';
      setErrorMessage(errorMsg);
      alert(errorMsg); // ✅ GUARANTEED VISIBILITY
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);

    try {
      let response;
      if (isLogin) {
        response = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
      }

      console.log('Authentication successful:', response);
      
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // ✅ GUARANTEED ERROR DISPLAY WITH ALERT
      let message = '';
      
      if (error.message) {
        const lowerErrorMessage = error.message.toLowerCase();
        
        if (lowerErrorMessage.includes('invalid credentials') || 
            lowerErrorMessage.includes('unauthorized')) {
          message = '❌ Invalid email or password. Please check your credentials and try again.';
          setFormErrors({ 
            email: 'Check your email', 
            password: 'Check your password' 
          });
        } else if (lowerErrorMessage.includes('user not found') || 
                   lowerErrorMessage.includes('email not registered')) {
          message = '❌ No account found with this email address. Please register first.';
          setFormErrors({ email: 'Email not registered' });
        } else if (lowerErrorMessage.includes('user already exists') || 
                   lowerErrorMessage.includes('email already registered')) {
          message = '❌ An account with this email already exists. Please login instead.';
          setFormErrors({ email: 'Email already registered' });
        } else if (lowerErrorMessage.includes('network') || 
                   lowerErrorMessage.includes('connection')) {
          message = '🌐 Network error. Please check your internet connection and try again.';
        } else {
          message = `❌ ${error.message}`;
        }
      } else {
        message = '❌ Authentication failed. Please try again.';
      }
      
      // ✅ SHOW ERROR WITH BOTH ALERT AND STATE
      setErrorMessage(message);
      alert(message); // ✅ GUARANTEED VISIBILITY
      
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear general error when user makes changes
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      rememberMe: false
    });
    setFormErrors({});
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left Side - Nature Image */}
        <div className="relative w-full md:w-1/2 p-8 flex flex-col justify-center text-white bg-[url('https://images.unsplash.com/photo-1476231682828-37e571bc172f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-olive-700 bg-opacity-70"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to TaskTrackr</h1>
            <p className="mb-6">Organize your life, one task at a time.</p>
            <div className="flex items-center space-x-2 mb-4">
              <FaCheckCircle className="text-xl" />
              <span>Plan and prioritize your daily tasks</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <FaClipboardList className="text-xl" />
              <span>Track progress and stay focused</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRocket className="text-xl" />
              <span>Achieve your goals, one task at a time</span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="bg-white w-full md:w-1/2 p-8 md:p-10">
          <div className="text-center mb-8">
            <button 
              onClick={toggleMode}
              className="flex items-center text-olive-600 hover:text-olive-800 mb-4"
            >
              <FaArrowLeft className="mr-2" /> 
              {isLogin ? 'Create an account' : 'Back to login'}
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Login to Your Account' : 'Create an Account'}
            </h2>
          </div>

          {/* ✅ SIMPLE ERROR DISPLAY */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg input-focus focus:outline-none ${
                      formErrors.name ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting || loading}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {formErrors.name}</p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaAt className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg input-focus focus:outline-none ${
                    formErrors.email ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting || loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {formErrors.email}</p>
              )}
            </div>

            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg input-focus focus:outline-none ${
                      formErrors.phone ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="Enter your phone number"
                    disabled={isSubmitting || loading}
                    maxLength="10"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {formErrors.phone}</p>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg input-focus focus:outline-none ${
                    formErrors.password ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  disabled={isSubmitting || loading}
                />
              </div>
              {formErrors.password && (
                <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {formErrors.password}</p>
              )}
              {!isLogin && (
                <div className="text-xs text-gray-500 mt-1">
                  Use 6 or more characters with a mix of letters, numbers & symbols
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-olive-600 focus:ring-olive-500 border-gray-300 rounded"
                    disabled={isSubmitting || loading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm text-olive-600 hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            {!isLogin && (
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    className="h-4 w-4 text-olive-600 focus:ring-olive-500 border-gray-300 rounded"
                    required
                    disabled={isSubmitting || loading}
                  />
                  <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-olive-600 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-olive-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full btn-olive py-2 px-4 rounded-lg font-medium mb-4 ${
                (isSubmitting || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
