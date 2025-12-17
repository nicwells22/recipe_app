import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { handleApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User, AuthTokens } from '@/types';

interface LoginData {
  email: string;
}

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setTokens, logout: storeLogout, isAuthenticated } = useAuthStore();

  // Get user from store instead of fetching on every mount
  const user = useAuthStore((state) => state.user);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthTokens>('/auth/login', { email: data.email });
      return response.data;
    },
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token);
      // Fetch user data with the new token
      try {
        const userResponse = await api.get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        setUser(userResponse.data);
      } catch (e) {
        console.error('Failed to fetch user after login:', e);
      }
      toast.success('Welcome back!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const logout = () => {
    storeLogout();
    queryClient.clear();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
