import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
    copilotLanguage?: string;
    aiKnowledgeLevel?: number;
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
};

// Content API
export const contentAPI = {
  getModules: async () => {
    const response = await apiClient.get('/content/modules');
    return response.data;
  },

  getModule: async (moduleId: number) => {
    const response = await apiClient.get(`/content/modules/${moduleId}`);
    return response.data;
  },

  getStep: async (stepId: number) => {
    const response = await apiClient.get(`/content/steps/${stepId}`);
    return response.data;
  },

  updateProgress: async (progressData: {
    stepId: number;
    status: string;
    progressPercent?: number;
    lastScreen?: number;
  }) => {
    const response = await apiClient.post('/content/progress', progressData);
    return response.data;
  },

  getProgress: async () => {
    const response = await apiClient.get('/content/progress');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  logEvent: async (eventData: {
    eventType: string;
    moduleId: number;
    stepId: number;
    screenId?: number;
    eventData?: any;
  }) => {
    const response = await apiClient.post('/analytics/events', eventData);
    return response.data;
  },

  getEvents: async (limit = 100, offset = 0) => {
    const response = await apiClient.get(`/analytics/events?limit=${limit}&offset=${offset}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData: {
    name?: string;
    department?: string;
    copilotLanguage?: string;
    aiKnowledgeLevel?: number;
  }) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
};

// Helper functions for auth state management
export const authHelpers = {
  setAuthData: (token: string, user: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  getAuthData: () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  },

  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default apiClient;
