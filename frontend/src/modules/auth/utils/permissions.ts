import { UserRole, ROLE_PERMISSIONS } from '../types/auth.types';

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission as any) ?? false;
};

export const canAccess = {
  dashboard: (role: UserRole) => hasPermission(role, 'view_dashboard'),
  patients: (role: UserRole) => hasPermission(role, 'view_patients'),
  editPatients: (role: UserRole) => hasPermission(role, 'edit_patients'),
  deletePatients: (role: UserRole) => hasPermission(role, 'delete_patients'),
  appointments: (role: UserRole) => hasPermission(role, 'view_appointments'),
  treatments: (role: UserRole) => hasPermission(role, 'view_treatments'),
  reports: (role: UserRole) => hasPermission(role, 'view_reports'),
  users: (role: UserRole) => hasPermission(role, 'manage_users'),
  settings: (role: UserRole) => hasPermission(role, 'manage_settings'),
  finance: (role: UserRole) => hasPermission(role, 'view_finance'),
};

export const usePermissions = (role: UserRole) => ({
  canViewDashboard: canAccess.dashboard(role),
  canViewPatients: canAccess.patients(role),
  canEditPatients: canAccess.editPatients(role),
  canDeletePatients: canAccess.deletePatients(role),
  canViewAppointments: canAccess.appointments(role),
  canViewTreatments: canAccess.treatments(role),
  canViewReports: canAccess.reports(role),
  canManageUsers: canAccess.users(role),
  canManageSettings: canAccess.settings(role),
  canViewFinance: canAccess.finance(role),
});
