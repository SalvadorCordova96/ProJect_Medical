// ============================================================================
// LAYOUT PRINCIPAL DE LA APLICACIÓN
// ============================================================================

import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { FloatingChatbot } from '../../chatbot/components/FloatingChatbot'

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Outlet />
      </main>
      
      <FloatingChatbot />
    </div>
  )
}
