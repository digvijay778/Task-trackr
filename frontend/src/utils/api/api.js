import axios from 'axios';

const BASE_URL = import.meta.env.MODE_ENV === "development" ? "http://localhost:5001/api" : "/api";
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Attaching token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);  // Add this line
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Interceptor caught 401 error');
    // Check for 401 error and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(
+   `${BASE_URL}/user/refresh`,
    {},
          { withCredentials: true }
        );
        console.log('Refresh response:', refreshResponse);
        const newToken = refreshResponse.data.token;
        console.log('New token:', newToken);
        localStorage.setItem('token', newToken);

        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect
        localStorage.removeItem('token');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;
