// ============================================================================
// TIPOS DEL LAYOUT Y NAVEGACIÓN
// ============================================================================

import { UserRole } from '../../auth/types/auth.types'

export interface NavTab {
  id: string
  label: string
  path: string
  icon: any
  allowedRoles: UserRole[]
  badge?: number
}
