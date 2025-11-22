import axios from 'axios';
import { User, Group, Message, Conversation } from '../types';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, username: string) => {
    const response = await api.post('/auth/register', { email, password, username });
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  sendDirect: async (recipientId: number, content: string) => {
    const response = await api.post('/messages/direct', { recipient_id: recipientId, content });
    return response.data;
  },

  sendGroup: async (groupId: number, content: string) => {
    const response = await api.post('/messages/group', { group_id: groupId, content });
    return response.data;
  },

  getDirectMessages: async (userId: number, limit = 50): Promise<{ messages: Message[]; otherUser: User }> => {
    const response = await api.get(`/messages/direct/${userId}?limit=${limit}`);
    return response.data;
  },

  getGroupMessages: async (groupId: number, limit = 50): Promise<{ messages: Message[]; group: Group }> => {
    const response = await api.get(`/messages/group/${groupId}?limit=${limit}`);
    return response.data;
  },

  getConversations: async (): Promise<{ conversations: Conversation[] }> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getAllMessages: async (limit = 100): Promise<{ messages: Message[] }> => {
    const response = await api.get(`/messages/all?limit=${limit}`);
    return response.data;
  },
};

// Groups API
export const groupsAPI = {
  create: async (name: string, description?: string): Promise<{ group: Group }> => {
    const response = await api.post('/groups', { name, description });
    return response.data;
  },

  getAll: async (): Promise<{ groups: Group[] }> => {
    const response = await api.get('/groups');
    return response.data;
  },

  getMy: async (): Promise<{ groups: Group[] }> => {
    const response = await api.get('/groups/my');
    return response.data;
  },

  getById: async (id: number): Promise<{ group: Group; members: any[] }> => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  join: async (id: number): Promise<{ group: Group }> => {
    const response = await api.post(`/groups/${id}/join`);
    return response.data;
  },

  leave: async (id: number) => {
    const response = await api.post(`/groups/${id}/leave`);
    return response.data;
  },

  addMember: async (groupId: number, userId: number) => {
    const response = await api.post(`/groups/${groupId}/members`, { user_id: userId });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  search: async (query: string): Promise<{ users: User[] }> => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getAll: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<{ user: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

export default api;