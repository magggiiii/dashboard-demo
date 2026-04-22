import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};
