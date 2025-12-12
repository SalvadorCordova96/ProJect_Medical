// ============================================================================
// HEADER CON BARRA DE NAVEGACIÓN
// ============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { List, X, Bell, Gear } from '@phosphor-icons/react'
import { useAuthStore } from '../../auth/stores/authStore'
import { NavTabs } from './NavTabs'
import { UserMenu } from './UserMenu'
import LogoImage from '@/assets/images/Logo.png'

export const Header = () => {
  const { user } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3)
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img src={LogoImage} alt="PodoSkin Logo" className="h-10 w-auto" />
              
              <div className="hidden md:block">
                <h2 className="font-bold text-gray-900 text-lg">PodoSkin</h2>
                <p className="text-xs text-gray-500 -mt-1">
                  {user?.clinica_nombre || 'Clínica Principal'}
                </p>
              </div>
            </Link>
          </div>
          
          <div className="hidden lg:block flex-1 px-8">
            <NavTabs />
          </div>
          
          <div className="flex items-center space-x-3">
            
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            {user?.rol === 'Admin' && (
              <Link 
                to="/configuraciones"
                className="hidden md:block p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Gear size={20} />
              </Link>
            )}
            
            <UserMenu />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4">
            <NavTabs mobile onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  )
}
