import { useState, useEffect } from "react";
import {
  FaUser,
  FaLock,
  FaAt,
  FaPhone,
  FaCheckCircle,
  FaClipboardList,
  FaRocket,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

export default function AuthPage() {
  const { login, register, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const errors = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        errors.name = "Name is required";
      } else if (formData.name.trim().length < 3) {
        errors.name = "Name must be at least 3 characters";
      }

      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        errors.phone = "Please enter a valid Indian phone number";
      }
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ SUBMIT HANDLER WITH ALERT FOR GUARANTEED ERROR DISPLAY
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrorMessage("");
    setFormErrors({});

    // Validate form first
    if (!validateForm()) {
      const errorMsg = "Please fix the errors below and try again.";
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
          password: formData.password,
        });
      } else {
        response = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      }

      console.log("Authentication successful:", response);
    } catch (error) {
      console.error("Authentication failed:", error);

      // ✅ GUARANTEED ERROR DISPLAY WITH ALERT
      let message = "";

      if (error.message) {
        const lowerErrorMessage = error.message.toLowerCase();

        if (
          lowerErrorMessage.includes("invalid credentials") ||
          lowerErrorMessage.includes("unauthorized")
        ) {
          message =
            "❌ Invalid email or password. Please check your credentials and try again.";
          setFormErrors({
            email: "Check your email",
            password: "Check your password",
          });
        } else if (
          lowerErrorMessage.includes("user not found") ||
          lowerErrorMessage.includes("email not registered")
        ) {
          message =
            "❌ No account found with this email address. Please register first.";
          setFormErrors({ email: "Email not registered" });
        } else if (
          lowerErrorMessage.includes("user already exists") ||
          lowerErrorMessage.includes("email already registered")
        ) {
          message =
            "❌ An account with this email already exists. Please login instead.";
          setFormErrors({ email: "Email already registered" });
        } else if (
          lowerErrorMessage.includes("network") ||
          lowerErrorMessage.includes("connection")
        ) {
          message =
            "🌐 Network error. Please check your internet connection and try again.";
        } else {
          message = `❌ ${error.message}`;
        }
      } else {
        message = "❌ Authentication failed. Please try again.";
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
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }

    // Clear general error when user makes changes
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      rememberMe: false,
    });
    setFormErrors({});
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 flex flex-col lg:flex-row">
        
        {/* Left Side - Brand Section */}
        <div className="relative w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center text-white bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900">
          
          {/* Base gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/40"></div>

          {/* Simple dot pattern alternative */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>

          <div className="relative z-10">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FaRocket className="text-2xl text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome to TaskTrackr
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Organize your life, one task at a time with our powerful
                productivity platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-lg text-white" />
                </div>
                <span className="text-gray-200 font-medium">
                  Plan and prioritize your daily tasks
                </span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <FaClipboardList className="text-lg text-white" />
                </div>
                <span className="text-gray-200 font-medium">
                  Track progress and stay focused
                </span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <FaRocket className="text-lg text-white" />
                </div>
                <span className="text-gray-200 font-medium">
                  Achieve your goals, one task at a time
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-gray-900/95 backdrop-blur-xl w-full lg:w-1/2 p-8 lg:p-12">
          <div className="mb-8">
            <button
              onClick={toggleMode}
              className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200 group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              {isLogin ? "Create an account" : "Back to login"}
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400">
              {isLogin
                ? "Sign in to your account to continue"
                : "Join us and start organizing your tasks"}
            </p>
          </div>

          {/* Error Display */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-2 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      formErrors.name
                        ? "border-red-500 bg-red-900/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting || loading}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-red-400 text-sm mt-2 font-medium flex items-center">
                    <span className="mr-1">⚠️</span> {formErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaAt className="text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.email
                      ? "border-red-500 bg-red-900/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting || loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-400 text-sm mt-2 font-medium flex items-center">
                  <span className="mr-1">⚠️</span> {formErrors.email}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-2 font-medium">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      formErrors.phone
                        ? "border-red-500 bg-red-900/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    placeholder="Enter your phone number"
                    disabled={isSubmitting || loading}
                    maxLength="10"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-red-400 text-sm mt-2 font-medium flex items-center">
                    <span className="mr-1">⚠️</span> {formErrors.phone}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.password
                      ? "border-red-500 bg-red-900/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  placeholder={
                    isLogin ? "Enter your password" : "Create a password"
                  }
                  disabled={isSubmitting || loading}
                />
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-sm mt-2 font-medium flex items-center">
                  <span className="mr-1">⚠️</span> {formErrors.password}
                </p>
              )}
              {!isLogin && (
                <div className="text-xs text-gray-500 mt-2">
                  Use 6 or more characters with a mix of letters, numbers &
                  symbols
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-gray-800 border-gray-600 rounded"
                    disabled={isSubmitting || loading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {!isLogin && (
              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-gray-800 border-gray-600 rounded mt-1"
                    required
                    disabled={isSubmitting || loading}
                  />
                  <label
                    htmlFor="agreeTerms"
                    className="ml-3 block text-sm text-gray-300"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isSubmitting || loading
                  ? "opacity-50 cursor-not-allowed transform-none"
                  : "shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
