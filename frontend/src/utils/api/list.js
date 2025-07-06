import axios from 'axios';
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:8001/api/v1" : "api/v1";
// const API_BASE_URL = 'http://localhost:8001/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// FIXED: Changed from '/todo/list' to '/todo/lists' to match backend route
export const getLists = async () => {
  try {
    const response = await api.get('/todo/lists'); // Fixed: /lists instead of /list
    return response.data;
  } catch (error) {
    console.error('Error fetching lists:', error);
    throw error;
  }
};

// FIXED: Added /todo prefix to match backend routes
export const createList = async (listData) => {
  try {
    console.log('[API] Creating list:', listData);
    const response = await api.post('/todo/list', listData); // Fixed: added /todo prefix
    return response.data;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

export const updateList = async (listId, listData) => {
  try {
    console.log(`[API] Updating list ${listId}:`, listData);
    const response = await api.put(`/todo/list/${listId}`, listData); // Fixed: added /todo prefix
    return response.data;
  } catch (error) {
    console.error(`Error updating list ${listId}:`, error);
    throw error;
  }
};

export const deleteList = async (listId) => {
  try {
    console.log(`[API] Deleting list ${listId}`);
    const response = await api.delete(`/todo/list/${listId}`); // Fixed: added /todo prefix
    return response.data;
  } catch (error) {
    console.error(`Error deleting list ${listId}:`, error);
    throw error;
  }
};