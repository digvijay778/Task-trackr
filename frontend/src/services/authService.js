import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance for auth requests
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ADD RESPONSE INTERCEPTOR BASED ON SEARCH RESULTS
authApi.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log('Axios interceptor caught error:', error);
    
    if (error.response && error.response.status === 401) {
      // Handle 401 specifically
      console.log('401 Unauthorized detected');
      
      // Create a more specific error message
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      const enhancedError = new Error(errorMessage);
      enhancedError.status = 401;
      enhancedError.response = error.response;
      
      return Promise.reject(enhancedError);
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  // User login with enhanced error handling
  login: async (credentials) => {
    try {
      const response = await authApi.post('/user/login', credentials);

      // Store tokens if login is successful
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }

      return response.data;
    } catch (error) {
      console.error('Login error in authService:', error);
      
      // ✅ ENHANCED ERROR HANDLING BASED ON SEARCH RESULTS
      if (error.status === 401 || (error.response && error.response.status === 401)) {
        throw new Error('Invalid credentials');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed');
      }
    }
  },

  // Rest of your existing methods...
  register: async (userData) => {
    try {
      const response = await authApi.post('/user/register', userData);

      if (response.data.data.token) {
        localStorage.setItem('accessToken', response.data.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      try {
        await authApi.post('/user/logout');
      } catch (serverError) {
        console.warn('Server logout failed:', serverError.message);
      }

      localStorage.removeItem('accessToken');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('accessToken');
      return { success: true };
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await authApi.get('/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      throw new Error(error.response?.data?.message || 'Failed to get user information');
    }
  },

  refreshToken: async () => {
    try {
      const response = await authApi.post('/user/refresh-token');

      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }

      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  isLoggedIn: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await authApi.post('/user/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send password reset email');
    }
  },

  resetPassword: async (userId, token, newPassword) => {
    try {
      const response = await authApi.post(`/user/reset-password/${userId}/${token}`, {
        password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await authApi.post('/user/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await authApi.put('/user/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await authApi.put('/user/update', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
};

export default authService;
