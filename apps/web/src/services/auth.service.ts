import { apiRequest } from '../lib/api';
import type { LoginRequest, LoginResponse, User } from '../types/auth';

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getProfile(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  async updateProfile(data: UpdateProfileDto): Promise<User> {
    return apiRequest<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
