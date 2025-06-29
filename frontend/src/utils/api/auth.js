import api from './api.js';

// Token management utilities
const TOKEN_KEY = 'auth_token';

const tokenManager = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        // Also set it in the API instance for immediate use
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },
  
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      // Remove from API headers
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
  
  isTokenValid: () => {
    const token = tokenManager.getToken();
    if (!token) return false;
    
    try {
      // Basic JWT validation - check if it's not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
};

// Initialize token in API headers if it exists
const initializeAuth = () => {
  const token = tokenManager.getToken();
  if (token && tokenManager.isTokenValid()) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    // Token exists but is invalid, remove it
    tokenManager.removeToken();
  }
};

// Register a new user
const register = async (userData) => {
  try {
    const response = await api.post('/user/register', userData);
    
    // Extract token from response
    const token = response.data.token || 
                 response.data.data?.token || 
                 response.data.accessToken || 
                 response.data.data?.accessToken;
    
    if (token) {
      tokenManager.setToken(token);
      console.log('Token stored after registration');
    } else {
      console.warn('No token received in registration response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login a user
const login = async (credentials, rememberMe = false) => {
  try {
    const response = await api.post('/user/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe
    });
    
    // Extract token from response
    const token = response.data.token || 
                 response.data.data?.token || 
                 response.data.accessToken || 
                 response.data.data?.accessToken;
    
    if (token) {
      tokenManager.setToken(token);
      console.log('Token stored after login');
    } else {
      console.warn('No token received in login response');
      throw new Error('Authentication successful but no token received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Logout the current user
const logout = async () => {
  try {
    // Try to call the logout endpoint
    await api.post('/user/logout');
  } catch (error) {
    console.error('Logout API error:', error);
    // Don't throw here - we still want to clear local storage
  } finally {
    // Always clear local storage regardless of API response
    tokenManager.removeToken();
    console.log('Token cleared on logout');
  }
};

// Get the current logged-in user
const getCurrentUser = async () => {
  try {
    const response = await api.get('/user/me'); // or '/auth/me' based on your backend
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    
    // If token is invalid, clear it
    if (error.response?.status === 401) {
      tokenManager.removeToken();
    }
    
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

// Update user profile
const updateProfile = async (userData) => {
  try {
    const response = await api.put('/user/update', userData); // or '/auth/update'
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response?.data || { message: 'Profile update failed' };
  }
};

// Change password
const changePassword = async (passwords) => {
  try {
    await api.put('/user/change-password', passwords); // or '/auth/change-password'
  } catch (error) {
    console.error('Change password error:', error);
    throw error.response?.data || { message: 'Password change failed' };
  }
};

// Request password reset
const forgotPassword = async (email) => {
  try {
    await api.post('/user/forgot-password', { email }); // or '/auth/forgot-password'
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error.response?.data || { message: 'Password reset request failed' };
  }
};

// Reset password with token
const resetPassword = async (token, newPassword) => {
  try {
    await api.post(`/user/reset-password/${token}`, { newPassword }); // or '/auth/reset-password'
  } catch (error) {
    console.error('Reset password error:', error);
    throw error.response?.data || { message: 'Password reset failed' };
  }
};

// Check authentication status
const isAuthenticated = () => {
  return tokenManager.isTokenValid();
};

// Get stored token
const getToken = () => {
  return tokenManager.getToken();
};

// Initialize authentication on module load
initializeAuth();

// Export the auth service
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  getToken,
  initializeAuth // Export for manual initialization if needed
};

export default authService;