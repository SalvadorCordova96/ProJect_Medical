// ============================================================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ============================================================================

import {
  House,
  CalendarBlank,
  ClipboardText,
  Gear
} from '@phosphor-icons/react'
import { NavTab } from '../types/layout.types'

export const NAVIGATION_TABS: NavTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: House,
    allowedRoles: ['Admin', 'Podologo', 'Recepcion'],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    path: '/agenda',
    icon: CalendarBlank,
    allowedRoles: ['Admin', 'Podologo', 'Recepcion'],
  },
  {
    id: 'historial-pacientes',
    label: 'Historial Pacientes',
    path: '/historial-pacientes',
    icon: ClipboardText,
    allowedRoles: ['Admin', 'Podologo'],
  },
  {
    id: 'configuraciones',
    label: 'Configuraciones',
    path: '/configuraciones',
    icon: Gear,
    allowedRoles: ['Admin'],
  },
]

export const getTabsForRole = (role: string): NavTab[] => {
  return NAVIGATION_TABS.filter(tab => 
    tab.allowedRoles.includes(role as any)
  )
}
