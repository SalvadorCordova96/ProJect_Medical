import { ConfiguracionesView } from '@/components/ConfiguracionesView'
import { useKV } from '@github/spark/hooks'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { Usuario, Podologo, Servicio, AuditLog } from '@/lib/types'
import { toast } from 'sonner'

export function ConfiguracionesRoute() {
  const { user } = useAuthStore()
  const [usuarios, setUsuarios] = useKV<Usuario[]>('usuarios', [])
  const [podologos] = useKV<Podologo[]>('podologos', [])
  const [servicios] = useKV<Servicio[]>('servicios', [])
  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('audit-logs', [])

  const addAuditLog = (action: string, entity: string, changes?: any) => {
    const log: AuditLog = {
      id_audit: Date.now(),
      usuario_id: user?.id_usuario || 1,
      usuario: user || undefined,
      action,
      entity,
      entity_id: null,
      changes,
      timestamp: new Date().toISOString()
    }
    setAuditLogs((currentLogs) => [...currentLogs, log])
  }

  const handleAddUsuario = (nuevoUsuario: Omit<Usuario, 'id_usuario' | 'created_at' | 'last_login'>) => {
    const usuario: Usuario = {
      ...nuevoUsuario,
      id_usuario: Date.now(),
      created_at: new Date().toISOString()
    }
    setUsuarios((currentUsuarios) => [...currentUsuarios, usuario])
    addAuditLog('create', 'usuario', { username: usuario.username, rol: usuario.rol })
  }

  const handleEditUsuario = (id: number, updates: Partial<Usuario>) => {
    setUsuarios((currentUsuarios) =>
      currentUsuarios.map(usuario =>
        usuario.id_usuario === id ? { ...usuario, ...updates } : usuario
      )
    )
    addAuditLog('update', 'usuario', updates)
  }

  const handleDeleteUsuario = (id: number) => {
    setUsuarios((currentUsuarios) =>
      currentUsuarios.map(usuario =>
        usuario.id_usuario === id ? { ...usuario, activo: false } : usuario
      )
    )
    addAuditLog('delete', 'usuario', { id })
  }

  const handleChangePassword = (id: number, newPassword: string) => {
    addAuditLog('password_change', 'usuario', { id })
    toast.success('Contraseña actualizada correctamente')
  }

  return (
    <ConfiguracionesView
      usuarios={usuarios}
      podologos={podologos}
      servicios={servicios}
      auditLogs={auditLogs}
      onAddUsuario={handleAddUsuario}
      onEditUsuario={handleEditUsuario}
      onDeleteUsuario={handleDeleteUsuario}
      onChangePassword={handleChangePassword}
      currentUserId={user?.id_usuario || 1}
    />
  )
}
