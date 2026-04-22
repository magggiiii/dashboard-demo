import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-logout and redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface ConnectedSource {
  id: string;
  name: string;
  type: 'file' | 'sheet';
  url?: string;
  fileId?: string;
  createdAt?: string;
}

export interface DashboardData {
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  elements: any[];
  layout?: any[];
  data?: Record<string, any>;
  connectedSource?: ConnectedSource | null;
  connectedSources?: ConnectedSource[];
}

export interface ChartData {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  data: Record<string, any>[];
  isActive: boolean;
}

export interface DashboardResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  charts: ChartData[];
  chat: any;
  data?: Record<string, any>;
  connectedSource?: ConnectedSource | null;
  connectedSources?: ConnectedSource[];
  createdAt: string;
  updatedAt: string;
}

export interface FileResponse {
  id: string;
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export const fileApi = {
  upload: async (file: File, dashboardId?: string): Promise<FileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const params = dashboardId ? `?dashboardId=${encodeURIComponent(dashboardId)}` : '';
    const response = await api.post(`/files/upload${params}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (): Promise<FileResponse[]> => {
    const response = await api.get('/files', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getByDashboard: async (dashboardId: string): Promise<FileResponse[]> => {
    const response = await api.get(`/files/dashboard/${dashboardId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getById: async (id: string): Promise<FileResponse> => {
    const response = await api.get(`/files/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getSignedUrl: async (id: string): Promise<string> => {
    const response = await api.get(`/files/${id}/url`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  update: async (id: string, data: { dashboardId?: string }): Promise<FileResponse> => {
    const response = await api.patch(`/files/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export const dashboardApi = {
  create: async (data: { name: string; description?: string; connectedSource?: ConnectedSource | null; connectedSources?: ConnectedSource[] }): Promise<DashboardResponse> => {
    const response = await api.post('/dashboards', data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getAll: async (signal?: AbortSignal): Promise<DashboardResponse[]> => {
    const response = await api.get('/dashboards', {
      headers: getAuthHeaders(),
      signal,
    });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<DashboardResponse> => {
    const response = await api.get(`/dashboards/${id}`, {
      headers: getAuthHeaders(),
      signal,
    });
    return response.data;
  },

  update: async (id: string, data: Partial<DashboardData>): Promise<DashboardResponse> => {
    const response = await api.put(`/dashboards/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/dashboards/${id}`, {
      headers: getAuthHeaders(),
    });
  },
};
