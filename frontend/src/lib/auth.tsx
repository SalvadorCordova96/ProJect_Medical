import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { Usuario, UserRole } from '@/lib/types'

interface AuthContextType {
  usuario: Usuario | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useKV<Usuario | null>('current-user', null)
  const currentUser = usuario ?? null

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username === 'admin' && password === 'Admin2024!') {
      const adminUser: Usuario = {
        id_usuario: 1,
        username: 'admin',
        email: 'admin@podoskin.mx',
        rol: 'Admin',
        nombre: 'Administrador',
        apellido: 'Sistema',
        activo: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      setUsuario(adminUser)
      return true
    }
    
    if (username === 'dr.ornelas' && password === 'Podo2024!') {
      const podologoUser: Usuario = {
        id_usuario: 2,
        username: 'dr.ornelas',
        email: 'ornelas@podoskin.mx',
        rol: 'Podologo',
        nombre: 'Dr. Ornelas',
        apellido: 'González',
        activo: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      setUsuario(podologoUser)
      return true
    }
    
    if (username === 'recepcion' && password === 'Recep2024!') {
      const recepcionUser: Usuario = {
        id_usuario: 3,
        username: 'recepcion',
        email: 'recepcion@podoskin.mx',
        rol: 'Recepcion',
        nombre: 'María',
        apellido: 'Rodríguez',
        activo: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      setUsuario(recepcionUser)
      return true
    }
    
    return false
  }

  const logout = () => {
    setUsuario(null)
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!currentUser) return false
    return roles.includes(currentUser.rol)
  }

  return (
    <AuthContext.Provider value={{ usuario: currentUser, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
