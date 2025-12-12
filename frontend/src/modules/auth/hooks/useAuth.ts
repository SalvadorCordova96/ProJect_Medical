import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error, login, logout, clearError } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
};
