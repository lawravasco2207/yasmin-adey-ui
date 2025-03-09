// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000/api'; // Local port 10000 with /api
console.log('API Base URL set to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Switch to 'token'
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Use Authorization header
  }
  console.log(`Request to ${config.url}:`, config.method, config.data || config.params);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API Error on ${error.config.url}:`, error.response?.data || error.message);
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
  image?: File
) => {
  const formData = new FormData();
  formData.append('sender_name', sender_name);
  formData.append('sender_email', sender_email);
  formData.append('vision', vision);
  formData.append('website_url', website_url);
  formData.append('message', message);
  if (image) formData.append('image', image);
  return api.post('/chat/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Content
export const getContent = () => api.get('/content');
export const uploadContent = (formData: FormData) => {
  console.log('Uploading to /content/upload with:', Array.from(formData.entries()));
  return api.post('/content/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteContent = (id: number) => api.delete(`/content/${id}`);
export const getPublicContent = () => api.get('/content/public');

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
export const login = (data: { input: string }) => api.post('/auth/login', data);

// Links
export const addLink = (name: string, url: string) => api.post('/links/add', { name, url });
export const getLinks = () => api.get('/links');
export const deleteLink = (id: number) => api.delete(`/links/${id}`);

export default api;