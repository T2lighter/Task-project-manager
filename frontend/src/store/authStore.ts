import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response.data;
    
    // 保存到localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // 更新状态
    set({ user });
  },
  
  register: async (username: string, password: string, email: string) => {
    await api.post('/auth/register', { username, password, email });
    // 注册成功后自动登录
    await useAuthStore.getState().login(username, password);
  },
  
  logout: () => {
    // 清除localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 更新状态
    set({ user: null });
  }
}));