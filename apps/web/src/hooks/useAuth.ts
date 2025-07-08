import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import type { LoginRequest } from '../types/auth';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();
  const navigate = useNavigate();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    if (profileData && isAuthenticated) {
      setUser(profileData);
    }
  }, [profileData, isAuthenticated, setUser]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      login(data.access_token, data.user);
      navigate('/reports');
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    isLoadingProfile,
  };
}
