import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  metadata?: Record<string, any>;
  order: number;
  createdAt: string;
}

export const chatApi = {
  getAllChats: async (): Promise<any[]> => {
    const response = await api.get('/chats', {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getChatById: async (chatId: string): Promise<any> => {
    const response = await api.get(`/chats/${chatId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getMessages: async (dashboardId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/dashboard/${dashboardId}/messages`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  addMessage: async (dashboardId: string, message: { content: string; role: string; metadata?: Record<string, any> }): Promise<ChatMessage> => {
    const response = await api.post(`/chats/dashboard/${dashboardId}/messages`, message, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  clearMessages: async (dashboardId: string): Promise<void> => {
    await api.delete(`/chats/dashboard/${dashboardId}/messages`, {
      headers: getAuthHeaders(),
    });
  },
};
