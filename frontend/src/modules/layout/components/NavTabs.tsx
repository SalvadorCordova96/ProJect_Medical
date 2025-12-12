// ============================================================================
// PESTAÑAS DE NAVEGACIÓN (DESKTOP Y MOBILE)
// ============================================================================

import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../auth/stores/authStore'
import { getTabsForRole } from '../config/navigation.config'

interface NavTabsProps {
  mobile?: boolean
  onNavigate?: () => void
}

export const NavTabs = ({ mobile = false, onNavigate }: NavTabsProps) => {
  const { user } = useAuthStore()
  
  if (!user) return null
  
  const tabs = getTabsForRole(user.rol)
  
  if (mobile) {
    return (
      <nav className="flex flex-col space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} weight="duotone" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {tab.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    )
  }
  
  return (
    <nav className="flex items-center space-x-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={16} weight="duotone" />
            <span className="text-sm">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {tab.badge}
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
