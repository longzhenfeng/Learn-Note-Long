import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  name: string;
  age: number;
  address: string;
  hobbies: string[];
  role: 'admin' | 'user' | 'guest';
}

export const UserService = {
  getAll: () => api.get<{ data: User[] }>('/users'),
  create: (data: Omit<User, 'id'>) => api.post('/users', data),
  update: (id: string, data: Partial<Omit<User, 'id'>>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export interface Article {
  id: string;
  title: string;
  content: string;
}

export const ArticleService = {
  getAll: () => api.get<{ data: Article[] }>('/admin/articles'),
};
