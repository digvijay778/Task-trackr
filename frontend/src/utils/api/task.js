import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api/v1';

// Set up axios defaults for authentication
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// FIXED: Get tasks by fetching the list (since tasks are included in list response)
export const getTasks = async (listId) => {
  try {
    const response = await api.get(`/todo/list/${listId}`); // Fixed: added /todo prefix
    return response.data.tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// FIXED: Added /todo prefix to match backend routes
export const createTask = async (taskData) => {
  const { listId, ...task } = taskData;
  const response = await api.post(`/todo/list/${listId}/task`, task); // Fixed: added /todo prefix
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const { listId, ...task } = taskData;
  const response = await api.put(`/todo/list/${listId}/task/${taskId}`, task); // Fixed: added /todo prefix
  return response.data;
};

export const deleteTask = async (taskId, listId) => {
  const response = await api.delete(`/todo/list/${listId}/task/${taskId}`); // Fixed: added /todo prefix
  return response.data;
};