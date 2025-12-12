// ============================================================================
// COMPONENTE: RUTA PROTEGIDA CON RBAC
// ============================================================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../modules/auth/stores/authStore'
import { UserRole } from '../modules/auth/types/auth.types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!user?.rol) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <Outlet />
}
