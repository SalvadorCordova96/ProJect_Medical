import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { SignOut } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="w-full justify-start gap-2"
    >
      <SignOut size={20} />
      <span>Cerrar Sesión</span>
    </Button>
  );
};
