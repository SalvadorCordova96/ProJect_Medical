export type UserRole = 'Admin' | 'Podologo' | 'Recepcion';

export interface User {
  id_usuario: number;
  nombre_usuario: string;
  rol: UserRole;
  email: string;
  activo: boolean;
  clinica_id: number;
  clinica_nombre?: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const ROLE_PERMISSIONS = {
  Admin: [
    'view_dashboard',
    'view_patients',
    'edit_patients',
    'delete_patients',
    'view_appointments',
    'edit_appointments',
    'view_treatments',
    'edit_treatments',
    'view_reports',
    'manage_users',
    'manage_settings',
    'view_finance',
  ],
  Podologo: [
    'view_dashboard',
    'view_patients',
    'edit_patients',
    'view_appointments',
    'edit_appointments',
    'view_treatments',
    'edit_treatments',
    'view_reports',
  ],
  Recepcion: [
    'view_dashboard',
    'view_patients',
    'view_appointments',
    'edit_appointments',
    'view_prospects',
  ],
} as const;
