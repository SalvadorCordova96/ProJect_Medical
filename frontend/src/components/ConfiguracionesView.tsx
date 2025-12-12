import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Usuario, Podologo, Servicio, UserRole, AuditLog } from '@/lib/types'
import { Plus, Pencil, Trash, Eye, LockKey } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ConfiguracionesViewProps {
  usuarios: Usuario[]
  podologos: Podologo[]
  servicios: Servicio[]
  auditLogs: AuditLog[]
  onAddUsuario: (usuario: Omit<Usuario, 'id_usuario' | 'created_at' | 'last_login'>) => void
  onEditUsuario: (id: number, updates: Partial<Usuario>) => void
  onDeleteUsuario: (id: number) => void
  onChangePassword: (id: number, newPassword: string) => void
  currentUserId: number
}

export function ConfiguracionesView({
  usuarios,
  podologos,
  servicios,
  auditLogs,
  onAddUsuario,
  onEditUsuario,
  onDeleteUsuario,
  onChangePassword,
  currentUserId
}: ConfiguracionesViewProps) {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [isCreateUsuario, setIsCreateUsuario] = useState(false)
  const [isEditUsuario, setIsEditUsuario] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [isChangePassword, setIsChangePassword] = useState(false)

  const [usuarioForm, setUsuarioForm] = useState({
    username: '',
    email: '',
    rol: 'Recepcion' as UserRole,
    nombre: '',
    apellido: '',
    password: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const handleCreateUsuario = () => {
    setUsuarioForm({
      username: '',
      email: '',
      rol: 'Recepcion',
      nombre: '',
      apellido: '',
      password: ''
    })
    setIsCreateUsuario(true)
  }

  const handleEditUsuario = (usuario: Usuario) => {
    if (usuario.id_usuario === currentUserId && usuario.rol === 'Admin') {
      toast.error('No puedes modificar tu propio rol de Admin')
      return
    }
    setSelectedUsuario(usuario)
    setUsuarioForm({
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      password: ''
    })
    setIsEditUsuario(true)
  }

  const handleSaveUsuario = () => {
    if (!usuarioForm.username || !usuarioForm.email || !usuarioForm.nombre || !usuarioForm.apellido) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    if (isCreateUsuario && !usuarioForm.password) {
      toast.error('La contraseña es requerida')
      return
    }

    if (isEditUsuario && selectedUsuario) {
      if (selectedUsuario.id_usuario === currentUserId && usuarioForm.rol !== 'Admin') {
        toast.error('No puedes cambiar tu propio rol de Admin')
        return
      }
      onEditUsuario(selectedUsuario.id_usuario, {
        username: usuarioForm.username,
        email: usuarioForm.email,
        rol: usuarioForm.rol,
        nombre: usuarioForm.nombre,
        apellido: usuarioForm.apellido
      })
      toast.success('Usuario actualizado')
      setIsEditUsuario(false)
      setSelectedUsuario(null)
    } else if (isCreateUsuario) {
      onAddUsuario({
        username: usuarioForm.username,
        email: usuarioForm.email,
        rol: usuarioForm.rol,
        nombre: usuarioForm.nombre,
        apellido: usuarioForm.apellido,
        activo: true
      })
      toast.success('Usuario creado')
      setIsCreateUsuario(false)
    }
  }

  const handleDeleteUsuario = (usuario: Usuario) => {
    if (usuario.id_usuario === currentUserId) {
      toast.error('No puedes eliminarte a ti mismo')
      return
    }
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.username}?`)) {
      onDeleteUsuario(usuario.id_usuario)
      toast.success('Usuario eliminado')
    }
  }

  const handleToggleActivoUsuario = (usuario: Usuario) => {
    if (usuario.id_usuario === currentUserId) {
      toast.error('No puedes desactivarte a ti mismo')
      return
    }
    onEditUsuario(usuario.id_usuario, { activo: !usuario.activo })
    toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'}`)
  }

  const handleOpenChangePassword = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setPasswordForm({ newPassword: '', confirmPassword: '' })
    setIsChangePassword(true)
  }

  const handleSavePassword = () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (selectedUsuario) {
      onChangePassword(selectedUsuario.id_usuario, passwordForm.newPassword)
      setIsChangePassword(false)
      setSelectedUsuario(null)
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Creación',
      update: 'Actualización',
      delete: 'Eliminación',
      login: 'Inicio de sesión',
      logout: 'Cierre de sesión',
      password_change: 'Cambio de contraseña',
      role_change: 'Cambio de rol'
    }
    return labels[action] || action
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuraciones</h1>
          <p className="text-sm text-muted-foreground">Administración del sistema (Solo Admin)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="podologos">Podólogos</TabsTrigger>
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total de usuarios: {usuarios.length}
              </p>
              <Button onClick={handleCreateUsuario}>
                <Plus size={20} />
                Nuevo Usuario
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id_usuario}>
                      <TableCell className="font-medium">
                        {usuario.nombre} {usuario.apellido}
                        <div className="text-xs text-muted-foreground">@{usuario.username}</div>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          usuario.rol === 'Admin' ? 'default' :
                          usuario.rol === 'Podologo' ? 'secondary' :
                          'outline'
                        }>
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.activo ? 'outline' : 'destructive'}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {usuario.last_login 
                          ? new Date(usuario.last_login).toLocaleDateString('es')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditUsuario(usuario)}
                            disabled={usuario.id_usuario === currentUserId && usuario.rol === 'Admin'}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenChangePassword(usuario)}
                          >
                            <LockKey size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActivoUsuario(usuario)}
                            disabled={usuario.id_usuario === currentUserId}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUsuario(usuario)}
                            disabled={usuario.id_usuario === currentUserId}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="podologos" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Podólogos Registrados</CardTitle>
                <CardDescription>
                  Total: {podologos.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {podologos.map((podologo) => (
                      <TableRow key={podologo.id_podologo}>
                        <TableCell className="font-medium">
                          {podologo.nombres} {podologo.apellidos}
                        </TableCell>
                        <TableCell>{podologo.especialidad || 'General'}</TableCell>
                        <TableCell className="text-sm">{podologo.contacto || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={podologo.activo ? 'outline' : 'destructive'}>
                            {podologo.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servicios" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Disponibles</CardTitle>
                <CardDescription>
                  Total: {servicios.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicios.map((servicio) => (
                      <TableRow key={servicio.id_servicio}>
                        <TableCell className="font-medium">{servicio.nombre}</TableCell>
                        <TableCell className="text-sm">{servicio.descripcion || '-'}</TableCell>
                        <TableCell>{servicio.duracion_minutos} min</TableCell>
                        <TableCell className="font-mono">${servicio.precio.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={servicio.activo ? 'outline' : 'destructive'}>
                            {servicio.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Auditoría</CardTitle>
                <CardDescription>
                  Últimas {auditLogs.length} acciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Entidad</TableHead>
                        <TableHead>Detalles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((log) => (
                          <TableRow key={log.id_audit}>
                            <TableCell className="text-sm">
                              {new Date(log.timestamp).toLocaleString('es')}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.usuario?.nombre} {log.usuario?.apellido}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm capitalize">{log.entity}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                              {log.changes ? JSON.stringify(log.changes) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCreateUsuario || isEditUsuario} onOpenChange={(open) => {
        if (!open) {
          setIsCreateUsuario(false)
          setIsEditUsuario(false)
          setSelectedUsuario(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={usuarioForm.nombre}
                  onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={usuarioForm.apellido}
                  onChange={(e) => setUsuarioForm({ ...usuarioForm, apellido: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="username">Usuario *</Label>
              <Input
                id="username"
                value={usuarioForm.username}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, username: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={usuarioForm.email}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={usuarioForm.rol}
                onValueChange={(value) => setUsuarioForm({ ...usuarioForm, rol: value as UserRole })}
                disabled={isEditUsuario && selectedUsuario?.id_usuario === currentUserId}
              >
                <SelectTrigger id="rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Podologo">Podólogo</SelectItem>
                  <SelectItem value="Recepcion">Recepción</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCreateUsuario && (
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={usuarioForm.password}
                  onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => {
                setIsCreateUsuario(false)
                setIsEditUsuario(false)
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUsuario}>
                {isEditUsuario ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePassword} onOpenChange={(open) => {
        if (!open) {
          setIsChangePassword(false)
          setSelectedUsuario(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cambiando contraseña para: <strong>{selectedUsuario?.username}</strong>
            </p>
            <div>
              <Label htmlFor="newPassword">Nueva Contraseña *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Repita la contraseña"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsChangePassword(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePassword}>
                Cambiar Contraseña
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
