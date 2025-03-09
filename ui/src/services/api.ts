// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api';
console.log('API Base URL set to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  console.log(`Request to ${config.url}:`, config.method, config.data || config.params);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API Error on ${error.config.url}:`, error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.error('The requested resource was not found.');
    }
    return Promise.reject(error);
  }
);

// Chat
export const submitChatMessage = (
  sender_name: string,
  sender_email: string,
  vision: string,
  website_url: string,
  message: string,
  image?: File,
  headers?: { Authorization: string }
) => {
  const formData = new FormData();
  formData.append('sender_name', sender_name);
  formData.append('sender_email', sender_email);
  formData.append('vision', vision);
  formData.append('website_url', website_url);
  formData.append('message', message);
  if (image) formData.append('image', image);
  return api.post('/chat/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data', ...headers },
  });
};

// Content
export const getContent = (headers?: { Authorization: string }) =>
  api.get('/content', headers ? { headers } : undefined);

export const uploadContent = (data: FormData, config: { headers: { Authorization: string } }) => {
  return api.post('/content/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data', // Required for FormData
      ...config.headers, // Spread Authorization
    },
  });
};

export const deleteContent = (id: number, headers?: { Authorization: string }) =>
  api.delete(`/content/${id}`, headers ? { headers } : undefined);

export const getPublicContent = (headers?: { Authorization: string }) =>
  api.get('/content/public', headers ? { headers } : undefined);

// Dashboard
export const getTodos = (headers?: { Authorization: string }) =>
  api.get('/dashboard/todos', headers ? { headers } : undefined);

export const addTodo = (
  title: string,
  priority: 'high' | 'medium' | 'low',
  due_date: string,
  headers?: { Authorization: string }
) =>
  api.post('/dashboard/todos', { title, priority, due_date }, headers ? { headers } : undefined);

export const getChatMessages = (headers?: { Authorization: string }) =>
  api.get('/chat/messages', headers ? { headers } : undefined);

export const submitChatReply = (
  message_id: number,
  reply: string,
  headers?: { Authorization: string }
) =>
  api.post('/chat/reply', { message_id, reply }, headers ? { headers } : undefined);

// Login
export const login = (data: { input: string }, headers?: { Authorization: string }) =>
  api.post('/auth/login', data, headers ? { headers } : undefined);

// Links
export const addLink = (name: string, url: string, headers?: { Authorization: string }) =>
  api.post('/links/add', { name, url }, headers ? { headers } : undefined);

export const getLinks = (headers?: { Authorization: string }) =>
  api.get('/links', headers ? { headers } : undefined);

export const deleteLink = (id: number, headers?: { Authorization: string }) =>
  api.delete(`/links/${id}`, headers ? { headers } : undefined);

export default api;