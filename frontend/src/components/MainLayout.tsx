import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { usePermissions } from '@/modules/auth/utils/permissions'
import { ConfiguracionesModal } from '@/components/ConfiguracionesModal'
import LogoImage from '@/assets/images/Logo.png'
import { 
  House, 
  CalendarBlank, 
  ClipboardText, 
  Gear,
  SignOut
} from '@phosphor-icons/react'

interface NavItem {
  id: string
  label: string
  icon: ReactNode
  permission: keyof ReturnType<typeof usePermissions>
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <House size={20} weight="duotone" />, permission: 'canViewDashboard' },
  { id: 'agenda', label: 'Agenda', icon: <CalendarBlank size={20} weight="duotone" />, permission: 'canViewAppointments' },
  { id: 'historial-pacientes', label: 'Historial Pacientes', icon: <ClipboardText size={20} weight="duotone" />, permission: 'canViewPatients' },
  { id: 'configuraciones', label: 'Configuraciones', icon: <Gear size={20} weight="duotone" />, permission: 'canManageSettings' }
]

interface MainLayoutProps {
  children: ReactNode
  activeView: string
  onNavigate: (view: string) => void
}

export function MainLayout({ children, activeView, onNavigate }: MainLayoutProps) {
  const { user, logout } = useAuthStore()
  const permissions = usePermissions(user?.rol ?? 'Recepcion')
  const [showConfigModal, setShowConfigModal] = useState(false)

  const filteredNavItems = navItems.filter(item => permissions[item.permission])

  const initials = user 
    ? user.nombre_usuario.substring(0, 2).toUpperCase()
    : '??'

  const handleNavigate = (view: string) => {
    if (view === 'configuraciones') {
      setShowConfigModal(true)
    } else {
      onNavigate(view)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={LogoImage} alt="PodoSkin Logo" className="h-12 w-auto" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 h-11"
              onClick={() => handleNavigate(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.nombre_usuario}
              </p>
              <p className="text-xs text-muted-foreground">{user?.rol}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={logout}
          >
            <SignOut size={16} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <ConfiguracionesModal 
        open={showConfigModal} 
        onOpenChange={setShowConfigModal}
      />
    </div>
  )
}
