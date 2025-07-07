import axios from 'axios';
const BASE_URL = import.meta.env.MODE_ENV === "development" ? "http://localhost:5000/api/v1" : "/api/v1";

// Create axios instance with default configuration
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await api.post('/user/refresh-token');
                const newToken = refreshResponse.data.data.accessToken;
                localStorage.setItem('accessToken', newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const todoService = {
    // ✅ FIXED: Get all todo lists (matches your backend route)
    getLists: async () => {
        try {
            const response = await api.get('/todolists'); // Changed from /todos to /todolists
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch todo lists');
        }
    },

    getAllTodoLists: async () => {
        try {
            const response = await api.get('/todolists'); // Changed from /todos to /todolists
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch todo lists');
        }
    },

    // ✅ FIXED: Create a new todo list
    createTodoList: async (listData) => {
        try {
            const response = await api.post('/todolists', listData); // Changed from /todos to /todolists
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create todo list');
        }
    },

    // ✅ FIXED: Update a todo list
    updateTodoList: async (listId, listData) => {
        try {
            const response = await api.put(`/todolists/${listId}`, listData); // Changed from /todos to /todolists
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update todo list');
        }
    },

    // ✅ FIXED: Delete a todo list
    deleteTodoList: async (listId) => {
        try {
            const response = await api.delete(`/todolists/${listId}`); // Changed from /todos to /todolists
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete todo list');
        }
    },

    // ✅ FIXED: Get specific todo list with tasks
    getTodoListById: async (listId) => {
        try {
            const response = await api.get(`/todolists/${listId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch todo list');
        }
    },

    // ✅ FIXED: Archive/unarchive todo list
    toggleArchive: async (listId) => {
        try {
            const response = await api.patch(`/todolists/${listId}/archive`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to toggle archive status');
        }
    },

    // ✅ TASK METHODS - Updated to match your backend routes
    
    // Get tasks for a specific todo list
    getTasksByTodoList: async (todoListId) => {
        try {
            const response = await api.get(`/tasks/todolist/${todoListId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
        }
    },

    // Create a new task
    addTask: async (taskData) => {
        try {
            const response = await api.post('/tasks', taskData); // Changed to /tasks endpoint
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add task');
        }
    },

    // Update a task
    updateTask: async (taskId, taskData) => {
        try {
            const response = await api.put(`/tasks/${taskId}`, taskData); // Changed to /tasks endpoint
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update task');
        }
    },

    // Delete a task
    deleteTask: async (taskId) => {
        try {
            const response = await api.delete(`/tasks/${taskId}`); // Changed to /tasks endpoint
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete task');
        }
    },

    // Toggle task completion
    toggleTask: async (taskId) => {
        try {
            const response = await api.patch(`/tasks/${taskId}/toggle`); // Changed to /tasks endpoint
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to toggle task');
        }
    },

    // Get specific task
    getTaskById: async (taskId) => {
        try {
            const response = await api.get(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch task');
        }
    },

    // Bulk operations
    deleteMultipleTasks: async (taskIds) => {
        try {
            const response = await api.delete('/tasks/bulk', { data: { taskIds } });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete tasks');
        }
    },

    markMultipleTasksCompleted: async (taskIds) => {
        try {
            const response = await api.patch('/tasks/bulk/complete', { taskIds });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to complete tasks');
        }
    },

    // ✅ FIXED: Get todo statistics
    getStats: async () => {
        try {
            const response = await api.get('/todolists/stats'); // Changed from /todos/stats to /todolists/stats
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
};

export default todoService;
