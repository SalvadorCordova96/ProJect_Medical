// ============================================================================
// TARJETA DE BIENVENIDA
// ============================================================================

import { User } from '../../auth/types/auth.types'
import { Sparkle } from '@phosphor-icons/react'

interface WelcomeCardProps {
  user: User | null
}

export const WelcomeCard = ({ user }: WelcomeCardProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 18) return '¡Buenas tardes'
    return '¡Buenas noches'
  }
  
  return (
    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkle size={24} weight="duotone" className="text-yellow-300" />
              <span className="text-blue-100 text-sm font-medium">
                {new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.nombre_usuario}!
            </h1>
            
            <p className="text-blue-100 text-lg">
              {user?.clinica_nombre} • {user?.rol}
            </p>
            
            <p className="text-blue-200 mt-4 max-w-2xl">
              Aquí tienes un resumen de la actividad de hoy.
              Usa el asistente virtual para consultas rápidas.
            </p>
          </div>
          
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg">
              {user?.nombre_usuario[0].toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
